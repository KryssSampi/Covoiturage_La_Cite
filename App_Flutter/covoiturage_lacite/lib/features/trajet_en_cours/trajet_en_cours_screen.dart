// ============================================================
// lib/features/trajet_en_cours/trajet_en_cours_screen.dart
// Écran principal « Trajet en cours »
// Miroir de TrajetEnCoursPage.tsx — route /trajet-en-cours/:id
// ============================================================

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/services/api_service.dart';
import 'models/trajet_en_cours_models.dart';
import 'services/trajet_en_cours_service.dart';
import 'widgets/trajet_map_widget.dart';
import 'widgets/progression_section.dart';
import 'widgets/trip_info_panel.dart';
import 'widgets/trajet_header_card.dart';
import 'widgets/evaluation_sheet.dart';
import 'widgets/trajet_modals.dart';
import 'widgets/action_bar_widget.dart';

class TrajetEnCoursScreen extends StatefulWidget {
  const TrajetEnCoursScreen({super.key, required this.tripId});

  final String tripId;

  @override
  State<TrajetEnCoursScreen> createState() => _TrajetEnCoursScreenState();
}

class _TrajetEnCoursScreenState extends State<TrajetEnCoursScreen> {
  late final TrajetEnCoursService _service;

  // État de chargement
  bool _isLoading = true;
  String? _error;
  TrajetEnCoursDto? _data;

  // Polling position conducteur
  Timer? _positionTimer;
  DriverPositionDto? _driverPosition;

  // Progression simulation (élapse)
  Timer? _elapsedTimer;
  int _elapsedSeconds = 0;

  // Rôle utilisateur
  bool _isDriver = false;
  String _currentUserId = '';

  // Déjà évalués
  List<String> _alreadyReviewedIds = [];

  // Modales
  bool _showCancelWarning = false;
  bool _showTripCompleted = false;

  // Toast
  ({String message, bool isSuccess})? _toast;

  @override
  void initState() {
    super.initState();
    _service = TrajetEnCoursService(ApiService.instance);
    _initScreen();
  }

  @override
  void dispose() {
    _positionTimer?.cancel();
    _elapsedTimer?.cancel();
    super.dispose();
  }

  Future<void> _initScreen() async {
    // Récupérer l'userId depuis les prefs
    final prefs = await SharedPreferences.getInstance();
    _currentUserId = prefs.getString('userId') ?? '';

    await _loadTrip();
  }

  Future<void> _loadTrip() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final data = await _service.getLive(widget.tripId);
      if (!mounted) return;

      // Déterminer le rôle
      _isDriver = _currentUserId == data.trip.driverId;

      // Charger les avis déjà soumis
      if (_currentUserId.isNotEmpty) {
        _alreadyReviewedIds = await _service.getAlreadyReviewedIds(widget.tripId, _currentUserId);
      }

      // Vérifier si le trajet est terminé
      final String status = data.trip.status.toLowerCase();
      final bool isCompleted = status.contains('completed') || status.contains('done');

      setState(() {
        _data = data;
        _isLoading = false;
        if (data.driverPosition != null) {
          _driverPosition = data.driverPosition;
        }
      });

      _startPolling();
      _startElapsedTimer();

