import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final ApiService _api = ApiService.instance;
  bool _isLoading = true;
  String? _error;
  List<_ChatTrip> _trips = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final results = await Future.wait([
        _fetchTrips('/api/trips/mine/driver'),
        _fetchTrips('/api/trips/mine/passenger'),
      ]);
      final seen = <String>{};
      final merged = <_ChatTrip>[];
      for (final list in results) {
        for (final t in list) {
          if (seen.add(t.id)) merged.add(t);
        }
      }
      merged.sort((a, b) => b.departureTime.compareTo(a.departureTime));
      if (!mounted) return;
      setState(() => _trips = merged);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<List<_ChatTrip>> _fetchTrips(String path) async {
    try {
      final payload = await _api.get(path);
      final rows = _extractList(payload);
      return rows.whereType<Map<String, dynamic>>().map(_ChatTrip.fromJson).toList();
    } catch (_) {
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Messages',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Color(0xFF0D1624))),
                  IconButton(
                    onPressed: _isLoading ? null : _load,
                    icon: const Icon(Icons.refresh_rounded, color: Color(0xFF7A879A)),
                  ),
                ],
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _load,
                child: _buildBody(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return const Center(child: CircularProgressIndicator(color: Color(0xFF1A56CC)));
    if (_error != null) return _EmptyState(
      icon: Icons.wifi_off_rounded,
      iconColor: const Color(0xFFE24B4A),
      iconBg: const Color(0xFFFCEBEB),
      title: 'Erreur de connexion',
      subtitle: _error!,
      actionLabel: 'Réessayer',
      onAction: _load,
    );
    if (_trips.isEmpty) return const _EmptyState(
      icon: Icons.chat_bubble_outline_rounded,
      iconColor: Color(0xFF8A95A8),
      iconBg: Color(0xFFEEF0F5),
      title: 'Aucune conversation',
      subtitle: 'Vos conversations apparaîtront ici dès que vous aurez un trajet.',
    );

    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _trips.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _TripChatTile(trip: _trips[i]),
    );
  }
}

class _TripChatTile extends StatelessWidget {
  const _TripChatTile({required this.trip});
  final _ChatTrip trip;

  @override
  Widget build(BuildContext context) {
    final chatAvailable = DateTime.now().isAfter(
      trip.departureTime.subtract(const Duration(hours: 2)),
    );
    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: chatAvailable ? () => context.push('/chat/${trip.id}') : null,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 46, height: 46,
                decoration: BoxDecoration(
                  color: chatAvailable ? const Color(0xFF1A56CC) : const Color(0xFFD8DBE5),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  chatAvailable ? Icons.chat_rounded : Icons.lock_clock_rounded,
                  color: Colors.white, size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${trip.departureLabel} → ${trip.arrivalLabel}',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0D1624)),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      _fmtDateTime(trip.departureTime),
                      style: const TextStyle(fontSize: 12, color: Color(0xFF7A879A)),
                    ),
                    if (!chatAvailable)
                      const Text(
                        'Chat disponible 2h avant le départ',
                        style: TextStyle(fontSize: 11, color: Color(0xFFd97706)),
                      ),
                  ],
                ),
              ),
              if (chatAvailable)
                const Icon(Icons.chevron_right_rounded, color: Color(0xFF1A56CC)),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon, required this.iconColor, required this.iconBg,
    required this.title, required this.subtitle,
    this.actionLabel, this.onAction,
  });
  final IconData icon;
  final Color iconColor, iconBg;
  final String title, subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return ListView(children: [
      const SizedBox(height: 80),
      Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 72, height: 72,
            decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
            child: Icon(icon, size: 36, color: iconColor)),
        const SizedBox(height: 16),
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Text(subtitle, textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Color(0xFF7A879A))),
        ),
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: onAction,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1A56CC), foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: Text(actionLabel!),
          ),
        ],
      ])),
    ]);
  }
}

List<dynamic> _extractList(dynamic payload) {
  if (payload is List<dynamic>) return payload;
  if (payload is Map<String, dynamic>) {
    final data = payload['data'] ?? payload['items'] ?? payload['results'];
    if (data is List<dynamic>) return data;
  }
  return [];
}

String _fmtDateTime(DateTime dt) {
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${dt.year}-${two(dt.month)}-${two(dt.day)} ${two(dt.hour)}:${two(dt.minute)}';
}

class _ChatTrip {
  final String id, departureLabel, arrivalLabel;
  final DateTime departureTime;

  const _ChatTrip({
    required this.id, required this.departureLabel,
    required this.arrivalLabel, required this.departureTime,
  });

  factory _ChatTrip.fromJson(Map<String, dynamic> json) {
    return _ChatTrip(
      id: json['id']?.toString() ?? '',
      departureLabel: _str(json, ['departureLabel', 'fromLabel', 'departureCity', 'from']),
      arrivalLabel: _str(json, ['arrivalLabel', 'toLabel', 'arrivalCity', 'to']),
      departureTime: _toDateTime(json['departureTime'] ?? json['departureDateTime'] ?? json['startTime']) ?? DateTime.now(),
    );
  }
}

String _str(Map<String, dynamic> json, List<String> keys) {
  for (final k in keys) {
    final v = json[k];
    if (v != null && v.toString().trim().isNotEmpty) return v.toString().trim();
  }
  return '';
}

DateTime? _toDateTime(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  return DateTime.tryParse(value.toString());
}
