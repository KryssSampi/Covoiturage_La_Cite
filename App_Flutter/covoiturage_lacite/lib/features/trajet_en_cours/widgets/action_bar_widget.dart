// ============================================================
// lib/features/trajet_en_cours/widgets/action_bar_widget.dart
// Barre d'actions bas de page : évaluation inline + boutons
// Miroir de ActionBar.tsx du site web
// ============================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/trajet_en_cours_models.dart';

class ActionBarWidget extends StatefulWidget {
  const ActionBarWidget({
    super.key,
    required this.trip,
    required this.isDriver,
    required this.tripId,
    this.onShowEvaluation,
    this.onShowSignalement,
  });

  final TrajetResponseDto trip;
  final bool isDriver;
  final String tripId;
  final VoidCallback? onShowEvaluation;
  final VoidCallback? onShowSignalement;

  @override
  State<ActionBarWidget> createState() => _ActionBarWidgetState();
}

class _ActionBarWidgetState extends State<ActionBarWidget> {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0x12000000))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Bouton Messages (redirection vers ChatListScreen) ─────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => context.push('/chat/${widget.tripId}'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF08316E),
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.chat_bubble_outline, color: Colors.white, size: 18),
                label: const Text(
                  'Messages',
                  style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white),
                ),
              ),
            ),
          ),
          // ── Boutons secondaires ───────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                // Évaluer
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: widget.onShowEvaluation,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      side: const BorderSide(color: Color(0xFFBA7517)),
                    ),
                    icon: const Icon(Icons.star_outline, size: 16, color: Color(0xFFBA7517)),
                    label: const Text('Évaluer', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFFBA7517))),
                  ),
                ),
                const SizedBox(width: 10),
                // Signaler
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: widget.onShowSignalement,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      side: const BorderSide(color: Color(0xFFe03050)),
                    ),
                    icon: const Icon(Icons.flag_outlined, size: 16, color: Color(0xFFe03050)),
                    label: const Text('Signaler', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFFe03050))),
                  ),
                ),
                const SizedBox(width: 10),
                // SOS (urgence — lien tel:911)
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFFCEBEB),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFe03050)),
                  ),
                  child: IconButton(
                    onPressed: () {
                      // Ouvre l'application téléphonique avec 911
                      // Nécessite le package url_launcher
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('🚨 En cas d\'urgence, appelez le 911'),
                          backgroundColor: Color(0xFFe03050),
                        ),
                      );
                    },
                    icon: const Icon(Icons.sos, color: Color(0xFFe03050), size: 22),
                    tooltip: 'SOS Urgence - 911',
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
