import 'dart:io';

class ApiConstants {
  // API Configuration
  static const String _envBaseUrl = String.fromEnvironment('API_URL');

  // App Configuration (Dummy variables)
  static const String appName = String.fromEnvironment(
    'APP_NAME',
    defaultValue: 'Vector Driver',
  );
  static const String appVersion = String.fromEnvironment(
    'APP_VERSION',
    defaultValue: '1.0.0',
  );
  static const String environment = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );

  static const String _envWebUrl = String.fromEnvironment('WEB_URL');

  static String get webUrl {
    if (_envWebUrl.isNotEmpty) {
      return _envWebUrl;
    }
    return 'http://localhost:5173';
  }

  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) {
      return _envBaseUrl;
    }

    // Fallback logic if no environment variable is provided
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://localhost:8080';
  }
}
