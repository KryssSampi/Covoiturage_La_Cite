import 'reserve_button.dart';
// ============================================================
// lib/features/trip/published_trip_screen.dart
// Vue détail d'un trajet publié — Version Mobile Flutter
// Miroir fidèle du PublishedTripView web
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../core/services/api_service.dart';
import '../../core/services/trip_service.dart';
import '../../core/models/trip.dart';

// ─────────────────────────────────────────────────────────────
// RÔLE DU VIEWER
// ─────────────────────────────────────────────────────────────
enum PTViewerRole { passenger, driverOwner, admin }

enum PTReservationStatus {
  none,
  pending,
  confirmed,
  refused,
  cancelled,
  inProgress,
  completed,
}

// ─────────────────────────────────────────────────────────────
// ÉCRAN PRINCIPAL
// ─────────────────────────────────────────────────────────────
class PublishedTripScreen extends StatefulWidget {
  const PublishedTripScreen({
    super.key,
    required this.tripService,
    this.trip,
    this.tripId,
    this.initialData,
    this.viewerRole = PTViewerRole.passenger,
    this.existingReservationStatus = PTReservationStatus.none,
    this.source,
    this.sourceStatus,
    this.reservationId,
  }) : assert(trip != null || tripId != null || initialData != null);

  final TripService tripService;
  final Trip? trip;
  final String? tripId;
  final Map<String, dynamic>? initialData;
  final PTViewerRole viewerRole;
  final PTReservationStatus existingReservationStatus;
  final String? source;
  final String? sourceStatus;
  final String? reservationId;

  @override
  State<PublishedTripScreen> createState() => _PublishedTripScreenState();
}

