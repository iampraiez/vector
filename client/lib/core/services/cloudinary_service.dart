import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/env.dart';

/// Unsigned image upload to Cloudinary (same flow as web: client uploads, sends URL to API).
class CloudinaryService {
  static CloudinaryService _instance = CloudinaryService._();
  static CloudinaryService get instance => _instance;

  @visibleForTesting
  static set instance(CloudinaryService mock) => _instance = mock;

  CloudinaryService._();

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
    ),
  );

  /// Uploads a local image file; returns `secure_url` from Cloudinary.
  Future<String> upload({required String filePath}) async {
    if (!Env.isCloudinaryConfigured) {
      throw StateError(
        'Cloudinary is not configured. Build with '
        '--dart-define=CLOUDINARY_CLOUD_NAME=... and '
        '--dart-define=CLOUDINARY_UPLOAD_PRESET=...',
      );
    }

    final uri =
        'https://api.cloudinary.com/v1_1/${Env.cloudinaryCloudName}/image/upload';
    final formData = FormData.fromMap({
      'upload_preset': Env.cloudinaryUploadPreset,
      'file': await MultipartFile.fromFile(filePath),
    });

    final response = await _dio.post<Map<String, dynamic>>(
      uri,
      data: formData,
    );

    final data = response.data;
    if (response.statusCode != 200 || data == null) {
      throw Exception('Cloudinary upload failed (${response.statusCode})');
    }

    final url = data['secure_url'];
    if (url is! String || url.isEmpty) {
      throw Exception('Cloudinary response missing secure_url');
    }
    return url;
  }
}
