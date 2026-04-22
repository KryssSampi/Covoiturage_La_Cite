import '../cache/user_cache_service.dart';
import 'api_service.dart';

/// Facade for user-scoped resources with cache keys pre-wired.
class UserDataService {
  UserDataService._();
  static final UserDataService instance = UserDataService._();

  final ApiService _api = ApiService.instance;

  Future<dynamic> getProfile({bool forceRefresh = false}) {
    return _api.get(
      '/api/users/me',
      cacheKey: CacheKeys.profile,
      forceRefresh: forceRefresh,
    );
  }

  Future<dynamic> updateProfile(Map<String, dynamic> body) {
    return _api.patch(
      '/api/users/me',
      body,
      invalidateKeys: <String>[CacheKeys.profile, CacheKeys.dashboard],
    );
  }

  Future<dynamic> getNotifications({bool forceRefresh = false}) {
    return _api.get(
      '/api/notifications',
      cacheKey: CacheKeys.notifications,
      forceRefresh: forceRefresh,
    );
  }

  Future<dynamic> getFavorites({bool forceRefresh = false}) {
    return _api.get(
      '/api/favorites',
      cacheKey: CacheKeys.favorites,
      forceRefresh: forceRefresh,
    );
  }
}

