// lib/main.dart
// App entry point — fixed imports, no broken profile path

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/models/trip.dart';
import 'core/navigation_key.dart';
import 'core/services/api_service.dart';
import 'core/services/auth_service.dart';
import 'core/services/trip_service.dart';
import 'core/state/app_state.dart';
import 'core/shell/app_shell.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/otp_screen.dart';
import 'features/brouillons/brouillons_screen.dart';
import 'features/favoris/favoris_screen.dart';
import 'features/historique/historique_screen.dart';
import 'features/messages/messages_screen.dart';
import 'features/notifications/notification_detail_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/reviews/reviews_screen.dart';
import 'features/search/driver_search_map_screen.dart';
import 'features/search/search_screen.dart';
import 'features/settings/app_settings_screen.dart';
import 'features/stats/stats_screen.dart';
import 'features/trajet_en_cours/trajet_en_cours_screen.dart';
import 'features/trip/create_trip_screen.dart';
import 'features/trip/reservation_request_detail_screen.dart';
import 'features/trip/reservation_screen.dart';
import 'features/trip/published_trip_screen.dart';
import 'features/chat/chat_screen.dart';

final TripService _tripService = TripService(ApiService.instance);
final AuthService _authService = AuthService(ApiService.instance);

void main() {
  runApp(const ProviderScope(child: CovoiturageApp()));
}

class CovoiturageApp extends StatelessWidget {
  const CovoiturageApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const _AppLifecycleRoot();
  }
}

class _AppLifecycleRoot extends StatefulWidget {
  const _AppLifecycleRoot();

  @override
  State<_AppLifecycleRoot> createState() => _AppLifecycleRootState();
}

class _AppLifecycleRootState extends State<_AppLifecycleRoot>
    with WidgetsBindingObserver {
  static const String _kLifecycleStateKey = 'app.lifecycle.state';
  static const String _kLifecycleAtKey = 'app.lifecycle.at';
  static const String _kLifecycleRouteKey = 'app.lifecycle.route';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_persistLifecycleState('start'));
  }

  @override
  void dispose() {
    unawaited(_persistLifecycleState('close'));
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        unawaited(_persistLifecycleState('resume'));
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.hidden:
      case AppLifecycleState.paused:
        unawaited(_persistLifecycleState('pause'));
        break;
      case AppLifecycleState.detached:
        unawaited(_persistLifecycleState('close'));
        break;
    }
  }

  Future<void> _persistLifecycleState(String state) async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String route =
          appRouter.routeInformationProvider.value.uri.toString();
      await prefs.setString(_kLifecycleStateKey, state);
      await prefs.setString(_kLifecycleAtKey, DateTime.now().toIso8601String());
      await prefs.setString(_kLifecycleRouteKey, route);
    } catch (_) {
      // Best effort persistence only.
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Covoiturage La Cité',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1A56CC)),
        primaryColor: const Color(0xFF08316E),
        scaffoldBackgroundColor: const Color(0xFFF2F5FA),
        textTheme: GoogleFonts.openSansTextTheme(),
      ),
      routerConfig: appRouter,
    );
  }
}

