import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/trip.dart';
import '../../core/services/api_service.dart';
import '../../core/services/ors_route_service.dart';
import '../../core/services/trip_service.dart';
import 'driver_search_map_screen.dart';
import 'trip_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({
    super.key,
    required this.tripService,
    this.initialFrom,
    this.initialTo,
    this.initialFromLat,
    this.initialFromLng,
    this.initialToLat,
    this.initialToLng,
    this.autoSearchOnInit = false,
    this.isDriver = false,
  });

  final TripService tripService;
  final String? initialFrom;
  final String? initialTo;
  final double? initialFromLat;
  final double? initialFromLng;
  final double? initialToLat;
  final double? initialToLng;
  final bool autoSearchOnInit;
  final bool isDriver;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();
  final _fromFocus = FocusNode();
  final _toFocus = FocusNode();

  Timer? _debounce;
  Timer? _driverAutoSearchDebounce;
  bool _fromFieldActive = true;
  bool _isLoadingSuggestion = false;
  List<OrsPlaceSuggestion> _orsSuggestions = const <OrsPlaceSuggestion>[];
  OrsPlaceSuggestion? _fromSelection;
  OrsPlaceSuggestion? _toSelection;
  bool _driverAutoSearchInFlight = false;
  String? _lastDriverAutoSearchKey;

  bool _isLoadingFavoritePlaces = false;
  bool _isLocatingUser = false;
  List<_FavoritePlaceItem> _favoritePlaces = const <_FavoritePlaceItem>[];

  bool _isLoading = false;
  bool _hasSearched = false;
  String? _error;
  List<Trip> _results = <Trip>[];

  static const List<String> _suggestions = <String>[
    'Campus La Cite',
    'Place d\'Orleans',
    'Barrhaven Town Centre',
    'Arret Hurdman',
    'Gatineau Centre',
  ];

  bool get _canSearch =>
      _fromCtrl.text.trim().isNotEmpty && _toCtrl.text.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    if (widget.initialFrom != null) _fromCtrl.text = widget.initialFrom!;
    if (widget.initialTo != null) _toCtrl.text = widget.initialTo!;
    if (widget.initialFromLat != null && widget.initialFromLng != null) {
      _fromSelection = OrsPlaceSuggestion(
        label: widget.initialFrom?.trim().isNotEmpty == true
            ? widget.initialFrom!.trim()
            : 'Depart',
        lat: widget.initialFromLat!,
        lng: widget.initialFromLng!,
      );
    }
    if (widget.initialToLat != null && widget.initialToLng != null) {
      _toSelection = OrsPlaceSuggestion(
        label: widget.initialTo?.trim().isNotEmpty == true
            ? widget.initialTo!.trim()
            : 'Destination',
        lat: widget.initialToLat!,
        lng: widget.initialToLng!,
      );
    }
    _fromFocus.addListener(_onFocusChanged);
    _toFocus.addListener(_onFocusChanged);
    unawaited(_loadDriverFavoritePlaces());
    if (widget.isDriver) {
      if (_canSearch) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _scheduleDriverAutoSearch();
        });
      }
    } else if (widget.autoSearchOnInit && _canSearch) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        unawaited(_runPassengerSearch());
      });
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _driverAutoSearchDebounce?.cancel();
    _fromCtrl.dispose();
    _toCtrl.dispose();
    _fromFocus.dispose();
    _toFocus.dispose();
    super.dispose();
  }

  void _onFocusChanged() {
    if (!_fromFocus.hasFocus && !_toFocus.hasFocus) {
      setState(() {
        _isLoadingSuggestion = false;
        _orsSuggestions = const <OrsPlaceSuggestion>[];
      });
      if (widget.isDriver) {
        unawaited(_triggerDriverAutoSearchIfReady());
      }
      return;
    }

    _fromFieldActive = _fromFocus.hasFocus;
    final String seed =
        _fromFieldActive ? _fromCtrl.text.trim() : _toCtrl.text.trim();
    _queueOrsSuggestions(seed);
  }

  void _queueOrsSuggestions(String raw) {
    _debounce?.cancel();
    final String query = raw.trim();
    if (query.length < 3) {
      setState(() {
        _isLoadingSuggestion = false;
        _orsSuggestions = const <OrsPlaceSuggestion>[];
      });
      return;
    }

    setState(() => _isLoadingSuggestion = true);
    _debounce = Timer(const Duration(milliseconds: 260), () async {
      final List<OrsPlaceSuggestion> found =
          await OrsRouteService.instance.suggestPlaces(query, limit: 8);
      if (!mounted) return;
      setState(() {
        _isLoadingSuggestion = false;
        _orsSuggestions = found;
      });
    });
  }

  void _onFromChanged(String value) {
    if (_fromSelection?.label != value.trim()) {
      _fromSelection = null;
    }
    _lastDriverAutoSearchKey = null;
    if (_fromFocus.hasFocus) {
      _queueOrsSuggestions(value);
    }
    setState(() {});
  }

  void _onToChanged(String value) {
    if (_toSelection?.label != value.trim()) {
      _toSelection = null;
    }
    _lastDriverAutoSearchKey = null;
    if (_toFocus.hasFocus) {
      _queueOrsSuggestions(value);
    }
    setState(() {});
  }

  void _scheduleDriverAutoSearch() {
    if (!widget.isDriver) return;
    _driverAutoSearchDebounce?.cancel();
    _driverAutoSearchDebounce = Timer(
      const Duration(milliseconds: 220),
      _triggerDriverAutoSearchIfReady,
    );
  }

  Future<void> _triggerDriverAutoSearchIfReady() async {
    if (!mounted || !widget.isDriver || !_canSearch || _driverAutoSearchInFlight) {
      return;
    }
    final String key = '${_fromCtrl.text.trim()}|${_toCtrl.text.trim()}';
    if (_lastDriverAutoSearchKey == key) return;

    _driverAutoSearchInFlight = true;
    _lastDriverAutoSearchKey = key;
    try {
      await _openDriverMap();
    } finally {
      _driverAutoSearchInFlight = false;
    }
  }

  Future<void> _loadDriverFavoritePlaces() async {
    if (mounted) setState(() => _isLoadingFavoritePlaces = true);

    try {
      dynamic payload;
      try {
        payload = await ApiService.instance.get('/api/favorites');
      } catch (_) {
        payload = await ApiService.instance.get('/api/lieux-favoris');
      }
      final dynamic body = (payload is Map<String, dynamic>)
          ? (payload['data'] ?? payload)
          : payload;
      final dynamic placesData = body is Map<String, dynamic>
          ? (body['places'] ?? body['favoritePlaces'] ?? body['locations'])
          : body;

      final List<dynamic> rows = _extractList(placesData);
      final List<_FavoritePlaceItem> parsed = rows
          .whereType<Map<String, dynamic>>()
          .map(_FavoritePlaceItem.fromJson)
          .where((item) => item.label.isNotEmpty)
          .toList();

      if (!mounted) return;
      setState(() {
        _favoritePlaces = parsed.isEmpty ? _FavoritePlaceItem.fixtureFallback : parsed;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _favoritePlaces = _FavoritePlaceItem.fixtureFallback;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoadingFavoritePlaces = false);
      }
    }
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List<dynamic>) return data;
    if (data is Map<String, dynamic>) {
      final dynamic candidate = data['items'] ?? data['data'] ?? data['results'];
      if (candidate is List<dynamic>) return candidate;
    }
    return const <dynamic>[];
  }

  Future<void> _useCurrentLocationAsDeparture() async {
    if (_isLocatingUser) return;
    if (mounted) {
      setState(() {
        _isLocatingUser = true;
        _error = null;
      });
    }

    try {
      final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          setState(() {
            _error = 'Activez la localisation pour utiliser votre position.';
          });
        }
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) {
          setState(() {
            _error = 'Permission de localisation refusee.';
          });
        }
        return;
      }

      final Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.bestForNavigation,
      );

      final String label =
          'Votre position (${position.latitude.toStringAsFixed(5)}, ${position.longitude.toStringAsFixed(5)})';
      final OrsPlaceSuggestion currentLocation = OrsPlaceSuggestion(
        label: label,
        lat: position.latitude,
        lng: position.longitude,
      );
      final bool fillFrom = _fromFocus.hasFocus ||
          (!_toFocus.hasFocus && _fromCtrl.text.trim().isEmpty);
      final FocusNode targetFocus = fillFrom ? _fromFocus : _toFocus;
      if (fillFrom) {
        _fromCtrl.text = label;
        _fromSelection = currentLocation;
        _fromFieldActive = false;
      } else {
        _toCtrl.text = label;
        _toSelection = currentLocation;
      }
      if (!targetFocus.hasFocus) {
        FocusScope.of(context).requestFocus(targetFocus);
      }
      _lastDriverAutoSearchKey = null;
      if (mounted) setState(() {});

      if (widget.isDriver) {
        await _triggerDriverAutoSearchIfReady();
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de recuperer votre position actuelle.';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLocatingUser = false);
      }
    }
  }

  void _selectFavoritePlace(_FavoritePlaceItem place) {
    final bool fillFrom = _fromFocus.hasFocus ||
        (!_toFocus.hasFocus && _fromCtrl.text.trim().isEmpty);
    final FocusNode targetFocus = fillFrom ? _fromFocus : _toFocus;

    if (fillFrom) {
      _fromCtrl.text = place.label;
      _fromSelection = place.toSuggestion();
      _fromFieldActive = false;
    } else {
      _toCtrl.text = place.label;
      _toSelection = place.toSuggestion();
    }
    if (!targetFocus.hasFocus) {
      FocusScope.of(context).requestFocus(targetFocus);
    }

    _lastDriverAutoSearchKey = null;
    setState(() {});
    if (widget.isDriver) {
      _scheduleDriverAutoSearch();
    }
  }

  void _onInputSubmitted() {
    if (widget.isDriver) {
      unawaited(_triggerDriverAutoSearchIfReady());
      return;
    }
    if (_canSearch) {
      unawaited(_runPassengerSearch());
    }
  }

  Future<void> _runPassengerSearch() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
      _error = null;
      _hasSearched = true;
    });
    try {
      final results = await widget.tripService.searchTrips(
        from: _fromCtrl.text.trim(),
        to: _toCtrl.text.trim(),
      );
      setState(() => _results = results);
    } catch (_) {
      try {
        final fallback = await widget.tripService.searchTrips(from: '', to: '');
        setState(() {
          _results = fallback;
          _error = null;
        });
      } catch (_) {
        setState(() => _error = 'Connexion impossible. Verifiez votre reseau.');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _openDriverMap() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final OrsPlaceSuggestion? from = _fromSelection ??
          await OrsRouteService.instance.geocodeFirst(_fromCtrl.text.trim());
      final OrsPlaceSuggestion? to = _toSelection ??
          await OrsRouteService.instance.geocodeFirst(_toCtrl.text.trim());

      if (!mounted) return;
      if (from == null || to == null) {
        setState(() {
          _isLoading = false;
          _error = 'Choisissez un depart et une destination valides.';
        });
        _lastDriverAutoSearchKey = null;
        return;
      }

      _fromSelection = from;
      _toSelection = to;

      await context.push(
        '/driver-search-map',
        extra: DriverSearchMapArgs(
          fromText: from.label,
          toText: to.label,
          fromLat: from.lat,
          fromLng: from.lng,
          toLat: to.lat,
          toLng: to.lng,
        ),
      );
      _error = null;
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Impossible d\'ouvrir la carte pour cette recherche.';
        });
      }
      _lastDriverAutoSearchKey = null;
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _onSearchTap() async {
    if (!_canSearch) return;
    if (widget.isDriver) {
      await _openDriverMap();
      return;
    }
    await _runPassengerSearch();
  }

  void _selectSuggestion(String label) {
    if (_fromFocus.hasFocus) {
      _fromCtrl.text = label;
    } else {
      _toCtrl.text = label;
    }
    setState(() {});
    FocusScope.of(context).unfocus();
  }

  void _selectDriverSuggestion(OrsPlaceSuggestion suggestion) {
    if (_fromFieldActive) {
      _fromCtrl.text = suggestion.label;
      _fromSelection = suggestion;
    } else {
      _toCtrl.text = suggestion.label;
      _toSelection = suggestion;
    }
    _lastDriverAutoSearchKey = null;
    setState(() {
      _orsSuggestions = const <OrsPlaceSuggestion>[];
    });
    FocusScope.of(context).unfocus();
    _scheduleDriverAutoSearch();
  }

  void _navigateToDetail(Trip trip) {
    context.push('/trip/${trip.id}', extra: trip);
  }

  void _openMapAfterSearch() {
    context.push(
      '/driver-search-map',
      extra: DriverSearchMapArgs(
        fromText: _fromCtrl.text.trim(),
        toText: _toCtrl.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isFocused = _fromFocus.hasFocus || _toFocus.hasFocus;
    final bool showDriverQuickPlaces = widget.isDriver && isFocused;
    final bool canPop = Navigator.of(context).canPop();

    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              color: const Color(0xFF08316E),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Row(
                children: [
                  if (widget.isDriver || canPop) ...<Widget>[
                    IconButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                    const SizedBox(width: 4),
                  ],
                  Expanded(
                    child: Column(
                      children: [
                        _SearchField(
                          ctrl: _fromCtrl,
                          focus: _fromFocus,
                          hint: 'Point de depart',
                          dotColor: Colors.white,
                          onChanged: _onFromChanged,
                          onSubmitted: _onInputSubmitted,
                        ),
                        const SizedBox(height: 8),
                        _SearchField(
                          ctrl: _toCtrl,
                          focus: _toFocus,
                          hint: 'Destination',
                          dotColor: const Color(0xFF1A56CC),
                          onChanged: _onToChanged,
                          onSubmitted: _onInputSubmitted,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: _canSearch ? _onSearchTap : null,
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: _canSearch
                            ? const Color(0xFF1A56CC)
                            : const Color(0xFF94A3B8),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: _isLoading
                          ? const Padding(
                              padding: EdgeInsets.all(14),
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.search, color: Colors.white, size: 24),
                    ),
                  ),
                ],
                ),
              ),
            if (showDriverQuickPlaces)
              _DriverQuickPlaces(
                isLocatingUser: _isLocatingUser,
                isLoadingFavorites: _isLoadingFavoritePlaces,
                favorites: _favoritePlaces,
                onUseCurrentLocation: _useCurrentLocationAsDeparture,
                onFavoriteTap: _selectFavoritePlace,
              ),
            if (_error != null)
              Container(
                width: double.infinity,
                color: const Color(0xFFFAEEDA),
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                child: Text(
                  _error!,
                  style: const TextStyle(
                    color: Color(0xFF854F0B),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            Expanded(
              child: isFocused
                  ? _DriverSuggestions(
                      suggestions: _orsSuggestions,
                      isLoading: _isLoadingSuggestion,
                      onSelect: _selectDriverSuggestion,
                    )
                  : (widget.isDriver
                      ? _DriverIdleZone(
                          canSearch: _canSearch,
                          fromLabel: _fromCtrl.text.trim(),
                          toLabel: _toCtrl.text.trim(),
                          onOpenMap: _openDriverMap,
                        )
                      : _ResultsZone(
                          isLoading: _isLoading,
                          hasSearched: _hasSearched,
                          error: _error,
                          results: _results,
                          onRetry: _runPassengerSearch,
                          onTripTap: _navigateToDetail,
                          showMapAfterSearch: false,
                          onMapTap: _openMapAfterSearch,
                        )),
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({
    required this.ctrl,
    required this.focus,
    required this.hint,
    required this.dotColor,
    required this.onChanged,
    this.onSubmitted,
  });

  final TextEditingController ctrl;
  final FocusNode focus;
  final String hint;
  final Color dotColor;
  final ValueChanged<String> onChanged;
  final VoidCallback? onSubmitted;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD8DBE5)),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: ctrl,
              focusNode: focus,
              onChanged: onChanged,
              onSubmitted: (_) => onSubmitted?.call(),
              decoration: InputDecoration(
                hintText: hint,
                border: InputBorder.none,
                hintStyle: const TextStyle(color: Color(0xFF8A95A8), fontSize: 14),
              ),
              style: const TextStyle(fontSize: 14, color: Color(0xFF0D1624)),
            ),
          ),
          if (ctrl.text.isNotEmpty)
            InkWell(
              onTap: () {
                ctrl.clear();
                onChanged('');
              },
              child: const Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(Icons.close, size: 16, color: Color(0xFF8A95A8)),
              ),
            ),
        ],
      ),
    );
  }
}

