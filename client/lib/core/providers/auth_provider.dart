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
  final String? phone;
  final String? vehicleType;
  final String? vehicleMake;
  final String? vehicleModel;
  final String? vehiclePlate;
  final String? vehicleColor;
  final String? licenseNumber;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.companyId,
    required this.emailVerified,
    required this.isOnboarded,
    this.phone,
    this.vehicleType,
    this.vehicleMake,
    this.vehicleModel,
    this.vehiclePlate,
    this.vehicleColor,
    this.licenseNumber,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final profile = json['driver_profile'] ?? {};
    return UserModel(
      id: json['id'] ?? json['sub'] ?? '',
      email: json['email'] ?? '',
      name: json['full_name'] ?? json['name'] ?? '',
      role: json['role'] ?? 'driver',
      companyId: json['company_id'],
      emailVerified: json['email_verified'] ?? false,
      isOnboarded: json['is_onboarded'] ?? false,
      phone: json['phone'] as String?,
      vehicleType: profile['vehicle_type'],
      vehicleMake: profile['vehicle_make'],
      vehicleModel: profile['vehicle_model'],
      vehiclePlate: profile['vehicle_plate'],
      vehicleColor: profile['vehicle_color'],
      licenseNumber: profile['license_number'],
    );
  }

  UserModel copyWith({
    String? name,
    String? phone,
    String? vehicleType,
    String? vehicleMake,
    String? vehicleModel,
    String? vehiclePlate,
    String? vehicleColor,
    String? licenseNumber,
    bool? isOnboarded,
  }) {
    return UserModel(
      id: id,
      email: email,
      name: name ?? this.name,
      role: role,
      companyId: companyId,
      emailVerified: emailVerified,
      isOnboarded: isOnboarded ?? this.isOnboarded,
      phone: phone ?? this.phone,
      vehicleType: vehicleType ?? this.vehicleType,
      vehicleMake: vehicleMake ?? this.vehicleMake,
      vehicleModel: vehicleModel ?? this.vehicleModel,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      vehicleColor: vehicleColor ?? this.vehicleColor,
      licenseNumber: licenseNumber ?? this.licenseNumber,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'full_name': name,
    'role': role,
    'company_id': companyId,
    'email_verified': emailVerified,
    'is_onboarded': isOnboarded,
    'phone': phone,
    'driver_profile': {
      'vehicle_type': vehicleType,
      'vehicle_make': vehicleMake,
      'vehicle_model': vehicleModel,
      'vehicle_plate': vehiclePlate,
      'vehicle_color': vehicleColor,
      'license_number': licenseNumber,
    },
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

  Future<void> completeOnboarding() async {
    if (_user == null || _accessToken == null) return;
    try {
      // Call backend to persist the onboarding state permanently
      await _authService.completeOnboarding(_accessToken!);

      // Update local state and persist to secure storage
      _user = UserModel(
        id: _user!.id,
        email: _user!.email,
        name: _user!.name,
        role: _user!.role,
        companyId: _user!.companyId,
        emailVerified: _user!.emailVerified,
        isOnboarded: true,
        vehicleType: _user!.vehicleType,
        vehicleMake: _user!.vehicleMake,
        vehicleModel: _user!.vehicleModel,
        vehiclePlate: _user!.vehiclePlate,
        vehicleColor: _user!.vehicleColor,
        licenseNumber: _user!.licenseNumber,
      );
      await _storage.write(key: 'user', value: jsonEncode(_user!.toJson()));
      notifyListeners();
    } catch (e) {
      debugPrint('Error completing onboarding: $e');
      // If backend fails, we might reconsider whether we update local state
      // but typically we should let the user through or show an error.
      // For now, let's keep it robust and only update on success.
    }
  }

  Future<void> updateDriverProfile(Map<String, dynamic> profileData) async {
    if (_accessToken == null) return;
    await _authService.updateDriverProfile(_accessToken!, profileData);
    
    // Update local user state
    if (_user != null) {
      _user = _user!.copyWith(
        name: profileData['full_name'],
        phone: profileData['phone'],
        vehicleType: profileData['vehicle_type'],
        vehicleMake: profileData['vehicle_make'],
        vehicleModel: profileData['vehicle_model'],
        vehiclePlate: profileData['vehicle_plate'],
        vehicleColor: profileData['vehicle_color'],
        licenseNumber: profileData['license_number'],
        isOnboarded: true,
      );
      
      await _storage.write(key: 'user', value: jsonEncode(_user!.toJson()));
      notifyListeners();
    }
  }

  Future<void> joinCompany(String companyCode) async {
    if (_accessToken == null) return;
    final data = await _authService.joinCompany(_accessToken!, companyCode);
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
