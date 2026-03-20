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

  int _activeTab = 0; // 0 = today/active, 1 = completed

  bool _isLoading = true;
  bool _isOffline = false;
  String? _errorMessage;

  // Routes from API
  List<Map<String, dynamic>> _activeRoutes = [];
  List<Map<String, dynamic>> _completedRoutes = [];

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
      final today = DateTime.now().toIso8601String().split('T').first;
      final data = await _api.getAssignments(date: today);
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
    final routes = (data['routes'] as List? ?? [])
        .cast<Map<String, dynamic>>();
    _activeRoutes = routes
        .where((r) => r['status'] != 'completed' && r['status'] != 'cancelled')
        .toList();
    _completedRoutes = routes
        .where((r) => r['status'] == 'completed' || r['status'] == 'cancelled')
        .toList();
  }

  Future<void> _refreshInBackground() async {
    try {
      final today = DateTime.now().toIso8601String().split('T').first;
      final data = await _api.getAssignments(date: today);
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
    Map<String, dynamic> route,
  ) async {
    if (await OfflineService.checkAndShowOfflineSnackBar(context)) return;
    final routeId = route['id'] as String;
    setState(() => _startingRoutes.add(routeId));

    try {
      await _api.startRoute(routeId);

      // Load stops into RouteProgressProvider
      final stops = route['stops'] as List? ?? [];
      if (context.mounted) {
        RouteProgressScope.of(context).loadStops(stops);
        context.push('/navigation');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start route: $e'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _startingRoutes.remove(routeId));
    }
  }

  @override
  Widget build(BuildContext context) {
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
                      'Your delivery schedule for today',
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
                        count: _activeRoutes.length,
                        isActive: _activeTab == 0,
                        onTap: () => setState(() => _activeTab = 0),
                      ),
                      _Tab(
                        label: 'Completed',
                        count: _completedRoutes.length,
                        isActive: _activeTab == 1,
                        onTap: () => setState(() => _activeTab = 1),
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
                        child: _activeTab == 0
                            ? _buildActiveList(context)
                            : _buildCompletedList(),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
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

  Widget _buildActiveList(BuildContext context) {
    if (_activeRoutes.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 40),
          EmptyState(
            title: 'No active assignments',
            message: 'Your routes for today will appear here.',
            icon: Icons.local_shipping_outlined,
          ),
        ],
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: _activeRoutes.length,
      itemBuilder: (ctx, i) {
        final route = _activeRoutes[i];
        final routeId = route['id'] as String;
        final stops = (route['stops'] as List? ?? []);
        final totalStops = stops.length;
        final completedStops =
            stops.where((s) => (s as Map)['status'] == 'completed').length;
        final isStarting = _startingRoutes.contains(routeId);

        return _RouteCard(
          routeId: routeId,
          name: route['name'] as String? ?? 'Route',
          status: route['status'] as String? ?? 'assigned',
          totalStops: totalStops,
          completedStops: completedStops,
          date: route['date'] as String? ?? '',
          isStarting: isStarting,
          onStart: () => _startRoute(context, route),
          onContinue: () {
            // Route already started, re-load stops and go to navigation
            RouteProgressScope.of(context).loadStops(stops);
            context.push('/navigation');
          },
        );
      },
    );
  }

  Widget _buildCompletedList() {
    if (_completedRoutes.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 40),
          EmptyState(
            title: 'No completed routes',
            message: 'Routes you finish today will appear here.',
            icon: Icons.inventory_2_outlined,
          ),
        ],
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: _completedRoutes.length,
      itemBuilder: (ctx, i) {
        final route = _completedRoutes[i];
        final stops = (route['stops'] as List? ?? []);
        final totalStops = stops.length;

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
                      route['name'] as String? ?? 'Route',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$totalStops stops completed',
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
      },
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
                  Icons.local_shipping_outlined,
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
                      '$totalStops stops · $date',
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
                  color: isActive
                      ? AppColors.primaryLight
                      : AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  isActive ? 'Active' : 'Assigned',
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
              onPressed: isStarting
                  ? null
                  : isActive
                  ? onContinue
                  : onStart,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
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
                      isActive ? 'Continue Route' : 'Start Route',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
