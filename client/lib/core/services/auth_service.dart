import 'package:dio/dio.dart';
import '../constants/api_constants.dart';

class AuthService {
  static final AuthService instance = AuthService._();
  AuthService._();

  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 3),
  ));

  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/sign-in', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> signUpDriver({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String companyCode,
  }) async {
    try {
      final response = await _dio.post('/auth/sign-up/driver', data: {
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'company_code': companyCode,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> refresh(String refreshToken) async {
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> signOut(String accessToken) async {
    try {
      await _dio.post(
        '/auth/sign-out',
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
    } catch (_) {
      // Ignore sign out errors
    }
  }

  String _handleError(DioException e) {
    if (e.response?.data != null && e.response?.data['message'] != null) {
      final message = e.response?.data['message'];
      if (message is List) return message.join(', ');
      return message.toString();
    }
    return e.message ?? 'An unexpected error occurred';
  }
}
