
import '../models/trip.dart';
import 'api_service.dart';
import '../utils/parsing.dart' as parsing;

class TripService {
  TripService(this._api);

  final ApiService _api;

  Future<void> cancelReservation(String reservationId, {String? reason}) async {
    try {
      await _api.post('/api/reservations/$reservationId/cancel', {'reason': reason ?? ''});
    } catch (e) {
      // Ne jamais faire crasher l'app, log possible
    }
  }

  Future<List<Trip>> searchTrips({
    required String from,
    required String to,
    String? date,
    int seats = 1,
  }) async {
    final data = await _api.get('/api/trips/search', params: {
      'from': from,
      'to': to,
      if (date != null) 'date': date,
      'seats': '$seats',
    });
    final items = parsing.extractList(data);
    return items.map((e) => Trip.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> getTripPayloadById(String id) async {
    final data = await _api.get('/api/trips/$id');
    final body = data as Map<String, dynamic>;
    final payload = body['data'] ?? body;
    if (payload is Map<String, dynamic>) return payload;
    return <String, dynamic>{};
  }

  Future<Trip> getTripById(String id) async {
    final payload = await getTripPayloadById(id);
    return Trip.fromJson(payload);
  }

  Future<ReservationResult> createReservation({required String tripId}) async {
    final data = await _api.post('/api/reservations', {'tripId': tripId});
    return ReservationResult.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Map<String, dynamic>>> getDriverTrips() async {
    final data = await _api.get('/api/trips/mine/driver');
    return parsing
        .extractList(data)
        .whereType<Map<String, dynamic>>()
        .toList();
  }

  Future<void> acceptReservation(String reservationId) async {
    await _api.post('/api/reservations/$reservationId/accept', {});
  }

  Future<void> refuseReservation(String reservationId) async {
    await _api.post('/api/reservations/$reservationId/refuse', {});
  }
}
