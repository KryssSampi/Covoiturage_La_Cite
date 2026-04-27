import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_colors.dart';
import '../../core/app_text_styles.dart';
import '../../core/converters/display_converters.dart';
import '../../core/services/api_service.dart';
import '../../core/services/ors_route_service.dart';
import '../../core/services/trip_service.dart';
import '../../core/state/app_state.dart';
import '../../shared/widgets/shared_widgets.dart';

// ══════════════════════════════════════════════════════════════════════════════
// MODÈLES LOCAUX
// ══════════════════════════════════════════════════════════════════════════════

class _FavPill {
  final String label;
  final IconData icon;
  final Color bg;
  final Color fg;
  const _FavPill({
    required this.label,
    required this.icon,
    required this.bg,
    required this.fg,
  });
}

class _StatCard {
  final String value;
  final String unit;
  final String label;
  final Color iconBg;
  final Color iconFg;
  final IconData icon;
  final String? badge;
  const _StatCard({
    required this.value,
    required this.unit,
    required this.label,
    required this.iconBg,
    required this.iconFg,
    required this.icon,
    this.badge,
  });
}

class _RequestCard {
  final String initials;
  final Color avatarBg;
  final Color avatarFg;
  final String name;
  final String action;
  final String timeLabel;
  final String typeLabel;
  final Color typeBg;
  final Color typeFg;
  final String routeFrom;
  final String routeTo;
  final String? tripId;
  final bool hasAccept;
  final bool isDriverRequest;
  final String? reservationId;
  const _RequestCard({
    required this.initials,
    required this.avatarBg,
    required this.avatarFg,
    required this.name,
    required this.action,
    required this.timeLabel,
    required this.typeLabel,
    required this.typeBg,
    required this.typeFg,
    required this.routeFrom,
    required this.routeTo,
    this.tripId,
    this.hasAccept = false,
    this.isDriverRequest = false,
    this.reservationId,
  });
}

class _ActiveTripSnapshot {
  const _ActiveTripSnapshot({
    required this.tripId,
    required this.timeLabel,
    required this.fromLabel,
    required this.toLabel,
    required this.statusLabel,
    required this.statusBg,
    required this.statusFg,
    required this.priceLabel,
    required this.passengerLabel,
    required this.progress,
    required this.etaLabel,
    required this.canOpenLiveTrip,
  });

  final String tripId;
  final String timeLabel;
  final String fromLabel;
  final String toLabel;
  final String statusLabel;
  final Color statusBg;
  final Color statusFg;
  final String priceLabel;
  final String passengerLabel;
  final double progress;
  final String etaLabel;
  final bool canOpenLiveTrip;
}