class _DriverQuickPlaces extends StatelessWidget {
  const _DriverQuickPlaces({
    required this.isLocatingUser,
    required this.isLoadingFavorites,
    required this.favorites,
    required this.onUseCurrentLocation,
    required this.onFavoriteTap,
  });

  final bool isLocatingUser;
  final bool isLoadingFavorites;
  final List<_FavoritePlaceItem> favorites;
  final VoidCallback onUseCurrentLocation;
  final ValueChanged<_FavoritePlaceItem> onFavoriteTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      child: Column(
        children: <Widget>[
          ListTile(
            onTap: isLocatingUser ? null : onUseCurrentLocation,
            leading: const Icon(Icons.my_location_rounded, color: Color(0xFF1A56CC)),
            title: const Text(
              'Votre position',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
            subtitle: const Text(
              'Utiliser ma position exacte comme depart',
              style: TextStyle(color: Color(0xFF7A879A), fontSize: 12),
            ),
            trailing: isLocatingUser
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
          ),
          const Divider(height: 1, color: Color(0x12000000)),
          if (isLoadingFavorites)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else if (favorites.isEmpty)
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 14, 16, 14),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Aucun favori disponible.',
                  style: TextStyle(color: Color(0xFF7A879A), fontSize: 12),
                ),
              ),
            )
          else
            Column(
              children: favorites
                  .map(
                    (place) => Column(
                      children: <Widget>[
                        ListTile(
                          onTap: () => onFavoriteTap(place),
                          leading: const Icon(
                            Icons.star_rounded,
                            color: Color(0xFF0F6E56),
                          ),
                          title: Text(
                            place.label,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: place.address.isEmpty
                              ? null
                              : Text(
                                  place.address,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Color(0xFF7A879A),
                                    fontSize: 12,
                                  ),
                                ),
                          trailing: const Icon(
                            Icons.chevron_right_rounded,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                        const Divider(height: 1, color: Color(0x12000000)),
                      ],
                    ),
                  )
                  .toList(),
            ),
        ],
      ),
    );
  }
}

