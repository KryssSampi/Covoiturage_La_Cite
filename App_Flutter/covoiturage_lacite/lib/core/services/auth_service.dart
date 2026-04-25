import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../cache/user_cache_service.dart';
import '../fixtures/app_fixtures.dart';
import '../state/app_state.dart';
import 'api_service.dart';

class AuthService {
  AuthService(this._apiService);

  static const String _fixturePendingEmailKey = 'fixture_pending_email';

  final ApiService _apiService;

  Future<String?> initSession() async {
    try {
      final dynamic response =
          await _apiService.post('/api/auth/session/init', <String, dynamic>{});
      final Map<String, dynamic> payload = _extractPayload(response);
      final String? publicId = payload['publicId']?.toString();
      if (publicId != null && publicId.isNotEmpty) {
        final SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_public_id', publicId);
      }
      return publicId;
    } catch (_) {
      // Keep auth resilient for fixture profiles when backend auth is down.
      return null;
    }
  }

  Future<EmailCheckResult> verifyEmail(String email) async {
    final String normalizedEmail = email.trim().toLowerCase();
    final bool fixtureProfile = AppFixtures.isFixtureAuthEmail(normalizedEmail);

    if (fixtureProfile) {
      await _setPendingFixtureEmail(normalizedEmail);
      return const EmailCheckResult(
        existingUser: true,
        otpSent: false,
        message: 'Profil de test detecte',
      );
    }

    final dynamic response = await _apiService.post(
      '/api/auth/session/verify-email',
      <String, dynamic>{'email': normalizedEmail},
    );
    final Map<String, dynamic> payload = _extractPayload(response);

    final bool existingUser =
        (payload['userExists'] == true) ||
        (payload['exists'] == true) ||
        (payload['isExistingUser'] == true) ||
        (payload['nextStep']?.toString().toLowerCase().contains('password') == true);

    final bool otpSent =
        (payload['otpSent'] == true) ||
        (payload['codeSent'] == true) ||
        (payload['nextStep']?.toString().toLowerCase().contains('otp') == true);

    await _setPendingFixtureEmail(null);

    return EmailCheckResult(
      existingUser: existingUser,
      otpSent: otpSent,
      message: payload['message']?.toString(),
    );
  }

  Future<AuthStepResult> passwordLogin(String password) async {
    final String? fixtureEmail = await _getPendingFixtureEmail();

    if (fixtureEmail != null && fixtureEmail.isNotEmpty) {
      if (password == AppFixtures.fixtureAuthPassword) {
        await _persistFixtureSession(fixtureEmail);
        return const AuthStepResult(
          success: true,
          requiresCode: false,
          message: 'Connexion profil test reussie',
        );
      }
      return const AuthStepResult(
        success: false,
        requiresCode: false,
        message: 'Mot de passe test invalide',
      );
    }

    final dynamic response = await _apiService.post(
      '/api/auth/session/password-login',
      <String, dynamic>{'password': password},
    );
    final Map<String, dynamic> payload = _extractPayload(response);

    final bool locked = payload['locked'] == true || payload['isLocked'] == true;
    final int? retryAfterSeconds = _extractRetryAfterSeconds(payload);

    if (_hasAccessToken(payload)) {
      await _persistTokens(payload, markNeedsOnboarding: false);
      return AuthStepResult(success: true, message: payload['message']?.toString());
    }

    final bool requiresCode =
        payload['requiresCode'] == true ||
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
    final String? fixtureEmail = await _getPendingFixtureEmail();
    if (fixtureEmail != null && fixtureEmail.isNotEmpty) {
      // OTP must stay disabled for fixture profiles.
      await _persistFixtureSession(fixtureEmail);
      return const AuthStepResult(success: true, message: 'OTP ignore pour profil test');
    }

    final dynamic response = await _apiService.post(
      '/api/auth/session/verify-code',
      <String, dynamic>{'code': code},
    );
    final Map<String, dynamic> payload = _extractPayload(response);

    if (_hasAccessToken(payload)) {
      await _persistTokens(payload, markNeedsOnboarding: false);
      return AuthStepResult(success: true, message: payload['message']?.toString());
    }

    final bool needsRegister =
        payload['registrationRequired'] == true ||
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
    final dynamic response = await _apiService.post(
      '/api/auth/session/register',
      <String, dynamic>{
        'firstName': firstName,
        'lastName': lastName,
        'password': password,
      },
    );
    final Map<String, dynamic> payload = _extractPayload(response);

    if (_hasAccessToken(payload)) {
      await _persistTokens(payload, markNeedsOnboarding: true);
      return AuthStepResult(success: true, message: payload['message']?.toString());
    }

    return AuthStepResult(success: false, message: payload['message']?.toString());
  }

  Future<void> logout() async {
    await UserCacheService.instance.clearCurrentUser();

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    await prefs.remove('userId');
    await prefs.remove('auth_public_id');
    await prefs.remove('cached_profile');
    await prefs.remove(_fixturePendingEmailKey);
    await prefs.setBool('is_logged_in', false);
  }

  Future<bool> isLoggedIn() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('auth_token');
    if (token == null || token.isEmpty) return false;

    if (token.startsWith('fixture_access_')) {
      return true;
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
    final String? userId =
        user is Map<String, dynamic> ? user['id']?.toString() : payload['userId']?.toString();

    if (userId != null && userId.isNotEmpty) {
      await prefs.setString('userId', userId);
      UserCacheService.instance.setUserId(userId);
    }

    await prefs.setBool('is_logged_in', true);
    await prefs.remove(_fixturePendingEmailKey);

    if (markNeedsOnboarding) {
      await prefs.setBool('needs_onboarding', true);
      await prefs.setBool('onboarding_done', false);
    }
  }

  Future<void> _persistFixtureSession(String email) async {
    final Map<String, dynamic>? fixture = AppFixtures.fixtureProfileByEmail(email);
    if (fixture == null) {
      throw StateError('Fixture profile not found');
    }

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String userId = fixture['id']?.toString() ?? '';
    final String token = 'fixture_access_${DateTime.now().millisecondsSinceEpoch}_$userId';
    final String refresh = 'fixture_refresh_${DateTime.now().millisecondsSinceEpoch}_$userId';

    await prefs.setString('auth_token', token);
    await prefs.setString('refresh_token', refresh);
    await prefs.setString('userId', userId);
    await prefs.setBool('is_logged_in', true);
    await prefs.remove(_fixturePendingEmailKey);

    UserCacheService.instance.setUserId(userId);

    final String role = fixture['role']?.toString().toLowerCase() ?? '';
    final bool isDriver = role.contains('conducteur') || role.contains('driver');
    AppStateStore.instance.switchMode(isDriver ? AppUserMode.driver : AppUserMode.passenger);
    AppStateStore.instance.updateCurrentUserFromJson(fixture);
  }

  Future<void> _setPendingFixtureEmail(String? email) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    if (email == null || email.isEmpty) {
      await prefs.remove(_fixturePendingEmailKey);
    } else {
      await prefs.setString(_fixturePendingEmailKey, email);
    }
  }

  Future<String?> _getPendingFixtureEmail() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_fixturePendingEmailKey);
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