enum _LocationResolveStatus {
  success,
  serviceDisabled,
  permissionDenied,
  permissionDeniedForever,
  error,
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with WidgetsBindingObserver {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _api = ApiService.instance;
  static const Duration _loadTimeout = Duration(seconds: 18);
  static const int _minSuggestionChars = 3;

  Timer? _keyboardCloseTimer;

  bool _isSearchFocused = false;
  bool _isLoading = true;
  bool _hasError = false;
  bool _isLoadingSuggestions = false;
  bool _isResolvingLocation = false;
  String? _firstName;
  Position? _currentPosition;
  OrsPlaceSuggestion? _selectedSuggestion;
  Timer? _suggestionDebounce;
  List<OrsPlaceSuggestion> _searchSuggestions = const <OrsPlaceSuggestion>[];
  List<_StatCard> _stats = [];
  List<_RequestCard> _requests = [];
  _ActiveTripSnapshot? _activeTrip;

  // FavPills définis ici (pas en const static pour éviter le conflit AppColors)
  List<_FavPill> get _favPills => [
        _FavPill(
          label: 'La Cité',
          icon: Icons.school_outlined,
          bg: AppColors.blueLight,
          fg: AppColors.blue,
        ),
        _FavPill(
          label: 'Maison',
          icon: Icons.home_outlined,
          bg: AppColors.tealLight,
          fg: AppColors.teal,
        ),
        _FavPill(
          label: 'Travail',
          icon: Icons.work_outline,
          bg: AppColors.amberLight,
          fg: AppColors.amber,
        ),
      ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _searchCtrl.addListener(_onSearchTextChanged);
    _loadDashboard();
    unawaited(_resolveCurrentPosition(showSystemPrompt: true));
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _suggestionDebounce?.cancel();
    _searchCtrl.removeListener(_onSearchTextChanged);
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    _keyboardCloseTimer?.cancel();
    super.dispose();
  }

  // ── Lifecycle: sauvegarde/restauration état lors du passage en arrière-plan ──
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
        // Sauvegarder l'état si nécessaire (ex: scroll position)
        _onPause();
        break;
      case AppLifecycleState.resumed:
        _onResume();
        break;
      case AppLifecycleState.detached:
      case AppLifecycleState.hidden:
        break;
    }
  }

  @override
  void didChangeMetrics() {
    super.didChangeMetrics();
    final double keyboardInset = WidgetsBinding
        .instance.platformDispatcher.views.first.viewInsets.bottom;
    // Si le clavier se ferme alors qu'on est en focus sur la barre de recherche
    if (keyboardInset == 0 && _isSearchFocused) {
      // On attend un court délai avant de fermer le focus pour laisser le clavier sortir
      _keyboardCloseTimer?.cancel();
      _keyboardCloseTimer = Timer(const Duration(milliseconds: 350), () {
        if (!mounted) return;
        FocusManager.instance.primaryFocus?.unfocus();
        setState(() {
          _isSearchFocused = false;
          _isLoadingSuggestions = false;
          _searchSuggestions = const <OrsPlaceSuggestion>[];
        });
      });
    } else {
      // Si le clavier s'ouvre ou autre, on annule le timer
      _keyboardCloseTimer?.cancel();
    }
  }

  void _onPause() {
    // Sauvegarder la position de scroll ou d'autres états
    // SharedPreferences.getInstance().then((p) => p.setDouble('home_scroll', _scrollCtrl.hasClients ? _scrollCtrl.offset : 0));
  }

  void _onResume() {
    // Rafraîchir les données critiques (demandes, stats) après retour
    if (mounted && !_isLoading) {
      _loadDashboard();
    }
  }

  void _onSearchTextChanged() {
    final String query = _searchCtrl.text.trim();
    if (_selectedSuggestion != null &&
        _selectedSuggestion!.label.trim() != query) {
      _selectedSuggestion = null;
    }
    if (_isSearchFocused) {
      _queueSuggestions(query);
    }
  }

  void _queueSuggestions(String raw) {
    _suggestionDebounce?.cancel();
    final String query = raw.trim();
    if (query.length < _minSuggestionChars) {
      if (mounted) {
        setState(() {
          _isLoadingSuggestions = false;
          _searchSuggestions = const <OrsPlaceSuggestion>[];
        });
      }
      return;
    }

    if (mounted) {
      setState(() => _isLoadingSuggestions = true);
    }

    _suggestionDebounce = Timer(const Duration(milliseconds: 260), () async {
      final List<OrsPlaceSuggestion> suggestions =
          await OrsRouteService.instance.suggestPlaces(query, limit: 8);
      if (!mounted) return;
      setState(() {
        _isLoadingSuggestions = false;
        _searchSuggestions = suggestions;
      });
    });
  }

  Future<_LocationResolveStatus> _resolveCurrentPosition({
    bool showSystemPrompt = false,
  }) async {
    if (_isResolvingLocation) return _LocationResolveStatus.error;
    _isResolvingLocation = true;
    try {
      final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return _LocationResolveStatus.serviceDisabled;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied && showSystemPrompt) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied) {
        return _LocationResolveStatus.permissionDenied;
      }
      if (permission == LocationPermission.deniedForever) {
        return _LocationResolveStatus.permissionDeniedForever;
      }

      final Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.bestForNavigation,
      );
      if (mounted) {
        setState(() => _currentPosition = position);
      } else {
        _currentPosition = position;
      }
      return _LocationResolveStatus.success;
    } catch (_) {
      return _LocationResolveStatus.error;
    } finally {
      _isResolvingLocation = false;
    }
  }

  Future<void> _showLocationRequiredDialog(
      _LocationResolveStatus status) async {
    if (!mounted) return;
    String message;
    switch (status) {
      case _LocationResolveStatus.serviceDisabled:
        message =
            'Activez le service de localisation pour lancer la recherche.';
        break;
      case _LocationResolveStatus.permissionDenied:
        message =
            'La position est requise pour definir le depart. Autorisez la localisation.';
        break;
      case _LocationResolveStatus.permissionDeniedForever:
        message =
            'La permission de localisation est bloquee. Autorisez-la dans les parametres.';
        break;
      case _LocationResolveStatus.error:
        message = 'Impossible de recuperer votre position actuelle.';
        break;
      case _LocationResolveStatus.success:
        message = '';
        break;
    }

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Position requise'),
          content: Text(message),
          actions: <Widget>[
            if (status == _LocationResolveStatus.permissionDeniedForever)
              TextButton(
                onPressed: () async {
                  await Geolocator.openAppSettings();
                  if (context.mounted) Navigator.of(context).pop();
                },
                child: const Text('Parametres'),
              ),
            TextButton(
              onPressed: () async {
                if (status == _LocationResolveStatus.serviceDisabled) {
                  await Geolocator.openLocationSettings();
                }
                if (context.mounted) Navigator.of(context).pop();
              },
              child: const Text('Reessayer'),
            ),
          ],
        );
      },
    );
  }

  Future<bool> _ensureCurrentPositionForSearch() async {
    while (mounted) {
      final _LocationResolveStatus status =
          await _resolveCurrentPosition(showSystemPrompt: true);
      if (status == _LocationResolveStatus.success) return true;
      await _showLocationRequiredDialog(status);
    }
    return false;
  }

  String _buildCurrentPositionLabel(Position position) {
    return 'Votre position (${position.latitude.toStringAsFixed(5)}, '
        '${position.longitude.toStringAsFixed(5)})';
  }

  Future<void> _loadDashboard() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _hasError = false;
    });

    try {
      final bool isDriver = AppStateStore.instance.isDriver;
      final List<dynamic> payloads =
          await Future.wait<dynamic>(<Future<dynamic>>[
        _api.get('/api/users/me'),
        isDriver
            ? _api.get('/api/trips/mine/driver')
            : _api.get('/api/reservations'),
        isDriver
            ? _api.get('/api/driver/reservation-requests')
            : _api.get('/api/passenger/reservations-enriched'),
        isDriver
            ? _api.get('/api/finances/driver/summary')
            : _api.get('/api/finances/passenger/summary'),
      ]).timeout(_loadTimeout);

      final HomeDashboardDisplay dashboard = DisplayConverters.toHomeDashboard(
        userPayload: payloads[0],
        tripsPayload: payloads[1],
        pendingPayload: payloads[2],
        financePayload: payloads[3],
      );
      final _ActiveTripSnapshot? activeTrip = _extractActiveTrip(payloads[1]);

      if (!mounted) return;
      setState(() {
        _firstName = dashboard.firstName;
        _stats = _buildStats(dashboard);
        _requests = _extractRequests(dashboard.pendingRequests.cast<dynamic>());
        _activeTrip = activeTrip;
        _isLoading = false;
        _hasError = false;
      });

      AppStateStore.instance.setPageHasNews(
        AppNavPage.reservations,
        dashboard.pendingRequests.isNotEmpty,
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _hasError = true;
        _firstName ??= AppStateStore.instance.currentUser.firstName;
        _requests = const <_RequestCard>[];
        _stats = _buildEmptyStats();
        _activeTrip = null;
      });
      AppStateStore.instance.setPageHasNews(AppNavPage.reservations, false);
    }
  }

  List<_StatCard> _buildStats(HomeDashboardDisplay dashboard) {
    return [
      _StatCard(
        value: '${dashboard.totalTrips}',
        unit: '',
        label: 'Trajets',
        iconBg: const Color(0xFFFDECEA),
        iconFg: AppColors.redMid,
        icon: Icons.directions_car_outlined,
      ),
      _StatCard(
        value: dashboard.averageRating.toStringAsFixed(1),
        unit: '',
        label: 'Note',
        iconBg: AppColors.amberLight,
        iconFg: AppColors.amberMid,
        icon: Icons.star_outline,
      ),
      _StatCard(
        value: '${dashboard.totalPassengers}',
        unit: '',
        label: 'Passagers',
        iconBg: AppColors.tealLight,
        iconFg: AppColors.teal,
        icon: Icons.people_alt_outlined,
      ),
      _StatCard(
        value: dashboard.totalRevenue.toStringAsFixed(0),
        unit: r'$',
        label: 'Revenus',
        iconBg: AppColors.blueLight,
        iconFg: AppColors.blue,
        icon: Icons.payments_outlined,
      ),
    ];
  }

  List<_StatCard> _buildEmptyStats() {
    return [
      _StatCard(
          value: '-',
          unit: '',
          label: 'Trajets',
          iconBg: AppColors.blueLight,
          iconFg: AppColors.blue,
          icon: Icons.directions_car_outlined),
      _StatCard(
          value: '-',
          unit: '',
          label: 'Note',
          iconBg: AppColors.amberLight,
          iconFg: AppColors.amberMid,
          icon: Icons.star_outline),
      _StatCard(
          value: '-',
          unit: '',
          label: 'Passagers',
          iconBg: AppColors.tealLight,
          iconFg: AppColors.teal,
          icon: Icons.people_alt_outlined),
      _StatCard(
          value: '-',
          unit: r'$',
          label: 'Revenus',
          iconBg: AppColors.blueLight,
          iconFg: AppColors.blue,
          icon: Icons.payments_outlined),
    ];
  }

  List<_RequestCard> _extractRequests(List<dynamic> raw) {
    final bool isDriver = AppStateStore.instance.isDriver;
    return raw.take(3).map((dynamic row) {
      final Map<String, dynamic> m =
          row is Map<String, dynamic> ? row : <String, dynamic>{};
      final Map<String, dynamic> reservation =
          m['reservation'] is Map<String, dynamic>
              ? m['reservation'] as Map<String, dynamic>
              : m;
      final Map<String, dynamic> trip = m['trip'] is Map<String, dynamic>
          ? m['trip'] as Map<String, dynamic>
          : <String, dynamic>{};
      final Map<String, dynamic> passenger =
          m['passenger'] is Map<String, dynamic>
              ? m['passenger'] as Map<String, dynamic>
              : <String, dynamic>{};
      final Map<String, dynamic> driver = m['driver'] is Map<String, dynamic>
          ? m['driver'] as Map<String, dynamic>
          : <String, dynamic>{};

      final String first = isDriver
          ? '${m['passengerFirstName'] ?? passenger['firstName'] ?? m['firstName'] ?? ''}'
              .trim()
          : '${driver['firstName'] ?? m['driverFirstName'] ?? ''}'.trim();
      final String last = isDriver
          ? '${m['passengerLastName'] ?? passenger['lastName'] ?? m['lastName'] ?? ''}'
              .trim()
          : '${driver['lastName'] ?? m['driverLastName'] ?? ''}'.trim();
      final String fallbackName = isDriver ? 'Passager' : 'Conducteur';
      final String name = ('$first $last').trim().isEmpty
          ? fallbackName
          : ('$first $last').trim();
      final String initials = name
          .split(' ')
          .where((String e) => e.isNotEmpty)
          .take(2)
          .map((String e) => e[0].toUpperCase())
          .join();
      final String from = trip['departureLabel']?.toString() ?? '-';
      final String to = trip['arrivalLabel']?.toString() ?? '-';
      final String status = reservation['status']?.toString() ??
          m['status']?.toString() ??
          'pending';

      return _RequestCard(
        initials: initials.isEmpty ? 'P' : initials,
        avatarBg: const Color(0xFFFDECEA),
        avatarFg: AppColors.redMid,
        name: name,
        action: isDriver
            ? 'veut rejoindre votre trajet - $from -> $to'
            : 'Reservation $status - $from -> $to',
        timeLabel: _shortDate(trip['departureTime']?.toString() ?? ''),
        typeLabel: isDriver ? 'Nouvelle demande' : 'Mes reservations',
        typeBg: isDriver ? AppColors.blueLight : AppColors.tealLight,
        typeFg: isDriver ? AppColors.blue : AppColors.teal,
        routeFrom: from,
        routeTo: to,
        tripId: trip['id']?.toString() ?? reservation['tripId']?.toString(),
        hasAccept: isDriver,
        isDriverRequest: isDriver,
        reservationId: reservation['id']?.toString() ?? m['id']?.toString(),
      );
    }).toList();
  }

  _ActiveTripSnapshot? _extractActiveTrip(dynamic tripsPayload) {
    final List<Map<String, dynamic>> rows =
        DisplayConverters.extractMapList(tripsPayload);
    if (rows.isEmpty) return null;

    Map<String, dynamic>? row;
    for (final Map<String, dynamic> item in rows) {
      final String status = _tripStatus(item);
      if (status.contains('in_progress') ||
          status.contains('in progress') ||
          status.contains('imminent')) {
        row = item;
        break;
      }
    }
    row ??= rows.first;
    if (row == null) return null;

    final String status = _tripStatus(row);
    final bool isInProgress =
        status.contains('in_progress') || status.contains('in progress');
    final bool isImminent = status.contains('imminent');
    final String tripId = row['id']?.toString() ?? '';
    final int totalSeats =
        _toInt(row['totalSeats'] ?? row['seats'], fallback: 4);
    final int availableSeats = _toInt(row['availableSeats'], fallback: 0);
    final int currentPassengers =
        ((totalSeats - availableSeats).clamp(0, totalSeats)) as int;
    final double price = _toDouble(
      row['pricePerPassenger'] ?? row['passengerPrice'] ?? row['price'],
      fallback: 0,
    );
    final int durationMin = _toInt(
        row['estimatedDurationMin'] ?? row['estimatedDurationMinutes'],
        fallback: 7);

    return _ActiveTripSnapshot(
      tripId: tripId,
      timeLabel: _timeLabel(row['departureTime']),
      fromLabel: row['departureLabel']?.toString() ?? 'Depart',
      toLabel: row['arrivalLabel']?.toString() ?? 'Destination',
      statusLabel:
          isInProgress ? 'En cours' : (isImminent ? 'Imminent' : 'Planifie'),
      statusBg: isInProgress ? AppColors.redLight : AppColors.amberLight,
      statusFg: isInProgress ? AppColors.redMid : AppColors.amberMid,
      priceLabel: '${price.toStringAsFixed(price % 1 == 0 ? 0 : 2)} CAD',
      passengerLabel: '$currentPassengers/$totalSeats passagers',
      progress: isInProgress ? 0.38 : (isImminent ? 0.1 : 0.0),
      etaLabel: '$durationMin min',
      canOpenLiveTrip: (isInProgress || isImminent) && tripId.isNotEmpty,
    );
  }

  String _tripStatus(Map<String, dynamic> row) {
    final dynamic status = row['tripStatus'] ?? row['status'];
    if (status is Map<String, dynamic>) {
      return status['tripStatus']?.toString().toLowerCase() ?? '';
    }
    return status?.toString().toLowerCase() ?? '';
  }

  String _timeLabel(dynamic raw) {
    final DateTime? dt = _parseDate(raw);
    if (dt == null) return '--:--';
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  int _toInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  double _toDouble(dynamic value, {double fallback = 0}) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? fallback;
  }

  String _shortDate(String raw) {
    final DateTime? dt = _parseDate(raw);
    if (dt == null) return '';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}';
  }

  DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    try {
      return DateTime.parse(v.toString()).toLocal();
    } catch (_) {
      return null;
    }
  }

  Future<void> _openSearch() async {
    final String query = _searchCtrl.text.trim();
    final bool isDriver = AppStateStore.instance.isDriver;
    if (query.isEmpty) {
      context.push(
        '/search',
        extra: <String, dynamic>{
          'from': '',
          'to': '',
          'isDriver': isDriver,
        },
      );
      return;
    }

    final bool hasPosition =
        _currentPosition != null || await _ensureCurrentPositionForSearch();
    if (!hasPosition || !mounted || _currentPosition == null) return;

    OrsPlaceSuggestion? destination = _selectedSuggestion;
    if (destination == null || destination.label.trim() != query) {
      destination = await OrsRouteService.instance.geocodeFirst(query);
    }

    if (!mounted) return;
    if (destination == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Destination introuvable.')),
      );
      return;
    }

    _selectedSuggestion = destination;
    final Position position = _currentPosition!;
    final String fromLabel = _buildCurrentPositionLabel(position);
    FocusScope.of(context).unfocus();
    await context.push(
      '/search',
      extra: <String, dynamic>{
        'from': fromLabel,
        'fromLat': position.latitude,
        'fromLng': position.longitude,
        'to': destination.label,
        'toLat': destination.lat,
        'toLng': destination.lng,
        'autoSearch': true,
        'isDriver': isDriver,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.grayBg,
      child: _isLoading
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Color(0xFF1A56CC)),
                  SizedBox(height: 10),
                  Text(
                    'Chargement...',
                    style: TextStyle(
                      color: Color(0xFF6B7280),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            )
          : _hasError
              ? _buildErrorState()
              : _buildContent(),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded,
                size: 48, color: Color(0xFF8A95A8)),
            const SizedBox(height: 16),
            Text(
              'Impossible de charger le tableau de bord',
              style: AppTextStyles.soraSubtitle(),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Verifiez votre connexion et reessayez.',
              style: AppTextStyles.body(size: 13, color: AppColors.text3),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _loadDashboard,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Reessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.blue,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    return CustomScrollView(
      controller: _scrollCtrl,
      slivers: <Widget>[
        if (!_isSearchFocused) SliverToBoxAdapter(child: _buildHeroSection()),
        SliverPersistentHeader(
          pinned: true,
          delegate: _SearchBarDelegate(
            favPills: _favPills,
            controller: _searchCtrl,
            onFocusChanged: (bool focused) {
              if (!mounted) return;
              setState(() => _isSearchFocused = focused);
              if (focused) {
                _queueSuggestions(_searchCtrl.text);
              } else {
                _suggestionDebounce?.cancel();
                setState(() {
                  _isLoadingSuggestions = false;
                  _searchSuggestions = const <OrsPlaceSuggestion>[];
                });
              }
            },
            onChanged: (_) => _queueSuggestions(_searchCtrl.text),
            onSearchTap: _openSearch,
          ),
        ),
        if (_isSearchFocused)
          SliverFillRemaining(
            hasScrollBody: true,
            child: _HomeSuggestionPanel(
              query: _searchCtrl.text.trim(),
              minChars: _minSuggestionChars,
              isLoading: _isLoadingSuggestions,
              suggestions: _searchSuggestions,
              onSelect: (OrsPlaceSuggestion suggestion) {
                _selectedSuggestion = suggestion;
                _searchCtrl.text = suggestion.label;
                unawaited(_openSearch());
              },
            ),
          )
        else ...<Widget>[
          const SliverToBoxAdapter(child: SectionLabel('Trajet en cours')),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _ActiveTripCard(
                trip: _activeTrip,
                onTap: () {
                  if (_activeTrip == null || !_activeTrip!.canOpenLiveTrip)
                    return;
                  context.push('/trajet-en-cours/${_activeTrip!.tripId}');
                },
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SectionLabel('Mes statistiques')),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _StatsGrid(stats: _stats),
            ),
          ),
          const SliverToBoxAdapter(child: SectionLabel('Nouvelles demandes')),
          SliverToBoxAdapter(child: _RequestsScroll(requests: _requests)),
          const SliverToBoxAdapter(
              child: SectionLabel('Plus de fonctionnalites')),
          SliverToBoxAdapter(child: _QuickNavGrid()),
        ],
      ],
    );
  }

  Widget _buildHeroSection() {
    final double screenHeight = MediaQuery.of(context).size.height;
    final double heroHeight = (screenHeight * 0.60).clamp(280.0, 560.0);
    return SizedBox(
      height: heroHeight,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background — utilise un Container coloré comme fallback sûr
          _buildHeroBackground(),
          // Gradient overlay
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.4, 1.0],
                colors: [Colors.transparent, Color(0xFFF2F5FA)],
              ),
            ),
          ),
          // Greeting text
          Positioned(
            top: 20,
            left: 20,
            right: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                RichText(
                  textAlign: TextAlign.end,
                  text: TextSpan(
                    style: const TextStyle(
                      fontFamily: 'OpenSans',
                      fontSize: 20,
                      color: Color(0xFF0D1624),
                    ),
                    children: [
                      const TextSpan(text: 'Bienvenue, '),
                      TextSpan(
                        text: (_firstName?.isNotEmpty == true)
                            ? _firstName!
                            : 'Conducteur',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF08316E),
                        ),
                      ),
                      const TextSpan(text: ' !'),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Content de vous voir,',
                  textAlign: TextAlign.end,
                  style: TextStyle(fontSize: 16, color: Color(0xFF515151)),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Ou allons-nous aujourd\'hui ?',
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF08316E),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroBackground() {
    return SizedBox.expand(
      child: Image.asset(
        'assets/images/homepagebackground.png',
        fit: BoxFit.cover,
        alignment: Alignment.topCenter,
        errorBuilder: (_, __, ___) {
          return Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFE8F0FE), Color(0xFFDDE8F8)],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SEARCH BAR DELEGATE
// ══════════════════════════════════════════════════════════════════════════════

class _HomeSuggestionPanel extends StatelessWidget {
  const _HomeSuggestionPanel({
    required this.query,
    required this.minChars,
    required this.isLoading,
    required this.suggestions,
    required this.onSelect,
  });

  final String query;
  final int minChars;
  final bool isLoading;
  final List<OrsPlaceSuggestion> suggestions;
  final ValueChanged<OrsPlaceSuggestion> onSelect;

  @override
  Widget build(BuildContext context) {
    if (query.length < minChars) {
      return Center(
        child: Text(
          'Saisissez au moins $minChars lettres pour voir les suggestions.',
          style: const TextStyle(color: Color(0xFF7A879A), fontSize: 13),
          textAlign: TextAlign.center,
        ),
      );
    }

    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF1A56CC)),
      );
    }

    if (suggestions.isEmpty) {
      return const Center(
        child: Text(
          'Aucune suggestion trouvee.',
          style: TextStyle(color: Color(0xFF7A879A), fontSize: 13),
          textAlign: TextAlign.center,
        ),
      );
    }

    return Container(
      color: Colors.white,
      child: ListView.separated(
        itemCount: suggestions.length,
        separatorBuilder: (_, __) =>
            const Divider(height: 1, color: Color(0x12000000)),
        itemBuilder: (_, int i) {
          final OrsPlaceSuggestion suggestion = suggestions[i];
          return ListTile(
            onTap: () => onSelect(suggestion),
            leading: const Icon(Icons.place_outlined, color: Color(0xFF1A56CC)),
            title: Text(
              suggestion.label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              '${suggestion.lat.toStringAsFixed(5)}, ${suggestion.lng.toStringAsFixed(5)}',
              style: const TextStyle(color: Color(0xFF7A879A), fontSize: 12),
            ),
          );
        },
      ),
    );
  }
}

