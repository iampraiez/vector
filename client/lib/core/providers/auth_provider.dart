import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';

class UserModel {
  final String id;
  final String email;
  final String name;
  final String role;
  final String? companyId;
  final bool emailVerified;
  final bool isOnboarded;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.companyId,
    required this.emailVerified,
    required this.isOnboarded,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['sub'] ?? '',
      email: json['email'] ?? '',
      name: json['full_name'] ?? json['name'] ?? '',
      role: json['role'] ?? 'driver',
      companyId: json['company_id'],
      emailVerified: json['email_verified'] ?? false,
      isOnboarded: json['is_onboarded'] ?? (json['driver_profile']?['vehicle_plate'] != null),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'role': role,
    'company_id': companyId,
    'email_verified': emailVerified,
    'is_onboarded': isOnboarded,
  };
}

class AuthProvider extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final _authService = AuthService.instance;

  UserModel? _user;
  String? _accessToken;
  String? _refreshToken;
  bool _isLoading = true;

  UserModel? get user => _user;
  bool get isAuthenticated => _accessToken != null;
  bool get isLoading => _isLoading;

  Future<void> initialize() async {
    try {
      _accessToken = await _storage.read(key: 'access_token');
      _refreshToken = await _storage.read(key: 'refresh_token');
      final userJson = await _storage.read(key: 'user');
      
      if (userJson != null) {
        _user = UserModel.fromJson(jsonDecode(userJson));
      }

      if (_accessToken != null && _refreshToken != null) {
        // Optionally verify token or refresh it
        try {
          await refresh();
        } catch (e) {
          await logout();
        }
      }
    } catch (e) {
      debugPrint('Auth initialization error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    final data = await _authService.signIn(email: email, password: password);
    await _handleAuthResponse(data);
  }

  Future<void> signUp({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String companyCode,
  }) async {
    await _authService.signUpDriver(
      email: email,
      password: password,
      name: name,
      phone: phone,
      companyCode: companyCode,
    );
  }

  Future<void> verifyEmail(String email, String token) async {
    final data = await _authService.verifyEmail(email, token);
    await _handleAuthResponse(data);
  }

  Future<void> resendVerification(String email) async {
    await _authService.resendVerification(email);
  }

  Future<void> updateDriverProfile(Map<String, dynamic> profileData) async {
    if (_accessToken == null) return;
    await _authService.updateDriverProfile(_accessToken!, profileData);
    
    // Update local user state
    if (_user != null) {
      _user = UserModel(
        id: _user!.id,
        email: _user!.email,
        name: _user!.name,
        role: _user!.role,
        companyId: _user!.companyId,
        emailVerified: _user!.emailVerified,
        isOnboarded: true,
      );
      await _storage.write(key: 'user', value: jsonEncode(_user!.toJson()));
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    if (_refreshToken == null) return;
    final data = await _authService.refresh(_refreshToken!);
    await _handleAuthResponse(data);
  }

  Future<void> _handleAuthResponse(Map<String, dynamic> data) async {
    _accessToken = data['access_token'];
    _refreshToken = data['refresh_token'];
    _user = UserModel.fromJson(data['user']);

    await _storage.write(key: 'access_token', value: _accessToken);
    await _storage.write(key: 'refresh_token', value: _refreshToken);
    await _storage.write(key: 'user', value: jsonEncode(_user!.toJson()));

    notifyListeners();
  }

  Future<void> logout() async {
    if (_accessToken != null) {
      await _authService.signOut(_accessToken!);
    }
    
    _user = null;
    _accessToken = null;
    _refreshToken = null;

    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
    await _storage.delete(key: 'user');

    notifyListeners();
  }
}
