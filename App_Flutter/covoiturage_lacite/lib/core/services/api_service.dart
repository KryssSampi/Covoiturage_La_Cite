import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:cookie_jar/cookie_jar.dart';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:dio/io.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../fixtures/app_fixtures.dart';
import '../navigation_key.dart';
import '../state/app_state.dart';

class ApiService {
  static const _baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:5000',
  );

  static const _publicKeyStorageKey = 'server_public_key';
  static const _publicKeyFingerprintStorageKey = 'server_public_key_sha256';
  static String? _pinnedFingerprint;

  static late final Dio _dio;
  static late final CookieJar _cookieJar;

  ApiService._internal() {
    _dio = Dio(BaseOptions(baseUrl: _baseUrl));
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 15);
    _dio.options.sendTimeout = const Duration(seconds: 10);
    _dio.options.followRedirects = true;

    _cookieJar = CookieJar();
    _dio.interceptors.add(CookieManager(_cookieJar));

    _configurePinnedHttpClient();
    unawaited(_initSecureClient());

    _dio.interceptors.add(_AuthInterceptor());
  }

  static final ApiService instance = ApiService._internal();

  static Future<void> _initSecureClient() async {
    final prefs = await SharedPreferences.getInstance();
    String? cachedKey = prefs.getString(_publicKeyStorageKey);

    if (cachedKey == null || cachedKey.isEmpty) {
      try {
        final res = await Dio(
          BaseOptions(
            baseUrl: _baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 15),
            sendTimeout: const Duration(seconds: 10),
            headers: const {
              'X-Client-Type': 'mobile',
              'X-App-Version': '1.0.0',
            },
          ),
        ).get<dynamic>('/api/auth/public-key');

        final body = (res.data is Map<String, dynamic>)
            ? res.data as Map<String, dynamic>
            : <String, dynamic>{};
        cachedKey = body['publicKey']?.toString();

        if (cachedKey != null && cachedKey.isNotEmpty) {
          await prefs.setString(_publicKeyStorageKey, cachedKey);
        }
      } catch (_) {
        // If public key cannot be fetched at startup, fallback to cached value only.
      }
    }

    if (cachedKey != null && cachedKey.isNotEmpty) {
      final fingerprint = sha256.convert(utf8.encode(cachedKey)).toString();
      await prefs.setString(_publicKeyFingerprintStorageKey, fingerprint);
      _pinnedFingerprint = fingerprint;
    } else {
      _pinnedFingerprint = prefs.getString(_publicKeyFingerprintStorageKey);
    }
  }

  static void _configurePinnedHttpClient() {
    final adapter = _dio.httpClientAdapter;
    if (adapter is! IOHttpClientAdapter) {
      return;
    }

    adapter.createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback = (
        X509Certificate cert,
        String host,
        int port,
      ) {
        // Allow handshake only to run custom validation in validateCertificate.
        return true;
      };
      return client;
    };

    adapter.validateCertificate = (
      X509Certificate? cert,
      String host,
      int port,
    ) {
      if (cert == null) {
        return false;
      }

      final derFingerprint = sha256.convert(cert.der).toString();
      final pemFingerprint = sha256.convert(utf8.encode(cert.pem)).toString();

      // Best-effort pinning check against stored public-key fingerprint.
      // If not present, do not block requests.
      final pinned = _pinnedFingerprint;
      if (pinned == null || pinned.isEmpty) {
        return true;
      }
      return pinned == derFingerprint || pinned == pemFingerprint;
    };
  }

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? params,
    Options? options,
  }) async {
    try {
      final response = await _dio.get<dynamic>(
        path,
        queryParameters: params,
        options: options,
      );
      AppStateStore.instance.clearFixtureFallback();
      _syncCurrentUserIfNeeded(path, response.data);
      return response.data;
    } catch (error) {
      final fallback = AppFixtures.getFallback(
        path,
        params: params,
        isDriver: AppStateStore.instance.isDriver,
      );
      if (fallback != null) {
        AppStateStore.instance.reportFixtureFallback(
          endpoint: path,
          reason: _errorMessage(error),
        );
        _syncCurrentUserIfNeeded(path, fallback);
        return fallback;
      }
      rethrow;
    }
  }

  Future<dynamic> post(
    String path,
    dynamic body, {
    Options? options,
  }) async {
    try {
      final response = await _dio.post<dynamic>(path, data: body, options: options);
      AppStateStore.instance.clearFixtureFallback();
      _syncCurrentUserIfNeeded(path, response.data);
      return response.data;
    } catch (error) {
      final fallback = AppFixtures.postFallback(
        path,
        body,
        isDriver: AppStateStore.instance.isDriver,
      );
      if (fallback != null) {
        AppStateStore.instance.reportFixtureFallback(
          endpoint: path,
          reason: _errorMessage(error),
        );
        _syncCurrentUserIfNeeded(path, fallback);
        return fallback;
      }
      rethrow;
    }
  }

  Future<dynamic> patch(
    String path,
    dynamic body, {
    Options? options,
  }) async {
    try {
      final response = await _dio.patch<dynamic>(path, data: body, options: options);
      AppStateStore.instance.clearFixtureFallback();
      _syncCurrentUserIfNeeded(path, response.data);
      return response.data;
    } catch (error) {
      final fallback = AppFixtures.patchFallback(
        path,
        body,
        isDriver: AppStateStore.instance.isDriver,
      );
      if (fallback != null) {
        AppStateStore.instance.reportFixtureFallback(
          endpoint: path,
          reason: _errorMessage(error),
        );
        _syncCurrentUserIfNeeded(path, fallback);
        return fallback;
      }
      rethrow;
    }
  }

  static String _errorMessage(Object error) {
    if (error is DioException) {
      final dynamic body = error.response?.data;
      if (body is Map<String, dynamic>) {
        final dynamic data = body['data'];
        if (data is Map<String, dynamic> && data['message'] != null) {
          return data['message'].toString();
        }
        if (body['message'] != null) {
          return body['message'].toString();
        }
      }
      return error.message ?? error.type.name;
    }
    return error.toString();
  }

  static void _syncCurrentUserIfNeeded(String path, dynamic payload) {
    if (path != '/api/users/me') return;
    final map = _extractMap(payload);
    if (map != null && map.isNotEmpty) {
      AppStateStore.instance.updateCurrentUserFromJson(map);
    }
  }

  static Map<String, dynamic>? _extractMap(dynamic payload) {
    if (payload is! Map<String, dynamic>) return null;
    final dynamic data = payload['data'];
    if (data is Map<String, dynamic>) return data;
    return payload;
  }
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    final bool isSessionFlow = options.path.contains('/api/auth/session/');

    if (!isSessionFlow && token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    options.headers['X-Client-Type'] = 'mobile';
    options.headers['X-App-Version'] = '1.0.0';

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (!AppStateStore.instance.authenticationEnabled) {
      handler.next(err);
      return;
    }

    final statusCode = err.response?.statusCode;
    final requestPath = err.requestOptions.path;

    if (statusCode == 401 && !requestPath.contains('/api/auth/refresh')) {
      final prefs = await SharedPreferences.getInstance();
      final refresh = prefs.getString('refresh_token');

      if (refresh != null && refresh.isNotEmpty) {
        try {
          final refreshDio = Dio(
            BaseOptions(
              baseUrl: ApiService._baseUrl,
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 15),
              sendTimeout: const Duration(seconds: 10),
              headers: const {
                'X-Client-Type': 'mobile',
                'X-App-Version': '1.0.0',
              },
            ),
          );

          final res = await refreshDio.post<dynamic>(
            '/api/auth/refresh',
            data: {'refreshToken': refresh},
          );

          final body = (res.data is Map<String, dynamic>)
              ? res.data as Map<String, dynamic>
              : <String, dynamic>{};
          final payload = (body['data'] is Map<String, dynamic>)
              ? body['data'] as Map<String, dynamic>
              : body;

          final newAccess = payload['accessToken']?.toString();
          final newRefresh = payload['refreshToken']?.toString();

          if (newAccess != null && newAccess.isNotEmpty) {
            await prefs.setString('auth_token', newAccess);
            if (newRefresh != null && newRefresh.isNotEmpty) {
              await prefs.setString('refresh_token', newRefresh);
            }

            err.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
            final retry = await ApiService._dio.fetch<dynamic>(err.requestOptions);
            return handler.resolve(retry);
          }
        } catch (_) {
          // Fall through to logout flow.
        }
      }

      await prefs.remove('auth_token');
      await prefs.remove('refresh_token');

      unawaited(
        Future.microtask(() {
          final context = appNavigatorKey.currentContext;
          if (context != null) {
            context.go('/login');
          }
        }),
      );
    }

    handler.next(err);
  }
}