class _FocusSuggestions extends StatelessWidget {
  const _FocusSuggestions({required this.suggestions, required this.onSelect});

  final List<String> suggestions;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: ListView.separated(
        itemCount: suggestions.length,
        separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0x12000000)),
        itemBuilder: (_, i) => ListTile(
          onTap: () => onSelect(suggestions[i]),
          leading: const Icon(Icons.place_outlined, color: Color(0xFF1A56CC)),
          title: Text(suggestions[i], style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: const Text('Lieu suggere', style: TextStyle(color: Color(0xFF7A879A))),
        ),
      ),
    );
  }
}

class _FavoritePlaceItem {
  const _FavoritePlaceItem({
    required this.id,
    required this.label,
    required this.address,
    this.lat,
    this.lng,
  });

  final String id;
  final String label;
  final String address;
  final double? lat;
  final double? lng;

  OrsPlaceSuggestion? toSuggestion() {
    final double? safeLat = lat;
    final double? safeLng = lng;
    if (safeLat == null || safeLng == null) return null;
    return OrsPlaceSuggestion(label: label, lat: safeLat, lng: safeLng);
  }

  static _FavoritePlaceItem fromJson(Map<String, dynamic> row) {
    final dynamic coords = row['coordinates'] ?? row['coordonnees'] ?? row['location'];
    double? parsedLat =
        _toNullableDouble(row['lat'] ?? row['latitude'] ?? row['y']);
    double? parsedLng = _toNullableDouble(
      row['lng'] ?? row['lon'] ?? row['longitude'] ?? row['x'],
    );

    if ((parsedLat == null || parsedLng == null) && coords is Map<String, dynamic>) {
      parsedLat = parsedLat ??
          _toNullableDouble(coords['lat'] ?? coords['latitude'] ?? coords['y']);
      parsedLng = parsedLng ?? _toNullableDouble(
        coords['lng'] ?? coords['lon'] ?? coords['longitude'] ?? coords['x'],
      );
    }

    if ((parsedLat == null || parsedLng == null) && coords is List && coords.length >= 2) {
      final double first = _toNullableDouble(coords[0]) ?? 0;
      final double second = _toNullableDouble(coords[1]) ?? 0;
      if (first.abs() <= 90 && second.abs() <= 180) {
        parsedLat = first;
        parsedLng = second;
      } else if (first.abs() <= 180 && second.abs() <= 90) {
        parsedLat = second;
        parsedLng = first;
      }
    }

    return _FavoritePlaceItem(
      id: row['id']?.toString() ?? '',
      label: row['label']?.toString() ??
          row['name']?.toString() ??
          row['title']?.toString() ??
          '',
      address: row['address']?.toString() ?? row['description']?.toString() ?? '',
      lat: parsedLat,
      lng: parsedLng,
    );
  }

