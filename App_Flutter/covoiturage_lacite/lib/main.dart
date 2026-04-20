// lib/main.dart
// App entry point — fixed imports, no broken profile path

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/models/trip.dart';
import 'core/navigation_key.dart';
import 'core/services/api_service.dart';
import 'core/services/trip_service.dart';
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
import 'features/stats/stats_screen.dart';
import 'features/trip/create_trip_screen.dart';
import 'features/trip/reservation_request_detail_screen.dart';
import 'features/trip/reservation_screen.dart';
import 'features/trip/published_trip_screen.dart';
import 'features/chat/chat_screen.dart';

final TripService _tripService = TripService(ApiService.instance);

void main() {
  runApp(const ProviderScope(child: CovoiturageApp()));
}

class CovoiturageApp extends StatelessWidget {
  const CovoiturageApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Covoiturage La Cité',
      theme: ThemeData(
        colorScheme:
            ColorScheme.fromSeed(seedColor: const Color(0xFF1A56CC)),
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
  initialLocation: '/home',
  routes: <RouteBase>[
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(
      path: '/otp',
      builder: (_, GoRouterState state) => OtpScreen(
        email: state.uri.queryParameters['email'] ?? '',
        mode: state.uri.queryParameters['mode'] ?? 'password',
      ),
    ),
    GoRoute(
        path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
    GoRoute(path: '/home', builder: (_, __) => const AppShell()),
    GoRoute(path: '/messages', builder: (_, __) => const MessagesScreen()),
    GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
    GoRoute(path: '/stats', builder: (_, __) => const StatsScreen()),
    GoRoute(path: '/favoris', builder: (_, __) => const FavorisScreen()),
    GoRoute(path: '/reviews', builder: (_, __) => const ReviewsScreen()),
    GoRoute(
        path: '/historique', builder: (_, __) => const HistoriqueScreen()),
    GoRoute(
        path: '/brouillons', builder: (_, __) => const BrouillonsScreen()),
    GoRoute(
      path: '/search',
      builder: (_, GoRouterState state) {
        final Map<String, dynamic>? extra = state.extra is Map<String, dynamic>
            ? state.extra as Map<String, dynamic>
            : null;
        return SearchScreen(
          tripService: _tripService,
          initialFrom: extra?['from']?.toString(),
          initialTo: extra?['to']?.toString(),
          isDriver: true,
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
      builder: (_, __) => ReservationScreen(tripService: _tripService),
    ),
    GoRoute(
      path: '/chat/:tripId',
      builder: (_, GoRouterState state) =>
          ChatScreen(tripId: state.pathParameters['tripId'] ?? ''),
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
        path: '/notifications', builder: (_, __) => const NotificationsScreen()),
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
      ),
    ),
  ],
);
