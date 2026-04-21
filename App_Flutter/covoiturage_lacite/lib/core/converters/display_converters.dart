import '../utils/parsing.dart' as parsing;

class HomeDashboardDisplay {
  const HomeDashboardDisplay({
    required this.firstName,
    required this.totalTrips,
    required this.averageRating,
    required this.totalPassengers,
    required this.totalRevenue,
    required this.pendingRequests,
  });

  final String firstName;
  final int totalTrips;
  final double averageRating;
  final int totalPassengers;
  final double totalRevenue;
  final List<Map<String, dynamic>> pendingRequests;
}

abstract final class DisplayConverters {
  static Map<String, dynamic> extractMap(dynamic payload) {
    return parsing.extractMap(payload) ?? <String, dynamic>{};
  }

  static List<Map<String, dynamic>> extractMapList(dynamic payload) {
    return parsing
        .extractList(payload)
        .whereType<Map<String, dynamic>>()
        .toList();
  }

  static HomeDashboardDisplay toHomeDashboard({
    required dynamic userPayload,
    required dynamic tripsPayload,
    required dynamic pendingPayload,
    required dynamic financePayload,
  }) {
    final Map<String, dynamic> user = extractMap(userPayload);
    final Map<String, dynamic> driverProfile =
        _asMap(user['driverProfile']);
    final List<Map<String, dynamic>> trips = extractMapList(tripsPayload);
    final List<Map<String, dynamic>> pendingRows =
        extractMapList(pendingPayload);
    final Map<String, dynamic> finance = extractMap(financePayload);

    final int totalTrips = _toInt(
      driverProfile['totalTripsAsDriver'],
      fallback: trips.length,
    );
    final double averageRating = _toDouble(
      driverProfile['averageRating'] ?? user['averageRating'],
      fallback: 0,
    );
    final int totalPassengers = trips.fold<int>(
      0,
      (int acc, Map<String, dynamic> row) =>
          acc + _toInt(row['currentPassengers']),
    );
    final double totalRevenue = _toDouble(
      finance['gainMois'] ??
          finance['monthlyRevenue'] ??
          finance['totalRevenue'],
      fallback: 0,
    );

    return HomeDashboardDisplay(
      firstName: user['firstName']?.toString() ?? '',
      totalTrips: totalTrips,
      averageRating: averageRating,
      totalPassengers: totalPassengers,
      totalRevenue: totalRevenue,
      pendingRequests: pendingRows.map(toPendingRequestForHome).toList(),
    );
  }

  static Map<String, dynamic> toPendingRequestForHome(
    Map<String, dynamic> row,
  ) {
    if (row['trip'] is Map<String, dynamic> &&
        (row['passengerFirstName'] != null || row['passenger'] != null)) {
      if (row['passenger'] is Map<String, dynamic>) {
        final Map<String, dynamic> passenger =
            row['passenger'] as Map<String, dynamic>;
        return <String, dynamic>{
          'id': row['id'] ?? row['reservation']?['id'],
          'passengerFirstName':
              passenger['firstName'] ?? row['passengerFirstName'],
          'passengerLastName':
              passenger['lastName'] ?? row['passengerLastName'],
          'trip': row['trip'],
        };
      }
      return row;
    }

    final Map<String, dynamic> trip = _asMap(row['trip']);
    final Map<String, dynamic> passenger = _asMap(row['passenger']);
    final Map<String, dynamic> reservation = _asMap(row['reservation']);
    if (trip.isEmpty && passenger.isEmpty && reservation.isEmpty) {
      return row;
    }

    final String departureDate = trip['departureDate']?.toString() ?? '';
    final String departureTime = trip['departureTime']?.toString() ?? '';
    final String departureDateTime = departureDate.isNotEmpty &&
            departureTime.isNotEmpty
        ? '${departureDate}T$departureTime'
        : '';

    return <String, dynamic>{
      'id': reservation['id']?.toString() ?? row['id']?.toString() ?? '',
      'passengerFirstName': passenger['firstName']?.toString() ?? '',
      'passengerLastName': passenger['lastName']?.toString() ?? '',
      'trip': <String, dynamic>{
        'id': trip['id']?.toString() ?? '',
        'departureLabel': trip['departureLabel']?.toString() ?? '',
        'arrivalLabel': trip['arrivalLabel']?.toString() ?? '',
        'departureTime': departureDateTime,
      },
    };
  }

