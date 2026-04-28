import 'dart:convert';

import 'package:dio/dio.dart';
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
          await _apiService.post('/api/auth/init-session', <String, dynamic>{});
      final Map<String, dynamic> payload = _extractPayload(response);
      if (response is Map<String, dynamic>) {
        print('[Auth:init-session] root keys=${response.keys.join(",")}');
      } else {
        print('[Auth:init-session] root type=${response.runtimeType}');
      }
      print('[Auth:init-session] payload keys=${payload.keys.join(",")}');
      final String? publicId = _readString(
        payload,
        <String>['publicId', 'PublicId'],
      );
      final String? idKey = _readString(payload, <String>['idKey', 'IdKey']);

      final SharedPreferences prefs = await SharedPreferences.getInstance();
      if (publicId != null && publicId.isNotEmpty) {
        await prefs.setString('auth_public_id', publicId);
      }
      if (idKey != null && idKey.isNotEmpty) {
        await prefs.setString('auth_session_key', idKey);
      }

      // We only need one stable session identifier to continue auth flow.
      return (publicId != null && publicId.isNotEmpty)
          ? publicId
          : ((idKey != null && idKey.isNotEmpty) ? idKey : null);
    } catch (e) {
      print('[Auth:init-session] error=$e');
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
      '/api/auth/verify-email',
      <String, dynamic>{'email': normalizedEmail},
    );
    final Map<String, dynamic> payload = _extractPayload(response);

    final bool existingUser =
        (payload['userExists'] == true) ||
        (payload['exists'] == true) ||
        (payload['isExistingUser'] == true);

    final bool otpSent =
        (payload['otpSent'] == true) ||
        (payload['codeSent'] == true);

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

    try {
      final dynamic response = await _apiService.post(
        '/api/auth/password-login',
        <String, dynamic>{'password': password, 'clientType': 'mobile'},
      );
      final Map<String, dynamic> payload = _extractPayload(response);

      final bool locked =
          payload['locked'] == true || payload['isLocked'] == true;
      final int? retryAfterSeconds = _extractRetryAfterSeconds(payload);

      if (_hasAccessToken(payload)) {
        await _persistTokens(payload, markNeedsOnboarding: false);
        return AuthStepResult(
          success: true,
          message: payload['message']?.toString(),
        );
      }

      // On Server_Core, OTP_SENT returns 200 with message and no token.
      return AuthStepResult(
        success: false,
        requiresCode: !locked,
        locked: locked,
        retryAfterSeconds: retryAfterSeconds,
        message: payload['message']?.toString(),
      );
    } catch (error) {
      final Map<String, dynamic> payload = _extractErrorPayload(error);
      final int? statusCode = _extractStatusCode(error);
      final bool locked =
          statusCode == 429 || payload['locked'] == true || payload['isLocked'] == true;

      return AuthStepResult(
        success: false,
        requiresCode: false,
        locked: locked,
        retryAfterSeconds: _extractRetryAfterSeconds(payload),
        message: _extractErrorMessage(error, payload) ??
            (locked
                ? 'Session temporairement bloquee.'
                : 'Mot de passe invalide'),
      );
    }
  }

  Future<AuthStepResult> verifyCode(String code) async {
    final String? fixtureEmail = await _getPendingFixtureEmail();
    if (fixtureEmail != null && fixtureEmail.isNotEmpty) {
      // OTP must stay disabled for fixture profiles.
      await _persistFixtureSession(fixtureEmail);
      return const AuthStepResult(
          success: true, message: 'OTP ignore pour profil test');
    }

    try {
      final dynamic response = await _apiService.post(
        '/api/auth/verify-code',
        <String, dynamic>{
          'code': code,
          'rememberOtp': false,
          'clientType': 'mobile',
        },
      );
      final Map<String, dynamic> payload = _extractPayload(response);

      if (_hasAccessToken(payload)) {
        await _persistTokens(payload, markNeedsOnboarding: false);
        return AuthStepResult(
          success: true,
          message: payload['message']?.toString(),
        );
      }

      final bool codeValid =
          payload['success'] == true || payload['codeValid'] == true;

      if (codeValid) {
        return const AuthStepResult(
          success: false,
          requiresRegistration: true,
        );
      }

      final int? remainingAttempts = _toInt(payload['remainingAttempts']);
      final String? message = payload['message']?.toString();
      final String fallbackMessage =
          (remainingAttempts != null && remainingAttempts > 0)
              ? 'Code incorrect. $remainingAttempts tentative(s) restante(s).'
              : 'Code OTP incorrect';

      return AuthStepResult(
        success: false,
        requiresRegistration: false,
        message: message?.isNotEmpty == true ? message : fallbackMessage,
      );
    } catch (error) {
      final Map<String, dynamic> payload = _extractErrorPayload(error);
      return AuthStepResult(
        success: false,
        requiresRegistration: false,
        message: _extractErrorMessage(error, payload) ?? 'Code OTP incorrect',
      );
    }
  }

  Future<AuthStepResult> register({
    required String firstName,
    required String lastName,
    required String password,
  }) async {
    try {
      final dynamic response = await _apiService.post(
        '/api/auth/register',
        <String, dynamic>{
          'firstName': firstName,
          'lastName': lastName,
          'password': password,
          'clientType': 'mobile',
        },
      );
      final Map<String, dynamic> payload = _extractPayload(response);

      if (_hasAccessToken(payload)) {
        await _persistTokens(payload, markNeedsOnboarding: true);
        return AuthStepResult(
          success: true,
          message: payload['message']?.toString(),
        );
      }

      return AuthStepResult(
        success: false,
        message: payload['message']?.toString() ?? 'Inscription impossible',
      );
    } catch (error) {
      final Map<String, dynamic> payload = _extractErrorPayload(error);
      return AuthStepResult(
        success: false,
        message: _extractErrorMessage(error, payload) ??
            'Erreur lors de l\'inscription',
      );
    }
  }

  Future<RenewCodeResult> renewCode() async {
    try {
      final dynamic response =
          await _apiService.post('/api/auth/renew-code', <String, dynamic>{});
      final Map<String, dynamic> payload = _extractPayload(response);
      return RenewCodeResult(
        success: true,
        remainingResends: _toInt(payload['remainingResends']) ?? 0,
        message: payload['message']?.toString(),
      );
    } catch (error) {
      final Map<String, dynamic> payload = _extractErrorPayload(error);
      return RenewCodeResult(
        success: false,
        remainingResends: _toInt(payload['remainingResends']) ?? 0,
        message: _extractErrorMessage(error, payload) ??
            'Impossible de renvoyer le code',
      );
    }
  }

  Future<OtpStatusSnapshot?> getOtpStatus() async {
    try {
      final dynamic response = await _apiService.get('/api/auth/otp-status');
      final Map<String, dynamic> payload = _extractPayload(response);

      final bool hasOtp = payload['hasOtp'] == true;
      final DateTime? expiresAt = _toDateTime(payload['otpExpiresAt']);
      final int remainingResends = _toInt(payload['remainingResends']) ?? 0;

      return OtpStatusSnapshot(
        hasOtp: hasOtp,
        otpExpiresAt: expiresAt,
        remainingResends: remainingResends,
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    await UserCacheService.instance.clearCurrentUser();

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? refreshToken = prefs.getString('refresh_token');

    try {
      await _apiService.post(
        '/api/auth/logout',
        <String, dynamic>{'refreshToken': refreshToken},
      );
    } catch (_) {
      // Best effort only; local cleanup still applies.
    }

    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    await prefs.remove('userId');
    await prefs.remove('auth_public_id');
    await prefs.remove('auth_session_key');
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

      final String payloadJson =
          utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final Map<String, dynamic> payload =
          jsonDecode(payloadJson) as Map<String, dynamic>;
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
    final String token =
        'fixture_access_${DateTime.now().millisecondsSinceEpoch}_$userId';
    final String refresh =
        'fixture_refresh_${DateTime.now().millisecondsSinceEpoch}_$userId';

    await prefs.setString('auth_token', token);
    await prefs.setString('refresh_token', refresh);
    await prefs.setString('userId', userId);
    await prefs.setBool('is_logged_in', true);
    await prefs.remove(_fixturePendingEmailKey);

    UserCacheService.instance.setUserId(userId);

    final String role = fixture['role']?.toString().toLowerCase() ?? '';
    final bool isDriver = role.contains('conducteur') || role.contains('driver');
    AppStateStore.instance
        .switchMode(isDriver ? AppUserMode.driver : AppUserMode.passenger);
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

  static String? _readString(
    Map<String, dynamic> payload,
    List<String> keys,
  ) {
    for (final String key in keys) {
      final String? value = payload[key]?.toString();
      if (value != null && value.isNotEmpty) {
        return value;
      }
    }
    return null;
  }

  static bool _hasAccessToken(Map<String, dynamic> payload) {
    final String? accessToken = payload['accessToken']?.toString();
    return accessToken != null && accessToken.isNotEmpty;
  }

  static Map<String, dynamic> _extractPayload(dynamic response) {
    if (response is Map<String, dynamic>) {
      final dynamic data = response['data'] ?? response['Data'];
      if (data is Map<String, dynamic>) return data;
      return response;
    }
    return <String, dynamic>{};
  }

  static Map<String, dynamic> _extractErrorPayload(Object error) {
    if (error is DioException) {
      final dynamic body = error.response?.data;
      if (body is Map<String, dynamic>) {
        final dynamic data = body['data'];
        if (data is Map<String, dynamic>) {
          return <String, dynamic>{...body, ...data};
        }
        return body;
      }
    }
    return <String, dynamic>{};
  }

  static String? _extractErrorMessage(
    Object error,
    Map<String, dynamic> payload,
  ) {
    final String? payloadMessage = payload['message']?.toString();
    if (payloadMessage != null && payloadMessage.trim().isNotEmpty) {
      return payloadMessage;
    }

    final dynamic errors = payload['errors'];
    if (errors is List && errors.isNotEmpty) {
      final String first = errors.first?.toString() ?? '';
      if (first.trim().isNotEmpty) return first;
    }

    if (error is DioException) {
      return error.message;
    }
    return null;
  }

  static int? _extractStatusCode(Object error) {
    if (error is DioException) {
      return error.response?.statusCode;
    }
    return null;
  }

  static int? _extractRetryAfterSeconds(Map<String, dynamic> payload) {
    final dynamic value = payload['retryAfterSeconds'] ??
        payload['retryAfter'] ??
        payload['remainingSeconds'];
    return _toInt(value);
  }

  static int? _toInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '');
  }

  static DateTime? _toDateTime(dynamic value) {
    final String raw = value?.toString() ?? '';
    if (raw.isEmpty) return null;
    return DateTime.tryParse(raw)?.toLocal();
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

class RenewCodeResult {
  const RenewCodeResult({
    required this.success,
    required this.remainingResends,
    this.message,
  });

  final bool success;
  final int remainingResends;
  final String? message;
}

class OtpStatusSnapshot {
  const OtpStatusSnapshot({
    required this.hasOtp,
    required this.otpExpiresAt,
    required this.remainingResends,
  });

  final bool hasOtp;
  final DateTime? otpExpiresAt;
  final int remainingResends;
}
