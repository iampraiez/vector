import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/colors.dart';
import '../../core/constants/map_constants.dart';
import '../../core/services/location_service.dart';
import '../../core/services/map_service.dart';
import '../../core/services/driver_api_service.dart';
import '../../core/services/navigation_foreground_task_handler.dart';
import '../../main.dart' show RouteProgressScope;

class NavigationScreen extends StatefulWidget {
  const NavigationScreen({super.key});

  @override
  State<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  static bool _foregroundTaskSdkInited = false;

  final MapController _mapController = MapController();

  LatLng? _currentPosition;
  StreamSubscription<Position>? _positionStream;
  Timer? _locationSyncTimer;
  bool _locationPermissionGranted = false;
  bool _mapReady = false;

  // Route calculation state
  List<LatLng> _routePoints = [];
  String _distanceLabel = '---';
  String _etaLabel = '-- mins';
  Timer? _routeUpdateTimer;
  bool _followUser = true; // Added followUser toggle
  bool _isArriving = false;

  @override
  void initState() {
    super.initState();
    FlutterForegroundTask.addTaskDataCallback(_onForegroundLocationFromTask);
    _initLocationTracking();
  }

  @override
  void dispose() {
    FlutterForegroundTask.removeTaskDataCallback(_onForegroundLocationFromTask);
    _positionStream?.cancel();
    _locationSyncTimer?.cancel();
    _routeUpdateTimer?.cancel();
    unawaited(_stopForegroundLocationService());
    _mapController.dispose();
    super.dispose();
  }

  void _onForegroundLocationFromTask(Object data) {
    if (!mounted || data is! Map) return;
    final map = Map<String, dynamic>.from(data);
    final lat = map['lat'];
    final lng = map['lng'];
    if (lat is num && lng is num) {
      setState(() {
        _currentPosition = LatLng(lat.toDouble(), lng.toDouble());
      });
      _fetchDirections();
      if (_mapReady && _followUser) {
        _mapController.move(_currentPosition!, _mapController.camera.zoom);
      }
    }
  }

