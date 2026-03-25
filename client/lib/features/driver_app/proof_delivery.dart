import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui' as ui;
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/theme/colors.dart';
import '../../core/providers/route_progress_provider.dart';
import '../../core/config/env.dart';
import '../../core/services/cloudinary_service.dart';
import '../../core/services/driver_api_service.dart';
import '../../core/services/offline_service.dart';
import '../../main.dart' show RouteProgressScope;

class ProofDeliveryScreen extends StatefulWidget {
  final bool fromNav;
  const ProofDeliveryScreen({super.key, this.fromNav = false});

  @override
  State<ProofDeliveryScreen> createState() => _ProofDeliveryScreenState();
}

class _ProofDeliveryScreenState extends State<ProofDeliveryScreen> {
  final _api = DriverApiService.instance;

  bool _photo = false;
  bool _qrScanned = false;
  String? _capturedPhotoPath;
  String? _scannedQrCode;
  final TextEditingController _notesController = TextEditingController();
  bool _submitting = false;
  bool _uploadingPhoto = false;

  Future<void> _handleSubmit() async {
    if (!_photo || !_qrScanned) return;

    if (!context.mounted) return;
    final isOffline = await OfflineService.instance.isOffline();
    if (!mounted) return;

    if (!Env.isCloudinaryConfigured && !isOffline) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Photo upload is not configured. Build with CLOUDINARY_CLOUD_NAME '
            'and CLOUDINARY_UPLOAD_PRESET (dart-define).',
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() {
      _submitting = true;
      _uploadingPhoto = !isOffline;
    });

    final progress = RouteProgressScope.of(context);
    final stop = progress.currentStop;
    final localPath = _capturedPhotoPath;

    if (stop == null || localPath == null) {
      if (mounted) {
        setState(() {
          _submitting = false;
          _uploadingPhoto = false;
        });
      }
      return;
    }

    String? cloudPhotoUrl;
    try {
      if (isOffline) {
        // Queue for later sync
        await OfflineService.instance.queueDelivery(
          stopId: stop.id,
          localPhotoPath: localPath,
          qrCode: _scannedQrCode,
          notes: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
        );
      } else {
        cloudPhotoUrl = await CloudinaryService.instance.upload(filePath: localPath);
        if (!mounted) return;
        setState(() => _uploadingPhoto = false);

        await _api.completeDelivery(
          stop.id,
          photoUrl: cloudPhotoUrl,
          qrCode: _scannedQrCode,
          notes: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit: $e'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          margin: const EdgeInsets.all(16),
        ),
      );
      setState(() {
        _submitting = false;
        _uploadingPhoto = false;
      });
      return;
    }

    if (!context.mounted) return;

    // Mark current stop complete in local provider and advance index
    final routeComplete = progress.completeCurrentStop(
      photoPath: localPath,
      photoUrl: cloudPhotoUrl,
      qrCode: _scannedQrCode ?? '',
      deliveryNotes: _notesController.text,
    );

