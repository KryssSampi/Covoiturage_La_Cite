// ============================================================
// lib/features/trajet_en_cours/services/trajet_en_cours_service.dart
// Appels API vers Server Core
// GET /api/trips/{id}/live          → TrajetEnCoursDto
// PATCH /api/trips/{id}/complete    → void
// POST /api/trips/{id}/cancel       → void
// POST /api/reviews                 → void
// GET /api/gps/trips/{id}/latest/{userId} → GpsPositionResponseDto
// GET /api/reviews?tripId=...       → List<ReviewResponseDto>
// ============================================================

import '../../../core/services/api_service.dart';
import '../models/trajet_en_cours_models.dart';

class TrajetEnCoursService {
  const TrajetEnCoursService(this._api);

  final ApiService _api;

  /// GET /api/trips/{id}/live
  /// Retourne TrajetEnCoursDto : trip + passengers + driverPosition
  Future<TrajetEnCoursDto> getLive(String tripId) async {
    final dynamic payload = await _api.get('/api/trips/$tripId/live');
    final Map<String, dynamic> map = _extractMap(payload);
    return TrajetEnCoursDto.fromJson(map);
  }

  /// PATCH /api/trips/{id}/complete
  Future<void> completeTrip(String tripId) async {
    await _api.patch('/api/trips/$tripId/complete', {});
  }

  /// POST /api/trips/{id}/cancel
  Future<void> cancelTrip(String tripId, {String? reason}) async {
    await _api.post('/api/trips/$tripId/cancel', {'reason': reason ?? ''});
  }

  /// POST /api/reviews
  Future<void> submitReview(ReviewSubmitDto dto) async {
    await _api.post('/api/reviews', dto.toJson());
  }

  /// GET /api/gps/trips/{tripId}/latest/{driverId}
  /// Polling position conducteur en temps réel
  /// [driverId] = UserId du conducteur (trip.driverId)
  Future<DriverPositionDto?> getDriverPosition(
      String tripId, String driverId) async {
    if (driverId.isEmpty) return null;
    try {
      final dynamic payload = await _api.get(
        '/api/gps/trips/$tripId/latest/$driverId',
      );
      final Map<String, dynamic> map = _extractMap(payload);
      final double lat = _toDouble(map['latitude']);
      final double lng = _toDouble(map['longitude']);
      if (lat == 0 && lng == 0) return null;
      return DriverPositionDto(
        lat: lat,
        lng: lng,
        updatedAt: map['capturedAt']?.toString() ??
            DateTime.now().toUtc().toIso8601String(),
      );
    } catch (_) {
      return null;
    }
  }

  /// GET /api/reviews?tripId={id}&reviewerId={userId}
  /// Retourne les IDs des utilisateurs déjà évalués dans ce trajet
  Future<List<String>> getAlreadyReviewedIds(
      String tripId, String reviewerId) async {
    try {
      final dynamic payload = await _api.get(
        '/api/reviews',
        params: {'tripId': tripId, 'reviewerId': reviewerId},
      );
      final List<dynamic> rows = _extractList(payload);
      return rows
          .whereType<Map<String, dynamic>>()
          .map((r) => r['revieweeId']?.toString() ?? '')
          .where((id) => id.isNotEmpty)
          .toList();
    } catch (_) {
      return [];
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  static Map<String, dynamic> _extractMap(dynamic payload) {
    if (payload is Map<String, dynamic>) {
      final dynamic data = payload['data'];
      if (data is Map<String, dynamic>) return data;
      return payload;
    }
    return {};
  }

  static List<dynamic> _extractList(dynamic payload) {
    if (payload is List<dynamic>) return payload;
    if (payload is Map<String, dynamic>) {
      final dynamic data =
          payload['data'] ?? payload['items'] ?? payload['results'];
      if (data is List<dynamic>) return data;
    }
    return [];
  }

  static double _toDouble(dynamic v) {
    if (v is double) return v;
    if (v is num) return v.toDouble();
    return double.tryParse(v?.toString() ?? '') ?? 0;
  }
}