  static const List<_FavoritePlaceItem> fixtureFallback = <_FavoritePlaceItem>[
    _FavoritePlaceItem(
      id: 'fav_place_fallback_1',
      label: 'Campus',
      address: '801 promenade de l\'Aviation, Ottawa',
    ),
    _FavoritePlaceItem(
      id: 'fav_place_fallback_2',
      label: 'Maison',
      address: '142 rue des Erables, Gatineau',
    ),
  ];

  static double? _toNullableDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '');
  }
}

class _DriverSuggestions extends StatelessWidget {
  const _DriverSuggestions({
    required this.suggestions,
    required this.isLoading,
    required this.onSelect,
  });

  final List<OrsPlaceSuggestion> suggestions;
  final bool isLoading;
  final ValueChanged<OrsPlaceSuggestion> onSelect;

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF1A56CC)),
      );
    }

    if (suggestions.isEmpty) {
      return const Center(
        child: Text(
          'Saisissez au moins 3 lettres pour voir les suggestions ORS.',
          style: TextStyle(color: Color(0xFF7A879A), fontSize: 12),
          textAlign: TextAlign.center,
        ),
      );
    }

    return Container(
      color: Colors.white,
      child: ListView.separated(
        itemCount: suggestions.length,
        separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0x12000000)),
        itemBuilder: (_, i) {
          final s = suggestions[i];
          return ListTile(
            onTap: () => onSelect(s),
            leading: const Icon(Icons.place_outlined, color: Color(0xFF1A56CC)),
            title: Text(
              s.label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              '${s.lat.toStringAsFixed(5)}, ${s.lng.toStringAsFixed(5)}',
              style: const TextStyle(color: Color(0xFF7A879A), fontSize: 12),
            ),
          );
        },
      ),
    );
  }
}

