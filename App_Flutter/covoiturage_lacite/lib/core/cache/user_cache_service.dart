import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../db/cache_database.dart';

abstract class CacheKeys {
  static const String profile = 'profile';
  static const String reservations = 'reservations';
  static const String reservationsEnriched = 'reservations_enriched';
  static const String driverRequests = 'driver_reservation_requests';
  static const String notifications = 'notifications';
  static const String reviews = 'reviews';
  static const String myDriverTrips = 'my_driver_trips';
  static const String myPassengerTrips = 'my_passenger_trips';
  static const String drafts = 'drafts';
  static const String historique = 'historique';
  static const String favorites = 'favorites';
  static const String conversations = 'conversations';
  static String messagesByTrip(String tripId) => 'messages_trip_$tripId';
  static const String stats = 'stats';
  static const String finances = 'finances';
  static const String goboard = 'goboard';
  static const String dashboard = 'dashboard';
  static const String vehicles = 'vehicles';
  static const String unavailability = 'unavailability';
}

abstract class CacheTtl {
  static const int profile = 3600;
  static const int reservations = 300;
  static const int notifications = 120;
  static const int reviews = 1800;
  static const int trips = 300;
  static const int drafts = 600;
  static const int historique = 3600;
  static const int favorites = 1800;
  static const int conversations = 60;
  static const int messages = 60;
  static const int stats = 1800;
  static const int finances = 900;
  static const int goboard = 1800;
  static const int vehicles = 3600;
  static const int unavailability = 1800;
}

class UserCacheService {
  UserCacheService._();
  static final UserCacheService instance = UserCacheService._();

  final CacheDatabase _db = CacheDatabase.instance;
  String? _cachedUserId;

  Future<String> get _userId async {
    if (_cachedUserId != null && _cachedUserId!.isNotEmpty) return _cachedUserId!;
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    _cachedUserId = prefs.getString('userId') ?? '';
    return _cachedUserId!;
  }

  void setUserId(String id) {
    _cachedUserId = id;
  }

  Future<void> put(String key, dynamic value, {int? ttl}) async {
    final String uid = await _userId;
    if (uid.isEmpty) return;
    await _db.put(
      key: key,
      value: value,
      userId: uid,
      ttlSeconds: ttl ?? _defaultTtl(key),
    );
    if (key == CacheKeys.profile) {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString('cached_profile', jsonEncode(value));
    }
  }

  Future<dynamic> get(String key) async {
    final String uid = await _userId;
    if (uid.isEmpty) return null;
    return _db.get(key: key, userId: uid);
  }

  Future<dynamic> getStale(String key) async {
    final String uid = await _userId;
    if (uid.isEmpty) return null;
    return _db.getStale(key: key, userId: uid);
  }

  Future<void> invalidate(String key) async {
    final String uid = await _userId;
    if (uid.isEmpty) return;
    await _db.delete(key: key, userId: uid);
  }

  Future<void> invalidateAll(List<String> keys) async {
    for (final String key in keys) {
      await invalidate(key);
    }
  }

  Future<void> clearCurrentUser() async {
    final String uid = await _userId;
    if (uid.isNotEmpty) {
      await _db.clearUser(uid);
    }
    _cachedUserId = null;
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('cached_profile');
  }

  Future<void> clearAllUsers() async {
    await _db.clearAll();
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('cached_profile');
  }

  Future<void> purgeExpired() async {
    await _db.purgeExpired();
  }

  Future<int> estimateBytes() async {
    return _db.estimateBytes();
  }

  Future<int> countEntries() async {
    return _db.countEntries();
  }

  int _defaultTtl(String key) {
    if (key == CacheKeys.profile) return CacheTtl.profile;
    if (key == CacheKeys.notifications) return CacheTtl.notifications;
    if (key == CacheKeys.reservations ||
        key == CacheKeys.reservationsEnriched ||
        key == CacheKeys.driverRequests) {
      return CacheTtl.reservations;
    }
    if (key == CacheKeys.reviews) return CacheTtl.reviews;
    if (key == CacheKeys.myDriverTrips || key == CacheKeys.myPassengerTrips) {
      return CacheTtl.trips;
    }
    if (key == CacheKeys.drafts) return CacheTtl.drafts;
    if (key == CacheKeys.historique) return CacheTtl.historique;
    if (key == CacheKeys.favorites) return CacheTtl.favorites;
    if (key == CacheKeys.conversations) return CacheTtl.conversations;
    if (key.startsWith('messages_trip_')) return CacheTtl.messages;
    if (key == CacheKeys.stats) return CacheTtl.stats;
    if (key == CacheKeys.finances) return CacheTtl.finances;
    if (key == CacheKeys.goboard) return CacheTtl.goboard;
    if (key == CacheKeys.vehicles) return CacheTtl.vehicles;
    if (key == CacheKeys.unavailability) return CacheTtl.unavailability;
    return 1800;
  }
}

