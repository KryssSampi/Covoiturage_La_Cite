import 'package:flutter/material.dart';

/// Enum des états possibles du bouton réservation (inspiré du site web)
enum ReserveButtonStateKind {
  reserve,
  pending,
  confirmed,
  cooldown,
  full,
  manage,
  readonly,
  reservationConfirmed,
  reservationInProgress,
  reservationCancelled,
  reservationPending,
  reservationCompleted,
  reservationRejected,
  tripPublished,
  tripFull,
  tripConfirmed,
  tripInProgress,
  tripCompleted,
  tripCancelled,
  tripNoShow,
  tripImminent,
  reservationImminent,
}

class ReserveButtonState {
  final ReserveButtonStateKind kind;
  final double? hoursLeft;
  ReserveButtonState(this.kind, {this.hoursLeft});
}

class ReserveButton extends StatelessWidget {
  final ReserveButtonState state;
  final String tripId;
  final VoidCallback? onReserveClick;
  final VoidCallback? onFollowClick;
  final VoidCallback? onManageClick;
  final VoidCallback? onStartTripClick;

  const ReserveButton({
    super.key,
    required this.state,
    required this.tripId,
    this.onReserveClick,
    this.onFollowClick,
    this.onManageClick,
    this.onStartTripClick,
  });

  @override
  Widget build(BuildContext context) {
    final baseStyle = ElevatedButton.styleFrom(
      minimumSize: const Size.fromHeight(52),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      elevation: 0,
    );
    switch (state.kind) {
      case ReserveButtonStateKind.reserve:
        return ElevatedButton(
          onPressed: onReserveClick,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF08316E)),
          ),
          child: const Text('Réserver ce trajet'),
        );
      case ReserveButtonStateKind.pending:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF08316E)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
              ),
              SizedBox(width: 10),
              Text('En attente de confirmation…'),
            ],
          ),
        );
      case ReserveButtonStateKind.confirmed:
        return ElevatedButton(
          onPressed: onFollowClick,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF1a6b3a)),
          ),
          child: const Text('Suivre le trajet'),
        );
      case ReserveButtonStateKind.cooldown:
        return Column(
          children: [
            ElevatedButton(
              onPressed: null,
              style: baseStyle.copyWith(
                backgroundColor: MaterialStateProperty.all(const Color(0xFFe0e0e0)),
                foregroundColor: MaterialStateProperty.all(const Color(0xFF757575)),
              ),
              child: const Text('Demande refusée'),
            ),
            if (state.hoursLeft != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Vous pourrez retenter dans ${state.hoursLeft!.ceil()}h',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF757575)),
                ),
              ),
          ],
        );
      case ReserveButtonStateKind.full:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFFe0e0e0)),
            foregroundColor: MaterialStateProperty.all(const Color(0xFF757575)),
          ),
          child: const Text('Trajet complet'),
        );
      case ReserveButtonStateKind.manage:
        return ElevatedButton(
          onPressed: onManageClick,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF08316E)),
          ),
          child: const Text('Gérer les demandes'),
        );
      case ReserveButtonStateKind.readonly:
        return const SizedBox.shrink();
      case ReserveButtonStateKind.reservationConfirmed:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF1a6b3a)),
          ),
          child: const Text('Confirmé'),
        );
      case ReserveButtonStateKind.reservationInProgress:
        return ElevatedButton(
          onPressed: onFollowClick,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF08316E)),
          ),
          child: const Text('Suivre le trajet'),
        );
      case ReserveButtonStateKind.reservationCancelled:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFFe0e0e0)),
            foregroundColor: MaterialStateProperty.all(const Color(0xFF757575)),
          ),
          child: const Text('Annulé'),
        );
      case ReserveButtonStateKind.reservationPending:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFFe0e0e0)),
            foregroundColor: MaterialStateProperty.all(const Color(0xFF757575)),
          ),
          child: const Text('En attente de confirmation'),
        );
      case ReserveButtonStateKind.reservationCompleted:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(Colors.transparent),
            foregroundColor: MaterialStateProperty.all(const Color(0xFFBDBDBD)),
            shadowColor: MaterialStateProperty.all(Colors.transparent),
          ),
          child: const Text('Complété'),
        );
      case ReserveButtonStateKind.reservationRejected:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFFe0e0e0)),
            foregroundColor: MaterialStateProperty.all(const Color(0xFF757575)),
          ),
          child: const Text('Rejeté'),
        );
      case ReserveButtonStateKind.tripPublished:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFFe0e0e0)),
            foregroundColor: MaterialStateProperty.all(const Color(0xFF757575)),
          ),
          child: const Text('Publié'),
        );
      case ReserveButtonStateKind.tripFull:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(Colors.white),
            foregroundColor: MaterialStateProperty.all(const Color(0xFF0F6E56)),
            side: MaterialStateProperty.all(const BorderSide(color: Color(0xFFe0e0e0))),
          ),
          child: const Text('Plein'),
        );
      case ReserveButtonStateKind.tripConfirmed:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF1a6b3a)),
          ),
          child: const Text('Confirmé'),
        );
      case ReserveButtonStateKind.tripInProgress:
        return ElevatedButton(
          onPressed: onFollowClick,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF08316E)),
          ),
          child: const Text('Suivre le trajet'),
        );
      case ReserveButtonStateKind.tripCompleted:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(Colors.transparent),
            foregroundColor: MaterialStateProperty.all(const Color(0xFFBDBDBD)),
            shadowColor: MaterialStateProperty.all(Colors.transparent),
          ),
          child: const Text('Terminé'),
        );
      case ReserveButtonStateKind.tripCancelled:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFFe0e0e0)),
            foregroundColor: MaterialStateProperty.all(const Color(0xFF757575)),
          ),
          child: const Text('Annulé'),
        );
      case ReserveButtonStateKind.tripNoShow:
        return ElevatedButton(
          onPressed: null,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFFFFEBEE)),
            foregroundColor: MaterialStateProperty.all(const Color(0xFFD32F2F)),
          ),
          child: const Text('Absent'),
        );
      case ReserveButtonStateKind.tripImminent:
      case ReserveButtonStateKind.reservationImminent:
        return ElevatedButton(
          onPressed: onStartTripClick,
          style: baseStyle.copyWith(
            backgroundColor: MaterialStateProperty.all(const Color(0xFF0aad6a)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.play_arrow, color: Colors.white),
              SizedBox(width: 8),
              Text('Démarrer le trajet'),
            ],
          ),
        );
    }
  }
}
