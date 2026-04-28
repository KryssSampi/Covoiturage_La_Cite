import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:cookie_jar/cookie_jar.dart';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../cache/user_cache_service.dart';
import '../fixtures/app_fixtures.dart';
import '../navigation_key.dart';
import '../state/app_state.dart';

class ApiService {
  static const String _baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://covoituragelacite-production.up.railway.app/',
  );

  static const String _publicKeyStorageKey = 'server_public_key';
  static const String _publicKeyFingerprintStorageKey =
      'server_public_key_sha256';
  static String? _pinnedFingerprint;

  static late final Dio _dio;
  static late final CookieJar _cookieJar;

  final UserCacheService _cache = UserCacheService.instance;

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
    unawaited(_cache.purgeExpired());
  }

  static final ApiService instance = ApiService._internal();

  static Future<void> _initSecureClient() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String? cachedKey = prefs.getString(_publicKeyStorageKey);

    if (cachedKey == null || cachedKey.isEmpty) {
      try {
        final dynamic res = await Dio(
          BaseOptions(
            baseUrl: _baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 15),
            sendTimeout: const Duration(seconds: 10),
            headers: const <String, String>{
              'X-Client-Type': 'mobile',
              'X-App-Version': '1.0.0',
            },
          ),
        ).get<dynamic>('/api/auth/public-key');

        final Map<String, dynamic> body = (res.data is Map<String, dynamic>)
            ? res.data as Map<String, dynamic>
            : <String, dynamic>{};
        cachedKey = body['publicKey']?.toString();

        if (cachedKey != null && cachedKey.isNotEmpty) {
          await prefs.setString(_publicKeyStorageKey, cachedKey);
        }
      } catch (_) {
        // Best effort only.
      }
    }

    if (cachedKey != null && cachedKey.isNotEmpty) {
      final String fingerprint =
          sha256.convert(utf8.encode(cachedKey)).toString();
      await prefs.setString(_publicKeyFingerprintStorageKey, fingerprint);
      _pinnedFingerprint = fingerprint;
    } else {
      _pinnedFingerprint = prefs.getString(_publicKeyFingerprintStorageKey);
    }
  }

  static void _configurePinnedHttpClient() {
    final dynamic adapter = _dio.httpClientAdapter;
    if (adapter is! IOHttpClientAdapter) {
      return;
    }

    adapter.createHttpClient = () {
      final HttpClient client = HttpClient();
      // Production: rely on platform trust store.
      // Dev override can be enabled explicitly via --dart-define=ALLOW_BAD_CERT=true.
      const bool allowBadCert = bool.fromEnvironment(
        'ALLOW_BAD_CERT',
        defaultValue: false,
      );
      if (allowBadCert) {
        client.badCertificateCallback = (
          X509Certificate cert,
          String host,
          int port,
        ) {
          return true;
        };
      }
      return client;
    };

    adapter.validateCertificate = (
      X509Certificate? cert,
      String host,
      int port,
    ) {
      // Keep handshake strict enough to require a certificate object.
      // Trust decision is delegated to platform validation above.
      return cert != null;
    };
  }

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? params,
    Options? options,
    String? cacheKey,
    bool forceRefresh = false,
  }) async {
    final bool isAuthPath = path.startsWith('/api/auth/');
    final String? effectiveCacheKey = cacheKey ?? _inferCacheKey(path, params);

    if (effectiveCacheKey != null && !forceRefresh) {
      final dynamic cached = await _cache.get(effectiveCacheKey);
      if (cached != null) {
        AppStateStore.instance.clearFixtureFallback();
        _syncCurrentUserIfNeeded(path, cached);

        // Keep cache fresh while preserving fast UI.
        unawaited(
          _refreshInBackground(
            path,
            params: params,
            options: options,
            cacheKey: effectiveCacheKey,
          ),
        );
        return cached;
      }
    }

    try {
      final Response<dynamic> response = await _dio.get<dynamic>(
        path,
        queryParameters: params,
        options: options,
      );
      final dynamic data = response.data;

      AppStateStore.instance.clearFixtureFallback();
      _syncCurrentUserIfNeeded(path, data);

      if (effectiveCacheKey != null && data != null) {
        unawaited(_cache.put(effectiveCacheKey, data));
      }
      return data;
    } catch (error) {
      if (isAuthPath) {
        rethrow;
      }

      if (effectiveCacheKey != null) {
        final dynamic stale = await _cache.getStale(effectiveCacheKey);
        if (stale != null) {
          AppStateStore.instance.reportStaleCacheFallback(
            endpoint: path,
            reason: _errorMessage(error),
          );
          _syncCurrentUserIfNeeded(path, stale);
          return stale;
        }
      }

      final dynamic fallback = AppFixtures.getFallback(
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
    List<String> invalidateKeys = const <String>[],
  }) async {
    final bool isAuthPath = path.startsWith('/api/auth/');
    final List<String> keys = <String>{
      ...invalidateKeys,
      ..._inferInvalidationKeysForPost(path),
    }.toList();

    try {
      final Response<dynamic> response = await _dio.post<dynamic>(
        path,
        data: body,
        options: options,
      );
      AppStateStore.instance.clearFixtureFallback();
      _syncCurrentUserIfNeeded(path, response.data);
      if (keys.isNotEmpty) {
        unawaited(_cache.invalidateAll(keys));
      }
      return response.data;
    } catch (error) {
      if (isAuthPath) {
        rethrow;
      }

      final dynamic fallback = AppFixtures.postFallback(
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
        if (keys.isNotEmpty) {
          unawaited(_cache.invalidateAll(keys));
        }
        return fallback;
      }
      rethrow;
    }
  }

  Future<dynamic> patch(
    String path,
    dynamic body, {
    Options? options,
    List<String> invalidateKeys = const <String>[],
  }) async {
    final bool isAuthPath = path.startsWith('/api/auth/');
    final List<String> keys = <String>{
      ...invalidateKeys,
      ..._inferInvalidationKeysForPatch(path),
    }.toList();

    try {
      final Response<dynamic> response = await _dio.patch<dynamic>(
        path,
        data: body,
        options: options,
      );
      AppStateStore.instance.clearFixtureFallback();
      _syncCurrentUserIfNeeded(path, response.data);
      if (keys.isNotEmpty) {
        unawaited(_cache.invalidateAll(keys));
      }
      return response.data;
    } catch (error) {
      if (isAuthPath) {
        rethrow;
      }

      final dynamic fallback = AppFixtures.patchFallback(
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
        if (keys.isNotEmpty) {
          unawaited(_cache.invalidateAll(keys));
        }
        return fallback;
      }
      rethrow;
    }
  }

  Future<dynamic> delete(
    String path, {
    Options? options,
    List<String> invalidateKeys = const <String>[],
  }) async {
    final List<String> keys = <String>{...invalidateKeys}.toList();
    try {
      final Response<dynamic> response = await _dio.delete<dynamic>(
        path,
        options: options,
      );
      AppStateStore.instance.clearFixtureFallback();
      if (keys.isNotEmpty) {
        unawaited(_cache.invalidateAll(keys));
      }
      return response.data;
    } catch (error) {
      rethrow;
    }
  }

  Future<void> _refreshInBackground(
    String path, {
    Map<String, dynamic>? params,
    Options? options,
    required String cacheKey,
  }) async {
    try {
      final Response<dynamic> response = await _dio.get<dynamic>(
        path,
        queryParameters: params,
        options: options,
      );
      final dynamic data = response.data;
      if (data != null) {
        await _cache.put(cacheKey, data);
      }
      _syncCurrentUserIfNeeded(path, data);
      AppStateStore.instance.clearFixtureFallback();
    } catch (_) {
      // Silent background refresh failure.
    }
  }

  String? _inferCacheKey(String path, Map<String, dynamic>? _) {
    if (path == '/api/users/me') return CacheKeys.profile;
    if (path == '/api/reservations' || path == '/api/reservations/mine') {
      return CacheKeys.reservations;
    }
    if (path == '/api/passenger/reservations-enriched') {
      return CacheKeys.reservationsEnriched;
    }
    if (path == '/api/driver/reservation-requests') {
      return CacheKeys.driverRequests;
    }
    if (path == '/api/notifications') return CacheKeys.notifications;
    if (path == '/api/reviews/me') return CacheKeys.reviews;
    if (path == '/api/trips/mine/driver') return CacheKeys.myDriverTrips;
    if (path == '/api/trips/mine/passenger') return CacheKeys.myPassengerTrips;
    if (path == '/api/trips/drafts' || path == '/api/drafts')
      return CacheKeys.drafts;
    if (path == '/api/trips/history' ||
        path == '/api/driver/historique' ||
        path == '/api/passenger/historique') {
      return CacheKeys.historique;
    }
    if (path == '/api/favorites' ||
        path == '/api/lieux-favoris' ||
        path == '/api/places-favoris') {
      return CacheKeys.favorites;
    }
    if (path == '/api/messages/conversations' || path == '/api/conversations') {
      return CacheKeys.conversations;
    }
    if (path.startsWith('/api/messages/')) {
      final List<String> parts = path.split('/');
      if (parts.length >= 4) {
        final String tripId = parts[3];
        if (tripId.isNotEmpty) return CacheKeys.messagesByTrip(tripId);
      }
    }
    if (path == '/api/stats/me') return CacheKeys.stats;
    if (path == '/api/stats/finances' ||
        path == '/api/finances/driver/summary' ||
        path == '/api/finances/passenger/summary') {
      return CacheKeys.finances;
    }
    if (path == '/api/goboard/rankings' || path == '/api/gotasks/goboard') {
      return CacheKeys.goboard;
    }
    if (path == '/api/vehicles') return CacheKeys.vehicles;
    if (path == '/api/unavailability') return CacheKeys.unavailability;

    // Explicitly no cache for global/public and live search endpoints.
    if (path == '/api/trips/search' || path == '/api/locations/suggestions') {
      return null;
    }

    return null;
  }

  List<String> _inferInvalidationKeysForPost(String path) {
    if (path == '/api/reservations') {
      return <String>[
        CacheKeys.reservations,
        CacheKeys.reservationsEnriched,
        CacheKeys.driverRequests,
        CacheKeys.myPassengerTrips,
        CacheKeys.myDriverTrips,
        CacheKeys.dashboard,
      ];
    }
    if (path.startsWith('/api/reservations/') &&
        (path.endsWith('/accept') ||
            path.endsWith('/refuse') ||
            path.endsWith('/cancel'))) {
      return <String>[
        CacheKeys.reservations,
        CacheKeys.reservationsEnriched,
        CacheKeys.driverRequests,
        CacheKeys.myPassengerTrips,
        CacheKeys.myDriverTrips,
        CacheKeys.dashboard,
      ];
    }
    if (path == '/api/messages' || path.startsWith('/api/messages/')) {
      final List<String> keys = <String>[CacheKeys.conversations];
      final List<String> parts = path.split('/');
      if (parts.length >= 4) {
        keys.add(CacheKeys.messagesByTrip(parts[3]));
      }
      return keys;
    }
    if (path == '/api/trips') {
      return <String>[
        CacheKeys.myDriverTrips,
        CacheKeys.drafts,
        CacheKeys.dashboard
      ];
    }
    if (path == '/api/unavailability' ||
        path.contains('/api/unavailability/')) {
      return <String>[CacheKeys.unavailability];
    }
    if (path == '/api/reviews') {
      return <String>[CacheKeys.reviews];
    }
    if (path == '/api/vehicles') {
      return <String>[CacheKeys.vehicles];
    }
    if (path == '/api/users/change-password' ||
        path == '/api/users/me/delete') {
      return <String>[CacheKeys.profile, CacheKeys.dashboard];
    }
    return const <String>[];
  }

  List<String> _inferInvalidationKeysForPatch(String path) {
    if (path == '/api/users/me') {
      return <String>[CacheKeys.profile, CacheKeys.dashboard];
    }
    if (path == '/api/notifications/read-all') {
      return <String>[CacheKeys.notifications];
    }
    return const <String>[];
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
    final Map<String, dynamic>? map = _extractMap(payload);
    if (map != null && map.isNotEmpty) {
      AppStateStore.instance.updateCurrentUserFromJson(map);
      final String uid = map['id']?.toString() ?? '';
      if (uid.isNotEmpty) {
        UserCacheService.instance.setUserId(uid);
      }
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
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('auth_token');
    final String? authSessionKey = prefs.getString('auth_session_key');
    final bool isAuthFlow = options.path.startsWith('/api/auth/');

    if (!isAuthFlow && token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    if (isAuthFlow &&
        authSessionKey != null &&
        authSessionKey.isNotEmpty &&
        options.path != '/api/auth/init-session') {
      final String existingCookie = options.headers['Cookie']?.toString() ?? '';
      if (!existingCookie.contains('auth_session_key=')) {
        final String prefix =
            existingCookie.isEmpty ? '' : '${existingCookie.trim()}; ';
        options.headers['Cookie'] = '${prefix}auth_session_key=$authSessionKey';
      }
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

    final int? statusCode = err.response?.statusCode;
    final String requestPath = err.requestOptions.path;

    if (statusCode == 401 &&
        !requestPath.startsWith('/api/auth/') &&
        !requestPath.contains('/api/auth/refresh')) {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? currentToken = prefs.getString('auth_token');
      if (currentToken != null && currentToken.startsWith('fixture_access_')) {
        handler.next(err);
        return;
      }
      final String? refresh = prefs.getString('refresh_token');

      if (refresh != null && refresh.isNotEmpty) {
        try {
          final Dio refreshDio = Dio(
            BaseOptions(
              baseUrl: ApiService._baseUrl,
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 15),
              sendTimeout: const Duration(seconds: 10),
              headers: const <String, String>{
                'X-Client-Type': 'mobile',
                'X-App-Version': '1.0.0',
              },
            ),
          );

          final Response<dynamic> res = await refreshDio.post<dynamic>(
            '/api/auth/refresh',
            data: <String, String>{'refreshToken': refresh},
          );

          final Map<String, dynamic> body = (res.data is Map<String, dynamic>)
              ? res.data as Map<String, dynamic>
              : <String, dynamic>{};
          final Map<String, dynamic> payload =
              (body['data'] is Map<String, dynamic>)
                  ? body['data'] as Map<String, dynamic>
                  : body;

          final String? newAccess = payload['accessToken']?.toString();
          final String? newRefresh = payload['refreshToken']?.toString();

          if (newAccess != null && newAccess.isNotEmpty) {
            await prefs.setString('auth_token', newAccess);
            if (newRefresh != null && newRefresh.isNotEmpty) {
              await prefs.setString('refresh_token', newRefresh);
            }

            err.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
            final Response<dynamic> retry =
                await ApiService._dio.fetch<dynamic>(err.requestOptions);
            return handler.resolve(retry);
          }
        } catch (_) {
          // Fall through to forced logout.
        }
      }

      await prefs.remove('auth_token');
      await prefs.remove('refresh_token');

      unawaited(
        Future<void>.microtask(() {
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
