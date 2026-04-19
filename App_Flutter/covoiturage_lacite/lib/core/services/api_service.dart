import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';

import '../navigation_key.dart';

class ApiService {
  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: 'http://10.0.2.2:5000',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'jwt');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await _storage.delete(key: 'jwt');

            unawaited(
              Future.microtask(() {
                final context = appNavigatorKey.currentContext;
                if (context != null) {
                  GoRouter.of(context).push('/login');
                }
              }),
            );
          }

          handler.next(error);
        },
      ),
    );
  }

  static final ApiService instance = ApiService._internal();

  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<dynamic> get(String path, {Map<String, dynamic>? params}) async {
    final response = await _dio.get<dynamic>(path, queryParameters: params);
    return response.data;
  }

  Future<dynamic> post(String path, dynamic body) async {
    final response = await _dio.post<dynamic>(path, data: body);
    return response.data;
  }

  Future<dynamic> patch(String path, dynamic body) async {
    final response = await _dio.patch<dynamic>(path, data: body);
    return response.data;
  }
}
