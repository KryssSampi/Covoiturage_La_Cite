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
    Map<String, dynamic> asMap(dynamic value) {
      if (value is Map<String, dynamic>) return value;
      if (value is Map) {
        return value.map((k, v) => MapEntry(k.toString(), v));
      }
      return <String, dynamic>{};
    }

    final prefs = asMap(json['preferences']);
    final dynamic rawStatus = json['status'];
    final Map<String, dynamic> status = asMap(rawStatus);
    final driver = asMap(json['driver']);
    final vehicle = asMap(json['vehicle']);
    final departure = asMap(json['departure']);
    final arrival = asMap(json['arrival']);
    final String driverFullName = '${driver['firstName'] ?? ''} ${driver['lastName'] ?? ''}'.trim();

    int parseInt(dynamic value, {int fallback = 0}) {
      if (value is int) return value;
      if (value is num) return value.toInt();
      return int.tryParse(value?.toString() ?? '') ?? fallback;
    }

    double parseDouble(dynamic value, {double fallback = 0}) {
      if (value is double) return value;
      if (value is num) return value.toDouble();
      return double.tryParse(value?.toString() ?? '') ?? fallback;
    }

    return Trip(
      id: json['id']?.toString() ?? '',
      driverName: (json['driverName']?.toString() ?? driverFullName).trim(),
      driverRating: parseDouble(
        driver['rating'] ?? driver['averageRating'] ?? json['driverRating'],
      ),
      driverTripCount: parseInt(driver['tripCount'] ?? json['driverTripCount']),
      driverAvatarUrl: driver['avatarUrl'] as String?,
      departureLabel: departure['label']?.toString() ??
          json['departureLabel']?.toString() ??
          json['from']?.toString() ??
          json['departure']?.toString() ??
          json['departureAddress']?.toString() ??
          '',
      arrivalLabel: arrival['label']?.toString() ??
          json['arrivalLabel']?.toString() ??
          json['to']?.toString() ??
          json['destination']?.toString() ??
          json['arrivalAddress']?.toString() ??
          '',
      departureDate: json['departureDate']?.toString() ?? '',
      departureTime: (json['departureTime'] ??
              json['departureDateTime'] ??
              json['time'] ??
              '')
          .toString(),
      arrivalTime: json['arrivalTime'] as String?,
      availableSeats: parseInt(
        json['availableSeats'] ??
            json['maxPassengers'] ??
            json['seats'],
      ),
      totalSeats: parseInt(json['totalSeats'] ?? json['maxPassengers'], fallback: 4),
      pricePerSeat: parseDouble(json['pricePerPassenger'] ?? json['pricePerSeat'] ?? json['price']),
      passengerPrice: parseDouble(json['passengerPrice'] ?? json['pricePerPassenger'] ?? json['price']),
      vehicleModel: vehicle['label'] as String? ??
          ((vehicle['make'] != null || vehicle['model'] != null)
              ? '${vehicle['make'] ?? ''} ${vehicle['model'] ?? ''}'.trim()
              : null) ??
          json['vehicleModel'] as String? ??
          '',
      vehicleColor: vehicle['color'] as String? ?? json['vehicleColor'] as String? ?? '',
      paymentMethod: json['paymentMethod'] as String? ?? 'Cash',
      estimatedDurationMin: parseInt(
        json['estimatedDurationMin'] ??
            json['estimatedDurationMinutes'] ??
            json['estimatedDuration'],
      ),
      estimatedDistanceKm: parseDouble(
        json['estimatedDistanceKm'] ?? json['estimatedDistance'],
      ),
      baggageAllowed: prefs['baggageAllowed'] as bool? ?? false,
      petsAllowed: prefs['petsAllowed'] as bool? ?? false,
      smokingAllowed: prefs['smokingAllowed'] as bool? ?? false,
      musicAllowed: prefs['musicAllowed'] as bool? ?? false,
      flexibleItinerary: prefs['flexibleItinerary'] as bool? ?? false,
      driverNote: prefs['driverNote'] as String?,
      tripType: status['tripType']?.toString() ??
          json['tripType']?.toString() ??
          (rawStatus is String ? rawStatus : 'Unique'),
      isRecurrent: status['isRecurrent'] == true || json['isRecurrent'] == true,
      maxDetourMinutes: (status['maxDetourMinutes'] ?? json['maxDetourMinutes']) == null
          ? null
          : parseInt(status['maxDetourMinutes'] ?? json['maxDetourMinutes']),
      lastUpdatedAt: status['lastUpdatedAt']?.toString() ??
          json['updatedAt']?.toString() ??
          '',
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
      success: json['success'] as bool? ?? json['Success'] as bool? ?? false,
      reservationId:
          data?['id']?.toString() ?? data?['reservationId']?.toString(),
      message: json['message'] as String? ?? json['Message'] as String?,
    );
  }
}