  static Map<String, dynamic> toProfileViewJson(Map<String, dynamic> dto) {
    final Map<String, dynamic> preferences = _asMap(dto['preferences']);
    final Map<String, dynamic> driverProfile = _asMap(dto['driverProfile']);

    return <String, dynamic>{
      ...dto,
      'role': (dto['role']?.toString().toLowerCase().contains('driver') ?? false)
          ? 'Conducteur'
          : 'Passager',
      'isVerified': dto['isVerified'] ?? dto['isProfileVerified'] ?? false,
      'averageRating':
          driverProfile['averageRating'] ?? dto['averageRating'] ?? 0,
      'stats': <String, dynamic>{
        'goScore': dto['goScore'] ?? 0,
        'totalTrips':
            driverProfile['totalTripsAsDriver'] ?? dto['totalTrips'] ?? 0,
        'averageRating':
            driverProfile['averageRating'] ?? dto['averageRating'] ?? 0,
        'co2SavedKg': driverProfile['co2SavedKg'] ?? dto['co2SavedKg'] ?? 0,
      },
      'preferences': <String, dynamic>{
        'musicAccepted': preferences['musicAccepted'] == true,
        'petsAccepted': preferences['petsAccepted'] == true,
        'smokingAccepted': preferences['smokingAccepted'] == true,
        'conversationLevel':
            preferences['conversationLevel']?.toString() ?? 'moderate',
      },
      'notifications': <String, dynamic>{
        'emailPrimordiales': _toBool(
          preferences['emailPrimordiales'],
          fallback: true,
        ),
        'emailSecondaires': _toBool(
          preferences['emailSecondaires'],
          fallback: true,
        ),
        'emailNegligeables': _toBool(
          preferences['emailNegligeables'],
          fallback: false,
        ),
        'pushPrimordiales': _toBool(
          preferences['pushPrimordiales'],
          fallback: true,
        ),
        'pushSecondaires': _toBool(
          preferences['pushSecondaires'],
          fallback: false,
        ),
        'pushNegligeables': _toBool(
          preferences['pushNegligeables'],
          fallback: false,
        ),
      },
      'privacy': <String, dynamic>{
        'showPhoneNumber': false,
        'showLastName': true,
        'allowAffinityTracking': true,
      },
      'visibility': <String, dynamic>{
        'showGoScore': true,
        'showTripsCount': true,
        'showRating': true,
        'showCo2': true,
      },
      'languagesSpoken':
          (dto['languagesSpoken'] as List<dynamic>?)?.map((e) => '$e').toList(),
    };
  }

  static Map<String, dynamic> toConversationViewRow(
    Map<String, dynamic> dto,
  ) {
    if (dto['otherUser'] is Map<String, dynamic>) return dto;

    final String name = dto['otherUserName']?.toString() ?? '';
    final List<String> tokens =
        name.split(' ').where((String part) => part.isNotEmpty).toList();
    final String firstName = tokens.isEmpty ? 'Utilisateur' : tokens.first;
    final String lastName =
        tokens.length > 1 ? tokens.sublist(1).join(' ') : '';
    final String tripId = dto['tripId']?.toString() ?? '';

    return <String, dynamic>{
      'id': dto['id']?.toString() ?? (tripId.isEmpty ? '' : 'conv_$tripId'),
      'tripId': tripId,
      'otherUser': <String, dynamic>{
        'firstName': firstName,
        'lastName': lastName,
        'avatarUrl': dto['otherUserAvatar'],
      },
      'title': dto['tripLabel']?.toString() ?? 'Conversation',
      'lastMessage': dto['lastMessageContent']?.toString() ?? '',
      'updatedAt': dto['lastMessageAt']?.toString() ?? dto['updatedAt']?.toString(),
      'unreadCount': _toInt(dto['unreadCount']),
    };
  }

  static Map<String, dynamic> _asMap(dynamic value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map(
        (dynamic key, dynamic v) => MapEntry(key.toString(), v),
      );
    }
    return <String, dynamic>{};
  }

  static int _toInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static double _toDouble(dynamic value, {double fallback = 0}) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static bool _toBool(dynamic value, {bool fallback = false}) {
    if (value is bool) return value;
    if (value is num) return value != 0;
    final String raw = value?.toString().toLowerCase() ?? '';
    if (raw == 'true' || raw == '1') return true;
    if (raw == 'false' || raw == '0') return false;
    return fallback;
  }
}
