class Reservation {
  final String id;
  final String tripId;
  final String passengerId;
  final String status;
  final DateTime createdAt;

  const Reservation({
    required this.id,
    required this.tripId,
    required this.passengerId,
    required this.status,
    required this.createdAt,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['id']?.toString() ?? '',
      tripId: json['tripId']?.toString() ?? '',
      passengerId: json['passengerId']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      createdAt: DateTime.parse(json['createdAt']?.toString() ?? ''),
    );
  }
}