class _DriverIdleZone extends StatelessWidget {
  const _DriverIdleZone({
    required this.canSearch,
    required this.fromLabel,
    required this.toLabel,
    required this.onOpenMap,
  });

  final bool canSearch;
  final String fromLabel;
  final String toLabel;
  final VoidCallback onOpenMap;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.map_rounded, size: 64, color: Color(0xFFB6C2D3)),
            const SizedBox(height: 12),
            const Text(
              'Recherche conducteur',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF0D1624),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              canSearch
                  ? '$fromLabel -> $toLabel'
                  : 'Choisissez un point de depart et une destination.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF7A879A), fontSize: 13),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: canSearch ? onOpenMap : null,
              icon: const Icon(Icons.map_rounded),
              label: const Text('Afficher la carte'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F6E56),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultsZone extends StatelessWidget {
  const _ResultsZone({
    required this.isLoading,
    required this.hasSearched,
    required this.error,
    required this.results,
    required this.onRetry,
    required this.onTripTap,
    required this.showMapAfterSearch,
    required this.onMapTap,
  });

  final bool isLoading;
  final bool hasSearched;
  final String? error;
  final List<Trip> results;
  final VoidCallback onRetry;
  final void Function(Trip) onTripTap;
  final bool showMapAfterSearch;
  final VoidCallback onMapTap;

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF1A56CC)));
    }

    if (error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded, size: 48, color: Color(0xFF8A95A8)),
            const SizedBox(height: 12),
            const Text(
              'Connexion impossible',
              style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0D1624)),
            ),
            const SizedBox(height: 4),
            Text(error!, style: const TextStyle(fontSize: 12, color: Color(0xFF7A879A))),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Reessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1A56CC),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    if (!hasSearched) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.route_rounded, size: 72, color: Color(0xFFB6C2D3)),
            SizedBox(height: 12),
            Text(
              'Ou souhaitez-vous aller ?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF0D1624)),
            ),
          ],
        ),
      );
    }

    if (results.isEmpty) {
      return const Center(
        child: Text(
          'Aucun resultat',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0D1624)),
        ),
      );
    }

    return Column(
      children: [
        if (showMapAfterSearch)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onMapTap,
                icon: const Icon(Icons.map_rounded),
                label: const Text('Afficher la carte'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F6E56),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 24),
            itemCount: results.length,
            separatorBuilder: (_, __) => const Padding(
              padding: EdgeInsets.symmetric(horizontal: 10),
              child: Divider(height: 14, color: Color(0x1A000000)),
            ),
            itemBuilder: (_, i) => Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 10,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: TripCard(trip: results[i], onTap: () => onTripTap(results[i])),
            ),
          ),
        ),
      ],
    );
  }
}
