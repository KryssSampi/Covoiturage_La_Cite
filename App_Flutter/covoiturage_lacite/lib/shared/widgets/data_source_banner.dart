import 'package:flutter/material.dart';

class DataSourceBanner extends StatelessWidget {
  const DataSourceBanner({
    super.key,
    required this.isOfflineFixture,
    required this.isStaleCache,
    this.onRefresh,
  });

  final bool isOfflineFixture;
  final bool isStaleCache;
  final VoidCallback? onRefresh;

  @override
  Widget build(BuildContext context) {
    if (!isOfflineFixture && !isStaleCache) return const SizedBox.shrink();

    final bool fixture = isOfflineFixture && !isStaleCache;
    final Color bg = fixture ? const Color(0xFFFCEBEB) : const Color(0xFFFAEEDA);
    final Color fg = fixture ? const Color(0xFFE24B4A) : const Color(0xFF854F0B);

    return Container(
      width: double.infinity,
      color: bg,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: <Widget>[
          Icon(
            isStaleCache ? Icons.wifi_off_rounded : Icons.info_outline,
            size: 14,
            color: fg,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isStaleCache
                  ? 'Hors ligne: donnees locales affichees'
                  : 'Mode demo: donnees fixtures',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: fg,
              ),
            ),
          ),
          if (onRefresh != null)
            GestureDetector(
              onTap: onRefresh,
              child: Icon(Icons.refresh_rounded, size: 16, color: fg),
            ),
        ],
      ),
    );
  }
}