final GoRouter appRouter = GoRouter(
  navigatorKey: appNavigatorKey,
  initialLocation: '/bootstrap',
  routes: <RouteBase>[
    GoRoute(
        path: '/bootstrap', builder: (_, __) => const _AuthBootstrapScreen()),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(
      path: '/otp',
      builder: (_, GoRouterState state) => OtpScreen(
        email: state.uri.queryParameters['email'] ?? '',
        mode: state.uri.queryParameters['mode'] ?? 'password',
      ),
    ),
    GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
    GoRoute(path: '/home', builder: (_, __) => const AppShell()),
    GoRoute(path: '/messages', builder: (_, __) => const MessagesScreen()),
    GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
    GoRoute(path: '/stats', builder: (_, __) => const StatsScreen()),
    GoRoute(path: '/favoris', builder: (_, __) => const FavorisScreen()),
    GoRoute(path: '/reviews', builder: (_, __) => const ReviewsScreen()),
    GoRoute(
        path: '/app-settings', builder: (_, __) => const AppSettingsScreen()),
    GoRoute(path: '/historique', builder: (_, __) => const HistoriqueScreen()),
    GoRoute(path: '/brouillons', builder: (_, __) => const BrouillonsScreen()),
    GoRoute(
      path: '/search',
      builder: (_, GoRouterState state) {
        final Map<String, dynamic>? extra = state.extra is Map<String, dynamic>
            ? state.extra as Map<String, dynamic>
            : null;
        double? parseNullableDouble(dynamic value) {
          if (value is num) return value.toDouble();
          return double.tryParse(value?.toString() ?? '');
        }

        bool parseNullableBool(dynamic value) {
          if (value is bool) return value;
          final String raw = value?.toString().toLowerCase() ?? '';
          return raw == 'true' || raw == '1';
        }

        bool? parseOptionalBool(dynamic value) {
          if (value == null) return null;
          if (value is bool) return value;
          final String raw = value.toString().toLowerCase();
          if (raw == 'true' || raw == '1') return true;
          if (raw == 'false' || raw == '0') return false;
          return null;
        }

        final bool isDriverMode = parseOptionalBool(extra?['isDriver']) ??
            AppStateStore.instance.isDriver;
        return SearchScreen(
          tripService: _tripService,
          initialFrom: extra?['from']?.toString(),
          initialTo: extra?['to']?.toString(),
          initialFromLat: parseNullableDouble(extra?['fromLat']),
          initialFromLng: parseNullableDouble(extra?['fromLng']),
          initialToLat: parseNullableDouble(extra?['toLat']),
          initialToLng: parseNullableDouble(extra?['toLng']),
          autoSearchOnInit: parseNullableBool(extra?['autoSearch']),
          isDriver: isDriverMode,
        );
      },
    ),
    GoRoute(
      path: '/trip/:id',
      builder: (_, GoRouterState state) {
        final dynamic extra = state.extra;
        final Trip? trip = extra is Trip ? extra : null;
        final Map<String, dynamic>? initialData =
            extra is Map<String, dynamic> ? extra : null;
        final String id = state.pathParameters['id'] ?? '';
        return PublishedTripScreen(
          tripService: _tripService,
          tripId: id,
          trip: trip,
          initialData: initialData,
        );
      },
    ),
    GoRoute(
      path: '/trip-detail/:id',
      builder: (_, GoRouterState state) {
        final extra = state.extra as Map<String, dynamic>?;
        final id = state.pathParameters['id']!;
        PTViewerRole role = PTViewerRole.passenger;
        PTReservationStatus resStatus = PTReservationStatus.none;
        String? source, sourceStatus;
        if (extra != null) {
          final rawRole = extra['viewerRole']?.toString().toLowerCase() ?? '';
          if (rawRole.contains('driver')) role = PTViewerRole.driverOwner;
          if (rawRole.contains('admin')) role = PTViewerRole.admin;
          final rawRes =
              extra['reservationStatus']?.toString().toLowerCase() ?? '';
          resStatus = switch (rawRes) {
            'pending' => PTReservationStatus.pending,
            'confirmed' => PTReservationStatus.confirmed,
            'refused' => PTReservationStatus.refused,
            'cancelled' => PTReservationStatus.cancelled,
            'inprogress' || 'in_progress' => PTReservationStatus.inProgress,
            'completed' => PTReservationStatus.completed,
            _ => PTReservationStatus.none,
          };
          source = extra['source']?.toString();
          sourceStatus = extra['sourceStatus']?.toString();
        }
        return PublishedTripScreen(
          tripService: _tripService,
          tripId: id,
          initialData: extra,
          viewerRole: role,
          existingReservationStatus: resStatus,
          source: source,
          sourceStatus: sourceStatus,
          reservationId: extra?['reservationId']?.toString(),
        );
      },
    ),
    GoRoute(
      path: '/create-trip',
      builder: (_, GoRouterState state) => CreateTripScreen(
        prefill: state.extra is Map<String, dynamic>
            ? state.extra as Map<String, dynamic>
            : null,
      ),
    ),
    GoRoute(
      path: '/reservations',
      builder: (_, __) => ReservationScreen(
        tripService: _tripService,
        isDriver: AppStateStore.instance.isDriver,
      ),
    ),
    GoRoute(
      path: '/chat/:tripId',
      builder: (_, GoRouterState state) {
        final extra = state.extra is Map<String, dynamic>
            ? state.extra as Map<String, dynamic>
            : null;
        final tripId = state.pathParameters['tripId'] ?? '';

        DateTime? departureTime;
        if (extra?['tripDepartureTime'] != null) {
          departureTime =
              DateTime.tryParse(extra!['tripDepartureTime'].toString());
        }

        return ChatScreen(
          tripId: tripId,
          tripDepartureTime: departureTime,
          otherUserName: extra?['otherUserName']?.toString(),
          otherUserInitials: extra?['otherUserInitials']?.toString(),
          otherUserAvatarUrl: extra?['otherUserAvatarUrl']?.toString(),
          isDriver:
              extra?['isDriver'] as bool? ?? AppStateStore.instance.isDriver,
          tripRoute: extra?['tripRoute']?.toString(),
        );
      },
    ),
    GoRoute(
      path: '/driver-search-map',
      builder: (_, GoRouterState state) => DriverSearchMapScreen(
        args: state.extra is DriverSearchMapArgs
            ? state.extra as DriverSearchMapArgs
            : null,
      ),
    ),
    GoRoute(
      path: '/trajet-en-cours/:id',
      builder: (_, GoRouterState state) => TrajetEnCoursScreen(
        tripId: state.pathParameters['id'] ?? '',
      ),
    ),
    GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen()),
    GoRoute(
      path: '/notification/:id',
      builder: (_, GoRouterState state) => NotificationDetailScreen(
        notificationId: state.pathParameters['id'] ?? '',
        initialData: state.extra as Map<String, dynamic>?,
      ),
    ),
    GoRoute(
      path: '/reservation-request/:id',
      builder: (_, GoRouterState state) => ReservationRequestDetailScreen(
        reservationId: state.pathParameters['id'] ?? '',
        initialData: state.extra is Map<String, dynamic>
            ? state.extra as Map<String, dynamic>
            : null,
      ),
    ),
  ],
);

class _AuthBootstrapScreen extends StatefulWidget {
  const _AuthBootstrapScreen();

  @override
  State<_AuthBootstrapScreen> createState() => _AuthBootstrapScreenState();
}

class _AuthBootstrapScreenState extends State<_AuthBootstrapScreen> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    if (!AppStateStore.instance.authenticationEnabled) {
      if (mounted) context.go('/home');
      return;
    }

    final bool loggedIn = await _authService.isLoggedIn();
    if (!mounted) return;
    context.go(loggedIn ? '/home' : '/login');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
