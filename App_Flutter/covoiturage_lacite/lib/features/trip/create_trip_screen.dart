// ============================================================
// lib/features/trip/create_trip_screen.dart
// Formulaire de création de trajet — Version Mobile Flutter
// RECONSTRUIT — coordonnées lat/lng branchées via OrsRouteService
// Conforme à CreateTrajetDto (.NET) : VehicleId, DepartureLat/Lng,
// ArrivalLat/Lng, DepartureDate (DateOnly), DepartureTime (TimeOnly)
// ============================================================

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/services/api_service.dart';
import '../../core/services/ors_route_service.dart';
import 'trip_view_converter.dart';

// ─────────────────────────────────────────────────────────────
// MODÈLES LOCAUX
// ─────────────────────────────────────────────────────────────

class _PlaceSelection {
  final String label;
  final String address;
  final double lat;
  final double lng;

  const _PlaceSelection({
    required this.label,
    required this.address,
    required this.lat,
    required this.lng,
  });
}

class _TripPreferences {
  bool baggageAllowed;
  bool petsAllowed;
  bool smokingAllowed;
  bool musicAllowed;
  bool flexibleItinerary;

  _TripPreferences()
      : baggageAllowed = false,
        petsAllowed = false,
        smokingAllowed = false,
        musicAllowed = false,
        flexibleItinerary = false;
}

class _Vehicle {
  final String id;
  final String label;
  final String color;
  final int maxPassengers;

  const _Vehicle({
    required this.id,
    required this.label,
    required this.color,
    required this.maxPassengers,
  });

  factory _Vehicle.fromJson(Map<String, dynamic> j) => _Vehicle(
        id: j['id']?.toString() ?? '',
        label: _firstStr(j, ['label', 'model', 'make']) ?? 'Véhicule',
        color: j['color']?.toString() ?? '',
        maxPassengers: _toInt(j['maxPassengers'] ?? j['capacity'] ?? j['seats'],
            fallback: 4),
      );

  static String? _firstStr(Map<String, dynamic> m, List<String> keys) {
    for (final k in keys) {
      final v = m[k]?.toString().trim();
      if (v != null && v.isNotEmpty) return v;
    }
    return null;
  }

  static int _toInt(dynamic v, {int fallback = 0}) {
    if (v is int) return v;
    if (v is num) return v.toInt();
    return int.tryParse(v?.toString() ?? '') ?? fallback;
  }
}

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL
// ─────────────────────────────────────────────────────────────

class CreateTripScreen extends StatefulWidget {
  const CreateTripScreen({super.key, this.prefill});
  final Map<String, dynamic>? prefill;

  @override
  State<CreateTripScreen> createState() => _CreateTripScreenState();
}

