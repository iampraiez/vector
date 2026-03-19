import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/colors.dart';
import '../../shared/widgets/bottom_nav.dart';
import '../../shared/widgets/empty_state.dart';
import '../../core/services/driver_api_service.dart';
import '../../core/services/offline_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final _api = DriverApiService.instance;

  String _selectedPeriod = 'week';
  String? _expandedRouteId;

  final _periods = [
    {'key': 'week', 'label': 'Week'},
    {'key': 'month', 'label': 'Month'},
    {'key': 'year', 'label': 'Year'},
    {'key': 'all', 'label': 'All'},
  ];

  List<Map<String, dynamic>> _completedRoutes = [];

  // Static bar chart data derived from actual history (simplified: deliveries per day slot)
  final _weekBarData = [0, 0, 0, 0, 0, 0, 0];
  final _weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  bool _isLoading = true;
  String? _errorMessage;
  bool _isOffline = false;

  static const _cacheKey = 'cache_history';
  static const _cacheTtlMs = 30 * 60 * 1000; // 30 min

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _isOffline = false;
    });

    // Try live data first
    try {
      final data = await _api.getHistory(limit: 50);
      final routes = _parseRoutes(data);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cacheKey, jsonEncode({
        'ts': DateTime.now().millisecondsSinceEpoch,
        'data': routes,
      }));
      if (mounted) {
        setState(() {
          _completedRoutes = routes;
          _isLoading = false;
        });
      }
      return;
    } catch (_) {}

    // Fallback to cache
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey);
      if (raw != null) {
        final cached = jsonDecode(raw) as Map<String, dynamic>;
        final ts = cached['ts'] as int;
        if (DateTime.now().millisecondsSinceEpoch - ts < _cacheTtlMs) {
          final routes = (cached['data'] as List)
              .cast<Map<String, dynamic>>()
              .toList();
          if (mounted) {
            setState(() {
              _completedRoutes = routes;
              _isLoading = false;
              _isOffline = true;
            });
          }
          return;
        }
      }
    } catch (_) {}

    // No cache available — show error
    if (mounted) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Unable to connect. Please check your internet connection.';
      });
    }
  }

  List<Map<String, dynamic>> _parseRoutes(Map<String, dynamic> data) {
    return (data['data'] as List? ?? [])
        .cast<Map<String, dynamic>>()
        .map((r) {
      final stops = (r['stops'] as List? ?? []);
      final completedStops =
          stops.where((s) => (s as Map)['status'] == 'completed').length;
      return {
        'id': r['id'] ?? '',
        'name': r['name'] ?? 'Route',
        'date': _formatDate(r['date'] as String? ?? r['completed_at'] as String? ?? ''),
        'stops': stops.length,
        'completed': completedStops,
        'duration': '--',
        'distance': r['total_distance_km'] != null
            ? '${(r['total_distance_km'] as num).toStringAsFixed(1)} km'
            : '--',
        'earnings': '--',
        'rating': 0.0,
        'timeline': stops.take(3).map((s) {
          final sm = s as Map<String, dynamic>;
          return {
            'address': sm['address'] ?? '',
            'time': '--',
            'customer': sm['customer_name'] ?? '',
            'status': sm['status'] ?? 'delivered',
          };
        }).toList(),
      };
    }).toList();
  }

  String _formatDate(String raw) {
    if (raw.isEmpty) return '--';
    try {
      final dt = DateTime.parse(raw);
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final d = DateTime(dt.year, dt.month, dt.day);
      if (d == today) return 'Today';
      if (d == today.subtract(const Duration(days: 1))) return 'Yesterday';
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAF9),
        bottomNavigationBar: const AppBottomNav(),
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAF9),
        bottomNavigationBar: const AppBottomNav(),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadData,
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

    final double totalEarnings = 0;
    final int totalDeliveries = _completedRoutes.fold(
      0, (sum, r) => sum + (r['completed'] as int));
    final double avgRating = _completedRoutes.isEmpty
        ? 0
        : _completedRoutes.fold(0.0, (sum, r) =>
            sum + ((r['rating'] as num).toDouble())) /
            _completedRoutes.length;
    final int maxBar = _weekBarData.isEmpty
        ? 1
        : _weekBarData.reduce((a, b) => a > b ? a : b).clamp(1, 999);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            children: [
              if (_isOffline) OfflineService.offlineBanner(),
              // Header
              Container(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  border: const Border(bottom: BorderSide(color: AppColors.border)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      offset: const Offset(0, 4),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'History',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.6,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Your completed deliveries',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => _showExportModal(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          border: Border.all(color: AppColors.border),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: const [
                            Icon(
                              Icons.download_outlined,
                              size: 15,
                              color: AppColors.textSecondary,
                            ),
                            SizedBox(width: 6),
                            Text(
                              'Export',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Summary Cards
                    Row(
                      children: [
                        Expanded(
                          child: _SummaryCard(
                            label: 'Routes',
                            value: '${_completedRoutes.length}',
                            icon: Icons.local_shipping_outlined,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SummaryCard(
                            label: 'Deliveries',
                            value: '$totalDeliveries',
                            icon: Icons.check_circle_outline,
                            color: AppColors.success,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SummaryCard(
                            label: 'Earned',
                            value:
                                '\$${(totalEarnings / 1000).toStringAsFixed(1)}k',
                            icon: Icons.attach_money,
                            color: const Color(0xFFD97706),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Chart
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'This Week',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  Text(
                                    'Deliveries per day',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(99),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.star,
                                      size: 12,
                                      color: Color(0xFFFBBF24),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${avgRating.toStringAsFixed(1)} avg',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.success,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                height: 80,
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: _weekBarData.asMap().entries.map((e) {
                                    int i = e.key;
                                    int val = e.value;
                                    return Expanded(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          Expanded(
                                            child: Align(
                                              alignment: Alignment.bottomCenter,
                                              child: Container(
                                                width: double.infinity,
                                                margin: const EdgeInsets.symmetric(
                                                  horizontal: 4,
                                                ),
                                                height: (val / maxBar) * 70, // proportional height
                                                decoration: BoxDecoration(
                                                  color: i == 6
                                                      ? AppColors.primary
                                                      : AppColors.primaryLight,
                                                  borderRadius: const BorderRadius.vertical(
                                                    top: Radius.circular(4),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            _weekLabels[i],
                                            style: const TextStyle(
                                              fontSize: 10,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                              if (_weekBarData.every((v) => v == 0))
                                Positioned.fill(
                                  bottom: 20,
                                  child: Center(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: AppColors.white.withValues(alpha: 0.8),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: AppColors.border.withValues(alpha: 0.3)),
                                      ),
                                      child: const Text(
                                        'No activity this week',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Filter
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0D000000),
                            offset: Offset(0, 1),
                            blurRadius: 2,
                          ),
                        ],
                      ),
                      child: Row(
                        children: _periods
                            .map(
                              (p) => Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(
                                    () => _selectedPeriod = p['key']!,
                                  ),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: _selectedPeriod == p['key']
                                          ? AppColors.primary
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(7),
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      p['label']!,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: _selectedPeriod == p['key']
                                            ? AppColors.white
                                            : AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Routes
                    Text(
                      '${_completedRoutes.length} routes • ${_selectedPeriod == 'week'
                          ? 'This week'
                          : _selectedPeriod == 'month'
                          ? 'This month'
                          : _selectedPeriod == 'year'
                          ? 'This year'
                          : 'All time'}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
                        letterSpacing: 0.7,
                      ),
                    ),
                    const SizedBox(height: 10),

                    if (_completedRoutes.isEmpty)
                      const EmptyState(
                        title: 'No history',
                        message: 'Your completed routes will appear here.',
                        icon: Icons.history,
                      )
                    else
                      ..._completedRoutes.map((r) {
                        bool isExpanded = _expandedRouteId == r['id'];
                        int completionRate =
                            ((r['completed'] as int) /
                                    (r['stops'] as int) *
                                    100)
                                .round();

                        return GestureDetector(
                          onTap: () => setState(
                            () => _expandedRouteId = isExpanded
                                ? null
                                : r['id'] as String,
                          ),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isExpanded
                                    ? AppColors.primary
                                    : AppColors.border,
                              ),
                              boxShadow: isExpanded
                                  ? const [
                                      BoxShadow(
                                        color: Color(0x1A000000),
                                        offset: Offset(0, 4),
                                        blurRadius: 6,
                                      ),
                                    ]
                                  : const [
                                      BoxShadow(
                                        color: Color(0x0D000000),
                                        offset: Offset(0, 1),
                                        blurRadius: 2,
                                      ),
                                    ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    children: [
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Text(
                                                      r['date'] as String,
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        color:
                                                            AppColors.textMuted,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 4,
                                                      height: 4,
                                                      margin:
                                                          const EdgeInsets.symmetric(
                                                            horizontal: 8,
                                                          ),
                                                      decoration:
                                                          const BoxDecoration(
                                                            color: AppColors
                                                                .border,
                                                            shape:
                                                                BoxShape.circle,
                                                          ),
                                                    ),
                                                    const Icon(
                                                      Icons.star,
                                                      size: 11,
                                                      color: Color(0xFFFBBF24),
                                                    ),
                                                    const SizedBox(width: 3),
                                                    Text(
                                                      '${r['rating']}',
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        color: AppColors
                                                            .textSecondary,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  r['name'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w600,
                                                    color:
                                                        AppColors.textPrimary,
                                                  ),
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              Text(
                                                r['earnings'] as String,
                                                style: const TextStyle(
                                                  fontSize: 17,
                                                  fontWeight: FontWeight.w700,
                                                  color: AppColors.primary,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Container(
                                                width: 28,
                                                height: 28,
                                                decoration: BoxDecoration(
                                                  color: AppColors.surface,
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  border: Border.all(
                                                    color: AppColors.border,
                                                  ),
                                                ),
                                                child: Icon(
                                                  isExpanded
                                                      ? Icons.keyboard_arrow_up
                                                      : Icons
                                                            .keyboard_arrow_down,
                                                  size: 16,
                                                  color: isExpanded
                                                      ? AppColors.primary
                                                      : AppColors.textMuted,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      // Progress bar
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            '${r['completed']}/${r['stops']} stops',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                          Text(
                                            '$completionRate%',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: completionRate == 100
                                                  ? AppColors.success
                                                  : const Color(0xFFD97706),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 5),
                                      Stack(
                                        children: [
                                          Container(
                                            height: 4,
                                            decoration: BoxDecoration(
                                              color: AppColors.surface,
                                              borderRadius:
                                                  BorderRadius.circular(99),
                                            ),
                                          ),
                                          FractionallySizedBox(
                                            widthFactor: completionRate / 100,
                                            child: Container(
                                              height: 4,
                                              decoration: BoxDecoration(
                                                color: completionRate == 100
                                                    ? AppColors.success
                                                    : const Color(0xFFF59E0B),
                                                borderRadius:
                                                    BorderRadius.circular(99),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      const Divider(height: 1),
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                const Icon(
                                                  Icons.schedule,
                                                  size: 13,
                                                  color: AppColors.textMuted,
                                                ),
                                                const SizedBox(width: 5),
                                                Text(
                                                  r['duration'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color:
                                                        AppColors.textSecondary,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Expanded(
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                const Icon(
                                                  Icons.local_shipping_outlined,
                                                  size: 13,
                                                  color: AppColors.textMuted,
                                                ),
                                                const SizedBox(width: 5),
                                                Text(
                                                  r['distance'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color:
                                                        AppColors.textSecondary,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Expanded(
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                const Icon(
                                                  Icons.location_on_outlined,
                                                  size: 13,
                                                  color: AppColors.textMuted,
                                                ),
                                                const SizedBox(width: 5),
                                                Text(
                                                  '${r['stops']} stops',
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color:
                                                        AppColors.textSecondary,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                if (isExpanded) ...[
                                  const Divider(height: 1),
                                  Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'DELIVERY TIMELINE',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textSecondary,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                        const SizedBox(height: 12),
                                        ...(r['timeline'] as List).map((stop) {
                                          bool isDelivered =
                                              stop['status'] == 'delivered';
                                          return Padding(
                                            padding: const EdgeInsets.only(
                                              bottom: 14,
                                            ),
                                            child: Row(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Container(
                                                  width: 30,
                                                  height: 30,
                                                  decoration: BoxDecoration(
                                                    color: isDelivered
                                                        ? const Color(
                                                            0xFFECFDF5,
                                                          )
                                                        : const Color(
                                                            0xFFFEF2F2,
                                                          ),
                                                    shape: BoxShape.circle,
                                                    border: Border.all(
                                                      color: isDelivered
                                                          ? AppColors.success
                                                          : AppColors.error,
                                                      width: 2,
                                                    ),
                                                  ),
                                                  alignment: Alignment.center,
                                                  child: Icon(
                                                    isDelivered
                                                        ? Icons.check
                                                        : Icons.close,
                                                    size: 14,
                                                    color: isDelivered
                                                        ? AppColors.success
                                                        : AppColors.error,
                                                  ),
                                                ),
                                                const SizedBox(width: 14),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Text(
                                                            stop['address'],
                                                            style: const TextStyle(
                                                              fontSize: 13,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                              color: AppColors
                                                                  .textPrimary,
                                                            ),
                                                          ),
                                                          Row(
                                                            children: [
                                                              const Icon(
                                                                Icons.schedule,
                                                                size: 11,
                                                                color: AppColors
                                                                    .textMuted,
                                                              ),
                                                              const SizedBox(
                                                                width: 4,
                                                              ),
                                                              Text(
                                                                stop['time'],
                                                                style: const TextStyle(
                                                                  fontSize: 11,
                                                                  color: AppColors
                                                                      .textMuted,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w500,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ],
                                                      ),
                                                      Text(
                                                        stop['customer'],
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          color: AppColors
                                                              .textSecondary,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        }),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showExportModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Export History',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Select a time range for your report',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 24),
              _ExportFormatOption(
                icon: Icons.calendar_today_outlined,
                title: 'This Week',
                subtitle: 'Export data for the current week',
                onTap: () => _handleExport(context, 'week'),
              ),
              const SizedBox(height: 12),
              _ExportFormatOption(
                icon: Icons.calendar_month_outlined,
                title: 'This Month',
                subtitle: 'Export data for the current month',
                onTap: () => _handleExport(context, 'month'),
              ),
              const SizedBox(height: 12),
              _ExportFormatOption(
                icon: Icons.date_range_outlined,
                title: 'Custom Range',
                subtitle: 'Select specific dates to export',
                onTap: () => _handleExport(context, 'custom'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleExport(BuildContext context, String range) async {
    if (await OfflineService.checkAndShowOfflineSnackBar(context)) return;
    if (!context.mounted) return;
    context.pop();

    DateTimeRange? picked;
    if (range == 'custom') {
      picked = await showDateRangePicker(
        context: context,
        firstDate: DateTime(2020),
        lastDate: DateTime.now(),
        builder: (context, child) {
          return Theme(
            data: Theme.of(context).copyWith(
              colorScheme: const ColorScheme.light(
                primary: AppColors.primary,
                onPrimary: Colors.white,
                onSurface: AppColors.textPrimary,
              ),
            ),
            child: child!,
          );
        },
      );
      if (picked == null) return;
    }

    if (!context.mounted) return;

    try {
      final res = await _api.exportHistory(
        range: range,
        startDate: picked?.start.toIso8601String(),
        endDate: picked?.end.toIso8601String(),
      );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message'] ?? 'Export report shared!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    }
  }
}

class _SummaryCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _SummaryCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.2,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ExportFormatOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ExportFormatOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: const BoxDecoration(
                color: AppColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppColors.primary, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
