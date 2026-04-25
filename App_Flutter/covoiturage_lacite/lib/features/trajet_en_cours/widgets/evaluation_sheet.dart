// ============================================================
// lib/features/trajet_en_cours/widgets/evaluation_sheet.dart
// Modale d'évaluation fin de trajet — miroir de TripEndEvalModal.tsx
// ============================================================

import 'package:flutter/material.dart';
import '../models/trajet_en_cours_models.dart';

class EvaluationSheet extends StatefulWidget {
  const EvaluationSheet({
    super.key,
    required this.trip,
    required this.isDriver,
    required this.passengers,
    required this.alreadyReviewedIds,
    required this.onSubmit,
    required this.onClose,
  });

  final TrajetResponseDto trip;
  final bool isDriver;
  final List<TrajetPassengerDto> passengers;
  final List<String> alreadyReviewedIds;
  final Future<void> Function({
    required int rating,
    required String comment,
    required String revieweeId,
    required String reservationId,
  }) onSubmit;
  final VoidCallback onClose;

  @override
  State<EvaluationSheet> createState() => _EvaluationSheetState();
}

class _EvaluationSheetState extends State<EvaluationSheet> {
  int _rating = 0;
  final TextEditingController _commentCtrl = TextEditingController();
  String? _selectedPassengerId;
  bool _isSubmitting = false;
  bool _submitted = false;

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  bool get _canSubmit {
    if (_rating == 0 || _commentCtrl.text.trim().length < 10) return false;
    if (widget.isDriver && _selectedPassengerId == null) return false;
    return true;
  }

  String get _revieweeId {
    if (widget.isDriver) return _selectedPassengerId ?? '';
    return widget.trip.driverId;
  }

  String get _reservationId {
    if (widget.isDriver) {
      final passenger = widget.passengers.firstWhere(
        (p) => p.userId == _selectedPassengerId,
        orElse: () => widget.passengers.first,
      );
      return passenger.reservationId;
    }
    // Pour le passager, prendre la première réservation des passengers
    if (widget.passengers.isNotEmpty) return widget.passengers.first.reservationId;
    return '';
  }

  Future<void> _submit() async {
    if (!_canSubmit || _isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await widget.onSubmit(
        rating: _rating,
        comment: _commentCtrl.text.trim(),
        revieweeId: _revieweeId,
        reservationId: _reservationId,
      );
      if (mounted) setState(() => _submitted = true);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.fromLTRB(24, 12, 24, MediaQuery.of(context).padding.bottom + 20),
      child: _submitted ? _SuccessView(onClose: widget.onClose) : _FormView(
        trip: widget.trip,
        isDriver: widget.isDriver,
        passengers: widget.passengers,
        alreadyReviewedIds: widget.alreadyReviewedIds,
        rating: _rating,
        onRatingChanged: (r) => setState(() => _rating = r),
        commentCtrl: _commentCtrl,
        selectedPassengerId: _selectedPassengerId,
        onPassengerSelected: (id) => setState(() {
          _selectedPassengerId = id;
          _rating = 0;
          _commentCtrl.clear();
        }),
        canSubmit: _canSubmit,
        isSubmitting: _isSubmitting,
        onSubmit: _submit,
        onClose: widget.onClose,
      ),
    );
  }
}

class _FormView extends StatelessWidget {
  const _FormView({
    required this.trip,
    required this.isDriver,
    required this.passengers,
    required this.alreadyReviewedIds,
    required this.rating,
    required this.onRatingChanged,
    required this.commentCtrl,
    required this.selectedPassengerId,
    required this.onPassengerSelected,
    required this.canSubmit,
    required this.isSubmitting,
    required this.onSubmit,
    required this.onClose,
  });

