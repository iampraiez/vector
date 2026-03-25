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
import '../../shared/widgets/offline_banner.dart';

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

  int _activeTab = 0; // 0 = Active, 1 = Upcoming, 2 = Completed (today)

  bool _isLoading = true;
  bool _isOffline = false;
  String? _errorMessage;

  // Assignments from API
  List<Map<String, dynamic>> _activeAssignments = [];
  List<Map<String, dynamic>> _upcomingAssignments = [];
  List<Map<String, dynamic>> _completedAssignments = [];

  // Track which routes are being started (spinner per card)
  final Set<String> _startingRoutes = {};

  // AI Route Optimization Selection
  bool _isSelectionMode = false;
  final Set<String> _selectedStopIds = {};

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
    _completedAssignments =
        (data['completed'] as List? ?? []).cast<Map<String, dynamic>>();
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
    if (await OfflineService.instance.checkAndShowOfflineSnackBar(context)) return;
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

  Future<void> _rejectRoute(BuildContext context, Map<String, dynamic> item) async {
    if (await OfflineService.instance.checkAndShowOfflineSnackBar(context)) return;
    final isRoute = item['type'] == 'route';
    if (!isRoute) return;

    final itemId = item['id'] as String;

    if (!context.mounted) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reject Route?'),
        content: const Text('Are you sure you want to reject this assignment?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Reject'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _startingRoutes.add(itemId));
    try {
      await _api.rejectRoute(itemId);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Route rejected')),
        );
        _loadData(forceRefresh: true);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to reject: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _startingRoutes.remove(itemId));
    }
  }

  void _toggleSelection(String id) {
    setState(() {
      if (_selectedStopIds.contains(id)) {
        _selectedStopIds.remove(id);
        if (_selectedStopIds.isEmpty) _isSelectionMode = false;
      } else {
        _selectedStopIds.add(id);
        _isSelectionMode = true;
      }
    });
  }

  void _clearSelection() {
    setState(() {
      _selectedStopIds.clear();
      _isSelectionMode = false;
    });
  }

  Future<void> _optimizeSelection(BuildContext context) async {
    if (_selectedStopIds.isEmpty) return;
    
    // Navigate to Route Preview in "Draft" mode
    // We pass the selected stop IDs and a flag
    context.push('/route-preview', extra: {
      'isDraft': true,
      'stopIds': _selectedStopIds.toList(),
    });
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
    return Scaffold(
      backgroundColor: AppColors.white,
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Offline banner
OfflineBanner(apiOffline: _isOffline),

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
                  children: [
                    Expanded(
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
                    if (_isSelectionMode)
                      TextButton(
                        onPressed: _clearSelection,
                        child: const Text(
                          'Cancel',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
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
                        label: 'Done',
                        count: _completedAssignments.length,
                        isActive: _activeTab == 2,
                        onTap: () => setState(() {
                          _activeTab = 2;
                          _clearSelection();
                        }),
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
      floatingActionButton: ((_activeTab == 0 || _activeTab == 1) &&
              _selectedStopIds.isNotEmpty)
          ? FloatingActionButton.extended(
              onPressed: () => _optimizeSelection(context),
              backgroundColor: AppColors.primary,
              icon: const Icon(Icons.route_outlined, color: Colors.white),
              elevation: 4,
              label: Text(
                'Sequence ${_selectedStopIds.length} Orders',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            )
          : null,
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
      emptyTitle = 'Nothing completed yet today';
      emptyMessage =
          'Finished or cancelled routes and stops from today show here.';
      emptyIcon = Icons.check_circle_outline;
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

        final isCompletedTab = _activeTab == 2;
        if (isRoute) {
          final stops = (item['stops'] as List? ?? []);
          return _RouteCard(
            routeId: item['id'],
            name: item['name'] ?? 'Route',
            status: item['status'] ?? 'assigned',
            totalStops: stops.length,
            completedStops:
                stops.where((s) => (s as Map)['status'] == 'completed').length,
            date: item['date'] ?? '',
            isStarting: _startingRoutes.contains(item['id']),
            onStart: () => _startRoute(context, item),
            onReject: isRoute ? () => _rejectRoute(context, item) : null,
            onContinue: () {
              RouteProgressScope.of(context).loadStops(stops);
              context.push('/navigation');
            },
            isUpcoming: _activeTab == 1,
            isCompleted: isCompletedTab,
            stops: stops,
            isSelected: _selectedStopIds.contains(item['id']),

            isSelectionMode: _isSelectionMode && !isCompletedTab,
            onLongPress: isCompletedTab
                ? null
                : () => _toggleSelection(item['id'] as String),
            onSelectionToggle: isCompletedTab
                ? null
                : () => _toggleSelection(item['id'] as String),
          );
        } else {
          // Standalone Stop
          final ext = (item['external_id'] ?? item['externalId'])?.toString().trim() ?? '';
          final cust = (item['customer_name'] ?? item['customerName'])?.toString().trim() ?? '';
          final displayName = ext.isNotEmpty ? 'Order #$ext' : (cust.isNotEmpty ? cust : 'Order');
          return _RouteCard(
            routeId: item['id'],
            name: displayName,
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
            isCompleted: isCompletedTab,
            stops: [item],
            isSelected: _selectedStopIds.contains(item['id']),

            isSelectionMode: _isSelectionMode && !isCompletedTab,
            onLongPress: isCompletedTab
                ? null
                : () => _toggleSelection(item['id'] as String),
            onSelectionToggle: isCompletedTab
                ? null
                : () => _toggleSelection(item['id'] as String),
          );
        }
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
  final bool isUpcoming;
  final bool isStandalone;
  final bool isCompleted;
  final List<dynamic>? stops;
  final bool isSelected;
  final bool isSelectionMode;
  final VoidCallback? onLongPress;
  final VoidCallback? onSelectionToggle;
  final VoidCallback? onReject;

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
    this.isCompleted = false,
    this.stops,
    this.isSelected = false,
    this.isSelectionMode = false,
    this.onLongPress,
    this.onSelectionToggle,
    this.onReject,
  });


  @override
  Widget build(BuildContext context) {
    final isActive =
        !isCompleted && (status == 'active' || status == 'in_progress');
    final progress = totalStops > 0 ? completedStops / totalStops : 0.0;

    Color completedBorder() {
      switch (status) {
        case 'failed':
          return AppColors.error.withValues(alpha: 0.35);
        case 'cancelled':
          return AppColors.textMuted.withValues(alpha: 0.45);
        default:
          return AppColors.success.withValues(alpha: 0.4);
      }
    }

    (Color bg, Color fg, IconData icon) completedIconStyle() {
      switch (status) {
        case 'failed':
          return (AppColors.errorLight, AppColors.error, Icons.error_outline);
        case 'cancelled':
          return (
            AppColors.surface,
            AppColors.textMuted,
            Icons.cancel_outlined,
          );
        case 'returned':
          return (
            AppColors.warningLight,
            AppColors.warning,
            Icons.undo_rounded,
          );
        default:
          return (
            AppColors.successLight,
            AppColors.success,
            Icons.check_circle_rounded,
          );
      }
    }

    String completedBadgeLabel() {
      switch (status) {
        case 'failed':
          return 'Failed';
        case 'cancelled':
          return 'Cancelled';
        case 'returned':
          return 'Returned';
        default:
          return 'Completed';
      }
    }

    (Color bg, Color fg) completedBadgeColors() {
      switch (status) {
        case 'failed':
          return (AppColors.errorLight, AppColors.error);
        case 'cancelled':
          return (AppColors.surface, AppColors.textSecondary);
        case 'returned':
          return (AppColors.warningLight, AppColors.warning);
        default:
          return (AppColors.successLight, AppColors.success);
      }
    }

    final ci = isCompleted ? completedIconStyle() : null;
    final cb = isCompleted ? completedBadgeColors() : null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onLongPress: isCompleted ? null : onLongPress,
        onTap: isCompleted
            ? null
            : isSelectionMode
                ? onSelectionToggle
                : isStarting
                    ? null
                    : isUpcoming
                        ? () => context.push(
                              '/route-preview',
                              extra: {
                                'id': routeId,
                                'name': name,
                                'status': status,
                                'date': date,
                                'stops': stops ?? [],
                              },

                            )
                        : isActive
                            ? onContinue
                            : onStart,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.p4),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primary.withValues(alpha: 0.05)
                : AppColors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected
                  ? AppColors.primary
                  : isCompleted
                      ? completedBorder()
                      : isActive
                          ? AppColors.primary.withValues(alpha: 0.3)
                          : isUpcoming
                              ? const Color(0xFF3B82F6).withValues(alpha: 0.4)
                              : AppColors.border,
              width: isSelected ? 2 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: isSelected
                    ? AppColors.primary.withValues(alpha: 0.08)
                    : isCompleted
                        ? AppColors.success.withValues(alpha: 0.04)
                        : isActive
                            ? AppColors.primary.withValues(alpha: 0.08)
                            : isUpcoming
                                ? const Color(0xFF3B82F6).withValues(alpha: 0.06)
                                : Colors.black.withValues(alpha: 0.03),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
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
                            color: isCompleted
                                ? ci!.$1
                                : isSelected
                                    ? AppColors.white
                                    : isActive
                                        ? AppColors.successLight
                                        : isUpcoming
                                            ? const Color(0xFFEFF6FF)
                                            : AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isCompleted
                                ? ci!.$3
                                : isStandalone
                                    ? Icons.inventory_2_outlined
                                    : Icons.local_shipping_outlined,
                            size: 22,
                            color: isCompleted
                                ? ci!.$2
                                : isSelected || isActive
                                    ? AppColors.primary
                                    : isUpcoming
                                        ? const Color(0xFF2563EB)
                                        : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                  color: AppColors.textPrimary,
                                  decoration: isCompleted &&
                                          status == 'cancelled'
                                      ? TextDecoration.lineThrough
                                      : null,
                                  decorationColor: AppColors.textMuted,
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
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: isCompleted
                                    ? cb!.$1
                                    : isUpcoming
                                        ? const Color(0xFFEFF6FF)
                                        : isActive
                                            ? AppColors.primaryLight
                                            : AppColors.surface,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                isCompleted
                                    ? completedBadgeLabel()
                                    : isUpcoming
                                        ? 'Upcoming'
                                        : (isActive ? 'Active' : 'Assigned'),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: isCompleted
                                      ? cb!.$2
                                      : isUpcoming
                                          ? const Color(0xFF2563EB)
                                          : isActive
                                              ? AppColors.primary
                                              : AppColors.textMuted,
                                ),
                              ),
                            ),
                            if (!isSelectionMode && !isCompleted) ...[
                              const SizedBox(height: 8),
                              Icon(
                                Icons.chevron_right_rounded,
                                color: isUpcoming
                                    ? const Color(0xFF2563EB)
                                    : isActive
                                        ? AppColors.primary
                                        : AppColors.textMuted.withValues(alpha: 0.5),
                                size: 24,
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                    if (isCompleted && totalStops > 0) ...[
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
                              color: AppColors.success,
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
                            widthFactor: progress.clamp(0.0, 1.0),
                            child: Container(
                              height: 4,
                              decoration: BoxDecoration(
                                color: AppColors.success,
                                borderRadius: BorderRadius.circular(99),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
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
                    if (isStarting) ...[
                      const SizedBox(height: 12),
                      const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                            strokeWidth: 2,
                          ),
                        ),
                      ),
                    ],
                    if (isUpcoming) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          if (onReject != null) ...[
                            Expanded(
                              child: OutlinedButton(
                                onPressed: isStarting ? null : onReject,
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.error,
                                  side: BorderSide(color: AppColors.error.withValues(alpha: 0.5)),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                ),
                                child: const Text(
                                  'Reject',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                          ],
                          if (date == DateTime.now().toString().split(' ')[0])
                            Expanded(
                              child: ElevatedButton(
                                onPressed: isStarting ? null : onStart,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF2563EB),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  padding: const EdgeInsets.symmetric(vertical: 11),
                                ),
                                child: const Text(
                                  'Start Early',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          if (date != DateTime.now().toString().split(' ')[0] && onReject == null)
                            const SizedBox.shrink(),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
