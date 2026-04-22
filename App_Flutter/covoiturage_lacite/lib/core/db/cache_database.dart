import 'dart:convert';
import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

/// SQLite key-value cache scoped per user id.
class CacheDatabase {
  CacheDatabase._();
  static final CacheDatabase instance = CacheDatabase._();

  static Database? _db;
  static const int _version = 1;
  static const String _dbName = 'lacite_user_cache.db';

  Future<Database> get db async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final String path = p.join(await getDatabasesPath(), _dbName);
    return openDatabase(
      path,
      version: _version,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database database, int version) async {
    await database.execute('''
      CREATE TABLE user_cache (
        cache_key TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        ttl_seconds INTEGER NOT NULL DEFAULT 3600,
        user_id TEXT NOT NULL DEFAULT ''
      )
    ''');
    await database.execute(
      'CREATE INDEX idx_user_cache_user_id ON user_cache(user_id)',
    );
  }

  Future<void> _onUpgrade(Database database, int oldVersion, int newVersion) async {
    // Future migrations.
  }

  Future<void> put({
    required String key,
    required dynamic value,
    required String userId,
    int ttlSeconds = 3600,
  }) async {
    final Database database = await db;
    final int nowMs = DateTime.now().millisecondsSinceEpoch;
    await database.insert(
      'user_cache',
      <String, Object?>{
        'cache_key': _userKey(userId, key),
        'payload': jsonEncode(value),
        'updated_at': nowMs,
        'ttl_seconds': ttlSeconds,
        'user_id': userId,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<dynamic> get({
    required String key,
    required String userId,
  }) async {
    final Database database = await db;
    final List<Map<String, Object?>> rows = await database.query(
      'user_cache',
      where: 'cache_key = ?',
      whereArgs: <Object>[_userKey(userId, key)],
      limit: 1,
    );
    if (rows.isEmpty) return null;

    final Map<String, Object?> row = rows.first;
    final int updatedAt = (row['updated_at'] as int?) ?? 0;
    final int ttl = (row['ttl_seconds'] as int?) ?? 0;
    final int nowMs = DateTime.now().millisecondsSinceEpoch;
    final bool expired = nowMs - updatedAt > ttl * 1000;
    if (expired) return null;

    final String payload = row['payload']?.toString() ?? '{}';
    return jsonDecode(payload);
  }

  Future<dynamic> getStale({
    required String key,
    required String userId,
  }) async {
    final Database database = await db;
    final List<Map<String, Object?>> rows = await database.query(
      'user_cache',
      where: 'cache_key = ?',
      whereArgs: <Object>[_userKey(userId, key)],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    final String payload = rows.first['payload']?.toString() ?? '{}';
    return jsonDecode(payload);
  }

  Future<void> delete({
    required String key,
    required String userId,
  }) async {
    final Database database = await db;
    await database.delete(
      'user_cache',
      where: 'cache_key = ?',
      whereArgs: <Object>[_userKey(userId, key)],
    );
  }

  Future<void> clearUser(String userId) async {
    final Database database = await db;
    await database.delete(
      'user_cache',
      where: 'user_id = ?',
      whereArgs: <Object>[userId],
    );
  }

  Future<void> clearAll() async {
    final Database database = await db;
    await database.delete('user_cache');
  }

  Future<int> countEntries() async {
    final Database database = await db;
    final List<Map<String, Object?>> rows =
        await database.rawQuery('SELECT COUNT(*) as c FROM user_cache');
    if (rows.isEmpty) return 0;
    final dynamic value = rows.first['c'];
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  Future<int> purgeExpired() async {
    final Database database = await db;
    final int nowMs = DateTime.now().millisecondsSinceEpoch;
    return database.rawDelete(
      '''DELETE FROM user_cache
         WHERE (updated_at + ttl_seconds * 1000) < ?
           AND ? - updated_at > ?''',
      <Object>[nowMs, nowMs, 7 * 24 * 3600 * 1000],
    );
  }

  Future<int> estimateBytes() async {
    final Database database = await db;
    final String path = database.path;
    final File file = File(path);
    if (!file.existsSync()) return 0;
    return file.lengthSync();
  }

  String _userKey(String userId, String key) => '$userId::$key';
}

