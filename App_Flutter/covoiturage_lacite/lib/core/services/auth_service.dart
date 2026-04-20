import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'api_service.dart';

class AuthService {
  AuthService(this._apiService);

  final ApiService _apiService;

  Future<String?> initSession() async {
    final dynamic response = await _apiService.post('/api/auth/session/init', <String, dynamic>{});
    final Map<String, dynamic> payload = _extractPayload(response);
    final String? publicId = payload['publicId']?.toString();
    if (publicId != null && publicId.isNotEmpty) {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_public_id', publicId);
    }
    return publicId;
  }

  Future<EmailCheckResult> verifyEmail(String email) async {
    final dynamic response = await _apiService.post('/api/auth/session/verify-email', <String, dynamic>{
      'email': email,
    });
    final Map<String, dynamic> payload = _extractPayload(response);

    final bool existingUser = (payload['userExists'] == true) ||
        (payload['exists'] == true) ||
        (payload['isExistingUser'] == true) ||
        (payload['nextStep']?.toString().toLowerCase().contains('password') == true);

    final bool otpSent = (payload['otpSent'] == true) ||
        (payload['codeSent'] == true) ||
        (payload['nextStep']?.toString().toLowerCase().contains('otp') == true);

    return EmailCheckResult(
      existingUser: existingUser,
      otpSent: otpSent,
      message: payload['message']?.toString(),
    );
  }

  Future<AuthStepResult> passwordLogin(String password) async {
    final dynamic response = await _apiService.post('/api/auth/session/password-login', <String, dynamic>{
      'password': password,
    });
    final Map<String, dynamic> payload = _extractPayload(response);

    final bool locked = payload['locked'] == true || payload['isLocked'] == true;
    final int? retryAfterSeconds = _extractRetryAfterSeconds(payload);

    if (_hasAccessToken(payload)) {
      await _persistTokens(payload, markNeedsOnboarding: false);
      return AuthStepResult(success: true, message: payload['message']?.toString());
    }

    final bool requiresCode = payload['requiresCode'] == true ||
        payload['otpRequired'] == true ||
        (payload['nextStep']?.toString().toLowerCase().contains('verify') == true) ||
        (payload['nextStep']?.toString().toLowerCase().contains('otp') == true);

    return AuthStepResult(
      success: false,
      requiresCode: requiresCode,
      locked: locked,
      retryAfterSeconds: retryAfterSeconds,
      message: payload['message']?.toString(),
    );
  }

  Future<AuthStepResult> verifyCode(String code) async {
    final dynamic response = await _apiService.post('/api/auth/session/verify-code', <String, dynamic>{
      'code': code,
    });
    final Map<String, dynamic> payload = _extractPayload(response);

    if (_hasAccessToken(payload)) {
      await _persistTokens(payload, markNeedsOnboarding: false);
      return AuthStepResult(success: true, message: payload['message']?.toString());
    }

    final bool needsRegister = payload['registrationRequired'] == true ||
        payload['needsRegistration'] == true ||
        (payload['nextStep']?.toString().toLowerCase().contains('register') == true);

    return AuthStepResult(
      success: false,
      requiresRegistration: needsRegister,
      message: payload['message']?.toString(),
    );
  }

  Future<AuthStepResult> register({
    required String firstName,
    required String lastName,
    required String password,
  }) async {
    final dynamic response = await _apiService.post('/api/auth/session/register', <String, dynamic>{
      'firstName': firstName,
      'lastName': lastName,
      'password': password,
    });
    final Map<String, dynamic> payload = _extractPayload(response);

    if (_hasAccessToken(payload)) {
      await _persistTokens(payload, markNeedsOnboarding: true);
      return AuthStepResult(success: true, message: payload['message']?.toString());
    }

    return AuthStepResult(
      success: false,
      message: payload['message']?.toString(),
    );
  }

  Future<void> logout() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    await prefs.remove('userId');
    await prefs.remove('auth_public_id');
    await prefs.setBool('is_logged_in', false);
  }

  Future<bool> isLoggedIn() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('auth_token');
    if (token == null || token.isEmpty) {
      return false;
    }

    try {
      final List<String> parts = token.split('.');
      if (parts.length != 3) {
        return false;
      }

      final String payloadJson = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final Map<String, dynamic> payload = jsonDecode(payloadJson) as Map<String, dynamic>;
      final dynamic exp = payload['exp'];

      if (exp is! int) {
        return true;
      }

      final DateTime expiry = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
      return expiry.isAfter(DateTime.now());
    } catch (_) {
      return false;
    }
  }

  Future<dynamic> requestOtp(String email) async {
    await initSession();
    return verifyEmail(email);
  }

  Future<dynamic> verifyOtp(String email, String code) {
    return verifyCode(code);
  }

  Future<void> _persistTokens(
    Map<String, dynamic> payload, {
    required bool markNeedsOnboarding,
  }) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? accessToken = payload['accessToken']?.toString();
    final String refreshToken = payload['refreshToken']?.toString() ?? '';

    if (accessToken != null && accessToken.isNotEmpty) {
      await prefs.setString('auth_token', accessToken);
    }

    if (refreshToken.isNotEmpty) {
      await prefs.setString('refresh_token', refreshToken);
    }

    final dynamic user = payload['user'];
    final String? userId = user is Map<String, dynamic>
        ? user['id']?.toString()
        : payload['userId']?.toString();

    if (userId != null && userId.isNotEmpty) {
      await prefs.setString('userId', userId);
    }

    await prefs.setBool('is_logged_in', true);

    if (markNeedsOnboarding) {
      await prefs.setBool('needs_onboarding', true);
      await prefs.setBool('onboarding_done', false);
    }
  }

  static bool _hasAccessToken(Map<String, dynamic> payload) {
    final String? accessToken = payload['accessToken']?.toString();
    return accessToken != null && accessToken.isNotEmpty;
  }

  static Map<String, dynamic> _extractPayload(dynamic response) {
    if (response is Map<String, dynamic>) {
      final dynamic data = response['data'];
      if (data is Map<String, dynamic>) return data;
      return response;
    }
    return <String, dynamic>{};
  }

  static int? _extractRetryAfterSeconds(Map<String, dynamic> payload) {
    final dynamic value = payload['retryAfterSeconds'] ?? payload['retryAfter'] ?? payload['remainingSeconds'];
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '');
  }
}

class EmailCheckResult {
  const EmailCheckResult({
    required this.existingUser,
    required this.otpSent,
    this.message,
  });

  final bool existingUser;
  final bool otpSent;
  final String? message;
}

class AuthStepResult {
  const AuthStepResult({
    required this.success,
    this.requiresCode = false,
    this.requiresRegistration = false,
    this.locked = false,
    this.retryAfterSeconds,
    this.message,
  });

  final bool success;
  final bool requiresCode;
  final bool requiresRegistration;
  final bool locked;
  final int? retryAfterSeconds;
  final String? message;
}
