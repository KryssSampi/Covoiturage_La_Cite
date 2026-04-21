// ============================================================
// lib/features/trajet_en_cours/widgets/trajet_modals.dart
// Modales — annulation + fin de trajet (miroir de TripModals.tsx)
// ============================================================

import 'package:flutter/material.dart';

// ─── Modale annulation ─────────────────────────────────────────────────────

class CancelWarningModal extends StatelessWidget {
  const CancelWarningModal({
    super.key,
    required this.onClose,
    required this.onConfirm,
  });

  final VoidCallback onClose;
  final VoidCallback onConfirm;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.warning_amber_rounded, size: 48, color: Color(0xFFe03050)),
            const SizedBox(height: 14),
            const Text(
              'Attention — annulation',
              style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF08316E)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            const Text(
              "L'annulation d'un trajet en cours entraîne des pénalités financières et affecte votre score de fiabilité. Cette action est irréversible.",
              style: TextStyle(fontSize: 13, color: Color(0xFF7A879A), height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
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
                    child: const Text('Revenir', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF545D6E))),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: onConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFe03050),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text("Confirmer l'annulation", style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white, fontSize: 12)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Modale trajet terminé ─────────────────────────────────────────────────

class TripCompletedModal extends StatelessWidget {
  const TripCompletedModal({
    super.key,
    required this.isDriver,
    required this.onOk,
  });

  final bool isDriver;
  final VoidCallback onOk;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.flag_rounded, size: 48, color: Color(0xFF0aad6a)),
            const SizedBox(height: 16),
            const Text(
              'Trajet terminé !',
              style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w800, fontSize: 20, color: Color(0xFF08316E)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              isDriver
                  ? 'Vous avez bien complété votre trajet. Merci pour votre service !'
                  : 'Vous êtes arrivé à destination. Bon séjour !',
              style: const TextStyle(fontSize: 13, color: Color(0xFF7A879A), height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Veuillez évaluer votre expérience avant de quitter.',
              style: TextStyle(fontSize: 12, color: Color(0xFF7A879A)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onOk,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF08316E),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('OK — Évaluer', style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Toast flottant ─────────────────────────────────────────────────────────

class FloatingToast extends StatefulWidget {
  const FloatingToast({
    super.key,
    required this.message,
    this.isSuccess = true,
    required this.onDismiss,
  });

  final String message;
  final bool isSuccess;
  final VoidCallback onDismiss;

  @override
  State<FloatingToast> createState() => _FloatingToastState();
}

class _FloatingToastState extends State<FloatingToast> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _ctrl.forward();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        _ctrl.reverse().then((_) => widget.onDismiss());
      }
    });
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
      builder: (_, __) => Transform.translate(
        offset: Offset(0, (1 - _anim.value) * 20),
        child: Opacity(
          opacity: _anim.value,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: widget.isSuccess ? const Color(0xFF0aad6a) : const Color(0xFFe03050),
              borderRadius: BorderRadius.circular(14),
              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 16, offset: Offset(0, 4))],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  widget.isSuccess ? Icons.check_circle_outline : Icons.error_outline,
                  color: Colors.white,
                  size: 20,
                ),
                const SizedBox(width: 10),
                Flexible(
                  child: Text(
                    widget.message,
                    style: const TextStyle(fontFamily: 'Sora', fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
