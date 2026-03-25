import 'dart:async';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class OfflineBanner extends StatefulWidget {
  final bool apiOffline;
  const OfflineBanner({super.key, this.apiOffline = false});

  @override
  State<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends State<OfflineBanner> {
  late bool _isOffline;
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  @override
  void initState() {
    super.initState();
    _isOffline = widget.apiOffline;
    _checkInit();
    _subscription = Connectivity().onConnectivityChanged.listen((results) {
      if (mounted) {
        setState(() {
          _isOffline = results.every((r) => r == ConnectivityResult.none);
        });
      }
    });
  }

  Future<void> _checkInit() async {
    final results = await Connectivity().checkConnectivity();
    if (mounted) {
      setState(() {
        _isOffline = results.every((r) => r == ConnectivityResult.none);
      });
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.apiOffline && !_isOffline) return const SizedBox.shrink();
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: const Color(0xFFFEF3C7),
      child: Row(
        children: const [
          Icon(Icons.wifi_off, size: 16, color: Color(0xFFD97706)),
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
    );
  }
}
