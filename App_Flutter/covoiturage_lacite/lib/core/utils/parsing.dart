List<dynamic> extractList(dynamic payload) {
  if (payload is List<dynamic>) return payload;
  if (payload is Map<String, dynamic>) {
    final dynamic data = payload['data'] ?? payload['items'] ?? payload['results'];
    if (data is List<dynamic>) return data;
    if (data is Map<String, dynamic>) {
      final dynamic nested =
          data['items'] ?? data['results'] ?? data['rows'] ?? data['list'] ?? data['data'];
      if (nested is List<dynamic>) return nested;
    }
  }
  return <dynamic>[];
}

Map<String, dynamic>? extractMap(dynamic payload) {
  if (payload is Map<String, dynamic>) {
    final dynamic data = payload['data'];
    if (data is Map<String, dynamic>) return data;
    if (data is List<dynamic>) {
      for (final dynamic row in data) {
        if (row is Map<String, dynamic>) return row;
      }
    }
    return payload;
  }
  return null;
}

DateTime? toDateTime(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  return DateTime.tryParse(value.toString());
}

bool toBool(dynamic value) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  final String s = value?.toString().toLowerCase() ?? '';
  return s == 'true' || s == '1';
}

int toInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

double toDouble(dynamic value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}
