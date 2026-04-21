// ============================================================
// lib/features/trajet_en_cours/widgets/progression_section.dart
// Barre de progression du trajet — miroir de ProgressionSection.tsx
// ============================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../models/trajet_en_cours_models.dart';

class ProgressionSection extends StatelessWidget {
  const ProgressionSection({
    super.key,
    required this.trip,
    this.driverPosition,
    this.elapsedSeconds = 0,
  });

  final TrajetResponseDto trip;
  final DriverPositionDto? driverPosition;
  final int elapsedSeconds;

  double get _progressPercent {
    final int total = trip.estimatedDurationMinutes * 60;
    if (total <= 0) return 0;
    return math.min(elapsedSeconds / total * 100, 100);
  }

  int get _remainingSeconds {
    final int total = trip.estimatedDurationMinutes * 60;
    return math.max(total - elapsedSeconds, 0);
  }

  double get _distanceParcourueKm {
    final double? distTotal = trip.estimatedDistanceKm;
    if (distTotal == null) return 0;
    return distTotal * _progressPercent / 100;
  }

  String get _etaText {
    final int sec = _remainingSeconds;
    final DateTime eta = DateTime.now().add(Duration(seconds: sec));
    final String h = eta.hour.toString().padLeft(2, '0');
    final String m = eta.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  String _fmtDuration(int seconds) {
    final int min = seconds ~/ 60;
    final int sec = seconds % 60;
    if (min > 0) return '${min} min${sec > 0 ? ' ${sec} s' : ''}';
    return '${sec} s';
  }

  @override
  Widget build(BuildContext context) {
    final double pct = _progressPercent;
    final double distKm = trip.estimatedDistanceKm ?? 0;
    final double parcourue = _distanceParcourueKm;
    final double restante = math.max(distKm - parcourue, 0);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x12000000)),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                const Icon(Icons.map_outlined, size: 18, color: Color(0xFF08316E)),
                const SizedBox(width: 8),
                const Text(
                  'Progression du trajet',
                  style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF08316E)),
                ),
                const Spacer(),
                // Badge ETA
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE1F5EE),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0x400aad6a)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.access_time, size: 12, color: Color(0xFF0aad6a)),
                      const SizedBox(width: 4),
                      Text(
                        'Arrivée : $_etaText',
                        style: const TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 11, color: Color(0xFF0aad6a)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Barre de progression animée
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: pct / 100,
                minHeight: 8,
                backgroundColor: const Color(0xFFEEF0F5),
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0aad6a)),
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Étapes visuelles — départ + jalon + arrivée
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _StepsRow(trip: trip, progressPercent: pct),
          ),
          const SizedBox(height: 12),
          // Stats grid
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0x12000000))),
            ),
            child: Row(
              children: [
                _StatCell(value: '${parcourue.toStringAsFixed(1)} km', label: 'Parcouru', color: const Color(0xFF0aad6a)),
                _StatCell(value: '${restante.toStringAsFixed(1)} km', label: 'Restant', color: const Color(0xFF08316E)),
                _StatCell(value: '${pct.toStringAsFixed(0)}%', label: 'Progression', color: const Color(0xFFBA7517)),
                _StatCell(value: _fmtDuration(_remainingSeconds), label: 'ETA', color: const Color(0xFF0098c8), isLast: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StepsRow extends StatelessWidget {
  const _StepsRow({required this.trip, required this.progressPercent});
  final TrajetResponseDto trip;
  final double progressPercent;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Point départ
        _StepDot(
          label: trip.displayDepartureLabel,
          isDone: true,
          isActive: false,
          isDepart: true,
        ),
        // Ligne de progression
        Expanded(
          child: Stack(
            alignment: Alignment.centerLeft,
            children: [
              Container(height: 2, color: const Color(0xFFEEF0F5)),
              FractionallySizedBox(
                widthFactor: progressPercent / 100,
                child: Container(
                  height: 2,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [Color(0xFF0aad6a), Color(0xFF08316E)]),
                  ),
                ),
              ),
            ],
          ),
        ),
        // Point arrivée
        _StepDot(
          label: trip.displayArrivalLabel,
          isDone: progressPercent >= 100,
          isActive: false,
          isDepart: false,
        ),
      ],
    );
  }
}

class _StepDot extends StatelessWidget {
  const _StepDot({
    required this.label,
    required this.isDone,
    required this.isActive,
    required this.isDepart,
  });
  final String label;
  final bool isDone;
  final bool isActive;
  final bool isDepart;

  @override
  Widget build(BuildContext context) {
    final Color color = isDepart
        ? const Color(0xFF08316E)
        : isDone
            ? const Color(0xFF0aad6a)
            : const Color(0xFF7A879A);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: isDone ? color : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 2),
            boxShadow: isDone
                ? [BoxShadow(color: color.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 2))]
                : null,
          ),
          child: Icon(
            isDone ? Icons.check : (isDepart ? Icons.circle : Icons.flag_outlined),
            size: 14,
            color: isDone ? Colors.white : color,
          ),
        ),
        const SizedBox(height: 4),
        SizedBox(
          width: 60,
          child: Text(
            label,
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: color),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _StatCell extends StatelessWidget {
  const _StatCell({
    required this.value,
    required this.label,
    required this.color,
    this.isLast = false,
  });

  final String value;
  final String label;
  final Color color;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            right: isLast ? BorderSide.none : const BorderSide(color: Color(0x12000000)),
          ),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontFamily: 'Sora',
                fontWeight: FontWeight.w800,
                fontSize: 14,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: Color(0xFF7A879A), letterSpacing: 0.3),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
