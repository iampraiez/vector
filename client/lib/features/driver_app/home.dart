import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:geolocator/geolocator.dart' show ServiceStatus, LocationPermission;
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/bottom_nav.dart';
import '../../shared/widgets/skeleton.dart';
import '../../core/services/driver_api_service.dart';
import '../../core/services/location_service.dart';
import '../../main.dart' show AuthScope, RouteProgressScope;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeSummary {
  final String status;
  final int deliveriesToday;
  final int totalDeliveries;
  final int pendingStops;
  final double rating;
  final String? companyName;
  final String? managerName;
  final String? activeRouteName;
  final String? activeRouteId;
  final DateTime? lastActiveAt;

  const _HomeSummary({
    required this.status,
    required this.deliveriesToday,
    required this.totalDeliveries,
    required this.pendingStops,
    required this.rating,
    this.companyName,
    this.managerName,
    this.activeRouteName,
    this.activeRouteId,
    this.lastActiveAt,
  });

  factory _HomeSummary.fromJson(Map<String, dynamic> j) => _HomeSummary(
        status: j['status'] as String? ?? 'offline',
        deliveriesToday: (j['deliveries_today'] as num?)?.toInt() ?? 0,
        totalDeliveries: (j['total_deliveries'] as num?)?.toInt() ?? 0,
        pendingStops: (j['pending_stops'] as num?)?.toInt() ?? 0,
        rating: (j['rating'] as num?)?.toDouble() ?? 0.0,
        companyName: j['company_name'] as String?,
        managerName: j['manager_name'] as String?,
        activeRouteName: j['active_route_name'] as String?,
    activeRouteId: j['active_route_id'] as String?,
        lastActiveAt: j['last_active_at'] != null 
            ? DateTime.tryParse(j['last_active_at'] as String) 
            : null,
      );

  Map<String, dynamic> toJson() => {
        'status': status,
        'deliveries_today': deliveriesToday,
        'total_deliveries': totalDeliveries,
        'pending_stops': pendingStops,
        'rating': rating,
        'company_name': companyName,
        'manager_name': managerName,
        'active_route_name': activeRouteName,
    'active_route_id': activeRouteId,
        'last_active_at': lastActiveAt?.toIso8601String(),
      };
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  final _api = DriverApiService.instance;
  final _locationService = LocationService.instance;
  static const _cacheKey = 'cache_home_summary';
  static const _cacheTtlMinutes = 5;

  _HomeSummary? _summary;
  bool _isLoading = true;
  bool _isOffline = false;
  String? _errorMessage;

  // Location state
  bool _isLocationEnabled = true;
  LocationPermission _locationPermission = LocationPermission.always;
  StreamSubscription<ServiceStatus>? _locationServiceSubscription;

  // Session state
  Timer? _sessionTimer;
  Duration _sessionDuration = Duration.zero;
  bool _isToggling = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadData().then((_) {
      if (_summary?.status != 'offline') {
        _startTimer();
      }
    });
    _checkLocationStatus();
    _initLocationListener();
  }

  void _startTimer() {
    _sessionTimer?.cancel();
    if (_summary?.lastActiveAt == null) return;
    
    // Initial calculation
    _sessionDuration = DateTime.now().difference(_summary!.lastActiveAt!);
    
    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted && _summary?.lastActiveAt != null) {
        setState(() {
          _sessionDuration = DateTime.now().difference(_summary!.lastActiveAt!);
        });
      }
    });
  }

  void _stopTimer() {
    _sessionTimer?.cancel();
    _sessionTimer = null;
    if (mounted) {
      setState(() {
        _sessionDuration = Duration.zero;
      });
    }
  }

  Future<void> _toggleDuty(bool online) async {
    if (_isToggling) return;
    setState(() => _isToggling = true);

    try {
      final newStatus = online ? 'active' : 'offline';
      await _api.updateStatus(newStatus);
      
      // Reload summary immediately to get the fresh last_active_at from backend
      await _loadData(forceRefresh: true);
      
      if (online) {
        _startTimer();
      } else {
        _stopTimer();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update status: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isToggling = false);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _locationServiceSubscription?.cancel();
    _sessionTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkLocationStatus();
    }
  }

  Future<void> _checkLocationStatus() async {
    final isEnabled = await _locationService.isServiceEnabled();
    final permission = await _locationService.checkPermission();
    if (mounted) {
      setState(() {
        _isLocationEnabled = isEnabled;
        _locationPermission = permission;
      });
    }
  }

  void _initLocationListener() {
    _locationServiceSubscription =
        _locationService.getServiceStatusStream().listen((status) {
          if (mounted) {
            setState(() {
              _isLocationEnabled = status == ServiceStatus.enabled;
            });
          }
        });
  }

  bool get _showLocationBanner =>
      !_isLocationEnabled ||
      (_locationPermission == LocationPermission.denied ||
          _locationPermission == LocationPermission.deniedForever);

  Future<void> _loadData({bool forceRefresh = false}) async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _isOffline = false;
    });

    if (!forceRefresh) {
      final cached = await _getCached();
      if (cached != null && mounted) {
        setState(() {
          _summary = cached;
          _isLoading = false;
        });
        _refreshInBackground();
        return;
      }
    }

    // Fetch from API
    try {
      final data = await _api.getHomeSummary();
      final summary = _HomeSummary.fromJson(data);
      await _cache(summary);
      if (mounted) {
        setState(() {
          _summary = summary;
          _isLoading = false;
        });
      }
    } catch (e) {
      // Try serving from cache even if expired on error
      final cached = await _getCached(ignoreExpiry: true);
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isOffline = true;
          if (cached != null) {
            _summary = cached;
          } else {
            _errorMessage = e.toString();
          }
        });
      }
    }
  }

  Future<void> _refreshInBackground() async {
    try {
      final data = await _api.getHomeSummary();
      final summary = _HomeSummary.fromJson(data);
      await _cache(summary);
      if (mounted) setState(() => _summary = summary);
    } catch (_) {}
  }

  Future<void> _cache(_HomeSummary s) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _cacheKey,
      jsonEncode({
        'data': s.toJson(),
        'cached_at': DateTime.now().toIso8601String(),
      }),
    );
  }

  Future<_HomeSummary?> _getCached({bool ignoreExpiry = false}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey);
      if (raw == null) return null;
      final json = jsonDecode(raw) as Map<String, dynamic>;
      if (!ignoreExpiry) {
        final cachedAt = DateTime.parse(json['cached_at'] as String);
        if (DateTime.now().difference(cachedAt).inMinutes > _cacheTtlMinutes) {
          return null;
        }
      }
      return _HomeSummary.fromJson(json['data'] as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final hour = now.hour;
    final greeting = hour < 12
        ? 'Good morning'
        : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

    final days = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ];
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final dateStr = '${days[now.weekday - 1]}, ${months[now.month - 1]} ${now.day}';
    final userName = AuthScope.of(context).user?.name.split(' ').first ?? 'Driver';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () => _loadData(forceRefresh: true),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Offline banner
                    if (_isOffline)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        color: const Color(0xFFFEF3C7),
                        child: Row(
                          children: const [
                            Icon(
                              Icons.wifi_off,
                              size: 16,
                              color: Color(0xFFD97706),
                            ),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Showing cached data – you appear to be offline',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF92400E),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Location banner
                    if (_showLocationBanner) _buildLocationBanner(),

                    // Header
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        border: const Border(
                          bottom: BorderSide(color: AppColors.border),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            offset: const Offset(0, 4),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                dateStr.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textMuted,
                                  letterSpacing: 0.66,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _summary?.companyName != null && _summary!.companyName!.isNotEmpty
                                    ? _summary!.companyName!
                                    : '$greeting, $userName',
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.6,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              if (_summary?.companyName != null && _summary!.companyName!.isNotEmpty)
                                Text(
                                  'Logged in as $userName',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                            ],
                          ),
                          InkWell(
                            onTap: () => context.push('/notifications'),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: const Icon(
                                Icons.notifications_none,
                                size: 20,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Body
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.p4),
                      child: _isLoading
                          ? _buildSkeleton()
                          : _errorMessage != null
                          ? _buildError()
                          : _buildContent(context),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLocationBanner() {
    String message = '';
    String actionLabel = 'Enable';
    VoidCallback onTap = () {};

    if (!_isLocationEnabled) {
      message = 'Location services are disabled';
      actionLabel = 'Turn On';
      onTap = () => _locationService.openLocationSettings();
    } else if (_locationPermission == LocationPermission.denied) {
      message = 'Location permission is required';
      actionLabel = 'Grant';
      onTap = () async {
        final p = await _locationService.requestPermission();
        setState(() => _locationPermission = p);
      };
    } else if (_locationPermission == LocationPermission.deniedForever) {
      message = 'Location access is blocked';
      actionLabel = 'Settings';
      onTap = () => _locationService.openSettings();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFFFEE2E2),
        border: Border(bottom: BorderSide(color: Color(0xFFFECACA))),
      ),
      child: Row(
        children: [
          const Icon(Icons.location_off, size: 20, color: Color(0xFFDC2626)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF991B1B),
                  ),
                ),
                const Text(
                  'Enable to let fleet managers track your progress',
                  style: TextStyle(fontSize: 11, color: Color(0xFFB91C1C)),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: onTap,
            style: TextButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              actionLabel,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Column(
      children: [
        SkeletonBox(height: 140, radius: 16),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(child: SkeletonBox(height: 80, radius: 12)),
            const SizedBox(width: 12),
            Expanded(child: SkeletonBox(height: 80, radius: 12)),
          ],
        ),
        const SizedBox(height: 20),
        SkeletonBox(height: 60, radius: 12),
      ],
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? 'Failed to load data',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _loadData(forceRefresh: true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    final s = _summary;
    final pendingStops = s?.pendingStops ?? 0;
    final hasActiveRoute =
        (s?.activeRouteName != null && s!.activeRouteName!.isNotEmpty) ||
        pendingStops > 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Duty Toggle Card
        Container(
          padding: const EdgeInsets.all(AppSpacing.p4),
          decoration: BoxDecoration(
            color: s?.status == 'offline' ? AppColors.white : AppColors.primaryLight,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: s?.status == 'offline' ? AppColors.border : AppColors.primary.withValues(alpha: 0.2),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: s?.status == 'offline' ? AppColors.surface : AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  s?.status == 'offline' ? Icons.power_settings_new : Icons.bolt,
                  color: s?.status == 'offline' ? AppColors.textMuted : AppColors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      s?.status == 'offline' ? 'Currently Offline' : 'You are Online',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    if (s?.status != 'offline')
                      Text(
                        _sessionDuration.inHours > 0 
                          ? 'Online for ${_sessionDuration.inHours}h ${(_sessionDuration.inMinutes % 60)}m'
                          : 'Online for ${_sessionDuration.inMinutes}m',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      )
                    else
                      const Text(
                        'Switch to online to begin receiving orders',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                  ],
                ),
              ),
              _isToggling
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Switch.adaptive(
                      value: s?.status != 'offline',
                      activeTrackColor: AppColors.primary,
                      onChanged: _toggleDuty,
                    ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.p6),

        // Active Route / No Route
        const Text(
          'ACTIVE ROUTE',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.textMuted,
            letterSpacing: 0.77,
          ),
        ),
        const SizedBox(height: AppSpacing.p2),
        GestureDetector(
          onTap: () async {
            if (s?.activeRouteId != null) {
              showDialog(
                context: context, 
                barrierDismissible: false, 
                builder: (_) => const Center(child: CircularProgressIndicator()),
              );
              try {
                final routeData = await _api.getRoutePreview(s!.activeRouteId!);
                if (!context.mounted) return;
                Navigator.pop(context); // close dialog
                final stops = (routeData['stops'] as List? ?? []).cast<Map<String, dynamic>>();
                if (stops.isNotEmpty) {
                  RouteProgressScope.of(context).loadStops(stops);
                  context.push('/navigation');
                } else {
                  context.push('/assignments');
                }
              } catch (e) {
                if (!context.mounted) return;
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load active route: $e')));
              }
            } else {
              context.push('/assignments');
            }
          },
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.p5),
            decoration: BoxDecoration(
              color: AppColors.white,
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.25),
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x14059669),
                  offset: Offset(0, 4),
                  blurRadius: 16,
                ),
              ],
            ),
            child: hasActiveRoute
                ? Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: AppColors.successLight,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.local_shipping_outlined,
                                  size: 18,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.p2),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    s?.activeRouteName ?? 'Active Route',
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: -0.15,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Row(
                                    children: [
                                      Container(
                                        width: 6,
                                        height: 6,
                                        margin: const EdgeInsets.only(right: 6),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const Text(
                                        'In progress',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.2),
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '$pendingStops stop${pendingStops == 1 ? '' : 's'} left',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.p3),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAF9),
                          border: Border.all(color: AppColors.border),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              size: 16,
                              color: AppColors.primary,
                            ),
                            const SizedBox(width: AppSpacing.p2),
                            Expanded(
                              child: const Text(
                                'Resume your active delivery route',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ),
                            const Icon(
                              Icons.arrow_forward_ios,
                              size: 13,
                              color: AppColors.textMuted,
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.route_outlined,
                          color: AppColors.textMuted,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'No active route',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              'Check assignments for today\'s routes',
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios,
                        size: 13,
                        color: AppColors.textMuted,
                      ),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: AppSpacing.p5),

        // Stats
        Row(
          children: [
            Expanded(
              child: _StatCard(
                label: 'Today',
                value: '${s?.deliveriesToday ?? 0}',
                subtitle: 'deliveries',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                label: 'All time',
                value: '${s?.totalDeliveries ?? 0}',
                subtitle: 'deliveries',
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.p5),

        // Quick Actions
        const Text(
          'QUICK ACTIONS',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.textMuted,
            letterSpacing: 0.77,
          ),
        ),
        const SizedBox(height: AppSpacing.p2),
        Row(
          children: [
            Expanded(
              child: _ActionCard(
                icon: Icons.add_road_outlined,
                label: 'Add Route',
                onTap: () => context.push('/new-route'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ActionCard(
                icon: Icons.upload_file,
                label: 'Import',
                onTap: () => context.push('/new-route?tab=import'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ActionCard(
                icon: Icons.qr_code_scanner,
                label: 'Scan',
                onTap: () => context.push('/proof-delivery'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _ActionCard(
                icon: Icons.settings_outlined,
                label: 'Settings',
                onTap: () => context.push('/settings'),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.p5),

        // Driver stats footer
        if (s != null)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _FooterStat(
                  icon: Icons.star,
                  label: 'Rating',
                  value: s.rating > 0 ? s.rating.toStringAsFixed(1) : '--',
                  iconColor: const Color(0xFFFBBF24),
                ),
                Container(width: 1, height: 40, color: AppColors.border),
                _FooterStat(
                  icon: Icons.inventory_2_outlined,
                  label: 'Pending',
                  value: '${s.pendingStops}',
                  iconColor: AppColors.primary,
                ),
                Container(width: 1, height: 40, color: AppColors.border),
                _FooterStat(
                  icon: Icons.circle,
                  label: 'Duty Status',
                  value: s.status == 'offline'
                      ? 'Off Duty'
                      : s.status[0].toUpperCase() + s.status.substring(1),
                  iconColor: s.status == 'active'
                      ? AppColors.success
                      : AppColors.textMuted,
                ),
              ],
            ),
          ),

        const SizedBox(height: 20),
      ],
    );
  }
}

// ── Sub-widgets ────────────────────────────────────────────────────────────────

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String subtitle;
  const _StatCard({
    required this.label,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -1,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FooterStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color iconColor;
  const _FooterStat({
    required this.icon,
    required this.label,
    required this.value,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 16, color: iconColor),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
        ),
      ],
    );
  }
}
