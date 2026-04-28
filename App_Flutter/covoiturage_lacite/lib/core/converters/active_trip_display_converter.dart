import '../utils/trip_time_display_utils.dart';
import 'display_converters.dart';

class ActiveTripDisplayModel {
  const ActiveTripDisplayModel({
    required this.tripId,
    required this.timeLabel,
    required this.fromLabel,
    required this.toLabel,
    required this.statusLabel,
    required this.priceLabel,
    required this.passengerLabel,
    required this.progress,
    required this.etaLabel,
    required this.canOpenLiveTrip,
  });

  final String tripId;
  final String timeLabel;
  final String fromLabel;
  final String toLabel;
  final String statusLabel;
  final String priceLabel;
  final String passengerLabel;
  final double progress;
  final String etaLabel;
  final bool canOpenLiveTrip;
}

abstract final class ActiveTripDisplayConverter {
  static ActiveTripDisplayModel? fromDriverTripsPayload(dynamic tripsPayload) {
    final List<Map<String, dynamic>> rows =
        DisplayConverters.extractMapList(tripsPayload);
    if (rows.isEmpty) return null;

    final Map<String, dynamic>? inProgressRow =
        rows.cast<Map<String, dynamic>?>().firstWhere(
              (Map<String, dynamic>? row) =>
                  row != null && _normalizeTripStatus(row) == 'in_progress',
              orElse: () => null,
            );
    if (inProgressRow == null) return null;

    final String tripId = (inProgressRow['id'] ?? '').toString().trim();
    if (tripId.isEmpty) return null;

    final DateTime? departure = _extractDepartureDateTime(inProgressRow);
    final int totalSeats = _toInt(
      inProgressRow['totalSeats'] ??
          inProgressRow['seats'] ??
          inProgressRow['maxPassengers'],
      fallback: 0,
    );
    final int availableSeats = _toInt(
        inProgressRow['availableSeats'] ?? inProgressRow['remainingSeats']);
    final int currentPassengers = _toInt(
      inProgressRow['currentPassengers'],
      fallback: (totalSeats - availableSeats).clamp(0, totalSeats),
    );
    final double price = _toDouble(
      inProgressRow['pricePerPassenger'] ??
          inProgressRow['passengerPrice'] ??
          inProgressRow['price'],
    );
    final int durationMin = _toInt(
      inProgressRow['estimatedDurationMin'] ??
          inProgressRow['estimatedDurationMinutes'],
      fallback: 0,
    );

    final String priceLabel = '${_formatPrice(price)} CAD';
    final String passengerLabel = totalSeats > 0
        ? '$currentPassengers/$totalSeats passagers'
        : '$currentPassengers passagers';

    return ActiveTripDisplayModel(
      tripId: tripId,
      timeLabel: departure == null
          ? '--:--'
          : TripTimeDisplayUtils.formatRelativeDayWithTime(departure),
      fromLabel: (inProgressRow['departureLabel'] ?? 'Depart').toString(),
      toLabel: (inProgressRow['arrivalLabel'] ?? 'Destination').toString(),
      statusLabel: 'En cours',
      priceLabel: priceLabel,
      passengerLabel: passengerLabel,
      progress: 0.38,
      etaLabel: durationMin > 0 ? '$durationMin min' : '--',
      canOpenLiveTrip: true,
    );
  }

  static String _normalizeTripStatus(Map<String, dynamic> row) {
    final dynamic status = row['tripStatus'] ?? row['status'];
    String raw;
    if (status is Map<String, dynamic>) {
      raw = (status['tripStatus'] ?? status['status'] ?? '').toString();
    } else {
      raw = (status ?? '').toString();
    }
    return raw.trim().toLowerCase().replaceAll('-', '_');
  }

  static DateTime? _extractDepartureDateTime(Map<String, dynamic> row) {
    final DateTime? direct = _tryParseDateTime(
      row['departureDateTime'] ??
          row['departureDatetime'] ??
          row['departureTime'] ??
          row['dateTime'],
    );
    if (direct != null) return direct.toLocal();

    final String date = (row['departureDate'] ?? '').toString().trim();
    final String time = (row['departureTime'] ?? '').toString().trim();
    if (date.isEmpty || time.isEmpty) return null;

    final String cleanTime = time.contains('T')
        ? time.split('T').last
        : (time.contains(' ') ? time.split(' ').last : time);
    final DateTime? combined = _tryParseDateTime('$date $cleanTime');
    return combined?.toLocal();
  }

  static DateTime? _tryParseDateTime(dynamic value) {
    if (value == null) return null;
    final String raw = value.toString().trim();
    if (raw.isEmpty) return null;

    return DateTime.tryParse(raw) ??
        DateTime.tryParse(raw.replaceFirst(' ', 'T'));
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

  static String _formatPrice(double value) {
    return value % 1 == 0 ? value.toStringAsFixed(0) : value.toStringAsFixed(2);
  }
}
