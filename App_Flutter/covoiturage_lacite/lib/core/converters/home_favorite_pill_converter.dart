import 'display_converters.dart';

class HomeFavoritePillModel {
  const HomeFavoritePillModel({
    required this.label,
    required this.value,
    required this.iconTag,
    this.isAnchored = false,
  });

  final String label;
  final String value;
  final String iconTag;
  final bool isAnchored;
}

abstract final class HomeFavoritePillConverter {
  static List<HomeFavoritePillModel> toPills(dynamic payload) {
    final List<HomeFavoritePillModel> fromFlatList = _fromFlatList(payload);
    if (fromFlatList.isNotEmpty) return _dedupeByValue(fromFlatList);

    final List<HomeFavoritePillModel> fromLegacyMap = _fromLegacyMap(payload);
    return _dedupeByValue(fromLegacyMap);
  }

  static List<HomeFavoritePillModel> _fromFlatList(dynamic payload) {
    final List<Map<String, dynamic>> rows =
        DisplayConverters.extractMapList(payload);
    if (rows.isEmpty) return const <HomeFavoritePillModel>[];

    final List<HomeFavoritePillModel> result = <HomeFavoritePillModel>[];
    for (final Map<String, dynamic> row in rows) {
      final String label =
          (row['pseudonyme'] ?? row['label'] ?? row['name'] ?? '')
              .toString()
              .trim();
      final String value =
          (row['adresse'] ?? row['address'] ?? row['value'] ?? '')
              .toString()
              .trim();
      if (label.isEmpty || value.isEmpty) continue;

      result.add(
        HomeFavoritePillModel(
          label: label,
          value: value,
          iconTag: (row['iconTag'] ?? row['icon'] ?? 'autre').toString().trim(),
          isAnchored: row['isAnchored'] == true,
        ),
      );
    }
    return result;
  }

  static List<HomeFavoritePillModel> _fromLegacyMap(dynamic payload) {
    final Map<String, dynamic> root = DisplayConverters.extractMap(payload);
    final dynamic placesRaw = root['places'];
    if (placesRaw is! List) return const <HomeFavoritePillModel>[];

    final List<HomeFavoritePillModel> result = <HomeFavoritePillModel>[];
    for (final dynamic item in placesRaw) {
      if (item is! Map<String, dynamic>) continue;
      final String label =
          (item['label'] ?? item['pseudonyme'] ?? '').toString().trim();
      final String value =
          (item['address'] ?? item['adresse'] ?? item['value'] ?? '')
              .toString()
              .trim();
      if (label.isEmpty || value.isEmpty) continue;

      result.add(
        HomeFavoritePillModel(
          label: label,
          value: value,
          iconTag:
              (item['iconTag'] ?? item['icon'] ?? 'autre').toString().trim(),
          isAnchored: item['isAnchored'] == true,
        ),
      );
    }
    return result;
  }

  static List<HomeFavoritePillModel> _dedupeByValue(
      List<HomeFavoritePillModel> list) {
    final Set<String> seen = <String>{};
    final List<HomeFavoritePillModel> out = <HomeFavoritePillModel>[];
    for (final HomeFavoritePillModel pill in list) {
      final String key = pill.value.trim().toLowerCase();
      if (key.isEmpty || seen.contains(key)) continue;
      seen.add(key);
      out.add(pill);
    }
    return out;
  }
}
