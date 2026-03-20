import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/theme/colors.dart';
import '../../core/constants/map_constants.dart';
import '../../core/services/map_service.dart';
import '../../shared/widgets/buttons.dart';
import '../../main.dart' show RouteProgressScope;
import '../../core/services/driver_api_service.dart';

class RoutePreviewScreen extends StatefulWidget {
  final Map<String, dynamic>? routeData;
  const RoutePreviewScreen({super.key, this.routeData});

  @override
  State<RoutePreviewScreen> createState() => _RoutePreviewScreenState();
}

class _RoutePreviewScreenState extends State<RoutePreviewScreen> {
  final MapController _mapController = MapController();

  // Geocoded positions of each stop
  List<LatLng?> _stopCoords = [];
  List<LatLng> _routePolyline = [];

  double _distanceKm = 0;
  int _durationMin = 0;
  bool _loading = true;

  // Stops derived from routeData or empty if missing
  List<Map<String, dynamic>> _dynamicStops = [];
  bool _fetchingFullRoute = false;

  List<Map<String, dynamic>> get _stops {
    final raw = widget.routeData?['stops'] as List? ?? [];
    if (raw.isNotEmpty) return raw.cast<Map<String, dynamic>>();
    return _dynamicStops;
  }

  String get _routeName => widget.routeData?['name'] as String? ?? 'Delivery Route';
  String? get _routeId => widget.routeData?['id'] as String?;

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    if (_stops.isEmpty && _routeId != null) {
      setState(() => _fetchingFullRoute = true);
      try {
        final data = await DriverApiService.instance.getRoutePreview(_routeId!);
        if (mounted) {
          setState(() {
            _dynamicStops = (data['stops'] as List? ?? []).cast<Map<String, dynamic>>();
            _fetchingFullRoute = false;
          });
          if (_dynamicStops.isNotEmpty) {
            _geocodeStopsAndDrawRoute();
          } else {
            setState(() => _loading = false);
          }
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _fetchingFullRoute = false;
            _loading = false;
          });
        }
      }
    } else if (_stops.isNotEmpty) {
      _geocodeStopsAndDrawRoute();
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _geocodeStopsAndDrawRoute() async {
    final coords = await Future.wait(
      _stops.map((s) => MapService.instance.geocodeAddress(s['address'] as String)),
    );

    final validCoords = coords.whereType<LatLng>().toList();

    MapRouteData? route;
    if (validCoords.length >= 2) {
      route = await MapService.instance.getDirections(validCoords);
    }

    if (!mounted) return;
    setState(() {
      _stopCoords = coords;
      _routePolyline = route?.polylinePoints ?? validCoords;
      _distanceKm = route?.distanceKm ?? 0;
      _durationMin = route?.durationMin ?? 0;
      _loading = false;
    });

    // Pan camera to show the full route
    if (validCoords.isNotEmpty) {
      final bounds = LatLngBounds.fromPoints(validCoords);
      _mapController.fitCamera(
        CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(60)),
      );
    }
  }

  String get _durationStr {
    if (_durationMin == 0) return '--';
    final h = _durationMin ~/ 60;
    final m = _durationMin % 60;
    if (h == 0) return '${m}m';
    return '${h}h ${m}m';
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    final dateStr = 'Today • ${months[now.month - 1]} ${now.day}';

    final totalPkgs = _stops.fold<int>(0, (sum, s) => sum + (s['packages'] as int));
    final validCoords = _stopCoords.whereType<LatLng>().toList();
    final center = validCoords.isNotEmpty
        ? LatLng(
            validCoords.map((c) => c.latitude).reduce((a, b) => a + b) / validCoords.length,
            validCoords.map((c) => c.longitude).reduce((a, b) => a + b) / validCoords.length,
          )
        : const LatLng(6.5244, 3.3792); // Lagos default

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(12, 16, 20, 16),
              color: AppColors.white,
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(_routeName, style: const TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                        Text(dateStr, style: TextStyle(fontSize: 13, color: AppColors.textPrimary.withValues(alpha: 0.5), fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => Share.share(
                        'Check out my delivery route for $dateStr: ${_stops.length} stops, ${_distanceKm.toStringAsFixed(1)} km total.',
                        subject: 'Vector Delivery Route',
                      ),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(border: Border.all(color: AppColors.border.withValues(alpha: 0.15)), borderRadius: BorderRadius.circular(10)),
                        child: const Row(
                          children: [
                            Icon(Icons.share_outlined, size: 16, color: AppColors.textPrimary),
                            SizedBox(width: 6),
                            Text('Share', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    // ── Map Section ─────────────────────────────────────────────
                    SizedBox(
                      height: 300,
                      child: Stack(
                        children: [
                          FlutterMap(
                            mapController: _mapController,
                            options: MapOptions(
                              initialCenter: center,
                              initialZoom: 12,
                            ),
                            children: [
                              TileLayer(
                                urlTemplate: MapConstants.osmTileUrl,
                                userAgentPackageName: 'com.vector.driver',
                              ),
                              if (_routePolyline.isNotEmpty)
                                PolylineLayer(
                                  polylines: [
                                    Polyline(
                                      points: _routePolyline,
                                      color: AppColors.primary,
                                      strokeWidth: 4.5,
                                    ),
                                  ],
                                ),
                              if (_stopCoords.isNotEmpty)
                                MarkerLayer(
                                  markers: [
                                    for (int i = 0; i < _stops.length; i++)
                                      if (_stopCoords.length > i && _stopCoords[i] != null)
                                        Marker(
                                          point: _stopCoords[i]!,
                                          width: 36,
                                          height: 36,
                                          child: _StopMarker(number: i + 1, isFirst: i == 0),
                                        ),
                                  ],
                                ),
                            ],
                          ),

                          // Loading overlay
                          if (_loading || _fetchingFullRoute)
                            const Positioned.fill(
                              child: ColoredBox(
                                color: Color(0x88FFFFFF),
                                child: Center(child: CircularProgressIndicator()),
                              ),
                            ),

                          // Attribution
                          Positioned(
                            bottom: 4,
                            right: 8,
                            child: Text(
                              '© OpenStreetMap contributors',
                              style: TextStyle(fontSize: 9, color: Colors.black.withValues(alpha: 0.5)),
                            ),
                          ),

                          // Route optimized badge
                          if (!_loading && _distanceKm > 0)
                            Positioned(
                              bottom: 16,
                              left: 16,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(12), boxShadow: const [BoxShadow(color: Color(0x26000000), offset: Offset(0, 4), blurRadius: 12)]),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 32, height: 32,
                                      decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(8)),
                                      child: const Icon(Icons.route, color: AppColors.primary, size: 16),
                                    ),
                                    const SizedBox(width: 8),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('${_distanceKm.toStringAsFixed(1)} km', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                        Text('$_durationStr drive time', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    // Stats
                    Container(
                      color: Theme.of(context).colorScheme.surface,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                      child: Row(
                        children: [
                          Expanded(child: _StatCard(icon: Icons.location_on, label: 'Stops', value: '${_stops.length}')),
                          const SizedBox(width: 12),
                          Expanded(child: _StatCard(icon: Icons.inventory_2, label: 'Packages', value: '$totalPkgs')),
                          const SizedBox(width: 12),
                          Expanded(child: _StatCard(icon: Icons.schedule, label: 'Time', value: _durationStr)),
                          const SizedBox(width: 12),
                          Expanded(child: _StatCard(icon: Icons.near_me, label: 'Distance', value: _distanceKm > 0 ? '${_distanceKm.toStringAsFixed(1)} km' : '--')),
                        ],
                      ),
                    ),

                    // Stops List
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('DELIVERY SEQUENCE', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurfaceVariant, letterSpacing: 0.5)),
                              TextButton(
                                onPressed: () {},
                                child: Text('Reorder', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.primary)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ..._stops.asMap().entries.map((e) => _StopCard(stop: e.value, isFirst: e.key == 0)),
                          const SizedBox(height: 80),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          border: Border(top: BorderSide(color: AppColors.border.withValues(alpha: 0.15))),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), offset: const Offset(0, -4), blurRadius: 12)],
        ),
        child: AppButton(
          label: 'Start navigation',
          icon: const Icon(Icons.near_me, size: 16),
          isFullWidth: true,
          onPressed: () {
            if (_stops.isNotEmpty) {
              RouteProgressScope.of(context).loadStops(_stops);
              context.push('/navigation');
            } else {
              context.pop();
            }
          },
        ),
      ),
    );
  }
}

// ── Sub-widgets ──────────────────────────────────────────────────────────────

class _StopMarker extends StatelessWidget {
  final int number;
  final bool isFirst;
  const _StopMarker({required this.number, required this.isFirst});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isFirst ? AppColors.primary : AppColors.white,
        border: isFirst ? null : Border.all(color: AppColors.primary, width: 2),
        boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 6, offset: Offset(0, 2))],
      ),
      alignment: Alignment.center,
      child: Text(
        '$number',
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          color: isFirst ? Colors.white : AppColors.primary,
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _StatCard({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _StopCard extends StatelessWidget {
  final Map<String, dynamic> stop;
  final bool isFirst;
  const _StopCard({required this.stop, required this.isFirst});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              gradient: isFirst ? const LinearGradient(colors: [AppColors.primary, Color(0xFF047857)], begin: Alignment.topLeft, end: Alignment.bottomRight) : null,
              color: isFirst ? null : AppColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Text('${(stop['number'] ?? (stop.containsKey('index') ? stop['index']! + 1 : '?'))}', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: isFirst ? AppColors.white : AppColors.primary)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(stop['customer_name'] as String? ?? 'Customer', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textPrimary)),
                    if (isFirst)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                        child: const Text('START', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(stop['address'] as String, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.4)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.schedule, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(stop['eta'] as String, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                    const SizedBox(width: 16),
                    const Icon(Icons.inventory_2_outlined, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${stop['packages']} pkg', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