      // Si trajet déjà terminé → afficher la modale d'évaluation
      if (isCompleted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          setState(() => _showTripCompleted = true);
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _startPolling() {
    _positionTimer?.cancel();
    _positionTimer = Timer.periodic(const Duration(seconds: 10), (_) async {
      final pos = await _service.getDriverPosition(widget.tripId);
      if (mounted && pos != null) setState(() => _driverPosition = pos);
    });
  }

  void _startElapsedTimer() {
    _elapsedTimer?.cancel();
    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _elapsedSeconds++);
    });
  }

  void _showToast(String message, {bool isSuccess = true}) {
    setState(() => _toast = (message: message, isSuccess: isSuccess));
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _toast = null);
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  Future<void> _handleCompleteTrip() async {
    try {
      await _service.completeTrip(widget.tripId);
      if (!mounted) return;
      _showToast('Trajet terminé avec succès.');
      setState(() => _showTripCompleted = true);
    } catch (e) {
      _showToast('Erreur lors de la fin du trajet.', isSuccess: false);
    }
  }

  Future<void> _handleCancelTrip() async {
    setState(() => _showCancelWarning = false);
    try {
      await _service.cancelTrip(widget.tripId);
      if (!mounted) return;
      _showToast('Trajet annulé.', isSuccess: false);
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) context.pop();
    } catch (e) {
      _showToast('Erreur lors de l\'annulation.', isSuccess: false);
    }
  }

  void _handleCallDriver() {
    final trip = _data?.trip;
    if (trip == null) return;
    _showToast('Appel en cours vers ${trip.driver?.firstName ?? 'le conducteur'}…');
    // Pour un vrai appel, utiliser url_launcher :
    // launchUrl(Uri.parse('tel:+1xxxxxxxxxx'));
  }

  Future<void> _handleReviewSubmit({
    required int rating,
    required String comment,
    required String revieweeId,
    required String reservationId,
  }) async {
    final trip = _data?.trip;
    if (trip == null) return;

    final dto = ReviewSubmitDto(
      tripId: trip.id,
      reservationId: reservationId,
      reviewerId: _currentUserId,
      revieweeId: revieweeId,
      revieweeRole: _isDriver ? 'passenger' : 'driver',
      rating: rating,
      comment: comment,
    );

    await _service.submitReview(dto);
    if (!mounted) return;
    _showToast('✓ Évaluation envoyée — Merci !');
  }

  void _showEvaluationSheet() {
    final trip = _data?.trip;
    if (trip == null) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: EvaluationSheet(
          trip: trip,
          isDriver: _isDriver,
          passengers: _data?.passengers ?? [],
          alreadyReviewedIds: _alreadyReviewedIds,
          onSubmit: ({required int rating, required String comment, required String revieweeId, required String reservationId}) =>
              _handleReviewSubmit(rating: rating, comment: comment, revieweeId: revieweeId, reservationId: reservationId),
          onClose: () {
            Navigator.pop(context);
            _alreadyReviewedIds = [..._alreadyReviewedIds]; // force rebuild
          },
        ),
      ),
    );
  }

  // ── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFF0F4FB),
        body: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: Color(0xFF08316E)),
              SizedBox(height: 16),
              Text('Chargement du trajet…', style: TextStyle(fontSize: 14, color: Color(0xFF7A879A))),
            ],
          ),
        ),
      );
    }

    if (_error != null || _data == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF0F4FB),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Color(0xFFe03050)),
                const SizedBox(height: 16),
                Text(_error ?? 'Trajet introuvable.', textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF7A879A))),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _loadTrip,
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF08316E)),
                  child: const Text('Réessayer', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final TrajetResponseDto trip = _data!.trip;
    final List<TrajetPassengerDto> passengers = _data!.passengers;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F4FB),
      body: Stack(
        children: [
          // ── Contenu principal scrollable ─────────────────────────────
          Column(
            children: [
              // Header (non scrollable)
              TrajetHeaderCard(
                trip: trip,
                isDriver: _isDriver,
                onCompleteTrip: () {
                  if (_isDriver) showDialog(context: context, builder: (_) => _ConfirmCompleteDialog(onConfirm: _handleCompleteTrip));
                },
                onCancelTrip: () => setState(() => _showCancelWarning = true),
                onCallDriver: _handleCallDriver,
              ),
              // Contenu scrollable
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _loadTrip,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ── Carte ─────────────────────────────────────
                        TrajetMapWidget(
                          trip: trip,
                          driverPosition: _driverPosition,
                          height: 280,
                        ),
                        const SizedBox(height: 14),
                        // ── Progression ───────────────────────────────
                        ProgressionSection(
                          trip: trip,
                          driverPosition: _driverPosition,
                          elapsedSeconds: _elapsedSeconds,
                        ),
                        const SizedBox(height: 14),
                        // ── Informations trajet ───────────────────────
                        TripInfoPanel(
                          trip: trip,
                          isDriver: _isDriver,
                          passengers: passengers,
                        ),
                        const SizedBox(height: 14),
                      ],
                    ),
                  ),
                ),
              ),
              // Action bar (fixe en bas)
              ActionBarWidget(
                trip: trip,
                isDriver: _isDriver,
                tripId: widget.tripId,
                onShowEvaluation: _showEvaluationSheet,
                onShowSignalement: () => _showToast('Fonctionnalité de signalement — utiliser la version web pour plus de détails.', isSuccess: false),
              ),
            ],
          ),
          // ── Modales ──────────────────────────────────────────────────
          if (_showCancelWarning)
            _ModalOverlay(
              child: CancelWarningModal(
                onClose: () => setState(() => _showCancelWarning = false),
                onConfirm: _handleCancelTrip,
              ),
            ),
          if (_showTripCompleted)
            _ModalOverlay(
              child: TripCompletedModal(
                isDriver: _isDriver,
                onOk: () {
                  setState(() => _showTripCompleted = false);
                  _showEvaluationSheet();
                },
              ),
            ),
          // ── Toast ────────────────────────────────────────────────────
          if (_toast != null)
            Positioned(
              bottom: 120,
              left: 20,
              right: 20,
              child: FloatingToast(
                message: _toast!.message,
                isSuccess: _toast!.isSuccess,
                onDismiss: () => setState(() => _toast = null),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Overlay de fond pour les modales ────────────────────────────────────────

class _ModalOverlay extends StatelessWidget {
  const _ModalOverlay({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      child: Center(child: Padding(padding: const EdgeInsets.all(24), child: child)),
    );
  }
}

// ── Dialog confirmation complétion ──────────────────────────────────────────

class _ConfirmCompleteDialog extends StatelessWidget {
  const _ConfirmCompleteDialog({required this.onConfirm});
  final VoidCallback onConfirm;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Confirmer la fin du trajet', style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700)),
      content: const Text('Êtes-vous sûr de vouloir marquer ce trajet comme terminé ?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            onConfirm();
          },
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0aad6a)),
          child: const Text('Terminer', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