class _CreateTripScreenState extends State<CreateTripScreen>
    with SingleTickerProviderStateMixin {
  final _api = ApiService.instance;
  final _ors = OrsRouteService.instance;
  late final TabController _tabCtrl;

  // ── Lieux sélectionnés (avec coordonnées) ────────────────
  _PlaceSelection? _departure;
  _PlaceSelection? _arrival;

  // ── Contrôleurs texte + autocomplete ────────────────────
  final _departureCtrl = TextEditingController();
  final _arrivalCtrl = TextEditingController();
  final _noteCtrl = TextEditingController();

  List<OrsPlaceSuggestion> _departureSuggestions = [];
  List<OrsPlaceSuggestion> _arrivalSuggestions = [];
  bool _showDepartureSuggestions = false;
  bool _showArrivalSuggestions = false;
  Timer? _debounce;

  // ── Horaire ──────────────────────────────────────────────
  DateTime _departureDate = DateTime.now().add(const Duration(hours: 2));
  TimeOfDay _departureTime =
      TimeOfDay.fromDateTime(DateTime.now().add(const Duration(hours: 2)));

  // ── Options trajet ───────────────────────────────────────
  String _tripType = 'unique';
  int _availableSeats = 1;
  int _maxPassengers = 4;
  double _pricePerPassenger = 5.0;
  String _paymentMethod = 'cash';
  String? _selectedVehicleId;
  List<_Vehicle> _vehicles = [];
  final _prefs = _TripPreferences();

  // ── Récurrence ───────────────────────────────────────────
  List<bool> _recurrenceDays = List.filled(7, false);
  DateTime? _recurrenceEndDate;

  // ── État UI ──────────────────────────────────────────────
  bool _isLoadingVehicles = true;
  bool _isSubmitting = false;
  bool _showNoteField = false;
  Map<String, String?> _errors = {};

  // ── Route calculée (ORS) ─────────────────────────────────
  int _estimatedDurationMinutes = 0;
  double _estimatedDistanceKm = 0;
  List<Map<String, double>> _routePoints = [];
  String? _polylineString;
  bool _isCalculatingRoute = false;

  // ── Toast ────────────────────────────────────────────────
  bool _showToast = false;
  bool _toastSuccess = false;
  String _toastMsg = '';

  static const _tabs = ['Infos', 'Véhicule', 'Préférences', 'Tarif'];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: _tabs.length, vsync: this);
    _applyPrefill();
    _loadVehicles();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _tabCtrl.dispose();
    _departureCtrl.dispose();
    _arrivalCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────────────────
  // PREFILL
  // ─────────────────────────────────────────────────────────
  void _applyPrefill() {
    final p = widget.prefill;
    if (p == null) return;

    final depLabel =
        _firstStr(p, ['departureLabel', 'from', 'departureLocation']) ?? '';
    final arrLabel =
        _firstStr(p, ['arrivalLabel', 'to', 'arrivalLocation']) ?? '';
    final depLat = _toNullableDouble(p['departureLat'] ?? p['fromLat']);
    final depLng = _toNullableDouble(p['departureLng'] ?? p['fromLng']);
    final arrLat = _toNullableDouble(p['arrivalLat'] ?? p['toLat']);
    final arrLng = _toNullableDouble(p['arrivalLng'] ?? p['toLng']);

    if (depLabel.isNotEmpty) {
      _departureCtrl.text = depLabel;
      if (depLat != null && depLng != null) {
        _departure = _PlaceSelection(
          label: depLabel,
          address: depLabel,
          lat: depLat,
          lng: depLng,
        );
      }
    }
    if (arrLabel.isNotEmpty) {
      _arrivalCtrl.text = arrLabel;
      if (arrLat != null && arrLng != null) {
        _arrival = _PlaceSelection(
          label: arrLabel,
          address: arrLabel,
          lat: arrLat,
          lng: arrLng,
        );
      }
    }

    final price = p['pricePerSeat'] ?? p['pricePerPassenger'] ?? p['price'];
    if (price != null) _pricePerPassenger = _toDouble(price, fallback: 5.0);

    final seats = p['availableSeats'] ?? p['seats'];
    if (seats != null) _availableSeats = _toInt(seats, fallback: 1).clamp(1, 7);

    final dt = p['departureTime'] ?? p['departureDateTime'];
    if (dt != null) {
      final parsed = DateTime.tryParse(dt.toString())?.toLocal();
      if (parsed != null) {
        _departureDate = parsed;
        _departureTime = TimeOfDay.fromDateTime(parsed);
      }
    }

    // Données géo calculées depuis le circuit sélectionné
    final prefillDistance = _toNullableDouble(p['estimatedDistanceKm']);
    if (prefillDistance != null && prefillDistance > 0) {
      _estimatedDistanceKm = prefillDistance;
    }

    final prefillDuration = _toNullableDouble(p['estimatedDurationMinutes']);
    if (prefillDuration != null && prefillDuration > 0) {
      _estimatedDurationMinutes = prefillDuration.round();
    }

    // Polyline / waypoints
    final dynamic pl = p['polyline'];
    if (pl is String && pl.isNotEmpty) {
      _polylineString = pl;
    }

    final dynamic wp = p['waypoints'] ?? p['polyline'];
    if (wp is List && wp.isNotEmpty) {
      _routePoints = wp
          .whereType<Map<String, dynamic>>()
          .map((p) => <String, double>{
                'lat': (p['lat'] as num?)?.toDouble() ?? 0.0,
                'lng': (p['lng'] as num?)?.toDouble() ?? 0.0,
              })
          .where((p) => p['lat'] != 0 || p['lng'] != 0)
          .toList();
    }
  }

  // ─────────────────────────────────────────────────────────
  // CHARGEMENT VÉHICULES
  // ─────────────────────────────────────────────────────────
  Future<void> _loadVehicles() async {
    setState(() => _isLoadingVehicles = true);
    try {
      final data = await _api.get('/api/vehicles');
      final list = _extractList(data);
      final vehicles = list
          .whereType<Map<String, dynamic>>()
          .map(_Vehicle.fromJson)
          .where((v) => v.id.isNotEmpty)
          .toList();
      if (!mounted) return;
      setState(() {
        _vehicles = vehicles;
        if (vehicles.length == 1) {
          _selectedVehicleId = vehicles.first.id;
          _maxPassengers = vehicles.first.maxPassengers;
          _availableSeats =
              _availableSeats.clamp(1, (_maxPassengers - 1).clamp(1, 7));
        }
        _isLoadingVehicles = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoadingVehicles = false);
    }
  }

  // ─────────────────────────────────────────────────────────
  // AUTOCOMPLÉTION LIEUX
  // ─────────────────────────────────────────────────────────
  void _onDepartureChanged(String value) {
    _debounce?.cancel();
    if (value.trim().length < 3) {
      setState(() {
        _departureSuggestions = [];
        _showDepartureSuggestions = false;
        // Si l'utilisateur efface, on réinitialise la sélection
        if (_departure != null && value != _departure!.label) {
          _departure = null;
        }
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 350), () async {
      try {
        final suggestions = await _ors.suggestPlaces(value, limit: 5);
        if (!mounted) return;
        setState(() {
          _departureSuggestions = suggestions;
          _showDepartureSuggestions = suggestions.isNotEmpty;
        });
      } catch (_) {}
    });
  }

  void _onArrivalChanged(String value) {
    _debounce?.cancel();
    if (value.trim().length < 3) {
      setState(() {
        _arrivalSuggestions = [];
        _showArrivalSuggestions = false;
        if (_arrival != null && value != _arrival!.label) {
          _arrival = null;
        }
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 350), () async {
      try {
        final suggestions = await _ors.suggestPlaces(value, limit: 5);
        if (!mounted) return;
        setState(() {
          _arrivalSuggestions = suggestions;
          _showArrivalSuggestions = suggestions.isNotEmpty;
        });
      } catch (_) {}
    });
  }

  void _selectDeparture(OrsPlaceSuggestion s) {
    setState(() {
      _departure = _PlaceSelection(
        label: s.label,
        address: s.label,
        lat: s.lat,
        lng: s.lng,
      );
      _departureCtrl.text = s.label;
      _departureSuggestions = [];
      _showDepartureSuggestions = false;
      _errors.remove('departure');
    });
    _maybeCalculateRoute();
  }

  void _selectArrival(OrsPlaceSuggestion s) {
    setState(() {
      _arrival = _PlaceSelection(
        label: s.label,
        address: s.label,
        lat: s.lat,
        lng: s.lng,
      );
      _arrivalCtrl.text = s.label;
      _arrivalSuggestions = [];
      _showArrivalSuggestions = false;
      _errors.remove('arrival');
    });
    _maybeCalculateRoute();
  }

  Future<void> _maybeCalculateRoute() async {
    final dep = _departure;
    final arr = _arrival;
    if (dep == null || arr == null) return;

    // Si la route est déjà pré-remplie (circuit), ne pas recalculer
    if (_routePoints.isNotEmpty &&
        _estimatedDistanceKm > 0 &&
        _estimatedDurationMinutes > 0) {
      return;
    }

    setState(() => _isCalculatingRoute = true);
    try {
      final points = await _ors.routeBetweenCoords(
        fromLat: dep.lat,
        fromLng: dep.lng,
        toLat: arr.lat,
        toLng: arr.lng,
      );
      if (!mounted) return;
      // Calculer distance approximative depuis les points
      double distKm = 0;
      for (int i = 1; i < points.length; i++) {
        final lat1 = (points[i - 1]['lat'] ?? 0.0) as double;
        final lng1 = (points[i - 1]['lng'] ?? 0.0) as double;
        final lat2 = (points[i]['lat'] ?? 0.0) as double;
        final lng2 = (points[i]['lng'] ?? 0.0) as double;
        distKm += _haversine(lat1, lng1, lat2, lng2);
      }
      final durationMin = (distKm * 1.5).round().clamp(5, 300);
      setState(() {
        _routePoints = points
            .map((p) => {
                  'lat': (p['lat'] ?? 0.0) as double,
                  'lng': (p['lng'] ?? 0.0) as double,
                })
            .toList();
        _estimatedDistanceKm = distKm;
        _estimatedDurationMinutes = durationMin;
        _isCalculatingRoute = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isCalculatingRoute = false);
    }
  }

  double _haversine(double lat1, double lng1, double lat2, double lng2) {
    const r = 6371.0;
    final dLat = _deg2rad(lat2 - lat1);
    final dLng = _deg2rad(lng2 - lng1);
    final a = _sin(dLat / 2) * _sin(dLat / 2) +
        _cos(_deg2rad(lat1)) *
            _cos(_deg2rad(lat2)) *
            _sin(dLng / 2) *
            _sin(dLng / 2);
    final c = 2 * _atan2(_sqrt(a), _sqrt(1 - a));
    return r * c;
  }

  double _deg2rad(double deg) => deg * 3.14159265358979 / 180;
  double _sin(double x) {
    // Approximation Taylor pour valeurs proches de 0
    return x - x * x * x / 6;
  }

  double _cos(double x) => 1 - x * x / 2;
  double _sqrt(double x) => x <= 0
      ? 0
      : x < 1
          ? x * (1 + (1 - x) / 2)
          : x;
  double _atan2(double y, double x) {
    if (x > 0) return _atan(y / x);
    if (x < 0 && y >= 0) return _atan(y / x) + 3.14159;
    if (x < 0 && y < 0) return _atan(y / x) - 3.14159;
    if (x == 0 && y > 0) return 3.14159 / 2;
    return -3.14159 / 2;
  }

  double _atan(double x) => x - x * x * x / 3 + x * x * x * x * x / 5;

  // ─────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────
  bool _validate() {
    final e = <String, String?>{};
    if (_departure == null) {
      e['departure'] = 'Sélectionnez un lieu de départ dans la liste';
    }
    if (_arrival == null) {
      e['arrival'] = 'Sélectionnez un lieu d\'arrivée dans la liste';
    }
    if (_selectedVehicleId == null && _vehicles.isNotEmpty) {
      e['vehicle'] = 'Sélectionnez un véhicule';
    }
    if (_vehicles.isEmpty) {
      e['vehicle'] =
          'Aucun véhicule enregistré. Ajoutez-en un dans votre profil.';
    }
    if (_pricePerPassenger < 1) {
      e['price'] = 'Prix minimum 1 \$';
    }
    if (_tripType == 'recurrent' && !_recurrenceDays.any((d) => d)) {
      e['recurrence'] = 'Sélectionnez au moins un jour de récurrence';
    }
    setState(() => _errors = e);
    return e.isEmpty;
  }

  // ─────────────────────────────────────────────────────────
  // SOUMISSION
  // ─────────────────────────────────────────────────────────
  Future<void> _submit(bool publish) async {
    if (!_validate()) {
      // Navigation vers l'onglet avec l'erreur
      if (_errors.containsKey('departure') || _errors.containsKey('arrival')) {
        _tabCtrl.animateTo(0);
      } else if (_errors.containsKey('vehicle')) {
        _tabCtrl.animateTo(1);
      } else if (_errors.containsKey('price')) {
        _tabCtrl.animateTo(3);
      }
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final dep = _departure!;
      final arr = _arrival!;
      final departureDt = DateTime(
        _departureDate.year,
        _departureDate.month,
        _departureDate.day,
        _departureTime.hour,
        _departureTime.minute,
      );

      String? recurrenceEndDateStr;
      if (_tripType == 'recurrent' && _recurrenceEndDate != null) {
        final d = _recurrenceEndDate!;
        recurrenceEndDateStr = '${d.year}-${_p(d.month)}-${_p(d.day)}';
      }

      // Récupérer les jours sélectionnés (indices 0-6)
      final List<int>? recurrenceDays = _tripType == 'recurrent'
          ? _recurrenceDays
              .asMap()
              .entries
              .where((e) => e.value)
              .map((e) => e.key)
              .toList()
          : null;

      final body = TripViewConverter.buildCreateTripBody(
        departureLabel: dep.label,
        departureAddress: dep.address,
        departureLat: dep.lat,
        departureLng: dep.lng,
        arrivalLabel: arr.label,
        arrivalAddress: arr.address,
        arrivalLat: arr.lat,
        arrivalLng: arr.lng,
        departureDt: departureDt,
        vehicleId: _selectedVehicleId!,
        maxPassengers: _maxPassengers,
        pricePerPassenger: _pricePerPassenger,
        paymentMethod: _paymentMethod,
        tripType: _tripType,
        baggageAllowed: _prefs.baggageAllowed,
        petsAllowed: _prefs.petsAllowed,
        smokingAllowed: _prefs.smokingAllowed,
        musicAllowed: _prefs.musicAllowed,
        flexibleItinerary: _prefs.flexibleItinerary,
        driverNote:
            _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
        estimatedDurationMinutes: _estimatedDurationMinutes,
        estimatedDistanceKm: _estimatedDistanceKm,
        polyline: _polylineString,
        recurrenceDays: recurrenceDays,
        recurrenceEndDate: recurrenceEndDateStr,
        publish: publish,
      );

      // Ajouter le statut
      body['status'] = publish ? 'published' : 'draft';

      await _api.post('/api/trips', body);
      if (!mounted) return;

      setState(() {
        _showToast = true;
        _toastSuccess = true;
        _toastMsg =
            publish ? 'Trajet publié avec succès !' : 'Brouillon sauvegardé.';
      });
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) context.pop();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _showToast = true;
        _toastSuccess = false;
        _toastMsg = 'Erreur : ${e.toString().replaceAll('Exception: ', '')}';
      });
      await Future.delayed(const Duration(seconds: 4));
      if (mounted) setState(() => _showToast = false);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  String _p(int v) => v < 10 ? '0$v' : '$v';

  // ─────────────────────────────────────────────────────────
  // PICKERS
  // ─────────────────────────────────────────────────────────
  Future<void> _pickDate() async {
    final d = await showDatePicker(
      context: context,
      initialDate: _departureDate.isAfter(DateTime.now())
          ? _departureDate
          : DateTime.now().add(const Duration(hours: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFF08316E)),
        ),
        child: child!,
      ),
    );
    if (d != null && mounted) setState(() => _departureDate = d);
  }

  Future<void> _pickTime() async {
    final t = await showTimePicker(
      context: context,
      initialTime: _departureTime,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFF08316E)),
        ),
        child: child!,
      ),
    );
    if (t != null && mounted) setState(() => _departureTime = t);
  }

  Future<void> _pickEndDate() async {
    final d = await showDatePicker(
      context: context,
      initialDate:
          _recurrenceEndDate ?? DateTime.now().add(const Duration(days: 30)),
      firstDate: _departureDate,
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFF08316E)),
        ),
        child: child!,
      ),
    );
    if (d != null && mounted) setState(() => _recurrenceEndDate = d);
  }

  // ─────────────────────────────────────────────────────────
  // BUILD
  // ─────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Fermer suggestions si clic ailleurs
        setState(() {
          _showDepartureSuggestions = false;
          _showArrivalSuggestions = false;
        });
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF2F5FA),
        body: Stack(
          children: [
            NestedScrollView(
              headerSliverBuilder: (_, __) => [_buildAppBar()],
              body: Column(
                children: [
                  _buildTabBar(),
                  Expanded(
                    child: TabBarView(
                      controller: _tabCtrl,
                      children: [
                        _buildInfosTab(),
                        _buildVehicleTab(),
                        _buildPrefsTab(),
                        _buildTarifTab(),
                      ],
                    ),
                  ),
                  _buildBottomActions(),
                ],
              ),
            ),
            if (_showToast) _buildToast(),
          ],
        ),
      ),
    );
  }

  SliverAppBar _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      pinned: true,
      backgroundColor: const Color(0xFF08316E),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => context.pop(),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF051f4a), Color(0xFF0d4490)],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 50, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Créer votre trajet',
                    style: GoogleFonts.sora(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'Remplissez les informations pour publier',
                    style:
                        GoogleFonts.dmSans(fontSize: 12, color: Colors.white70),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      child: TabBar(
        controller: _tabCtrl,
        labelColor: const Color(0xFF08316E),
        unselectedLabelColor: const Color(0xFF8A95A8),
        indicatorColor: const Color(0xFF08316E),
        indicatorWeight: 3,
        labelStyle: GoogleFonts.sora(fontSize: 12, fontWeight: FontWeight.w700),
        unselectedLabelStyle: GoogleFonts.sora(fontSize: 12),
        tabs: _tabs.map((t) => Tab(text: t)).toList(),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // TAB 1 — Informations
  // ─────────────────────────────────────────────────────────
  Widget _buildInfosTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionCard(
            title: 'Lieux de départ et d\'arrivée',
            icon: Icons.place_outlined,
            children: [
              _fieldLabel('Point de départ'),
              _autocompleteField(
                controller: _departureCtrl,
                hint: 'Ex: Campus La Cité, Ottawa',
                prefixIcon: Icons.my_location,
                prefixColor: const Color(0xFF08316E),
                isSelected: _departure != null,
                error: _errors['departure'],
                onChanged: _onDepartureChanged,
                suggestions: _departureSuggestions,
                showSuggestions: _showDepartureSuggestions,
                onSelect: _selectDeparture,
                onDismiss: () => setState(() => _showDepartureSuggestions = false),
                readOnly: true,
              ),
              const SizedBox(height: 12),
              _fieldLabel('Point d\'arrivée'),
              _autocompleteField(
                controller: _arrivalCtrl,
                hint: 'Ex: Place d\'Orléans',
                prefixIcon: Icons.location_on,
                prefixColor: const Color(0xFFE24B4A),
                isSelected: _arrival != null,
                error: _errors['arrival'],
                onChanged: _onArrivalChanged,
                suggestions: _arrivalSuggestions,
                showSuggestions: _showArrivalSuggestions,
                onSelect: _selectArrival,
                onDismiss: () => setState(() => _showArrivalSuggestions = false),
                readOnly: true,
              ),
              // Indicateur route calculée
              if (_isCalculatingRoute)
                const Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Color(0xFF08316E)),
                      ),
                      SizedBox(width: 8),
                      Text('Calcul de l\'itinéraire…',
                          style: TextStyle(
                              fontSize: 11, color: Color(0xFF8A95A8))),
                    ],
                  ),
                )
              else if (_estimatedDistanceKm > 0)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE1F5EE),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.route,
                            size: 13, color: Color(0xFF0F6E56)),
                        const SizedBox(width: 6),
                        Text(
                          '${_estimatedDistanceKm.toStringAsFixed(1)} km · $_estimatedDurationMinutes min',
                          style: GoogleFonts.dmSans(
                              fontSize: 12, color: const Color(0xFF0F6E56)),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Date et heure de départ',
            icon: Icons.calendar_today_outlined,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _fieldLabel('Date'),
                  _tapField(
                    value:
                        '${_departureDate.day}/${_departureDate.month}/${_departureDate.year}',
                    icon: Icons.calendar_today,
                    onTap: _pickDate,
                  ),
                  const SizedBox(height: 12),
                  _fieldLabel('Heure'),
                  _tapField(
                    value: _departureTime.format(context),
                    icon: Icons.access_time,
                    onTap: _pickTime,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Type de trajet',
            icon: Icons.repeat_outlined,
            children: [
              _tripTypeSelector(),
              if (_tripType == 'recurrent') ...[
                const SizedBox(height: 14),
                _fieldLabel('Jours de récurrence'),
                if (_errors['recurrence'] != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(_errors['recurrence']!,
                        style: const TextStyle(
                            color: Color(0xFFE24B4A), fontSize: 11)),
                  ),
                _dayPicker(),
                const SizedBox(height: 12),
                _fieldLabel('Date de fin (optionnel)'),
                _tapField(
                  value: _recurrenceEndDate != null
                      ? '${_recurrenceEndDate!.day}/${_recurrenceEndDate!.month}/${_recurrenceEndDate!.year}'
                      : 'Sélectionner',
                  icon: Icons.event_repeat,
                  onTap: _pickEndDate,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // TAB 2 — Véhicule
  // ─────────────────────────────────────────────────────────
  Widget _buildVehicleTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _sectionCard(
            title: 'Véhicule',
            icon: Icons.directions_car_outlined,
            children: [
              if (_isLoadingVehicles)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: CircularProgressIndicator(color: Color(0xFF08316E)),
                  ),
                )
              else if (_vehicles.isEmpty)
                _emptyVehicleHint()
              else if (_vehicles.length == 1)
                _vehicleChip(_vehicles.first, selected: true)
              else ...[
                _fieldLabel('Choisir un véhicule'),
                ..._vehicles.map(
                  (v) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: GestureDetector(
                      onTap: () => setState(() {
                        _selectedVehicleId = v.id;
                        _maxPassengers = v.maxPassengers;
                        _availableSeats = _availableSeats.clamp(
                            1, (_maxPassengers - 1).clamp(1, 7));
                        _errors.remove('vehicle');
                      }),
                      child:
                          _vehicleChip(v, selected: _selectedVehicleId == v.id),
                    ),
                  ),
                ),
              ],
              if (_errors['vehicle'] != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(_errors['vehicle']!,
                      style: const TextStyle(
                          color: Color(0xFFE24B4A), fontSize: 11)),
                ),
            ],
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Places disponibles',
            icon: Icons.event_seat_outlined,
            children: [
              _fieldLabel(
                  'Places offertes (max ${(_maxPassengers - 1).clamp(1, 7)})'),
              const SizedBox(height: 10),
              _stepper(
                value: _availableSeats,
                min: 1,
                max: (_maxPassengers - 1).clamp(1, 7),
                onDecrement: () => setState(() {
                  if (_availableSeats > 1) _availableSeats--;
                }),
                onIncrement: () => setState(() {
                  if (_availableSeats < (_maxPassengers - 1)) _availableSeats++;
                }),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // TAB 3 — Préférences
  // ─────────────────────────────────────────────────────────
  Widget _buildPrefsTab() {
    final prefRows = [
      (
        icon: Icons.luggage_outlined,
        label: 'Bagages autorisés',
        get: _prefs.baggageAllowed,
        set: (bool v) => setState(() => _prefs.baggageAllowed = v),
      ),
      (
        icon: Icons.pets_outlined,
        label: 'Animaux acceptés',
        get: _prefs.petsAllowed,
        set: (bool v) => setState(() => _prefs.petsAllowed = v),
      ),
      (
        icon: Icons.smoke_free,
        label: 'Fumeur accepté',
        get: _prefs.smokingAllowed,
        set: (bool v) => setState(() => _prefs.smokingAllowed = v),
      ),
      (
        icon: Icons.music_note_outlined,
        label: 'Musique autorisée',
        get: _prefs.musicAllowed,
        set: (bool v) => setState(() => _prefs.musicAllowed = v),
      ),
      (
        icon: Icons.map_outlined,
        label: 'Itinéraire flexible',
        get: _prefs.flexibleItinerary,
        set: (bool v) => setState(() => _prefs.flexibleItinerary = v),
      ),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _sectionCard(
            title: 'Options pour les passagers',
            icon: Icons.tune_outlined,
            children: prefRows
                .map(
                  (p) => _prefToggleRow(
                    icon: p.icon,
                    label: p.label,
                    value: p.get,
                    onChanged: p.set,
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Message aux passagers',
            icon: Icons.message_outlined,
            children: [
              if (!_showNoteField)
                GestureDetector(
                  onTap: () => setState(() => _showNoteField = true),
                  child: Row(
                    children: [
                      const Icon(Icons.add_circle_outline,
                          size: 16, color: Color(0xFF08316E)),
                      const SizedBox(width: 6),
                      Text(
                        'Ajouter un message au trajet',
                        style: GoogleFonts.sora(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF08316E),
                        ),
                      ),
                    ],
                  ),
                )
              else ...[
                TextField(
                  controller: _noteCtrl,
                  maxLines: 3,
                  style: GoogleFonts.dmSans(fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Ex: Rendez-vous devant l\'entrée principale…',
                    hintStyle: GoogleFonts.dmSans(
                        fontSize: 13, color: const Color(0xFF8A95A8)),
                    filled: true,
                    fillColor: const Color(0xFFF8F9FC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFD8DBE5)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFD8DBE5)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF08316E)),
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    _noteCtrl.clear();
                    setState(() => _showNoteField = false);
                  },
                  child: Text(
                    'Supprimer le message',
                    style: GoogleFonts.dmSans(
                      fontSize: 11,
                      color: const Color(0xFFE24B4A),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // TAB 4 — Tarification
  // ─────────────────────────────────────────────────────────
  Widget _buildTarifTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _sectionCard(
            title: 'Prix par passager',
            icon: Icons.attach_money,
            children: [
              const SizedBox(height: 4),
              _priceSelector(),
              if (_errors['price'] != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(_errors['price']!,
                      style: const TextStyle(
                          color: Color(0xFFE24B4A), fontSize: 11)),
                ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFE1F5EE),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                      color: const Color(0xFF0F6E56).withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline,
                        size: 14, color: Color(0xFF0F6E56)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Prix affiché aux passagers : ${(_pricePerPassenger * 1.15).toStringAsFixed(2)} \$ (frais 15% inclus)',
                        style: GoogleFonts.dmSans(
                            fontSize: 12, color: const Color(0xFF0F6E56)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Mode de paiement',
            icon: Icons.credit_card_outlined,
            children: [_paymentSelector()],
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Récapitulatif',
            icon: Icons.summarize_outlined,
            children: [
              _summaryRow(
                  'Départ',
                  _departure?.label ??
                      (_departureCtrl.text.isEmpty
                          ? '—'
                          : _departureCtrl.text)),
              _summaryRow(
                  'Arrivée',
                  _arrival?.label ??
                      (_arrivalCtrl.text.isEmpty ? '—' : _arrivalCtrl.text)),
              _summaryRow(
                'Date',
                '${_departureDate.day}/${_departureDate.month}/${_departureDate.year} '
                    'à ${_departureTime.format(context)}',
              ),
              if (_estimatedDistanceKm > 0) ...[
                _summaryRow('Distance',
                    '${_estimatedDistanceKm.toStringAsFixed(1)} km'),
                _summaryRow('Durée estimée', '$_estimatedDurationMinutes min'),
              ],
              _summaryRow('Places', '$_availableSeats passager(s)'),
              _summaryRow('Prix',
                  '${_pricePerPassenger.toStringAsFixed(2)} \$ / passager'),
              _summaryRow('Paiement',
                  _paymentMethod == 'cash' ? 'Argent comptant' : 'Interac'),
            ],
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // ACTIONS BAS DE PAGE
  // ─────────────────────────────────────────────────────────
  Widget _buildBottomActions() {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.fromLTRB(
        16,
        10,
        16,
        MediaQuery.of(context).padding.bottom + 16,
      ),
      child: Row(
        children: [
          Expanded(
            child: _outlineBtn(
              label: 'Brouillon',
              icon: Icons.save_outlined,
              onTap: _isSubmitting ? null : () => _submit(false),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: _filledBtn(
              label: 'Publier le trajet',
              icon: Icons.rocket_launch_outlined,
              isLoading: _isSubmitting,
              onTap: _isSubmitting ? null : () => _submit(true),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // COMPOSANTS UI
  // ─────────────────────────────────────────────────────────

  Widget _sectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
              color: Color(0x0F000000), blurRadius: 8, offset: Offset(0, 2)),
        ],
        border: Border.all(color: const Color(0x12000000)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
            child: Row(
              children: [
                Icon(icon, size: 16, color: const Color(0xFF08316E)),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: GoogleFonts.sora(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF08316E),
                  ),
                ),
              ],
            ),
          ),
          Container(height: 1, color: const Color(0x12000000)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  Widget _fieldLabel(String label) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(
          label,
          style: GoogleFonts.sora(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF545D6E),
            letterSpacing: 0.3,
          ),
        ),
      );

  // Champ avec autocomplétion
  Widget _autocompleteField({
    required TextEditingController controller,
    required String hint,
    required IconData prefixIcon,
    Color prefixColor = const Color(0xFF08316E),
    required bool isSelected,
    String? error,
    required ValueChanged<String> onChanged,
    required List<OrsPlaceSuggestion> suggestions,
    required bool showSuggestions,
    required ValueChanged<OrsPlaceSuggestion> onSelect,
    required VoidCallback onDismiss,
    bool readOnly = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF8F9FC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: error != null
                  ? const Color(0xFFE24B4A)
                  : isSelected
                      ? const Color(0xFF08316E)
                      : const Color(0xFFD8DBE5),
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Icon(
                  isSelected ? Icons.check_circle : prefixIcon,
                  size: 16,
                  color: isSelected ? const Color(0xFF0F6E56) : prefixColor,
                ),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  onChanged: readOnly ? null : onChanged,
                  style: GoogleFonts.dmSans(fontSize: 14),
                  readOnly: readOnly,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: GoogleFonts.dmSans(
                        fontSize: 13, color: const Color(0xFF8A95A8)),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              if (!readOnly && controller.text.isNotEmpty)
                GestureDetector(
                  onTap: () {
                    controller.clear();
                    onChanged('');
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child:
                        Icon(Icons.close, size: 16, color: Color(0xFF8A95A8)),
                  ),
                ),
            ],
          ),
        ),
        if (error != null)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(error,
                style: const TextStyle(color: Color(0xFFE24B4A), fontSize: 11)),
          ),
        if (showSuggestions && suggestions.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFD8DBE5)),
              boxShadow: const [
                BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 8,
                    offset: Offset(0, 4)),
              ],
            ),
            child: Column(
              children: suggestions.map((s) {
                return InkWell(
                  onTap: () => onSelect(s),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 12),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 14, color: Color(0xFF8A95A8)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            s.label,
                            style: GoogleFonts.dmSans(
                                fontSize: 13, color: const Color(0xFF0D1624)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }

  Widget _tapField({
    required String value,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: const Color(0xFFF8F9FC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD8DBE5)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: const Color(0xFF8A95A8)),
            const SizedBox(width: 10),
            Text(value,
                style: GoogleFonts.dmSans(
                    fontSize: 14, color: const Color(0xFF0D1624))),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down,
                size: 16, color: Color(0xFF8A95A8)),
          ],
        ),
      ),
    );
  }

  Widget _tripTypeSelector() {
    return Row(
      children: ['unique', 'recurrent'].map((type) {
        final selected = _tripType == type;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: type == 'unique' ? 8 : 0),
            child: GestureDetector(
              onTap: () => setState(() => _tripType = type),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                height: 44,
                decoration: BoxDecoration(
                  color: selected ? const Color(0xFF08316E) : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: selected
                        ? const Color(0xFF08316E)
                        : const Color(0xFFD8DBE5),
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  type == 'unique' ? 'Unique' : 'Récurrent',
                  style: GoogleFonts.sora(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: selected ? Colors.white : const Color(0xFF545D6E),
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _dayPicker() {
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return Row(
      children: List.generate(7, (i) {
        final selected = _recurrenceDays[i];
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: i < 6 ? 4 : 0),
            child: GestureDetector(
              onTap: () =>
                  setState(() => _recurrenceDays[i] = !_recurrenceDays[i]),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 120),
                height: 38,
                decoration: BoxDecoration(
                  color: selected
                      ? const Color(0xFF08316E)
                      : const Color(0xFFF2F5FA),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: selected
                        ? const Color(0xFF08316E)
                        : const Color(0xFFD8DBE5),
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  days[i],
                  style: GoogleFonts.sora(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: selected ? Colors.white : const Color(0xFF7A879A),
                  ),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _vehicleChip(_Vehicle v, {required bool selected}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: selected ? const Color(0xFFE8F0FE) : const Color(0xFFF8F9FC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: selected ? const Color(0xFF08316E) : const Color(0xFFD8DBE5),
          width: selected ? 1.5 : 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color:
                  selected ? const Color(0xFF08316E) : const Color(0xFFEEF0F5),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.directions_car,
                size: 22,
                color: selected ? Colors.white : const Color(0xFF8A95A8)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(v.label,
                    style: GoogleFonts.sora(
                        fontSize: 13, fontWeight: FontWeight.w700)),
                Text('${v.color} · ${v.maxPassengers} places',
                    style: GoogleFonts.dmSans(
                        fontSize: 12, color: const Color(0xFF7A879A))),
              ],
            ),
          ),
          if (selected)
            const Icon(Icons.check_circle, color: Color(0xFF08316E), size: 20),
        ],
      ),
    );
  }

  Widget _emptyVehicleHint() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFAEEDA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBA7517).withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_outlined,
              color: Color(0xFFBA7517), size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Aucun véhicule enregistré. Ajoutez-en un dans votre profil.',
              style: GoogleFonts.dmSans(
                  fontSize: 12, color: const Color(0xFF854F0B)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepper({
    required int value,
    required int min,
    required int max,
    required VoidCallback onDecrement,
    required VoidCallback onIncrement,
  }) {
    return Row(
      children: [
        _stepBtn(icon: Icons.remove, onTap: value > min ? onDecrement : null),
        const SizedBox(width: 16),
        Text(
          '$value',
          style: GoogleFonts.sora(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF08316E)),
        ),
        const SizedBox(width: 16),
        _stepBtn(icon: Icons.add, onTap: value < max ? onIncrement : null),
        const SizedBox(width: 12),
        Text('place(s)',
            style: GoogleFonts.dmSans(
                fontSize: 14, color: const Color(0xFF7A879A))),
      ],
    );
  }

  Widget _stepBtn({required IconData icon, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color:
              onTap != null ? const Color(0xFF08316E) : const Color(0xFFEEF0F5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon,
            size: 18,
            color: onTap != null ? Colors.white : const Color(0xFF8A95A8)),
      ),
    );
  }

  Widget _prefToggleRow({
    required IconData icon,
    required String label,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8F9FC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD8DBE5)),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFFEEF0F5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, size: 16, color: const Color(0xFF08316E)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: GoogleFonts.dmSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF0D1624)),
              ),
            ),
            Switch.adaptive(
              value: value,
              onChanged: onChanged,
              activeColor: const Color(0xFF1D9E75),
            ),
          ],
        ),
      ),
    );
  }

  Widget _priceSelector() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _stepBtn(
          icon: Icons.remove,
          onTap: _pricePerPassenger > 1
              ? () => setState(() =>
                  _pricePerPassenger = (_pricePerPassenger - 1).clamp(1, 99))
              : null,
        ),
        const SizedBox(width: 20),
        Container(
          width: 110,
          height: 56,
          decoration: BoxDecoration(
            color: const Color(0xFFF8F9FC),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF08316E), width: 1.5),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                _pricePerPassenger.toStringAsFixed(0),
                style: GoogleFonts.sora(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF08316E)),
              ),
              const SizedBox(width: 4),
              Text('\$',
                  style: GoogleFonts.sora(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF8A95A8))),
            ],
          ),
        ),
        const SizedBox(width: 20),
        _stepBtn(
          icon: Icons.add,
          onTap: _pricePerPassenger < 99
              ? () => setState(() =>
                  _pricePerPassenger = (_pricePerPassenger + 1).clamp(1, 99))
              : null,
        ),
      ],
    );
  }

  Widget _paymentSelector() {
    final methods = [
      ('cash', 'Argent comptant', Icons.payments_outlined),
      ('interac', 'Virement Interac', Icons.swap_horiz_outlined),
    ];
    return Column(
      children: methods.map((m) {
        final selected = _paymentMethod == m.$1;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: GestureDetector(
            onTap: () => setState(() => _paymentMethod = m.$1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              decoration: BoxDecoration(
                color: selected
                    ? const Color(0xFFE8F0FE)
                    : const Color(0xFFF8F9FC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: selected
                      ? const Color(0xFF08316E)
                      : const Color(0xFFD8DBE5),
                  width: selected ? 1.5 : 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(m.$3,
                      size: 18,
                      color: selected
                          ? const Color(0xFF08316E)
                          : const Color(0xFF8A95A8)),
                  const SizedBox(width: 12),
                  Text(
                    m.$2,
                    style: GoogleFonts.dmSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: selected
                          ? const Color(0xFF08316E)
                          : const Color(0xFF3D4A5C),
                    ),
                  ),
                  const Spacer(),
                  if (selected)
                    const Icon(Icons.check_circle,
                        color: Color(0xFF08316E), size: 18),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(label,
                style: GoogleFonts.dmSans(
                    fontSize: 12, color: const Color(0xFF7A879A))),
          ),
          Expanded(
            child: Text(value,
                style: GoogleFonts.dmSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF0D1624))),
          ),
        ],
      ),
    );
  }

  Widget _filledBtn({
    required String label,
    required IconData icon,
    required bool isLoading,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        height: 50,
        decoration: BoxDecoration(
          color:
              onTap != null ? const Color(0xFF08316E) : const Color(0xFF8A95A8),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                      strokeWidth: 2.5, color: Colors.white),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(icon, size: 16, color: Colors.white),
                    const SizedBox(width: 8),
                    Text(
                      label,
                      style: GoogleFonts.sora(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _outlineBtn({
    required String label,
    required IconData icon,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 50,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFD8DBE5), width: 1.5),
        ),
        child: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: const Color(0xFF545D6E)),
              const SizedBox(width: 6),
              Text(
                label,
                style: GoogleFonts.sora(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF545D6E)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildToast() {
    return Positioned(
      bottom: 90,
      left: 20,
      right: 20,
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: const Duration(milliseconds: 300),
        builder: (_, v, child) => Opacity(opacity: v, child: child),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: _toastSuccess
                ? const Color(0xFF0F6E56)
                : const Color(0xFFE24B4A),
            borderRadius: BorderRadius.circular(14),
            boxShadow: const [
              BoxShadow(
                  color: Colors.black26, blurRadius: 12, offset: Offset(0, 4)),
            ],
          ),
          child: Row(
            children: [
              Icon(
                _toastSuccess
                    ? Icons.check_circle_outline
                    : Icons.error_outline,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _toastMsg,
                  style: GoogleFonts.sora(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// HELPERS PRIVÉS
// ─────────────────────────────────────────────────────────────

List<dynamic> _extractList(dynamic payload) {
  if (payload is List) return payload;
  if (payload is Map<String, dynamic>) {
    final d = payload['data'] ?? payload['items'] ?? payload['results'];
    if (d is List) return d;
  }
  return [];
}

String _firstStr(Map<String, dynamic> m, List<String> keys) {
  for (final k in keys) {
    final v = m[k]?.toString().trim();
    if (v != null && v.isNotEmpty) return v;
  }
  return '';
}

double? _toNullableDouble(dynamic v) {
  if (v is num) return v.toDouble();
  return double.tryParse(v?.toString() ?? '');
}

double _toDouble(dynamic v, {double fallback = 0}) {
  if (v is num) return v.toDouble();
  return double.tryParse(v?.toString() ?? '') ?? fallback;
}

int _toInt(dynamic v, {int fallback = 0}) {
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v?.toString() ?? '') ?? fallback;
}
