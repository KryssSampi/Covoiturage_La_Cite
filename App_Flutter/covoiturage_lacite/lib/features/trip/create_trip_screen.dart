// ============================================================
// lib/features/trip/create_trip_screen.dart
// Formulaire de création de trajet — Version Mobile Flutter
// Miroir fidèle du CreateTripForm web (Next.js)
// ============================================================

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/services/api_service.dart';

// ─────────────────────────────────────────────────────────────
// MODÈLE — données du formulaire
// ─────────────────────────────────────────────────────────────
class _TripPreferences {
  bool baggageAllowed;
  bool petsAllowed;
  bool smokingAllowed;
  bool musicAllowed;
  bool flexibleItinerary;
  String? driverNote;

  _TripPreferences()
      : baggageAllowed = false,
        petsAllowed = false,
        smokingAllowed = false,
        musicAllowed = false,
        flexibleItinerary = false,
        driverNote = null;
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
        label: j['label'] ?? j['model'] ?? 'Véhicule',
        color: j['color']?.toString() ?? '',
        maxPassengers: (j['maxPassengers'] ?? j['maxSeats'] ?? 4) as int,
      );
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
  late final TabController _tabCtrl;
  final _scrollCtrl = ScrollController();

  // Form state
  final _departureCtrl = TextEditingController();
  final _arrivalCtrl = TextEditingController();
  final _noteCtrl = TextEditingController();
  DateTime _departureDate = DateTime.now().add(const Duration(hours: 1));
  TimeOfDay _departureTime =
      TimeOfDay.fromDateTime(DateTime.now().add(const Duration(hours: 1)));

  String _tripType = 'unique'; // unique | recurrent
  int _availableSeats = 1;
  int _maxPassengers = 4;
  double _pricePerPassenger = 5.0;
  String _paymentMethod = 'cash';
  String? _selectedVehicleId;
  List<_Vehicle> _vehicles = [];
  final _prefs = _TripPreferences();

  // Recurrence
  List<bool> _recurrenceDays = List.filled(7, false);
  DateTime? _recurrenceEndDate;

  // UI state
  bool _isLoadingVehicles = true;
  bool _isSubmitting = false;
  bool _showNoteField = false;
  Map<String, String?> _errors = {};

  // Toast
  bool _showToast = false;
  bool _toastSuccess = false;
  String _toastMsg = '';

  // Tabs: Infos, Véhicule, Préférences, Tarif
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
    _tabCtrl.dispose();
    _scrollCtrl.dispose();
    _departureCtrl.dispose();
    _arrivalCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  void _applyPrefill() {
    final p = widget.prefill;
    if (p == null) return;
    _departureCtrl.text = _firstStr(p, ['departureLabel', 'departureAddress', 'from', 'departureLocation']);
    _arrivalCtrl.text = _firstStr(p, ['arrivalLabel', 'arrivalAddress', 'to', 'arrivalLocation']);
    final price = p['pricePerSeat'] ?? p['pricePerPassenger'] ?? p['price'];
    if (price != null) _pricePerPassenger = (price as num).toDouble();
    final seats = p['availableSeats'] ?? p['seats'];
    if (seats != null) _availableSeats = (seats as num).toInt().clamp(1, 7);
    // Date-time prefill from ISO string
    final dt = p['departureTime'] ?? p['departureDateTime'];
    if (dt != null) {
      final parsed = DateTime.tryParse(dt.toString())?.toLocal();
      if (parsed != null) {
        _departureDate = parsed;
        _departureTime = TimeOfDay.fromDateTime(parsed);
      }
    }
  }

  String _firstStr(Map<String, dynamic> m, List<String> keys) {
    for (final k in keys) {
      final v = m[k]?.toString().trim();
      if (v != null && v.isNotEmpty) return v;
    }
    return '';
  }

  Future<void> _loadVehicles() async {
    setState(() => _isLoadingVehicles = true);
    try {
      final data = await _api.get('/api/vehicles');
      final list = _extractList(data);
      final vehicles = list.whereType<Map<String, dynamic>>().map(_Vehicle.fromJson).toList();
      if (!mounted) return;
      setState(() {
        _vehicles = vehicles;
        if (vehicles.length == 1) {
          _selectedVehicleId = vehicles.first.id;
          _maxPassengers = vehicles.first.maxPassengers;
          _availableSeats = (_availableSeats).clamp(1, _maxPassengers - 1);
        }
        _isLoadingVehicles = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoadingVehicles = false);
    }
  }

  bool _validate() {
    final e = <String, String?>{};
    if (_departureCtrl.text.trim().isEmpty) e['departure'] = 'Requis';
    if (_arrivalCtrl.text.trim().isEmpty) e['arrival'] = 'Requis';
    if (_selectedVehicleId == null && _vehicles.isNotEmpty) e['vehicle'] = 'Sélectionnez un véhicule';
    if (_pricePerPassenger < 1) e['price'] = 'Prix minimum 1 \$';
    setState(() => _errors = e);
    return e.isEmpty;
  }

  Future<void> _submit(bool publish) async {
    if (!_validate()) {
      // Scroll to first error tab
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      final departureDt = DateTime(
        _departureDate.year, _departureDate.month, _departureDate.day,
        _departureTime.hour, _departureTime.minute,
      );
      final body = <String, dynamic>{
        'departureLabel': _departureCtrl.text.trim(),
        'arrivalLabel': _arrivalCtrl.text.trim(),
        'departureAddress': _departureCtrl.text.trim(),
        'arrivalAddress': _arrivalCtrl.text.trim(),
        'departureTime': departureDt.toUtc().toIso8601String(),
        'departureDate': '${departureDt.year}-${_pad(departureDt.month)}-${_pad(departureDt.day)}',
        'vehicleId': _selectedVehicleId,
        'maxPassengers': _maxPassengers,
        'availableSeats': _availableSeats,
        'pricePerPassenger': _pricePerPassenger,
        'paymentMethod': _paymentMethod,
        'tripType': _tripType,
        'status': publish ? 'published' : 'draft',
        'preferences': {
          'baggageAllowed': _prefs.baggageAllowed,
          'petsAllowed': _prefs.petsAllowed,
          'smokingAllowed': _prefs.smokingAllowed,
          'musicAllowed': _prefs.musicAllowed,
          'flexibleItinerary': _prefs.flexibleItinerary,
          'driverNote': _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
        },
        if (_tripType == 'recurrent') ...{
          'recurrenceDays': _recurrenceDays
              .asMap()
              .entries
              .where((e) => e.value)
              .map((e) => e.key)
              .toList(),
          if (_recurrenceEndDate != null)
            'recurrenceEndDate':
                '${_recurrenceEndDate!.year}-${_pad(_recurrenceEndDate!.month)}-${_pad(_recurrenceEndDate!.day)}',
        },
      };
      await _api.post('/api/trips', body);
      if (!mounted) return;
      setState(() {
        _showToast = true;
        _toastSuccess = true;
        _toastMsg = publish ? 'Trajet publié avec succès !' : 'Brouillon sauvegardé.';
      });
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) context.pop();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _showToast = true;
        _toastSuccess = false;
        _toastMsg = 'Erreur : $e';
      });
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  String _pad(int v) => v < 10 ? '0$v' : '$v';

  // ── Date & time pickers ──────────────────────────────────
  Future<void> _pickDate() async {
    final d = await showDatePicker(
      context: context,
      initialDate: _departureDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFF08316E)),
        ),
        child: child!,
      ),
    );
    if (d != null) setState(() => _departureDate = d);
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
    if (t != null) setState(() => _departureTime = t);
  }

  Future<void> _pickEndDate() async {
    final d = await showDatePicker(
      context: context,
      initialDate: _recurrenceEndDate ?? DateTime.now().add(const Duration(days: 30)),
      firstDate: _departureDate,
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFF08316E)),
        ),
        child: child!,
      ),
    );
    if (d != null) setState(() => _recurrenceEndDate = d);
  }

  // ── Build ────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                    style: GoogleFonts.dmSans(
                      fontSize: 12,
                      color: Colors.white70,
                    ),
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
  // TAB 1 — Informations de base
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
              // Départ
              _fieldLabel('Point de départ'),
              _inputField(
                controller: _departureCtrl,
                hint: 'Ex: Campus La Cité, Ottawa',
                prefixIcon: Icons.my_location,
                prefixColor: const Color(0xFF08316E),
                error: _errors['departure'],
              ),
              const SizedBox(height: 12),
              // Arrivée
              _fieldLabel('Point d\'arrivée'),
              _inputField(
                controller: _arrivalCtrl,
                hint: 'Ex: Place d\'Orléans',
                prefixIcon: Icons.location_on,
                prefixColor: const Color(0xFFE24B4A),
                error: _errors['arrival'],
              ),
            ],
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Date et heure de départ',
            icon: Icons.calendar_today_outlined,
            children: [
              LayoutBuilder(
                builder: (context, constraints) {
                  final isSmall = constraints.maxWidth < 350;
                  return isSmall
                      ? Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _fieldLabel('Date'),
                                      _tapField(
                                        value: '${_departureDate.day}/${_departureDate.month}/${_departureDate.year}',
                                        icon: Icons.calendar_today,
                                        onTap: _pickDate,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _fieldLabel('Heure'),
                                      _tapField(
                                        value: _departureTime.format(context),
                                        icon: Icons.access_time,
                                        onTap: _pickTime,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        )
                      : Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _fieldLabel('Date'),
                                  _tapField(
                                    value: '${_departureDate.day}/${_departureDate.month}/${_departureDate.year}',
                                    icon: Icons.calendar_today,
                                    onTap: _pickDate,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _fieldLabel('Heure'),
                                  _tapField(
                                    value: _departureTime.format(context),
                                    icon: Icons.access_time,
                                    onTap: _pickTime,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                },
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
  // TAB 2 — Véhicule & places
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
                const Center(child: CircularProgressIndicator(color: Color(0xFF08316E)))
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
                        _availableSeats = _availableSeats.clamp(1, v.maxPassengers - 1);
                      }),
                      child: _vehicleChip(v, selected: _selectedVehicleId == v.id),
                    ),
                  ),
                ),
                if (_errors['vehicle'] != null)
                  Text(_errors['vehicle']!,
                      style: const TextStyle(color: Color(0xFFE24B4A), fontSize: 11)),
              ],
            ],
          ),
          const SizedBox(height: 14),
          _sectionCard(
            title: 'Places disponibles',
            icon: Icons.event_seat_outlined,
            children: [
              _fieldLabel(
                  'Places offertes aux passagers (max ${(_maxPassengers - 1).clamp(1, 7)})'),
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
  // TAB 3 — Préférences passager
  // ─────────────────────────────────────────────────────────
  Widget _buildPrefsTab() {
    final prefRows = [
      (
        icon: Icons.luggage_outlined,
        label: 'Bagages autorisés',
        get: _prefs.baggageAllowed,
        set: (v) => setState(() => _prefs.baggageAllowed = v),
      ),
      (
        icon: Icons.pets_outlined,
        label: 'Animaux acceptés',
        get: _prefs.petsAllowed,
        set: (v) => setState(() => _prefs.petsAllowed = v),
      ),
      (
        icon: Icons.smoke_free,
        label: 'Fumeur accepté',
        get: _prefs.smokingAllowed,
        set: (v) => setState(() => _prefs.smokingAllowed = v),
      ),
      (
        icon: Icons.music_note_outlined,
        label: 'Musique autorisée',
        get: _prefs.musicAllowed,
        set: (v) => setState(() => _prefs.musicAllowed = v),
      ),
      (
        icon: Icons.map_outlined,
        label: 'Itinéraire flexible',
        get: _prefs.flexibleItinerary,
        set: (v) => setState(() => _prefs.flexibleItinerary = v),
      ),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _sectionCard(
            title: 'Options pour les passagers',
            icon: Icons.tune_outlined,
            children: [
              ...prefRows.map(
                (p) => _prefToggleRow(
                  icon: p.icon,
                  label: p.label,
                  value: p.get,
                  onChanged: (v) => p.set(v),
                ),
              ),
            ],
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
                  decoration: InputDecoration(
                    hintText: 'Ex: Rendez-vous devant l\'entrée principale...',
                    hintStyle: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF8A95A8)),
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
                  child: Text('Supprimer le message',
                      style: GoogleFonts.dmSans(
                          fontSize: 11,
                          color: const Color(0xFFE24B4A),
                          fontWeight: FontWeight.w600)),
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
                      style: const TextStyle(color: Color(0xFFE24B4A), fontSize: 11)),
                ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFE1F5EE),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF0F6E56).withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, size: 14, color: Color(0xFF0F6E56)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Prix affiché aux passagers: ${(_pricePerPassenger * 1.15).toStringAsFixed(2)} \$ (frais 15% inclus)',
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
            children: [
              _paymentSelector(),
            ],
          ),
          const SizedBox(height: 14),
          // Récapitulatif
          _sectionCard(
            title: 'Récapitulatif',
            icon: Icons.summarize_outlined,
            children: [
              _summaryRow('Départ', _departureCtrl.text.isEmpty ? '—' : _departureCtrl.text),
              _summaryRow('Arrivée', _arrivalCtrl.text.isEmpty ? '—' : _arrivalCtrl.text),
              _summaryRow(
                  'Date',
                  '${_departureDate.day}/${_departureDate.month}/${_departureDate.year} '
                      'à ${_departureTime.format(context)}'),
              _summaryRow('Places', '$_availableSeats passager(s)'),
              _summaryRow('Prix', '${_pricePerPassenger.toStringAsFixed(2)} \$ / passager'),
              _summaryRow('Paiement', _paymentMethod == 'cash' ? 'Argent comptant' : 'Virement Interac'),
            ],
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // BOTTOM ACTIONS
  // ─────────────────────────────────────────────────────────
  Widget _buildBottomActions() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
      child: Row(
        children: [
          Expanded(
            child: _outlineBtn(
              label: 'Brouillon',
              icon: Icons.save_outlined,
              isLoading: false,
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
  // COMPOSANTS UI ATOMIQUES
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
          BoxShadow(color: Color(0x0F000000), blurRadius: 8, offset: Offset(0, 2)),
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
        child: Text(label,
            style: GoogleFonts.sora(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF545D6E),
                letterSpacing: 0.3)),
      );

  Widget _inputField({
    required TextEditingController controller,
    required String hint,
    required IconData prefixIcon,
    Color prefixColor = const Color(0xFF08316E),
    String? error,
  }) {
    return TextField(
      controller: controller,
      style: GoogleFonts.dmSans(fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle:
            GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF8A95A8)),
        prefixIcon: Icon(prefixIcon, size: 16, color: prefixColor),
        filled: true,
        fillColor: const Color(0xFFF8F9FC),
        errorText: error,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFD8DBE5))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFD8DBE5))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF08316E))),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
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
                style: GoogleFonts.dmSans(fontSize: 14, color: const Color(0xFF0D1624))),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down, size: 16, color: Color(0xFF8A95A8)),
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
                    color: selected ? const Color(0xFF08316E) : const Color(0xFFD8DBE5),
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
              onTap: () => setState(() => _recurrenceDays[i] = !_recurrenceDays[i]),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 120),
                height: 38,
                decoration: BoxDecoration(
                  color: selected ? const Color(0xFF08316E) : const Color(0xFFF2F5FA),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: selected ? const Color(0xFF08316E) : const Color(0xFFD8DBE5),
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
              color: selected ? const Color(0xFF08316E) : const Color(0xFFEEF0F5),
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
              'Aucun véhicule enregistré. Ajoutez un véhicule dans votre profil.',
              style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF854F0B)),
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
              fontSize: 22, fontWeight: FontWeight.w800, color: const Color(0xFF08316E)),
        ),
        const SizedBox(width: 16),
        _stepBtn(icon: Icons.add, onTap: value < max ? onIncrement : null),
        const SizedBox(width: 12),
        Text('place(s)',
            style: GoogleFonts.dmSans(fontSize: 14, color: const Color(0xFF7A879A))),
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
          color: onTap != null ? const Color(0xFF08316E) : const Color(0xFFEEF0F5),
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
              child: Text(label,
                  style: GoogleFonts.dmSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF0D1624))),
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
              ? () => setState(() => _pricePerPassenger =
                  (_pricePerPassenger - 1).clamp(1, 99))
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
              ? () => setState(() => _pricePerPassenger =
                  (_pricePerPassenger + 1).clamp(1, 99))
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
                color: selected ? const Color(0xFFE8F0FE) : const Color(0xFFF8F9FC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: selected ? const Color(0xFF08316E) : const Color(0xFFD8DBE5),
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
                  Text(m.$2,
                      style: GoogleFonts.dmSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: selected
                              ? const Color(0xFF08316E)
                              : const Color(0xFF3D4A5C))),
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
          color: onTap != null ? const Color(0xFF08316E) : const Color(0xFF8A95A8),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(icon, size: 16, color: Colors.white),
                    const SizedBox(width: 8),
                    Text(label,
                        style: GoogleFonts.sora(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white)),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _outlineBtn({
    required String label,
    required IconData icon,
    required bool isLoading,
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
              Text(label,
                  style: GoogleFonts.sora(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF545D6E))),
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
              BoxShadow(color: Colors.black26, blurRadius: 12, offset: Offset(0, 4)),
            ],
          ),
          child: Row(
            children: [
              Icon(
                _toastSuccess ? Icons.check_circle_outline : Icons.error_outline,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(_toastMsg,
                    style: GoogleFonts.sora(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
List<dynamic> _extractList(dynamic payload) {
  if (payload is List) return payload;
  if (payload is Map<String, dynamic>) {
    final d = payload['data'] ?? payload['items'] ?? payload['results'];
    if (d is List) return d;
  }
  return [];
}