class _PublishedTripScreenState extends State<PublishedTripScreen>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  Trip? _trip;
  Map<String, dynamic>? _raw;
  bool _isLoading = true;
  bool _isReserving = false;
  bool _showMapExpanded = false;
  bool _showConfirmModal = false;
  bool _showCancelModal = false;
  String? _errorMsg;
  PTReservationStatus _reservationStatus = PTReservationStatus.none;
  bool _showSuccessToast = false;
  bool _showErrorToast = false;
  String _toastMsg = '';
  late final TabController _detailTabCtrl;

  @override
  void initState() {
    super.initState();
    _detailTabCtrl = TabController(length: 3, vsync: this);
    _reservationStatus = widget.existingReservationStatus;
    WidgetsBinding.instance.addObserver(this);
    _initData();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _detailTabCtrl.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Pas de rechargement nécessaire ici, l'état est déjà en mémoire
  }

  void _initData() {
    if (widget.initialData != null) {
      _raw = Map.from(widget.initialData!);
      try {
        _trip = Trip.fromJson(_raw!);
        _isLoading = false;
      } catch (_) {}
    }
    if (widget.trip != null) {
      _trip = widget.trip;
      _isLoading = false;
    }
    if (widget.tripId != null && widget.tripId!.isNotEmpty) {
      _loadTrip(showLoader: _trip == null);
    }
    // Si on a déjà les données, on n'affiche pas le loader
    if (!_isLoading && mounted) setState(() {});
  }

  Future<void> _loadTrip({bool showLoader = true}) async {
    if (widget.tripId == null) return;
    if (showLoader && mounted) {
      setState(() {
        _isLoading = true;
        _errorMsg = null;
      });
    }
    try {
      final raw = await widget.tripService.getTripPayloadById(widget.tripId!);
      final t = Trip.fromJson(raw);
      if (!mounted) return;
      setState(() {
        _raw = raw;
        _trip = t;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _errorMsg = 'Impossible de charger le trajet.';
        _isLoading = false;
      });
    }
  }

  Future<void> _reserve() async {
    if (_trip == null || _isReserving) return;
    setState(() => _isReserving = true);
    try {
      await widget.tripService.createReservation(tripId: _trip!.id);
      if (!mounted) return;
      setState(() {
        _reservationStatus = PTReservationStatus.pending;
        _showSuccessToast = true;
        _toastMsg = 'Demande envoyee ! Le conducteur vous repondra bientot.';
      });
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) setState(() => _showSuccessToast = false);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _showErrorToast = true;
        _toastMsg = 'Erreur lors de la reservation. Reessayez.';
      });
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) setState(() => _showErrorToast = false);
    } finally {
      if (mounted) {
        setState(() {
          _isReserving = false;
          _showConfirmModal = false;
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MAPPING ÉTAT DU BOUTON — Logique correcte miroir du web
  // ─────────────────────────────────────────────────────────────
  ReserveButtonState get _reserveButtonState {
    // 1. Source contextuelle "reservation" (arrivée depuis ReservationCard)
    if (widget.source == 'reservation') {
      switch (widget.sourceStatus) {
        case 'confirmed':
          return ReserveButtonState(
              ReserveButtonStateKind.reservationConfirmed);
        case 'in-progress':
        case 'in_progress':
          return ReserveButtonState(
              ReserveButtonStateKind.reservationInProgress);
        case 'cancelled':
          return ReserveButtonState(
              ReserveButtonStateKind.reservationCancelled);
        case 'pending':
          return ReserveButtonState(ReserveButtonStateKind.reservationPending);
        case 'completed':
          return ReserveButtonState(
              ReserveButtonStateKind.reservationCompleted);
        case 'rejected':
          return ReserveButtonState(ReserveButtonStateKind.reservationRejected);
        case 'imminent':
          return ReserveButtonState(ReserveButtonStateKind.reservationImminent);
        default:
          return ReserveButtonState(ReserveButtonStateKind.reserve);
      }
    }

    // 2. Source contextuelle "publishedtrip" (arrivée depuis TripCard)
    if (widget.source == 'publishedtrip') {
      switch (widget.sourceStatus) {
        case 'published':
          return ReserveButtonState(ReserveButtonStateKind.tripPublished);
        case 'full':
          return ReserveButtonState(ReserveButtonStateKind.tripFull);
        case 'confirmed':
          return ReserveButtonState(ReserveButtonStateKind.tripConfirmed);
        case 'in-progress':
        case 'in_progress':
          return ReserveButtonState(ReserveButtonStateKind.tripInProgress);
        case 'completed':
          return ReserveButtonState(ReserveButtonStateKind.tripCompleted);
        case 'cancelled':
          return ReserveButtonState(ReserveButtonStateKind.tripCancelled);
        case 'imminent':
          return ReserveButtonState(ReserveButtonStateKind.tripImminent);
        case 'no-show':
          return ReserveButtonState(ReserveButtonStateKind.tripNoShow);
        default:
          return ReserveButtonState(ReserveButtonStateKind.tripPublished);
      }
    }

    // 3. Conducteur propriétaire du trajet → "Gérer les demandes"
    if (widget.viewerRole == PTViewerRole.driverOwner) {
      return ReserveButtonState(ReserveButtonStateKind.manage);
    }

    // 4. Admin → lecture seule, bouton invisible
    if (widget.viewerRole == PTViewerRole.admin) {
      return ReserveButtonState(ReserveButtonStateKind.readonly);
    }

    // 5. Trajet complet
    if ((_trip?.availableSeats ?? 1) == 0) {
      return ReserveButtonState(ReserveButtonStateKind.full);
    }

    // 6. Statut de réservation du passager (modifiable par interaction)
    switch (_reservationStatus) {
      case PTReservationStatus.pending:
        return ReserveButtonState(ReserveButtonStateKind.pending);
      case PTReservationStatus.confirmed:
        return ReserveButtonState(ReserveButtonStateKind.confirmed);
      case PTReservationStatus.refused:
        return ReserveButtonState(ReserveButtonStateKind.cooldown,
            hoursLeft: 24);
      case PTReservationStatus.cancelled:
        return ReserveButtonState(ReserveButtonStateKind.reserve);
      case PTReservationStatus.inProgress:
        return ReserveButtonState(ReserveButtonStateKind.reservationInProgress);
      case PTReservationStatus.completed:
        return ReserveButtonState(ReserveButtonStateKind.reservationCompleted);
      case PTReservationStatus.none:
        return ReserveButtonState(ReserveButtonStateKind.reserve);
    }
  }

  bool get _canShowCancelBtn {
    return widget.viewerRole == PTViewerRole.passenger &&
        (_reservationStatus == PTReservationStatus.pending ||
            _reservationStatus == PTReservationStatus.confirmed);
  }

  bool get _canShowMessageBtn {
    if (_reservationStatus == PTReservationStatus.confirmed ||
        _reservationStatus == PTReservationStatus.inProgress) {
      return true;
    }
    if (widget.source == 'reservation') {
      final s = widget.sourceStatus ?? '';
      return s == 'confirmed' ||
          s == 'in-progress' ||
          s == 'in_progress' ||
          s == 'imminent';
    }
    return false;
  }

  bool get _canShowSosBtn {
    final s = widget.sourceStatus ?? '';
    return widget.source == 'reservation' &&
        (s == 'in-progress' || s == 'in_progress');
  }

  Future<void> _openTripTracking(Trip t, {bool tryStart = false}) async {
    if (widget.reservationId != null && widget.reservationId!.isNotEmpty) {
      try {
        await ApiService.instance.patch(
          '/api/reservations/${widget.reservationId}/boarding/passenger',
          {},
        );
      } catch (_) {
        // Best-effort only.
      }
    }

    if (tryStart) {
      try {
        await ApiService.instance.patch('/api/trips/${t.id}/start', {});
      } catch (_) {
        // Best-effort: passenger/no-rights can still access tracking screen.
      }
    }
    if (!mounted) return;
    context.push('/trajet-en-cours/${t.id}');
  }

  // ── BUILD ──────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF0F4F8),
        body:
            Center(child: CircularProgressIndicator(color: Color(0xFF08316E))),
      );
    }
    if (_errorMsg != null) {
      return _ErrorView(message: _errorMsg!, onRetry: _loadTrip);
    }
    final t = _trip!;
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _buildMapHero(t)),
              SliverToBoxAdapter(child: _buildSummaryCard(t)),
              SliverToBoxAdapter(child: _buildDetailsSection(t)),
              const SliverToBoxAdapter(child: SizedBox(height: 120)),
            ],
          ),
          // Sticky bottom
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildStickyBottom(t),
          ),
          // Modals
          if (_showConfirmModal) _buildConfirmModal(t),
          if (_showCancelModal) _buildCancelModal(),
          // Toasts
          if (_showSuccessToast || _showErrorToast) _buildToast(),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAP HERO
  // ─────────────────────────────────────────────────────────────
  Widget _buildMapHero(Trip t) {
    return GestureDetector(
      onTap: () => setState(() => _showMapExpanded = !_showMapExpanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 350),
        height: _showMapExpanded ? 300 : 240,
        child: Stack(
          fit: StackFit.expand,
          children: [
            _MapPlaceholder(
              from: t.departureLabel,
              to: t.arrivalLabel,
              polyline: _extractPolyline(_raw),
            ),
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                height: 100,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.black45, Colors.transparent],
                  ),
                ),
              ),
            ),
            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              left: 12,
              child: _CircleIconBtn(
                icon: Icons.arrow_back,
                onTap: () => context.pop(),
                bg: Colors.black.withOpacity(0.45),
              ),
            ),
            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              right: 12,
              child: _CircleIconBtn(
                icon:
                    _showMapExpanded ? Icons.fullscreen_exit : Icons.fullscreen,
                onTap: () =>
                    setState(() => _showMapExpanded = !_showMapExpanded),
                bg: Colors.black.withOpacity(0.45),
              ),
            ),
            Positioned(
              bottom: 14,
              right: 14,
              child: _MetaBadge(
                label:
                    '${t.estimatedDurationMin} min - ${t.estimatedDistanceKm.toStringAsFixed(1)} km',
              ),
            ),
            Positioned(
              bottom: 14,
              left: 14,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _RouteLabelChip(label: t.departureLabel, isDep: true),
                  const SizedBox(height: 4),
                  _RouteLabelChip(label: t.arrivalLabel, isDep: false),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY CARD
  // ─────────────────────────────────────────────────────────────
  Widget _buildSummaryCard(Trip t) {
    return Transform.translate(
      offset: const Offset(0, -12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(
                  color: Color(0x14000000),
                  blurRadius: 20,
                  offset: Offset(0, 6)),
            ],
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                child: Row(
                  children: [
                    _DriverAvatar(name: t.driverName, url: t.driverAvatarUrl),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(t.driverName,
                              style: GoogleFonts.sora(
                                  fontSize: 15, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.star,
                                  size: 12, color: Color(0xFFF59E0B)),
                              const SizedBox(width: 3),
                              Text(
                                '${t.driverRating.toStringAsFixed(1)} - ${t.driverTripCount} trajets',
                                style: GoogleFonts.dmSans(
                                    fontSize: 12,
                                    color: const Color(0xFF7A879A)),
                              ),
                            ],
                          ),
                          if (t.vehicleModel.isNotEmpty)
                            Text(
                              '${t.vehicleModel} - ${t.vehicleColor}',
                              style: GoogleFonts.dmSans(
                                  fontSize: 11, color: const Color(0xFF8A95A8)),
                            ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${widget.viewerRole == PTViewerRole.driverOwner ? t.pricePerSeat : t.passengerPrice}\$',
                          style: GoogleFonts.sora(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF08316E),
                          ),
                        ),
                        Text('/ passager',
                            style: GoogleFonts.dmSans(
                                fontSize: 10, color: const Color(0xFF7A879A))),
                      ],
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0x12000000)),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                child: Row(
                  children: [
                    _MetaCell(label: 'Date', value: t.departureDate),
                    _MetaCell(label: 'Depart', value: t.departureTime),
                    _MetaCell(
                        label: 'Duree', value: '${t.estimatedDurationMin} min'),
                    _MetaCell(
                      label: 'Places',
                      value: '${t.availableSeats}/${t.totalSeats}',
                      valueColor: t.availableSeats == 0
                          ? const Color(0xFFE24B4A)
                          : const Color(0xFF0F6E56),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0x12000000)),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
                child: Row(
                  children: [
                    const Icon(Icons.payment,
                        size: 14, color: Color(0xFF8A95A8)),
                    const SizedBox(width: 6),
                    Text(
                      t.paymentMethod == 'Cash'
                          ? 'Argent comptant'
                          : 'Virement Interac',
                      style: GoogleFonts.dmSans(
                          fontSize: 13, color: const Color(0xFF545D6E)),
                    ),
                    const Spacer(),
                    if (t.tripType == 'recurrent')
                      _TagChip(
                        label: 'Recurrent',
                        bg: const Color(0xFFE8F0FE),
                        fg: const Color(0xFF08316E),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // DETAILS
  // ─────────────────────────────────────────────────────────────
  Widget _buildDetailsSection(Trip t) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Details du trajet',
            style: GoogleFonts.sora(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF08316E),
            ),
          ),
          const SizedBox(height: 10),
          Container(
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0x12000000)),
            ),
            child: TabBar(
              controller: _detailTabCtrl,
              labelColor: Colors.white,
              unselectedLabelColor: const Color(0xFF7A879A),
              indicator: BoxDecoration(
                color: const Color(0xFF08316E),
                borderRadius: BorderRadius.circular(10),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelStyle:
                  GoogleFonts.sora(fontSize: 11, fontWeight: FontWeight.w700),
              unselectedLabelStyle: GoogleFonts.sora(fontSize: 11),
              tabs: const [
                Tab(text: 'Points'),
                Tab(text: 'Preferences'),
                Tab(text: 'Statut'),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: TabBarView(
              controller: _detailTabCtrl,
              children: [
                _PointsTab(trip: t, raw: _raw),
                _PreferencesTab(trip: t),
                _StatusTab(trip: t, raw: _raw),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STICKY BOTTOM — Stack de boutons comme sur le web
  // ─────────────────────────────────────────────────────────────
  Widget _buildStickyBottom(Trip t) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(
        16,
        12,
        16,
        MediaQuery.of(context).padding.bottom + 12,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Ligne principale: bouton réserver + actions secondaires
          Row(
            children: [
              // Bouton message (si confirmé)
              if (_canShowMessageBtn) ...[
                _CircleIconBtn(
                  icon: Icons.chat_bubble_outline,
                  onTap: () => context.push('/chat/${t.id}'),
                  bg: const Color(0xFFEEF0F5),
                  iconColor: const Color(0xFF08316E),
                ),
                const SizedBox(width: 10),
              ],
              // Bouton SOS (en cours)
              if (_canShowSosBtn) ...[
                _CircleIconBtn(
                  icon: Icons.sos,
                  onTap: () => _triggerSOS(t),
                  bg: const Color(0xFFE24B4A),
                  iconColor: Colors.white,
                ),
                const SizedBox(width: 10),
              ],
              // Bouton principal (ReserveButton)
              Expanded(
                child: ReserveButton(
                  state: _reserveButtonState,
                  tripId: t.id,
                  onReserveClick: _isReserving
                      ? null
                      : () => setState(() => _showConfirmModal = true),
                  onFollowClick: () => _openTripTracking(t),
                  onManageClick: () => context.push('/reservations'),
                  onStartTripClick: () => _openTripTracking(t, tryStart: true),
                ),
              ),
              // Bouton annuler (si passager avec réservation active)
              if (_canShowCancelBtn) ...[
                const SizedBox(width: 10),
                _CircleIconBtn(
                  icon: Icons.cancel_outlined,
                  onTap: () => setState(() => _showCancelModal = true),
                  bg: const Color(0xFFFCEBEB),
                  iconColor: const Color(0xFFE24B4A),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _triggerSOS(Trip t) async {
    await ApiService.instance.post('/api/sos', {'tripId': t.id});
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Alerte SOS envoyee aux administrateurs'),
        backgroundColor: Color(0xFFE24B4A),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MODALS
  // ─────────────────────────────────────────────────────────────
  Widget _buildConfirmModal(Trip t) {
    return _ModalOverlay(
      onDismiss: () => setState(() => _showConfirmModal = false),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ModalHeader(
            title: 'Confirmer la reservation',
            onClose: () => setState(() => _showConfirmModal = false),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  children: [
                    _DriverAvatar(
                        name: t.driverName, url: t.driverAvatarUrl, size: 40),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t.driverName,
                            style: GoogleFonts.sora(
                                fontSize: 14, fontWeight: FontWeight.w700)),
                        Row(
                          children: [
                            const Icon(Icons.star,
                                size: 11, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 2),
                            Text(
                              '${t.driverRating.toStringAsFixed(1)} - ${t.driverTripCount} trajets',
                              style: GoogleFonts.dmSans(
                                  fontSize: 12, color: const Color(0xFF7A879A)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F9FC),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
                      _ModalRow(
                        icon: Icons.calendar_today,
                        label: 'Date',
                        value: '${t.departureDate} a ${t.departureTime}',
                      ),
                      const SizedBox(height: 8),
                      _ModalRow(
                          icon: Icons.place,
                          label: 'De',
                          value: t.departureLabel),
                      const SizedBox(height: 8),
                      _ModalRow(
                          icon: Icons.flag, label: 'A', value: t.arrivalLabel),
                      const SizedBox(height: 8),
                      _ModalRow(
                        icon: Icons.attach_money,
                        label: 'Prix',
                        value:
                            '${t.passengerPrice.toStringAsFixed(2)} \$ (frais inclus)',
                      ),
                      const SizedBox(height: 8),
                      _ModalRow(
                        icon: Icons.payment,
                        label: 'Paiement',
                        value: t.paymentMethod == 'Cash'
                            ? 'Argent comptant'
                            : 'Virement Interac',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Votre demande sera envoyee au conducteur pour approbation.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.dmSans(
                      fontSize: 12, color: const Color(0xFF7A879A)),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _showConfirmModal = false),
                    child: _GhostBtn(label: 'Annuler'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: GestureDetector(
                    onTap: _reserve,
                    child:
                        _FilledBtn(label: 'Confirmer', isLoading: _isReserving),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCancelModal() {
    String? getReservationId() {
      if (widget.reservationId != null && widget.reservationId!.isNotEmpty) {
        return widget.reservationId;
      }
      final fromData = widget.initialData?['reservationId']?.toString();
      if (fromData != null && fromData.isNotEmpty) return fromData;
      final res = widget.initialData?['reservation'];
      if (res is Map<String, dynamic>) {
        final id = res['id']?.toString();
        if (id != null && id.isNotEmpty) return id;
      }
      return null;
    }

    return _ModalOverlay(
      onDismiss: () => setState(() => _showCancelModal = false),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ModalHeader(
            title: "Confirmer l'annulation",
            onClose: () => setState(() => _showCancelModal = false),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFCEBEB),
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: const Icon(Icons.warning_amber_outlined,
                      size: 28, color: Color(0xFFE24B4A)),
                ),
                const SizedBox(height: 14),
                Text(
                  'Etes-vous sur de vouloir annuler ?',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.sora(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF08316E),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Cette action est irreversible. Des frais d\'annulation peuvent s\'appliquer.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.dmSans(
                      fontSize: 13, color: const Color(0xFF7A879A)),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _showCancelModal = false),
                    child: _GhostBtn(label: 'Non, garder'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () async {
                      setState(() => _showCancelModal = false);
                      final reservationId = getReservationId();
                      if (reservationId == null || reservationId.isEmpty) {
                        setState(() {
                          _showErrorToast = true;
                          _toastMsg =
                              'Impossible de trouver l\'ID de reservation.';
                        });
                        await Future.delayed(const Duration(seconds: 3));
                        if (mounted) setState(() => _showErrorToast = false);
                        return;
                      }
                      try {
                        await widget.tripService
                            .cancelReservation(reservationId, reason: null);
                        if (!mounted) return;
                        setState(() {
                          _reservationStatus = PTReservationStatus.cancelled;
                          _showSuccessToast = true;
                          _toastMsg = 'Reservation annulee.';
                        });
                        await Future.delayed(const Duration(seconds: 3));
                        if (mounted) setState(() => _showSuccessToast = false);
                      } catch (e) {
                        if (!mounted) return;
                        setState(() {
                          _showErrorToast = true;
                          _toastMsg = 'Erreur lors de l\'annulation.';
                        });
                        await Future.delayed(const Duration(seconds: 3));
                        if (mounted) setState(() => _showErrorToast = false);
                      }
                    },
                    child: Container(
                      height: 50,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE24B4A),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Oui, annuler',
                        style: GoogleFonts.sora(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToast() {
    final isSuccess = _showSuccessToast;
    return Positioned(
      bottom: 100,
      left: 20,
      right: 20,
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: const Duration(milliseconds: 300),
        builder: (_, v, child) => Transform.translate(
          offset: Offset(0, (1 - v) * 20),
          child: Opacity(opacity: v, child: child),
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color:
                isSuccess ? const Color(0xFF0F6E56) : const Color(0xFFE24B4A),
            borderRadius: BorderRadius.circular(14),
            boxShadow: const [
              BoxShadow(
                  color: Colors.black26, blurRadius: 16, offset: Offset(0, 4)),
            ],
          ),
          child: Row(
            children: [
              Icon(
                isSuccess ? Icons.check_circle_outline : Icons.error_outline,
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
                    color: Colors.white,
                  ),
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
// TABS
// ─────────────────────────────────────────────────────────────

class _PointsTab extends StatelessWidget {
  const _PointsTab({required this.trip, this.raw});
  final Trip trip;
  final Map<String, dynamic>? raw;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _PointCard(
            type: 'Depart',
            label: trip.departureLabel,
            dotColor: const Color(0xFF08316E),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _PointCard(
            type: 'Arrivee',
            label: trip.arrivalLabel,
            dotColor: const Color(0xFFE24B4A),
          ),
        ),
      ],
    );
  }
}

class _PointCard extends StatelessWidget {
  const _PointCard(
      {required this.type, required this.label, required this.dotColor});
  final String type;
  final String label;
  final Color dotColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0x12000000)),
        boxShadow: const [
          BoxShadow(
              color: Color(0x0A000000), blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration:
                    BoxDecoration(color: dotColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 6),
              Text(
                type.toUpperCase(),
                style: GoogleFonts.sora(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  color: dotColor,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style:
                GoogleFonts.dmSans(fontSize: 13, fontWeight: FontWeight.w600),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _PreferencesTab extends StatelessWidget {
  const _PreferencesTab({required this.trip});
  final Trip trip;

  @override
  Widget build(BuildContext context) {
    final prefs = [
      (trip.baggageAllowed, Icons.luggage_outlined, 'Bagages'),
      (trip.petsAllowed, Icons.pets_outlined, 'Animaux'),
      (trip.smokingAllowed, Icons.smoke_free, 'Fumeur'),
      (trip.musicAllowed, Icons.music_note_outlined, 'Musique'),
      (trip.flexibleItinerary, Icons.map_outlined, 'Flexible'),
    ];
    return GridView.count(
      crossAxisCount: 2,
      childAspectRatio: 3.2,
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      children: prefs
          .map(
            (p) => Container(
              decoration: BoxDecoration(
                color: p.$1 ? const Color(0xFFE1F5EE) : const Color(0xFFFCEBEB),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: p.$1
                      ? const Color(0xFF0F6E56).withOpacity(0.2)
                      : const Color(0xFFE24B4A).withOpacity(0.2),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    p.$1 ? Icons.check_circle : Icons.cancel,
                    size: 14,
                    color: p.$1
                        ? const Color(0xFF0F6E56)
                        : const Color(0xFFE24B4A),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    p.$3,
                    style: GoogleFonts.dmSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: p.$1
                          ? const Color(0xFF0F6E56)
                          : const Color(0xFFE24B4A),
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _StatusTab extends StatelessWidget {
  const _StatusTab({required this.trip, this.raw});
  final Trip trip;
  final Map<String, dynamic>? raw;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0x12000000)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _InfoRow(
              'Type', trip.tripType == 'recurrent' ? 'Recurrent' : 'Unique'),
          _InfoRow(
              'Places', '${trip.availableSeats} dispo. / ${trip.totalSeats}'),
          _InfoRow(
            'Paiement',
            trip.paymentMethod == 'Cash' ? 'Argent comptant' : 'Interac',
          ),
          _InfoRow(
              'Distance', '${trip.estimatedDistanceKm.toStringAsFixed(1)} km'),
          _InfoRow('Duree', '${trip.estimatedDurationMin} min'),
          if (trip.driverNote != null && trip.driverNote!.isNotEmpty)
            _InfoRow('Note', trip.driverNote!),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 72,
            child: Text(
              label,
              style: GoogleFonts.dmSans(
                  fontSize: 12, color: const Color(0xFF7A879A)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.dmSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF0D1624),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// MAP
// ─────────────────────────────────────────────────────────────

class _MapPlaceholder extends StatelessWidget {
  const _MapPlaceholder({
    required this.from,
    required this.to,
    required this.polyline,
  });
  final String from;
  final String to;
  final List<Offset> polyline;

  List<LatLng> _toLatLngList(List<Offset> polyline) {
    return polyline.map((o) => LatLng(o.dy, o.dx)).toList();
  }

  LatLng? _getCenter(List<LatLng> points) {
    if (points.isEmpty) return null;
    double lat = 0, lng = 0;
    for (final p in points) {
      lat += p.latitude;
      lng += p.longitude;
    }
    return LatLng(lat / points.length, lng / points.length);
  }

  @override
  Widget build(BuildContext context) {
    final points = _toLatLngList(polyline);
    final center = _getCenter(points) ?? const LatLng(45.5017, -73.5673);
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: FlutterMap(
        options: MapOptions(
          center: center,
          zoom: 12.0,
          interactiveFlags: InteractiveFlag.pinchZoom | InteractiveFlag.drag,
        ),
        children: [
          TileLayer(
            urlTemplate:
                'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            subdomains: const ['a', 'b', 'c'],
            userAgentPackageName: 'com.example.covoiturage_lacite',
          ),
          if (points.length >= 2)
            PolylineLayer(
              polylines: [
                Polyline(
                  points: points,
                  color: const Color(0xFF08316E),
                  strokeWidth: 5,
                ),
              ],
            ),
          if (points.isNotEmpty)
            MarkerLayer(
              markers: [
                Marker(
                  point: points.first,
                  width: 36,
                  height: 36,
                  child: const Icon(Icons.location_on,
                      color: Color(0xFF08316E), size: 32),
                ),
                if (points.length > 1)
                  Marker(
                    point: points.last,
                    width: 36,
                    height: 36,
                    child: const Icon(Icons.flag,
                        color: Color(0xFFE24B4A), size: 32),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────────────────────

class _CircleIconBtn extends StatelessWidget {
  const _CircleIconBtn({
    required this.icon,
    required this.onTap,
    required this.bg,
    this.iconColor = Colors.white,
  });
  final IconData icon;
  final VoidCallback onTap;
  final Color bg;
  final Color iconColor;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
          child: Icon(icon, size: 20, color: iconColor),
        ),
      );
}

class _MetaBadge extends StatelessWidget {
  const _MetaBadge({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.65),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: GoogleFonts.sora(
              fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
        ),
      );
}

class _RouteLabelChip extends StatelessWidget {
  const _RouteLabelChip({required this.label, required this.isDep});
  final String label;
  final bool isDep;

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: isDep ? Colors.white : const Color(0xFFE24B4A),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            constraints: const BoxConstraints(maxWidth: 140),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              label,
              style: GoogleFonts.dmSans(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
}

class _TagChip extends StatelessWidget {
  const _TagChip({required this.label, required this.bg, required this.fg});
  final String label;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration:
            BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
        child: Text(
          label,
          style: GoogleFonts.sora(
              fontSize: 10, fontWeight: FontWeight.w700, color: fg),
        ),
      );
}

class _MetaCell extends StatelessWidget {
  const _MetaCell({required this.label, required this.value, this.valueColor});
  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: GoogleFonts.dmSans(
                    fontSize: 10, color: const Color(0xFF8A95A8))),
            const SizedBox(height: 2),
            Text(
              value,
              style: GoogleFonts.sora(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: valueColor ?? const Color(0xFF0D1624),
              ),
            ),
          ],
        ),
      );
}

class _DriverAvatar extends StatelessWidget {
  const _DriverAvatar({required this.name, this.url, this.size = 48});
  final String name;
  final String? url;
  final double size;

  @override
  Widget build(BuildContext context) {
    if (url != null && url!.isNotEmpty) {
      return CircleAvatar(
          radius: size / 2, backgroundImage: NetworkImage(url!));
    }
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: const Color(0xFFE8F0FE),
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : '?',
        style: GoogleFonts.sora(
          fontSize: size * 0.38,
          fontWeight: FontWeight.w700,
          color: const Color(0xFF08316E),
        ),
      ),
    );
  }
}

class _ModalOverlay extends StatelessWidget {
  const _ModalOverlay({required this.child, required this.onDismiss});
  final Widget child;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onDismiss,
        child: Container(
          color: Colors.black54,
          child: Center(
            child: GestureDetector(
              onTap: () {},
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [
                    BoxShadow(
                        color: Colors.black26,
                        blurRadius: 24,
                        offset: Offset(0, 8)),
                  ],
                ),
                child: child,
              ),
            ),
          ),
        ),
      );
}

class _ModalHeader extends StatelessWidget {
  const _ModalHeader({required this.title, required this.onClose});
  final String title;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 18, 16, 14),
        child: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.sora(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF08316E),
                ),
              ),
            ),
            GestureDetector(
              onTap: onClose,
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF0F5),
                  borderRadius: BorderRadius.circular(14),
                ),
                child:
                    const Icon(Icons.close, size: 14, color: Color(0xFF545D6E)),
              ),
            ),
          ],
        ),
      );
}

class _ModalRow extends StatelessWidget {
  const _ModalRow(
      {required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 13, color: const Color(0xFF08316E)),
          const SizedBox(width: 8),
          SizedBox(
            width: 70,
            child: Text(
              label,
              style: GoogleFonts.dmSans(
                  fontSize: 12, color: const Color(0xFF7A879A)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.dmSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF0D1624),
              ),
            ),
          ),
        ],
      );
}

class _GhostBtn extends StatelessWidget {
  const _GhostBtn({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Container(
        height: 50,
        decoration: BoxDecoration(
          color: const Color(0xFFEEF0F5),
          borderRadius: BorderRadius.circular(14),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: GoogleFonts.sora(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF545D6E),
          ),
        ),
      );
}

class _FilledBtn extends StatelessWidget {
  const _FilledBtn({required this.label, this.isLoading = false});
  final String label;
  final bool isLoading;

  @override
  Widget build(BuildContext context) => Container(
        height: 50,
        decoration: BoxDecoration(
          color: const Color(0xFF08316E),
          borderRadius: BorderRadius.circular(14),
        ),
        alignment: Alignment.center,
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                    strokeWidth: 2.5, color: Colors.white),
              )
            : Text(
                label,
                style: GoogleFonts.sora(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
      );
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline,
                  size: 48, color: Color(0xFFE24B4A)),
              const SizedBox(height: 12),
              Text(message, textAlign: TextAlign.center),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF08316E)),
                child: const Text('Reessayer'),
              ),
            ],
          ),
        ),
      );
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

List<Offset> _extractPolyline(Map<String, dynamic>? raw) {
  if (raw == null) return [];
  final source = raw['polyline'] ??
      raw['routePolyline'] ??
      raw['waypoints'] ??
      raw['coordinates'];
  if (source is List) {
    return source
        .map<Offset?>((dynamic row) {
          if (row is List && row.length >= 2) {
            final double lat = (row[0] as num?)?.toDouble() ?? 0;
            final double lng = (row[1] as num?)?.toDouble() ?? 0;
            if (lat == 0 && lng == 0) return null;
            return Offset(lng, lat);
          }
          if (row is Map) {
            final Map<dynamic, dynamic> m = row;
            final double lat =
                ((m['lat'] ?? m['latitude']) as num?)?.toDouble() ?? 0;
            final double lng =
                ((m['lng'] ?? m['lon'] ?? m['longitude']) as num?)
                        ?.toDouble() ??
                    0;
            if (lat == 0 && lng == 0) return null;
            return Offset(lng, lat);
          }
          return null;
        })
        .whereType<Offset>()
        .toList();
  }
  return [];
}
