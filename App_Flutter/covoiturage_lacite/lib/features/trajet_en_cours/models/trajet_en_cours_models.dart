// ============================================================
// lib/features/trajet_en_cours/models/trajet_en_cours_models.dart
// DTOs et modèles alignés sur TrajetEnCoursDto du Server Core
// ============================================================

class TrajetEnCoursDto {
  final TrajetResponseDto trip;
  final List<TrajetPassengerDto> passengers;
  final DriverPositionDto? driverPosition;

  const TrajetEnCoursDto({
    required this.trip,
    required this.passengers,
    this.driverPosition,
  });

  factory TrajetEnCoursDto.fromJson(Map<String, dynamic> json) {
    return TrajetEnCoursDto(
      trip: TrajetResponseDto.fromJson(json['trip'] as Map<String, dynamic>),
      passengers: (json['passengers'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(TrajetPassengerDto.fromJson)
          .toList(),
      driverPosition: json['driverPosition'] != null
          ? DriverPositionDto.fromJson(json['driverPosition'] as Map<String, dynamic>)
          : null,
    );
  }
}

class TrajetResponseDto {
  final String id;
  final String driverId;
  final String vehicleId;
  final String? departureLabel;
  final String departureAddress;
  final double departureLat;
  final double departureLng;
  final String? arrivalLabel;
  final String arrivalAddress;
  final double arrivalLat;
  final double arrivalLng;
  final String departureDate;
  final String departureTime;
  final String? estimatedArrivalTime;
  final int estimatedDurationMinutes;
  final double? estimatedDistanceKm;
  final int maxPassengers;
  final int currentPassengers;
  final double pricePerPassenger;
  final String paymentMethod;
  final String tripType;
  final String status;
  final String? conversationLevel;
  final String? driverNote;
  final String? polyline;
  final bool baggageAllowed;
  final bool petsAllowed;
  final bool smokingAllowed;
  final bool musicAllowed;
  final double? co2SavedKg;
  final double? averageRating;
  final String createdAt;
  final String updatedAt;
  final TripDriverDto? driver;
  final TripVehicleDto? vehicle;

  const TrajetResponseDto({
    required this.id,
    required this.driverId,
    required this.vehicleId,
    this.departureLabel,
    required this.departureAddress,
    required this.departureLat,
    required this.departureLng,
    this.arrivalLabel,
    required this.arrivalAddress,
    required this.arrivalLat,
    required this.arrivalLng,
    required this.departureDate,
    required this.departureTime,
    this.estimatedArrivalTime,
    required this.estimatedDurationMinutes,
    this.estimatedDistanceKm,
    required this.maxPassengers,
    required this.currentPassengers,
    required this.pricePerPassenger,
    required this.paymentMethod,
    required this.tripType,
    required this.status,
    this.conversationLevel,
    this.driverNote,
    this.polyline,
    this.baggageAllowed = false,
    this.petsAllowed = false,
    this.smokingAllowed = false,
    this.musicAllowed = false,
    this.co2SavedKg,
    this.averageRating,
    required this.createdAt,
    required this.updatedAt,
    this.driver,
    this.vehicle,
  });

  factory TrajetResponseDto.fromJson(Map<String, dynamic> json) {
    return TrajetResponseDto(
      id: json['id']?.toString() ?? '',
      driverId: json['driverId']?.toString() ?? '',
      vehicleId: json['vehicleId']?.toString() ?? '',
      departureLabel: json['departureLabel']?.toString() ?? json['departureAddress']?.toString(),
      departureAddress: json['departureAddress']?.toString() ?? '',
      departureLat: _toDouble(json['departureLat']),
      departureLng: _toDouble(json['departureLng']),
      arrivalLabel: json['arrivalLabel']?.toString() ?? json['arrivalAddress']?.toString(),
      arrivalAddress: json['arrivalAddress']?.toString() ?? '',
      arrivalLat: _toDouble(json['arrivalLat']),
      arrivalLng: _toDouble(json['arrivalLng']),
      departureDate: json['departureDate']?.toString() ?? '',
      departureTime: json['departureTime']?.toString() ?? '',
      estimatedArrivalTime: json['estimatedArrivalTime']?.toString(),
      estimatedDurationMinutes: _toInt(json['estimatedDurationMinutes']),
      estimatedDistanceKm: json['estimatedDistanceKm'] != null ? _toDouble(json['estimatedDistanceKm']) : null,
      maxPassengers: _toInt(json['maxPassengers']),
      currentPassengers: _toInt(json['currentPassengers']),
      pricePerPassenger: _toDouble(json['pricePerPassenger']),
      paymentMethod: json['paymentMethod']?.toString() ?? 'cash',
      tripType: json['tripType']?.toString() ?? 'unique',
      status: json['status']?.toString() ?? 'in_progress',
      conversationLevel: json['conversationLevel']?.toString(),
      driverNote: json['driverNote']?.toString() ?? json['notes']?.toString(),
      polyline: json['polyline']?.toString(),
      baggageAllowed: json['baggageAllowed'] == true,
      petsAllowed: json['petsAllowed'] == true,
      smokingAllowed: json['smokingAllowed'] == true,
      musicAllowed: json['musicAllowed'] == true,
      co2SavedKg: json['co2SavedKg'] != null ? _toDouble(json['co2SavedKg']) : null,
      averageRating: json['averageRating'] != null ? _toDouble(json['averageRating']) : null,
      createdAt: json['createdAt']?.toString() ?? '',
      updatedAt: json['updatedAt']?.toString() ?? '',
      driver: json['driver'] is Map<String, dynamic>
          ? TripDriverDto.fromJson(json['driver'] as Map<String, dynamic>)
          : null,
      vehicle: json['vehicle'] is Map<String, dynamic>
          ? TripVehicleDto.fromJson(json['vehicle'] as Map<String, dynamic>)
          : null,
    );
  }

  String get displayDepartureLabel => departureLabel ?? departureAddress;
  String get displayArrivalLabel => arrivalLabel ?? arrivalAddress;

  double get passengerPrice => pricePerPassenger * 1.15;
}

class TripDriverDto {
  final String id;
  final String firstName;
  final String lastName;
  final String? avatarUrl;
  final double averageRating;
  final int goScore;
  final bool isProfileVerified;

  const TripDriverDto({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.avatarUrl,
    required this.averageRating,
    required this.goScore,
    required this.isProfileVerified,
  });

  factory TripDriverDto.fromJson(Map<String, dynamic> json) {
    return TripDriverDto(
      id: json['id']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      avatarUrl: json['avatarUrl']?.toString(),
      averageRating: _toDouble(json['averageRating'] ?? json['rating']),
      goScore: _toInt(json['goScore']),
      isProfileVerified: json['isProfileVerified'] == true || json['profileVerified'] == true,
    );
  }

  String get fullName => '$firstName $lastName'.trim();
  String get initials {
    final f = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final l = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$f$l';
  }
}

class TripVehicleDto {
  final String id;
  final String make;
  final String model;
  final int year;
  final String color;
  final String licensePlate;
  final int capacity;
  final String? photoUrl;

  const TripVehicleDto({
    required this.id,
    required this.make,
    required this.model,
    required this.year,
    required this.color,
    required this.licensePlate,
    required this.capacity,
    this.photoUrl,
  });

  factory TripVehicleDto.fromJson(Map<String, dynamic> json) {
    return TripVehicleDto(
      id: json['id']?.toString() ?? '',
      make: json['make']?.toString() ?? '',
      model: json['model']?.toString() ?? '',
      year: _toInt(json['year']),
      color: json['color']?.toString() ?? '',
      licensePlate: json['licensePlate']?.toString() ?? '',
      capacity: _toInt(json['capacity'] ?? json['maxSeats']),
      photoUrl: json['photoUrl']?.toString(),
    );
  }

  String get displayLabel => '$make $model $year';
}

class TrajetPassengerDto {
  final String userId;
  final String firstName;
  final String lastName;
  final String? avatarUrl;
  final String reservationId;
  final String reservationStatus;

  const TrajetPassengerDto({
    required this.userId,
    required this.firstName,
    required this.lastName,
    this.avatarUrl,
    required this.reservationId,
    required this.reservationStatus,
  });

  factory TrajetPassengerDto.fromJson(Map<String, dynamic> json) {
    return TrajetPassengerDto(
      userId: json['userId']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      avatarUrl: json['avatarUrl']?.toString(),
      reservationId: json['reservationId']?.toString() ?? '',
      reservationStatus: json['reservationStatus']?.toString() ?? 'confirmed',
    );
  }

  String get fullName => '$firstName $lastName'.trim();
  String get initials {
    final f = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final l = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$f$l';
  }
}

class DriverPositionDto {
  final double lat;
  final double lng;
  final String updatedAt;

  const DriverPositionDto({
    required this.lat,
    required this.lng,
    required this.updatedAt,
  });

  factory DriverPositionDto.fromJson(Map<String, dynamic> json) {
    return DriverPositionDto(
      lat: _toDouble(json['lat']),
      lng: _toDouble(json['lng']),
      updatedAt: json['updatedAt']?.toString() ?? '',
    );
  }
}

// ─── Review submission ─────────────────────────────────────────────────────

class ReviewSubmitDto {
  final String tripId;
  final String reservationId;
  final String reviewerId;
  final String revieweeId;
  final String revieweeRole;
  final int rating;
  final String comment;
  final List<String> tags;

  const ReviewSubmitDto({
    required this.tripId,
    required this.reservationId,
    required this.reviewerId,
    required this.revieweeId,
    required this.revieweeRole,
    required this.rating,
    required this.comment,
    this.tags = const [],
  });

  Map<String, dynamic> toJson() => {
        'tripId': tripId,
        'reservationId': reservationId,
        'reviewerId': reviewerId,
        'revieweeId': revieweeId,
        'revieweeRole': revieweeRole,
        'rating': rating,
        'comment': comment,
        'tags': tags,
      };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

double _toDouble(dynamic value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

int _toInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}
