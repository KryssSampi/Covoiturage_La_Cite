class Trip {
  final String id;
  final String driverName;
  final double driverRating;
  final int driverTripCount;
  final String? driverAvatarUrl;
  final String departureLabel;
  final String arrivalLabel;
  final String departureDate;
  final String departureTime;
  final String? arrivalTime;
  final int availableSeats;
  final int totalSeats;
  final double pricePerSeat;
  final double passengerPrice;
  final String vehicleModel;
  final String vehicleColor;
  final String paymentMethod;
  final int estimatedDurationMin;
  final double estimatedDistanceKm;
  final bool baggageAllowed;
  final bool petsAllowed;
  final bool smokingAllowed;
  final bool musicAllowed;
  final bool flexibleItinerary;
  final String? driverNote;
  final String tripType;
  final bool isRecurrent;
  final int? maxDetourMinutes;
  final String lastUpdatedAt;

  const Trip({
    required this.id,
    required this.driverName,
    required this.driverRating,
    required this.driverTripCount,
    this.driverAvatarUrl,
    required this.departureLabel,
    required this.arrivalLabel,
    required this.departureDate,
    required this.departureTime,
    this.arrivalTime,
    required this.availableSeats,
    required this.totalSeats,
    required this.pricePerSeat,
    required this.passengerPrice,
    required this.vehicleModel,
    required this.vehicleColor,
    required this.paymentMethod,
    required this.estimatedDurationMin,
    required this.estimatedDistanceKm,
    required this.baggageAllowed,
    required this.petsAllowed,
    required this.smokingAllowed,
    required this.musicAllowed,
    required this.flexibleItinerary,
    this.driverNote,
    required this.tripType,
    required this.isRecurrent,
    this.maxDetourMinutes,
    required this.lastUpdatedAt,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    final prefs = json['preferences'] as Map<String, dynamic>? ?? {};
    final status = json['status'] as Map<String, dynamic>? ?? {};
    final driver = json['driver'] as Map<String, dynamic>? ?? {};
    final vehicle = json['vehicle'] as Map<String, dynamic>? ?? {};
    return Trip(
      id: json['id'] as String? ?? '',
      driverName: driver['firstName'] as String? ?? json['driverName'] as String? ?? '',
      driverRating: (driver['rating'] as num? ?? json['driverRating'] as num? ?? 0).toDouble(),
      driverTripCount: driver['tripCount'] as int? ?? 0,
      driverAvatarUrl: driver['avatarUrl'] as String?,
      departureLabel: (json['departure'] as Map<String, dynamic>?)?['label'] as String? ?? json['departureLabel'] as String? ?? '',
      arrivalLabel: (json['arrival'] as Map<String, dynamic>?)?['label'] as String? ?? json['arrivalLabel'] as String? ?? '',
      departureDate: json['departureDate'] as String? ?? '',
      departureTime: json['departureTime'] as String? ?? '',
      arrivalTime: json['arrivalTime'] as String?,
      availableSeats: json['availableSeats'] as int? ?? 0,
      totalSeats: json['totalSeats'] as int? ?? 4,
      pricePerSeat: (json['pricePerPassenger'] as num? ?? 0).toDouble(),
      passengerPrice: (json['passengerPrice'] as num? ?? 0).toDouble(),
      vehicleModel: vehicle['label'] as String? ?? json['vehicleModel'] as String? ?? '',
      vehicleColor: vehicle['color'] as String? ?? json['vehicleColor'] as String? ?? '',
      paymentMethod: json['paymentMethod'] as String? ?? 'Cash',
      estimatedDurationMin: json['estimatedDuration'] as int? ?? 0,
      estimatedDistanceKm: (json['estimatedDistance'] as num? ?? 0).toDouble(),
      baggageAllowed: prefs['baggageAllowed'] as bool? ?? false,
      petsAllowed: prefs['petsAllowed'] as bool? ?? false,
      smokingAllowed: prefs['smokingAllowed'] as bool? ?? false,
      musicAllowed: prefs['musicAllowed'] as bool? ?? false,
      flexibleItinerary: prefs['flexibleItinerary'] as bool? ?? false,
      driverNote: prefs['driverNote'] as String?,
      tripType: status['tripType'] as String? ?? 'Unique',
      isRecurrent: status['isRecurrent'] as bool? ?? false,
      maxDetourMinutes: status['maxDetourMinutes'] as int?,
      lastUpdatedAt: status['lastUpdatedAt'] as String? ?? '',
    );
  }
}

class ReservationResult {
  final bool success;
  final String? reservationId;
  final String? message;

  const ReservationResult({
    required this.success,
    this.reservationId,
    this.message,
  });

  factory ReservationResult.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>?;
    return ReservationResult(
      success: json['success'] as bool? ?? false,
      reservationId: data?['id'] as String?,
      message: json['message'] as String?,
    );
  }
}