    if (routeComplete) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isOffline
                ? '📦 Saved offline. All stops done!'
                : '🎉 Route complete! All deliveries done.',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          backgroundColor: isOffline ? AppColors.warning : AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 3),
        ),
      );
      context.go('/assignments');
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isOffline
                ? '📦 Saved offline. Navigating to stop ${progress.currentIndex + 1}.'
                : '✅ Stop delivered! Navigating to stop ${progress.currentIndex + 1}.',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          backgroundColor: isOffline ? AppColors.warning : AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 2),
        ),
      );
      context.pop();
    }

    if (mounted) {
      setState(() {
        _submitting = false;
        _uploadingPhoto = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isComplete = _photo && _qrScanned;
    // Cache provider once so we don't call of() multiple times per frame
    final RouteProgressProvider? progress = (() {
      try {
        return RouteProgressScope.of(context);
      } catch (_) {
        return null;
      }
    })();
    final currentStop = progress?.currentStop;

    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        onPressed: () => context.pop(),
                        icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Confirm Delivery',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  // Only show "Delivering to" context if launched from navigation or if we identified them via QR
                  if (widget.fromNav || _qrScanned) ...[
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.white.withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.location_on_rounded,
                              color: AppColors.primary,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  currentStop?.customerName ?? 'Recipient',
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  currentStop?.address ?? 'Delivery address',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textPrimary.withValues(alpha: 0.6),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            Expanded(
              child: Container(
                color: AppColors.white,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                  children: [
                    // Photo Section
                  _SectionHeader(title: 'Photo Evidence', isDone: _photo),
                  const SizedBox(height: 12),
                  if (!_photo)
                    InkWell(
                      onTap: () async {
                          final messenger = ScaffoldMessenger.of(context);
                          try {
                            final picker = ImagePicker();
                            final XFile? image = await picker.pickImage(
                              source: ImageSource.camera,
                              maxWidth: 1024,
                              maxHeight: 1024,
                              imageQuality: 70,
                            );
                            if (image != null && mounted) {
                              setState(() {
                                _photo = true;
                                _capturedPhotoPath = image.path;
                              });
                            } else if (mounted) {
                              // Camera was cancelled or failed
                              messenger.showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Camera access denied or cancelled',
                                  ),
                                  behavior: SnackBarBehavior.floating,
                                  backgroundColor: AppColors.warning,
                                ),
                              );
                            }
                          } catch (e) {
                            if (mounted) {
                              messenger.showSnackBar(
                                SnackBar(
                                  content: Text('Failed to capture photo: $e'),
                                  behavior: SnackBarBehavior.floating,
                                  backgroundColor: AppColors.error,
                                ),
                              );
                            }
                        }
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          vertical: 40,
                          horizontal: 20,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: CustomPaint(
                          painter: _DashedBorderPainter(color: AppColors.border),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              vertical: 40,
                              horizontal: 20,
                            ),
                            child: Column(
                              children: [
                                Container(
                                  width: 64,
                                  height: 64,
                                  decoration: const BoxDecoration(
                                    color: AppColors.primaryLight,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.camera_alt_rounded,
                                    size: 32,
                                    color: AppColors.primary,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Take a photo',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Capture delivered package',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 32),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: const [
                                Icon(
                                  Icons.check_circle_rounded,
                                  size: 64,
                                  color: AppColors.primary,
                                ),
                                SizedBox(height: 12),
                                Text(
                                  'Photo Captured',
                                  style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Package evidence saved',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextButton.icon(
                            onPressed: () => setState(() => _photo = false),
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('Retake Photo'),
                            style: TextButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              minimumSize: const Size.fromHeight(48),
                              textStyle: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 32),

                  // Signature Section
                  _SectionHeader(
                    title: 'Scan QR Code',
                    isDone: _qrScanned,
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Scan Customer QR Code',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (!_qrScanned)
                          InkWell(
                            onTap: () {
                              final messenger = ScaffoldMessenger.of(context);
                              final expectedToken = RouteProgressScope.of(context)
                                  .currentStop
                                  ?.trackingToken
                                  ?.trim();
                              if (expectedToken == null || expectedToken.isEmpty) {
                                messenger.showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Delivery code unavailable. Refresh assignments, then open this stop again.',
                                    ),
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                                return;
                              }

                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (ctx) => Container(
                                  height: MediaQuery.of(context).size.height * 0.7,
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                                    child: Stack(
                                      children: [
                                        MobileScanner(
                                          onDetect: (capture) {
                                            if (capture.barcodes.isEmpty) return;
                                            final raw =
                                                capture.barcodes.first.rawValue;
                                            if (raw == null) return;
                                            final scanned = raw.trim();
                                            if (scanned.isEmpty) return;

                                            if (scanned != expectedToken) {
                                              messenger.showSnackBar(
                                                const SnackBar(
                                                  content: Text(
                                                    'Wrong QR code. Please scan the customer\'s code.',
                                                  ),
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                ),
                                              );
                                              return;
                                            }

                                            if (ctx.mounted) ctx.pop();
                                            if (mounted) {
                                              setState(() {
                                                _qrScanned = true;
                                                _scannedQrCode = scanned;
                                              });
                                            }
                                          },
                                        ),
                                        Positioned(
                                          top: 16,
                                          right: 16,
                                          child: Container(
                                            decoration: BoxDecoration(
                                                color: AppColors.white.withValues(alpha: 0.2),
                                                shape: BoxShape.circle,
                                              ),
                                            child: IconButton(
                                              icon: const Icon(Icons.close, color: Colors.white),
                                              onPressed: () {
                                                if (ctx.mounted) ctx.pop();
                                              },
                                            ),
                                          ),
                                        ),
                                        const Positioned(
                                          top: 40,
                                          left: 0,
                                          right: 0,
                                          child: Center(
                                            child: Text(
                                              'Scan Customer QR',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 18,
                                                fontWeight: FontWeight.w600,
                                                shadows: [Shadow(color: Colors.black, blurRadius: 4)],
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              width: double.infinity,
                              height: 160,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAF9),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 56,
                                    height: 56,
                                    decoration: const BoxDecoration(
                                      color: AppColors.primaryLight,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.qr_code_scanner_rounded,
                                      size: 28,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'Tap to Scan',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'Customer has receiving QR code',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 24),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
                            ),
                            child: Column(
                              children: const [
                                Icon(
                                  Icons.check_circle_rounded,
                                  size: 48,
                                  color: AppColors.primary,
                                ),
                                SizedBox(height: 12),
                                Text(
                                  'QR Code Scanned',
                                  style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Verified delivery recipient',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        if (_qrScanned) ...[
                          const SizedBox(height: 12),
                          TextButton.icon(
                            onPressed: () => setState(() => _qrScanned = false),
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('Rescan QR Code'),
                            style: TextButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              minimumSize: const Size.fromHeight(48),
                              textStyle: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Notes section
                  const Text(
                    'Delivery Notes',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: TextField(
                      controller: _notesController,
                      maxLines: 4,
                      style: const TextStyle(fontSize: 15),
                      decoration: InputDecoration(
                        hintText:
                            "Add any delivery notes (e.g., 'Left at front door')",
                        hintStyle: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                        filled: true,
                        fillColor: const Color(0xFFF9FAFB),
                        contentPadding: const EdgeInsets.all(16),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
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
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: BoxDecoration(
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              offset: const Offset(0, -4),
              blurRadius: 12,
            ),
          ],
        ),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: double.infinity,
          height: 60,
          child: ElevatedButton(
            onPressed: isComplete && !_submitting ? _handleSubmit : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: isComplete ? AppColors.primary : const Color(0xFFE0E0E0),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              disabledBackgroundColor: const Color(0xFFE0E0E0),
              disabledForegroundColor: const Color(0xFF9E9E9E),
            ),
            child: _submitting
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 3,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        _uploadingPhoto
                            ? 'Uploading photo…'
                            : 'Completing delivery…',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.check_circle_rounded,
                        size: 20,
                        color: isComplete ? Colors.white : const Color(0xFF9E9E9E),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Complete Delivery',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isComplete ? Colors.white : const Color(0xFF9E9E9E),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final bool isDone;
  const _SectionHeader({required this.title, required this.isDone});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
        if (isDone)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: const [
                Icon(
                  Icons.check_circle_rounded,
                  size: 14,
                  color: AppColors.primary,
                ),
                SizedBox(width: 4),
                Text(
                  'DONE',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}


class _DashedBorderPainter extends CustomPainter {
  final Color color;
  _DashedBorderPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.width, size.height),
        const Radius.circular(16),
      ));

    const dashWidth = 8.0;
    const dashSpace = 4.0;
    double distance = 0.0;

    for (ui.PathMetric pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        canvas.drawPath(
          pathMetric.extractPath(distance, distance + dashWidth),
          paint,
        );
        distance += dashWidth + dashSpace;
      }
      distance = 0.0;
    }
  }

  @override
  bool shouldRepaint(covariant _DashedBorderPainter oldDelegate) =>
      oldDelegate.color != color;
}