  void _startPeriodicLocationServerSync() {
    _locationSyncTimer?.cancel();
    _locationSyncTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      if (_currentPosition != null) {
        await MapService.instance.updateDriverLocation(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
        );
      }
    });
  }

  Future<void> _startAndroidForegroundLocationService() async {
    if (!Platform.isAndroid) return;

    if (!_foregroundTaskSdkInited) {
      FlutterForegroundTask.init(
        androidNotificationOptions: AndroidNotificationOptions(
          channelId: 'vector_delivery_navigation',
          channelName: 'Live delivery tracking',
          channelDescription:
              'Keeps GPS active so your fleet can see your position during a route.',
          onlyAlertOnce: true,
        ),
        iosNotificationOptions: const IOSNotificationOptions(
          showNotification: false,
          playSound: false,
        ),
        foregroundTaskOptions: ForegroundTaskOptions(
          eventAction: ForegroundTaskEventAction.repeat(5000),
          autoRunOnBoot: false,
          autoRunOnMyPackageReplaced: false,
          allowWakeLock: true,
          allowWifiLock: true,
        ),
      );
      _foregroundTaskSdkInited = true;
    }

    if (await FlutterForegroundTask.isRunningService) {
      return;
    }

    final result = await FlutterForegroundTask.startService(
      serviceId: 88801,
      serviceTypes: const [ForegroundServiceTypes.location],
      notificationTitle: 'Vector Delivery',
      notificationText: 'Sharing your location with the fleet',
      callback: navigationForegroundTaskStartCallback,
    );

    if (result is ServiceRequestFailure) {
      if (kDebugMode) {
        debugPrint(
          '[Navigation] Foreground service failed, using in-app timer: ${result.error}',
        );
      }
      _startPeriodicLocationServerSync();
    }
  }

  Future<void> _stopForegroundLocationService() async {
    if (!Platform.isAndroid) return;
    if (!await FlutterForegroundTask.isRunningService) return;
    await FlutterForegroundTask.stopService();
  }

  Future<void> _initLocationTracking() async {
    final locService = LocationService.instance;
    bool serviceEnabled = await locService.isServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) setState(() => _locationPermissionGranted = false);
      return;
    }

    LocationPermission permission = await locService.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await locService.requestPermission();
    }
    if (permission == LocationPermission.deniedForever ||
        permission == LocationPermission.denied) {
      if (mounted) setState(() => _locationPermissionGranted = false);
      return;
    }

    if (mounted) setState(() => _locationPermissionGranted = true);

    // Get initial position
    final pos = await locService.getCurrentPosition();
    if (pos != null && mounted) {
      setState(() => _currentPosition = LatLng(pos.latitude, pos.longitude));
      if (_mapReady) {
        _mapController.move(_currentPosition!, 16);
      }
    }

    // Stream location changes
    _positionStream =
        locService.getPositionStream(distanceFilter: 10).listen((Position p) {
          if (!mounted) return;
          setState(() => _currentPosition = LatLng(p.latitude, p.longitude));
          
          // Refresh route on significant movement
          _fetchDirections();

          if (_mapReady && _followUser) {
            _mapController.move(_currentPosition!, _mapController.camera.zoom);
          }
        });

    // Initial route fetch
    _fetchDirections();

    // Periodic route refresh (every 30 seconds)
    _routeUpdateTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _fetchDirections();
    });

    // Android: foreground service keeps GPS + server sync when the screen locks.
    // iOS / fallback: same 5s timer as before.
    if (Platform.isAndroid) {
      await _startAndroidForegroundLocationService();
    } else {
      _startPeriodicLocationServerSync();
    }
  }

  Future<void> _fetchDirections() async {
    if (!mounted || _currentPosition == null) return;

    final progress = RouteProgressScope.of(context);
    final currentStop = progress.currentStop;
    if (currentStop == null || currentStop.lat == null || currentStop.lng == null) {
      return;
    }

    final destination = LatLng(currentStop.lat!, currentStop.lng!);
    final routeData = await MapService.instance.getDirections([
      _currentPosition!,
      destination,
    ]);

    if (routeData != null && mounted) {
      setState(() {
        _routePoints = routeData.polylinePoints;
        _distanceLabel = '${routeData.distanceKm.toStringAsFixed(1)} km';
        _etaLabel = '${routeData.durationMin} mins';
      });
    }
  }

  void _stopLocationTracking() {
    _positionStream?.cancel();
    _locationSyncTimer?.cancel();
    _positionStream = null;
    _locationSyncTimer = null;
    unawaited(_stopForegroundLocationService());
  }

  @override
  Widget build(BuildContext context) {
    final progress = RouteProgressScope.of(context);
    final currentStop = progress.currentStop;
    final upcomingStops = progress.upcomingStops;

    if (currentStop == null || progress.isRouteComplete) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.go('/assignments');
      });
      return const Scaffold(
        body: Center(child: Text('Route Complete! Heading back...')),
      );
    }

    final currentData = {
      'id': progress.currentIndex + 1,
      'customer': currentStop.customerName,
      'address': currentStop.address,
      'phone': currentStop.phone,
      'eta': _etaLabel,
      'distance': _distanceLabel,
      'packages': currentStop.packages,
    };
    final remainingData = upcomingStops
        .map(
          (s) => {
            'id': progress.allStops.indexOf(s) + 1,
            'customer': s.customerName,
            'address': s.address,
            'phone': s.phone,
            'eta': s.eta,
            'distance': s.distance,
            'packages': s.packages,
          },
        )
        .toList();

    final mapCenter = _currentPosition ?? const LatLng(6.5244, 3.3792);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // ── Real Map Background ─────────────────────────────────────────
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: mapCenter,
                initialZoom: 15,
                onMapReady: () => setState(() => _mapReady = true),
                onPositionChanged: (pos, hasGesture) {
                  if (hasGesture && _followUser) {
                    setState(() => _followUser = false);
                  }
                },
              ),
              children: [
                TileLayer(
                  urlTemplate: MapConstants.osmTileUrl,
                  userAgentPackageName: 'com.vector.driver',
                ),

                // Polyline Layer for Route
                if (_routePoints.isNotEmpty)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _routePoints,
                        color: AppColors.primary,
                        strokeWidth: 3,
                        borderColor: AppColors.primary.withValues(alpha: 0.3),
                        borderStrokeWidth: 1.5,
                      ),
                    ],
                  ),

                // Markers
                MarkerLayer(
                  markers: [
                    // Current position marker
                    if (_currentPosition != null)
                      Marker(
                        point: _currentPosition!,
                        width: 52,
                        height: 52,
                        child: _PulsingLocationDot(),
                      ),
                    
                    // Destination marker (Current Stop)
                    if (currentStop.lat != null && currentStop.lng != null)
                      Marker(
                        point: LatLng(currentStop.lat!, currentStop.lng!),
                        width: 52,
                        height: 52,
                        child: _DestinationMarker(stopId: currentStop.id),
                      ),
                  ],
                ),

                // OSM attribution
                RichAttributionWidget(
                  attributions: [
                    TextSourceAttribution('© OpenStreetMap contributors'),
                  ],
                ),
              ],
            ),
          ),

          // ── Top Control Bar ─────────────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          _stopLocationTracking();
                          context.go('/assignments');
                        },
                        icon: const Icon(
                          Icons.close,
                          color: AppColors.textPrimary,
                        ),
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            if (_currentPosition != null) {
                              _mapController.move(_currentPosition!, 16);
                              setState(() => _followUser = true);
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: AppColors.border.withValues(alpha: 0.15),
                              ),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        AppColors.primary,
                                        Color(0xFF047857),
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                    Icons.near_me,
                                    color: Colors.white,
                                    size: 24,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        '${currentData['eta']}',
                                        style: TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.w700,
                                          color: Theme.of(
                                            context,
                                          ).colorScheme.primary,
                                          height: 1,
                                        ),
                                      ),
                                      Text(
                                        '${currentData['distance']} away',
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Theme.of(
                                            context,
                                          ).colorScheme.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Stop progress pill
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.border.withValues(alpha: 0.5),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.inventory_2_outlined,
                          size: 16,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Stop ${progress.currentIndex + 1} of ${progress.allStops.length}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),

          // ── Location disabled banner ────────────────────────────────────
          if (!_locationPermissionGranted)
            Positioned(
              top: 100,
              left: 16,
              right: 16,
              child: SafeArea(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: const Row(
                    children: [
                      Icon(
                        Icons.location_off,
                        size: 18,
                        color: Color(0xFFD97706),
                      ),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Location access disabled — enable it in Settings for real-time tracking.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF92400E),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // ── Bottom Draggable Drawer ─────────────────────────────────────
          DraggableScrollableSheet(
            initialChildSize: 0.5,
            minChildSize: 0.3,
            maxChildSize: 0.9,
            builder: (context, scrollController) {
              return Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(24),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      offset: const Offset(0, -4),
                      blurRadius: 24,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 12),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.outlineVariant,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    Expanded(
                      child: ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                        children: [
                          _buildNextStopInfo(currentData),
                          const SizedBox(height: 16),
                          _buildPackageInfo(currentData),
                          const SizedBox(height: 20),
                          _buildActionButtons(currentData),
                          const SizedBox(height: 20),
                          _buildArriveButton(context, currentStop.id),
                          const SizedBox(height: 24),
                          const Divider(),
                          const SizedBox(height: 24),
                          if (remainingData.isNotEmpty) ...[
                            _buildUpcomingStops(remainingData),
                          ] else ...[
                            _buildNoMoreStops(),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPackageInfo(Map<String, dynamic> currentData) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            Icons.inventory_2_rounded,
            size: 20,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(width: 10),
          Text(
            '${currentData['packages']} ${currentData['packages'] == 1 ? 'package' : 'packages'} to deliver',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNextStopInfo(Map<String, dynamic> currentData) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [
                AppColors.primary,
                Theme.of(context).colorScheme.primary,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            '${currentData['id']}',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'NEXT STOP',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).colorScheme.primary,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${currentData['customer']}',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.location_on,
                    size: 16,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      '${currentData['address']}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(Map<String, dynamic> currentData) {
    final hasPhone = currentData['phone'] != null && (currentData['phone'] as String).isNotEmpty;
    
    return Row(
      children: [
        Expanded(
          child: Opacity(
            opacity: hasPhone ? 1.0 : 0.4,
            child: _ActionBtn(
              icon: Icons.phone,
              label: 'Call',
              onTap: hasPhone ? () {
                final uri = Uri.parse('tel:${currentData['phone']}');
                launchUrl(uri);
              } : null,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Opacity(
            opacity: hasPhone ? 1.0 : 0.4,
            child: _ActionBtn(
              icon: Icons.message,
              label: 'Message',
              onTap: hasPhone ? () {
                final uri = Uri.parse('sms:${currentData['phone']}');
                launchUrl(uri);
              } : null,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildArriveButton(BuildContext context, String stopId) {
    final canTap = !_isArriving && stopId.isNotEmpty;
    return InkWell(
      onTap: canTap
          ? () async {
              setState(() => _isArriving = true);
              try {
                await DriverApiService.instance.arriveAtStop(stopId);
                if (!mounted) return;
                _stopLocationTracking();
                setState(() => _isArriving = false);
                if (!context.mounted) return;
                context.push('/proof-delivery?fromNav=true');
              } catch (_) {
                if (!mounted) return;
                setState(() => _isArriving = false);
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Failed to mark arrival. Please try again.'),
                  ),
                );
              }
            }
          : null,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.15),
              offset: const Offset(0, 4),
              blurRadius: 10,
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_isArriving) ...[
              const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 10),
            ],
            const Text(
              'Mark as Arrived',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            if (!_isArriving) ...[
              const SizedBox(width: 8),
              const Icon(
                Icons.check_circle_outline_rounded,
                color: Colors.white,
                size: 20,
              ),
            ],
          ],
        ),
      ),
    );
  }


  Widget _buildUpcomingStops(List<Map<String, dynamic>> remainingStops) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'UPCOMING STOPS',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 12),
        ...remainingStops.map(
          (s) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.border.withValues(alpha: 0.15),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.border.withValues(alpha: 0.1),
                      width: 2,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${s['id']}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s['customer'] as String,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        s['address'] as String,
                        style: TextStyle(
                          fontSize: 13,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNoMoreStops() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: AppColors.white,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.flag_outlined,
              color: AppColors.primary,
              size: 28,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Final stop of this route',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Complete this delivery to finish the route.',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _DestinationMarker extends StatelessWidget {
  final String stopId;
  const _DestinationMarker({required this.stopId});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.15),
          ),
        ),
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(
            Icons.location_on_rounded,
            color: Colors.white,
            size: 18,
          ),
        ),
      ],
    );
  }
}

// ── Sub-widgets ──────────────────────────────────────────────────────────────

class _PulsingLocationDot extends StatefulWidget {
  @override
  State<_PulsingLocationDot> createState() => _PulsingLocationDotState();
}

class _PulsingLocationDotState extends State<_PulsingLocationDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _radiusAnim;
  late Animation<double> _opacityAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _radiusAnim = Tween<double>(begin: 12, end: 26).animate(_ctrl);
    _opacityAnim = Tween<double>(begin: 0.5, end: 0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, _) => Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: _radiusAnim.value * 2,
            height: _radiusAnim.value * 2,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(
                0xFF3B82F6,
              ).withValues(alpha: _opacityAnim.value),
            ),
          ),
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF3B82F6),
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.4),
                  blurRadius: 8,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  const _ActionBtn({
    required this.icon,
    required this.label,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
            width: 1.5,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
