import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api_service.dart';

class AuthService {
  AuthService(this._apiService);

  final ApiService _apiService;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<dynamic> requestOtp(String email) {
    return _apiService.post('/api/auth/verify-email', {
      'email': email,
    });
  }

  Future<dynamic> verifyOtp(String email, String code) async {
    final response = await _apiService.post('/api/auth/verify-code', {
      'email': email,
      'code': code,
    });

    if (response is Map<String, dynamic>) {
      final token = response['token']?.toString();
      final userId = response['userId']?.toString();

      if (token != null && token.isNotEmpty) {
        await _storage.write(key: 'jwt', value: token);
      }

      if (userId != null && userId.isNotEmpty) {
        await _storage.write(key: 'userId', value: userId);
      }
    }

    return response;
  }

  Future<void> logout() async {
    await _storage.deleteAll();
  }

  Future<bool> isLoggedIn() async {
    final jwt = await _storage.read(key: 'jwt');
    return jwt != null && jwt.isNotEmpty;
  }
}