class _SearchBarDelegate extends SliverPersistentHeaderDelegate {
  final List<_FavPill> favPills;
  final TextEditingController controller;
  final ValueChanged<bool> onFocusChanged;
  final ValueChanged<String>? onChanged;
  final VoidCallback onSearchTap;

  const _SearchBarDelegate({
    required this.favPills,
    required this.controller,
    required this.onFocusChanged,
    this.onChanged,
    required this.onSearchTap,
  });

  @override
  double get minExtent => 76;
  @override
  double get maxExtent => 76;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      // color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: const Border(bottom: BorderSide(color: AppColors.border)),
        boxShadow: overlapsContent
            ? [
                BoxShadow(
                    color: Colors.black.withOpacity(.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2))
              ]
            : null,
      ),
      child: Focus(
        onFocusChange: onFocusChanged,
        child: Container(
          height: 50,
          decoration: BoxDecoration(
            color: AppColors.gray50,
            borderRadius: BorderRadius.circular(AppColors.rFull),
            border: Border.all(color: AppColors.gray200, width: 1.5),
          ),
          child: Row(
            children: [
              const SizedBox(width: 16),
              GestureDetector(
                onTap: onSearchTap,
                child:
                    const Icon(Icons.search, size: 18, color: AppColors.text3),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: controller,
                  onChanged: onChanged,
                  onSubmitted: (_) => onSearchTap(),
                  style: AppTextStyles.searchText(),
                  decoration: InputDecoration(
                    hintText: 'Rechercher une destination...',
                    hintStyle: AppTextStyles.searchPlaceholder(),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              // Favoris pills
              if (favPills.isNotEmpty)
                SizedBox(
                  height: 50,
                  width: 156,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 9),
                    itemCount: favPills.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 6),
                    itemBuilder: (_, i) {
                      final pill = favPills[i];
                      return GestureDetector(
                        onTap: () {
                          controller.text = pill.label;
                          onSearchTap();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: pill.bg,
                            borderRadius:
                                BorderRadius.circular(AppColors.rFull),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(pill.icon, size: 13, color: pill.fg),
                              const SizedBox(width: 4),
                              Text(
                                pill.label,
                                style: AppTextStyles.soraBadge(color: pill.fg)
                                    .copyWith(fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _SearchBarDelegate oldDelegate) => false;
}

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVE TRIP CARD
// ══════════════════════════════════════════════════════════════════════════════

class _ActiveTripCard extends StatelessWidget {
  const _ActiveTripCard({
    required this.trip,
    required this.onTap,
  });

  final _ActiveTripSnapshot? trip;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final _ActiveTripSnapshot fallback = _ActiveTripSnapshot(
      tripId: '',
      timeLabel: '07:40',
      fromLabel: 'Campus La Cite',
      toLabel: 'Place d\'Orleans',
      statusLabel: 'En cours',
      statusBg: AppColors.redLight,
      statusFg: AppColors.redMid,
      priceLabel: '5 CAD',
      passengerLabel: '2/3 passagers',
      progress: .38,
      etaLabel: '7 min',
      canOpenLiveTrip: false,
    );
    final _ActiveTripSnapshot model = trip ?? fallback;

    return GestureDetector(
      onTap: model.canOpenLiveTrip ? onTap : null,
      child: AppCard(
        shadows: AppColors.shMd,
        radius: AppColors.rLg,
        padding: EdgeInsets.zero,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppColors.blueLight, Color(0xFFC8D9F8)],
                      ),
                      borderRadius: BorderRadius.circular(AppColors.rMd),
                    ),
                    child: const Icon(Icons.location_city,
                        size: 36, color: AppColors.blue),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(model.timeLabel,
                            style: AppTextStyles.soraSubtitle()),
                        const SizedBox(height: 3),
                        RouteMiniRow(from: model.fromLabel, to: model.toLabel),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.blueLight,
                            borderRadius:
                                BorderRadius.circular(AppColors.rFull),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.person,
                                  size: 11, color: AppColors.blue),
                              const SizedBox(width: 4),
                              Text(
                                model.passengerLabel,
                                style: AppTextStyles.soraBadge()
                                    .copyWith(fontSize: 11.5),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      StatusPill(
                        label: model.statusLabel,
                        bg: model.statusBg,
                        fg: model.statusFg,
                      ),
                      const SizedBox(height: 6),
                      Text(model.priceLabel,
                          style: AppTextStyles.soraSubtitle(
                              color: AppColors.blue)),
                    ],
                  ),
                ],
              ),
            ),
            const AppDivider(),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 9, 14, 12),
              child: Row(
                children: [
                  _PulsingDot(color: model.statusFg),
                  const SizedBox(width: 6),
                  Text(
                    model.statusLabel,
                    style: AppTextStyles.soraSemibold(
                        size: 12, color: model.statusFg),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        value: model.progress,
                        backgroundColor: AppColors.gray200,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(model.statusFg),
                        minHeight: 6,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(model.etaLabel,
                      style: AppTextStyles.soraSubtitle(color: AppColors.blue)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  final Color color;
  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1500))
      ..repeat(reverse: true);
    _anim = Tween<double>(begin: 1.0, end: .5).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Opacity(
        opacity: _anim.value,
        child: Container(
          width: 8,
          height: 8,
          decoration:
              BoxDecoration(color: widget.color, shape: BoxShape.circle),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// STATS GRID
// ══════════════════════════════════════════════════════════════════════════════

class _StatsGrid extends StatelessWidget {
  final List<_StatCard> stats;
  const _StatsGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    if (stats.isEmpty) return const SizedBox.shrink();
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.6,
      children: stats.map(_buildCard).toList(),
    );
  }

  Widget _buildCard(_StatCard s) {
    return AppCard(
      shadows: AppColors.shSm,
      radius: AppColors.rLg,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: s.iconBg,
              borderRadius: BorderRadius.circular(AppColors.rMd),
            ),
            child: Icon(s.icon, size: 24, color: s.iconFg),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(s.value, style: AppTextStyles.soraNumber()),
                    if (s.unit.isNotEmpty) ...[
                      const SizedBox(width: 2),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(s.unit, style: AppTextStyles.caption()),
                      ),
                    ],
                  ],
                ),
                Text(s.label,
                    style: AppTextStyles.caption(),
                    overflow: TextOverflow.ellipsis),
                if (s.badge != null)
                  Container(
                    margin: const EdgeInsets.only(top: 3),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.greenLight,
                      borderRadius: BorderRadius.circular(AppColors.rFull),
                    ),
                    child: Text(
                      s.badge!,
                      style: AppTextStyles.soraBadge(color: AppColors.green)
                          .copyWith(fontSize: 10),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// REQUESTS SCROLL — CORRIGÉ (hauteur fixe + guard empty)
// ══════════════════════════════════════════════════════════════════════════════

class _RequestsScroll extends StatelessWidget {
  final List<_RequestCard> requests;
  const _RequestsScroll({required this.requests});

  @override
  Widget build(BuildContext context) {
    if (requests.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(AppColors.rLg),
            border: Border.all(color: AppColors.border),
          ),
          alignment: Alignment.center,
          child: Text(
            'Aucune demande en attente',
            style: AppTextStyles.body(size: 13, color: AppColors.text3),
          ),
        ),
      );
    }

    return SizedBox(
      height: 168,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: requests.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) => _RequestCardWidget(card: requests[i]),
      ),
    );
  }
}