  final TrajetResponseDto trip;
  final bool isDriver;
  final List<TrajetPassengerDto> passengers;
  final List<String> alreadyReviewedIds;
  final int rating;
  final ValueChanged<int> onRatingChanged;
  final TextEditingController commentCtrl;
  final String? selectedPassengerId;
  final ValueChanged<String?> onPassengerSelected;
  final bool canSubmit;
  final bool isSubmitting;
  final VoidCallback onSubmit;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Handle
        Center(
          child: Container(
            width: 40, height: 4,
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(color: const Color(0xFFD8DBE5), borderRadius: BorderRadius.circular(2)),
          ),
        ),
        // Titre
        const Text('Trajet terminé !', style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w800, fontSize: 20, color: Color(0xFF08316E))),
        const SizedBox(height: 4),
        Text(
          isDriver ? 'Évaluez vos passagers' : 'Évaluez votre conducteur',
          style: const TextStyle(fontSize: 13, color: Color(0xFF7A879A)),
        ),
        const SizedBox(height: 16),
        // Sélecteur passager (conducteur seulement)
        if (isDriver && passengers.isNotEmpty) ...[
          const Text('Évaluer :', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF0D1624))),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: selectedPassengerId,
            hint: const Text('— Choisir un passager —', style: TextStyle(color: Color(0xFF7A879A))),
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFFF0F4FB),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0x1C000000))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0x1C000000))),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            items: passengers.map((p) {
              final bool reviewed = alreadyReviewedIds.contains(p.userId);
              return DropdownMenuItem(
                value: p.userId,
                enabled: !reviewed,
                child: Text('${p.fullName}${reviewed ? ' ✓' : ''}', style: TextStyle(color: reviewed ? const Color(0xFF7A879A) : const Color(0xFF0D1624))),
              );
            }).toList(),
            onChanged: onPassengerSelected,
          ),
          const SizedBox(height: 16),
        ],
        // Étoiles
        if (!isDriver || selectedPassengerId != null) ...[
          const Text('Note *', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF0D1624))),
          const SizedBox(height: 8),
          _StarRow(rating: rating, onChanged: onRatingChanged),
          if (rating > 0) ...[
            const SizedBox(height: 4),
            Text(
              _ratingLabel(rating),
              style: const TextStyle(fontSize: 11, color: Color(0xFF7A879A)),
            ),
          ],
          const SizedBox(height: 16),
          // Commentaire
          const Text('Commentaire *', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF0D1624))),
          const SizedBox(height: 8),
          TextField(
            controller: commentCtrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Décrivez votre expérience (10 caractères min.)…',
              hintStyle: const TextStyle(color: Color(0xFF8A95A8), fontSize: 13),
              filled: true,
              fillColor: const Color(0xFFF0F4FB),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0x1C000000))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0x1C000000))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF08316E))),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
          const SizedBox(height: 20),
        ],
        // Boutons
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: onClose,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  side: const BorderSide(color: Color(0xFFD8DBE5)),
                ),
                child: const Text('Plus tard', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF545D6E))),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton.icon(
                onPressed: canSubmit && !isSubmitting ? onSubmit : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: canSubmit ? const Color(0xFF0aad6a) : const Color(0xFFD8DBE5),
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: isSubmitting
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send_rounded, size: 16, color: Colors.white),
                label: const Text('Soumettre', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _ratingLabel(int r) {
    const labels = {1: 'Mauvais', 2: 'Passable', 3: 'Correct', 4: 'Bien', 5: 'Excellent !'};
    return labels[r] ?? '';
  }
}

class _StarRow extends StatelessWidget {
  const _StarRow({required this.rating, required this.onChanged});
  final int rating;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(5, (i) {
        final int star = i + 1;
        return GestureDetector(
          onTap: () => onChanged(star),
          child: Padding(
            padding: const EdgeInsets.only(right: 4),
            child: Icon(
              star <= rating ? Icons.star_rounded : Icons.star_outline_rounded,
              size: 32,
              color: star <= rating ? const Color(0xFFF59E0B) : const Color(0x20000000),
            ),
          ),
        );
      }),
    );
  }
}

class _SuccessView extends StatelessWidget {
  const _SuccessView({required this.onClose});
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Center(
          child: Container(
            width: 40, height: 4,
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(color: const Color(0xFFD8DBE5), borderRadius: BorderRadius.circular(2)),
          ),
        ),
        const Icon(Icons.check_circle_rounded, size: 56, color: Color(0xFF0aad6a)),
        const SizedBox(height: 16),
        const Text('Merci pour votre évaluation !', style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w800, fontSize: 20, color: Color(0xFF08316E))),
        const SizedBox(height: 8),
        const Text('Votre avis aide la communauté à améliorer le covoiturage.', style: TextStyle(fontSize: 13, color: Color(0xFF7A879A)), textAlign: TextAlign.center),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onClose,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF08316E),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Fermer', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
          ),
        ),
      ],
    );
  }
}
