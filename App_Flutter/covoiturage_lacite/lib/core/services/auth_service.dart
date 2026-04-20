import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'api_service.dart';

class AuthService {
  AuthService(this._apiService);

  final ApiService _apiService;

  Future<dynamic> requestOtp(String email) {
    return _apiService.post('/api/auth/verify-email', {
      'email': email,
      'clientType': 'mobile',
    });
  }

  Future<dynamic> verifyOtp(String email, String code) async {
    final response = await _apiService.post('/api/auth/verify-code', {
      'email': email,
      'code': code,
      'clientType': 'mobile',
    });

    if (response is Map<String, dynamic>) {
      final prefs = await SharedPreferences.getInstance();
      final body = (response['data'] is Map<String, dynamic>)
          ? response['data'] as Map<String, dynamic>
          : response;

      final accessToken = body['accessToken']?.toString();
      final refreshToken = body['refreshToken']?.toString() ?? '';
      final userId = body['user']?['id']?.toString() ?? body['userId']?.toString();

      if (accessToken != null && accessToken.isNotEmpty) {
        await prefs.setString('auth_token', accessToken);
      }

      await prefs.setString('refresh_token', refreshToken);

      if (userId != null && userId.isNotEmpty) {
        await prefs.setString('userId', userId);
      }
    }

    return response;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('refresh_token');
    await prefs.remove('userId');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token == null || token.isEmpty) {
      return false;
    }

    try {
      final parts = token.split('.');
      if (parts.length != 3) {
        return false;
      }

      final payloadJson = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final payload = jsonDecode(payloadJson) as Map<String, dynamic>;
      final exp = payload['exp'];

      if (exp is! int) {
        return true;
      }

      final expiry = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
      return expiry.isAfter(DateTime.now());
    } catch (_) {
      return false;
    }
  }
}
