import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/bottom_nav.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/skeleton.dart';
import '../../core/services/driver_api_service.dart';
import '../../core/services/offline_service.dart';

import '../../main.dart' show RouteProgressScope;

class AssignmentsScreen extends StatefulWidget {
  const AssignmentsScreen({super.key});

  @override
  State<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends State<AssignmentsScreen> {
  final _api = DriverApiService.instance;
  static const _cacheKey = 'cache_assignments_today';
  static const _cacheTtlMinutes = 10;

  int _activeTab = 0; // 0 = Active, 1 = Upcoming, 2 = Completed

  bool _isLoading = true;
  bool _isOffline = false;
  String? _errorMessage;

  // Assignments from API
  List<Map<String, dynamic>> _activeAssignments = [];
  List<Map<String, dynamic>> _upcomingAssignments = [];
  List<Map<String, dynamic>> _completedAssignments = [];

  // Track which routes are being started (spinner per card)
  final Set<String> _startingRoutes = {};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData({bool forceRefresh = false}) async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _isOffline = false;
    });

    // Try cache first
    if (!forceRefresh) {
      final cached = await _getCached();
      if (cached != null && mounted) {
        _applyData(cached);
        setState(() => _isLoading = false);
        _refreshInBackground();
        return;
      }
    }

    await _fetchFromApi();
  }

  Future<void> _fetchFromApi() async {
    try {
      final data = await _api.getAssignments();
      await _cache(data);
      if (mounted) {
        _applyData(data);
        setState(() {
          _isLoading = false;
          _isOffline = false;
        });
      }
    } catch (e) {
      final cached = await _getCached(ignoreExpiry: true);
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isOffline = true;
          if (cached != null) {
            _applyData(cached);
          } else {
            _errorMessage = e.toString();
          }
        });
      }
    }
  }

  void _applyData(Map<String, dynamic> data) {
    _activeAssignments = (data['active'] as List? ?? []).cast<Map<String, dynamic>>();
    _upcomingAssignments = (data['upcoming'] as List? ?? []).cast<Map<String, dynamic>>();
    _completedAssignments = (data['completed'] as List? ?? []).cast<Map<String, dynamic>>();
  }

  Future<void> _refreshInBackground() async {
    try {
      final data = await _api.getAssignments();
      await _cache(data);
      if (mounted) setState(() => _applyData(data));
    } catch (_) {}
  }

  Future<void> _cache(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _cacheKey,
      jsonEncode({
        'data': data,
        'cached_at': DateTime.now().toIso8601String(),
      }),
    );
  }

  Future<Map<String, dynamic>?> _getCached({bool ignoreExpiry = false}) async {
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
      return json['data'] as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> _startRoute(
    BuildContext context,
    Map<String, dynamic> item,
  ) async {
    if (await OfflineService.checkAndShowOfflineSnackBar(context)) return;
    final isRoute = item['type'] == 'route';
    final itemId = item['id'] as String;
    setState(() => _startingRoutes.add(itemId));

    try {
      if (isRoute) {
        await _api.startRoute(itemId);
        // Load stops into RouteProgressProvider
        final stops = item['stops'] as List? ?? [];
        if (context.mounted) {
          RouteProgressScope.of(context).loadStops(stops);
          context.push('/navigation');
        }
      } else {
        await _api.startStop(itemId);
        // Load single stop into RouteProgressProvider
        if (context.mounted) {
          RouteProgressScope.of(context).loadStops([item]);
          context.push('/navigation');
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _startingRoutes.remove(itemId));
    }
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? 'Failed to load assignments',
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

  @override
  Widget build(BuildContext context) {
    // ... rest of the build method (lines 114 to end)
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Offline banner
              if (_isOffline)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: const Color(0xFFFEF3C7),
                  child: Row(
                    children: const [
                      Icon(Icons.wifi_off,
                          size: 16, color: Color(0xFFD97706)),
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Assignments',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.6,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Your delivery schedule and orders',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

              // Tabs
              Container(
                color: AppColors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      _Tab(
                        label: 'Active',
                        count: _activeAssignments.length,
                        isActive: _activeTab == 0,
                        onTap: () => setState(() => _activeTab = 0),
                      ),
                      _Tab(
                        label: 'Upcoming',
                        count: _upcomingAssignments.length,
                        isActive: _activeTab == 1,
                        onTap: () => setState(() => _activeTab = 1),
                      ),
                      _Tab(
                        label: 'Completed',
                        count: _completedAssignments.length,
                        isActive: _activeTab == 2,
                        onTap: () => setState(() => _activeTab = 2),
                      ),
                    ],
                  ),
                ),
              ),

              Expanded(
                child: _isLoading
                    ? ListView(
                        padding: const EdgeInsets.all(16),
                        physics: const NeverScrollableScrollPhysics(),
                        children: List.generate(
                          3,
                          (i) => const Padding(
                            padding: EdgeInsets.only(bottom: 12),
                            child: SkeletonBox(height: 160, radius: 16),
                          ),
                        ),
                      )
                    : _errorMessage != null
                    ? _buildError()
                    : RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: () => _loadData(forceRefresh: true),
                        child: _buildAssignmentList(context),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAssignmentList(BuildContext context) {
    final List<Map<String, dynamic>> currentList;
    final String emptyTitle;
    final String emptyMessage;
    final IconData emptyIcon;

    if (_activeTab == 0) {
      currentList = _activeAssignments;
      emptyTitle = 'No active assignments';
      emptyMessage = 'Your routes for today will appear here.';
      emptyIcon = Icons.local_shipping_outlined;
    } else if (_activeTab == 1) {
      currentList = _upcomingAssignments;
      emptyTitle = 'No upcoming routes';
      emptyMessage = 'Future assignments will appear here.';
      emptyIcon = Icons.calendar_today_outlined;
    } else {
      currentList = _completedAssignments;
      emptyTitle = 'No completed work';
      emptyMessage = 'Assignments you finish today will appear here.';
      emptyIcon = Icons.inventory_2_outlined;
    }

    if (currentList.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 40),
          EmptyState(
            title: emptyTitle,
            message: emptyMessage,
            icon: emptyIcon,
          ),
        ],
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: currentList.length,
      itemBuilder: (ctx, i) {
        final item = currentList[i];
        final isRoute = item['type'] == 'route';
        
        if (_activeTab == 2) {
          return _buildCompletedCard(item);
        }

        if (isRoute) {
          final stops = (item['stops'] as List? ?? []);
          return _RouteCard(
            routeId: item['id'],
            name: item['name'] ?? 'Route',
            status: item['status'] ?? 'assigned',
            totalStops: stops.length,
            completedStops: stops.where((s) => (s as Map)['status'] == 'completed').length,
            date: item['date'] ?? '',
            isStarting: _startingRoutes.contains(item['id']),
            onStart: () => _startRoute(context, item),
            onContinue: () {
              RouteProgressScope.of(context).loadStops(stops);
              context.push('/navigation');
            },
            isUpcoming: _activeTab == 1,
          );
        } else {
          // Standalone Stop
          return _RouteCard(
            routeId: item['id'],
            name: item['customer_name'] ?? 'Order',
            status: item['status'] ?? 'assigned',
            totalStops: 1,
            completedStops: item['status'] == 'completed' ? 1 : 0,
            date: item['delivery_date'] ?? '',
            isStarting: _startingRoutes.contains(item['id']),
            onStart: () => _startRoute(context, item),
            onContinue: () {
              RouteProgressScope.of(context).loadStops([item]);
              context.push('/navigation');
            },
            isUpcoming: _activeTab == 1,
            isStandalone: true,
          );
        }
      },
    );
  }

  Widget _buildCompletedCard(Map<String, dynamic> item) {
    final isRoute = item['type'] == 'route';
    final title = isRoute ? (item['name'] ?? 'Route') : (item['customer_name'] ?? 'Order');
    final subtitle = isRoute 
        ? '${(item['stops'] as List? ?? []).length} stops completed'
        : 'Order delivered';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(AppSpacing.p4),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: AppColors.success,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Done',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.success,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _Tab extends StatelessWidget {
  final String label;
  final int count;
  final bool isActive;
  final VoidCallback onTap;
  const _Tab({
    required this.label,
    required this.count,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? AppColors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(7),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight:
                      isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive
                      ? AppColors.textPrimary
                      : AppColors.textSecondary,
                ),
              ),
              if (count > 0) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppColors.primaryLight
                        : AppColors.surface,
                    borderRadius: BorderRadius.circular(99),
                  ),
                  child: Text(
                    '$count',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isActive
                          ? AppColors.primary
                          : AppColors.textMuted,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _RouteCard extends StatelessWidget {
  final String routeId;
  final String name;
  final String status;
  final int totalStops;
  final int completedStops;
  final String date;
  final bool isStarting;
  final VoidCallback onStart;
  final VoidCallback onContinue;
  final bool isUpcoming;
  final bool isStandalone;

  const _RouteCard({
    required this.routeId,
    required this.name,
    required this.status,
    required this.totalStops,
    required this.completedStops,
    required this.date,
    required this.isStarting,
    required this.onStart,
    required this.onContinue,
    this.isUpcoming = false,
    this.isStandalone = false,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = status == 'active' || status == 'in_progress';
    final progress = totalStops > 0 ? completedStops / totalStops : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(AppSpacing.p4),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? AppColors.primary.withValues(alpha: 0.3)
              : AppColors.border,
        ),
        boxShadow: [
          BoxShadow(
            color: isActive
                ? AppColors.primary.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isActive
                      ? AppColors.successLight
                      : AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  isStandalone ? Icons.inventory_2_outlined : Icons.local_shipping_outlined,
                  size: 22,
                  color: isActive ? AppColors.primary : AppColors.textMuted,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isStandalone 
                        ? 'Standalone Order · $date'
                        : '$totalStops stops · $date',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isUpcoming
                      ? const Color(0xFFEFF6FF)
                      : isActive
                          ? AppColors.primaryLight
                          : AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  isUpcoming ? 'Upcoming' : (isActive ? 'Active' : 'Assigned'),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isUpcoming
                        ? const Color(0xFF2563EB)
                        : isActive
                            ? AppColors.primary
                            : AppColors.textMuted,
                  ),
                ),
              ),
            ],
          ),

          if (isActive && totalStops > 0) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$completedStops / $totalStops stops',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  '${(progress * 100).round()}%',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Stack(
              children: [
                Container(
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
                FractionallySizedBox(
                  widthFactor: progress,
                  child: Container(
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (isStarting || isUpcoming)
                  ? null
                  : isActive
                  ? onContinue
                  : onStart,
              style: ElevatedButton.styleFrom(
                backgroundColor: isUpcoming ? AppColors.surface : AppColors.primary,
                foregroundColor: isUpcoming ? AppColors.textMuted : Colors.white,
                disabledBackgroundColor: isUpcoming ? AppColors.surface : AppColors.primary.withValues(alpha: 0.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: isUpcoming ? 0 : 2,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: isStarting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.5,
                      ),
                    )
                  : Text(
                      isUpcoming 
                        ? 'Scheduled for $date'
                        : (isActive ? 'Continue Route' : 'Start Route'),
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: isUpcoming ? AppColors.textMuted : Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
