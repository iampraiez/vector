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

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.companyId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      name: json['name'] ?? '',
      role: json['role'] ?? 'driver',
      companyId: json['company_id'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'role': role,
    'company_id': companyId,
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
    final data = await _authService.signUpDriver(
      email: email,
      password: password,
      name: name,
      phone: phone,
      companyCode: companyCode,
    );
    await _handleAuthResponse(data);
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