class _RequestCardWidget extends StatelessWidget {
  final _RequestCard card;
  static final _tripService = TripService(ApiService.instance);
  const _RequestCardWidget({required this.card});

  Future<void> _handleAccept(BuildContext context) async {
    final String? id = card.reservationId;
    if (id == null || id.isEmpty) return;
    try {
      await _tripService.acceptReservation(id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Demande acceptee')),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de l\'acceptation')),
        );
      }
    }
  }

  Future<void> _handleRefuse(BuildContext context) async {
    final String? id = card.reservationId;
    if (id == null || id.isEmpty) return;
    try {
      await _tripService.refuseReservation(id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Demande refusee')),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors du refus')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        final String? id = card.reservationId;
        final String? tripId = card.tripId;
        if (card.isDriverRequest && id != null && id.isNotEmpty) {
          context.push('/reservation-request/$id');
          return;
        }
        if (tripId != null && tripId.isNotEmpty) {
          context.push('/trip/$tripId');
        }
      },
      child: AppCard(
        shadows: AppColors.shSm,
        radius: AppColors.rLg,
        padding: EdgeInsets.zero,
        child: SizedBox(
          width: 300,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AvatarInitials(
                      initials: card.initials,
                      bg: card.avatarBg,
                      fg: card.avatarFg,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  card.name,
                                  style: AppTextStyles.soraSubtitle(),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(card.timeLabel,
                                  style: AppTextStyles.caption()),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            card.action,
                            style: AppTextStyles.body(size: 12.5),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          StatusPill(
                              label: card.typeLabel,
                              bg: card.typeBg,
                              fg: card.typeFg),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const AppDivider(),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
                child: Row(
                  children: [
                    Expanded(
                      child:
                          RouteMiniRow(from: card.routeFrom, to: card.routeTo),
                    ),
                    const SizedBox(width: 8),
                    if (card.hasAccept) ...[
                      GestureDetector(
                        onTap: () => _handleRefuse(context),
                        child: _smallBtn(
                            'Refuser', AppColors.gray100, AppColors.gray600),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () => _handleAccept(context),
                        child: _smallBtn(
                            'Accepter', AppColors.blue, AppColors.surface),
                      ),
                    ] else
                      _smallBtn('Voir', AppColors.blueLight, AppColors.blue),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _smallBtn(String label, Color bg, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(AppColors.rSm),
        ),
        child: Text(label,
            style: AppTextStyles.button(color: fg).copyWith(fontSize: 12)),
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUICK NAV GRID
// ══════════════════════════════════════════════════════════════════════════════

class _QuickNavItem {
  final String label;
  final IconData icon;
  final Color bg;
  final Color fg;
  final String route;
  const _QuickNavItem({
    required this.label,
    required this.icon,
    required this.bg,
    required this.fg,
    required this.route,
  });
}

class _QuickNavGrid extends StatelessWidget {
  static final List<_QuickNavItem> _items = [
    _QuickNavItem(
        label: 'Mes favoris',
        icon: Icons.favorite_outline,
        bg: AppColors.blueLight,
        fg: AppColors.blue,
        route: '/favoris'),
    _QuickNavItem(
        label: 'Planificateur',
        icon: Icons.calendar_today_outlined,
        bg: AppColors.tealLight,
        fg: AppColors.teal,
        route: '/search'),
    _QuickNavItem(
        label: 'Statistiques',
        icon: Icons.bar_chart_outlined,
        bg: AppColors.amberLight,
        fg: AppColors.amber,
        route: '/stats'),
    _QuickNavItem(
        label: 'Reservation',
        icon: Icons.event_outlined,
        bg: AppColors.tealLight,
        fg: AppColors.teal,
        route: '/reservations'),
    _QuickNavItem(
        label: 'Profil',
        icon: Icons.person_outline,
        bg: AppColors.amberLight,
        fg: AppColors.amber,
        route: '/profile'),
    _QuickNavItem(
        label: 'Avis',
        icon: Icons.star_outline,
        bg: AppColors.blueLight,
        fg: AppColors.blue,
        route: '/reviews'),
  ];

  @override
  Widget build(BuildContext context) {
    final double totalWidth =
        MediaQuery.of(context).size.width - 16 * 2 - 12 * 2;
    final double itemWidth = totalWidth / 3;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 12,
        runSpacing: 14,
        children: _items
            .map((item) =>
                SizedBox(width: itemWidth, child: _buildItem(context, item)))
            .toList(),
      ),
    );
  }

  Widget _buildItem(BuildContext context, _QuickNavItem item) {
    return GestureDetector(
      onTap: () => context.push(item.route),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
                color: item.bg, borderRadius: BorderRadius.circular(18)),
            child: Icon(item.icon, size: 28, color: item.fg),
          ),
          const SizedBox(height: 6),
          Text(
            item.label,
            style: AppTextStyles.body(size: 12, color: AppColors.text2),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MES OPTIONS SECTION
// ══════════════════════════════════════════════════════════════════════════════

class _MesOptionsSection extends StatelessWidget {
  const _MesOptionsSection();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0F000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min, // 🔥 FIX CRITIQUE
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 14, 16, 4),
              child: Text(
                'Mes options',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: Color(0xFF0D1624),
                ),
              ),
            ),
            _tile(context, Icons.history_rounded, 'Historique', '/historique'),
            _tile(context, Icons.description_outlined, 'Brouillons',
                '/brouillons'),
            _tile(context, Icons.bar_chart_rounded, 'Statistiques', '/stats'),
            _tile(context, Icons.reviews_outlined, 'Avis', '/reviews'),
            _tile(context, Icons.favorite_outline, 'Favoris', '/favoris'),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _tile(
      BuildContext context, IconData icon, String label, String route) {
    return ListTile(
      onTap: () => context.push(route),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
      leading: Icon(icon, color: const Color(0xFF1A56CC)),
      title: Text(
        label,
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 14,
          color: Color(0xFF0D1624),
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: Color(0xFF8A95A8),
      ),
      dense: true,
      visualDensity: VisualDensity.compact, // 🔧 stabilise le layout
    );
  }
}
// class _MesOptionsSection extends StatelessWidget {
//   const _MesOptionsSection();

//   @override
//   Widget build(BuildContext context) {
//     return Padding(
//       padding: const EdgeInsets.symmetric(horizontal: 16),
//       child: Container(
//         decoration: BoxDecoration(
//           color: Colors.white,
//           borderRadius: BorderRadius.circular(16),
//           boxShadow: const [
//             BoxShadow(color: Color(0x0F000000), blurRadius: 8, offset: Offset(0, 2)),
//           ],
//         ),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             const Padding(
//               padding: EdgeInsets.fromLTRB(16, 14, 16, 4),
//               child: Text(
//                 'Mes options',
//                 style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFF0D1624)),
//               ),
//             ),
//             _tile(context, Icons.history_rounded, 'Historique', '/historique'),
//             _tile(context, Icons.description_outlined, 'Brouillons', '/brouillons'),
//             _tile(context, Icons.bar_chart_rounded, 'Statistiques', '/stats'),
//             _tile(context, Icons.reviews_outlined, 'Avis', '/reviews'),
//             _tile(context, Icons.favorite_outline, 'Favoris', '/favoris'),
//             const SizedBox(height: 8),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _tile(BuildContext context, IconData icon, String label, String route) {
//     return ListTile(
//       onTap: () => context.push(route),
//       contentPadding: const EdgeInsets.symmetric(horizontal: 16),
//       leading: Icon(icon, color: const Color(0xFF1A56CC)),
//       title: Text(
//         label,
//         style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF0D1624)),
//       ),
//       trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF8A95A8)),
//       dense: true,
//     );
//   }
// }
