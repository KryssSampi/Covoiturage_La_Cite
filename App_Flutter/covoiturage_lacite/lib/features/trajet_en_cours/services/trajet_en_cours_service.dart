// ============================================================
// lib/features/trajet_en_cours/services/trajet_en_cours_service.dart
// Appels API vers /api/trajet-en-cours/[id]
// BFF Next.js → Server Core
// ============================================================

import '../../../core/services/api_service.dart';
import '../models/trajet_en_cours_models.dart';

class TrajetEnCoursService {
  const TrajetEnCoursService(this._api);

  final ApiService _api;

  /// GET /api/trajet-en-cours/[id]
  /// Retourne trip + passengers + driverPosition
  Future<TrajetEnCoursDto> getLive(String tripId) async {
    final dynamic payload = await _api.get('/api/trajet-en-cours/$tripId');
    final Map<String, dynamic> map = _extractMap(payload);
    return TrajetEnCoursDto.fromJson(map);
  }

  /// PATCH /api/trips/[id]/complete
  Future<void> completeTrip(String tripId) async {
    await _api.patch('/api/trips/$tripId/complete', {});
  }

  /// POST /api/trips/[id]/cancel
  Future<void> cancelTrip(String tripId, {String? reason}) async {
    await _api.post('/api/trips/$tripId/cancel', {'reason': reason ?? ''});
  }

  /// POST /api/reviews
  Future<void> submitReview(ReviewSubmitDto dto) async {
    await _api.post('/api/reviews', dto.toJson());
  }

  /// GET /api/trips/[id]/positions — polling positions en temps réel
  Future<DriverPositionDto?> getDriverPosition(String tripId) async {
    try {
      final dynamic payload = await _api.get('/api/trips/$tripId/positions');
      final Map<String, dynamic> map = _extractMap(payload);
      final dynamic driverPos = map['driverPos'] ?? map['driverPosition'];
      if (driverPos is Map<String, dynamic>) {
        return DriverPositionDto.fromJson(driverPos);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// GET /api/reviews?tripId=[id]&reviewerId=[userId]
  /// Retourne les IDs déjà évalués
  Future<List<String>> getAlreadyReviewedIds(String tripId, String reviewerId) async {
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
      final dynamic data = payload['data'] ?? payload['items'] ?? payload['results'];
      if (data is List<dynamic>) return data;
    }
    return [];
  }
}
