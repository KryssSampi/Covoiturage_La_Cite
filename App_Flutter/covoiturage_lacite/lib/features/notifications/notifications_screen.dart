import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService.instance;
  bool _isLoading = true;
  bool _isMarkingAll = false;
  String? _error;
  List<_NotificationItem> _items = <_NotificationItem>[];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dynamic payload = await _api.get('/api/notifications');
      final List<dynamic> rows = _extractList(payload);
      final List<_NotificationItem> items = rows
          .whereType<Map<String, dynamic>>()
          .map(_NotificationItem.fromJson)
          .toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      if (!mounted) return;
      setState(() {
        _items = items;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _markAllRead() async {
    if (_isMarkingAll) return;
    setState(() {
      _isMarkingAll = true;
    });
    try {
      await _api.patch('/api/notifications/read-all', <String, dynamic>{});
      if (!mounted) return;
      setState(() {
        _items = _items.map((n) => n.copyWith(isRead: true)).toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Toutes les notifications sont lues.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Operation impossible: $e')),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _isMarkingAll = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final int unreadCount = _items.where((n) => !n.isRead).length;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: <Widget>[
          IconButton(
            onPressed: _isLoading ? null : _loadNotifications,
            icon: const Icon(Icons.refresh),
          ),
          TextButton(
            onPressed: (_items.isEmpty || unreadCount == 0 || _isMarkingAll) ? null : _markAllRead,
            child: _isMarkingAll ? const Text('...') : const Text('Tout lire'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadNotifications,
        child: _buildBody(unreadCount: unreadCount),
      ),
    );
  }

  Widget _buildBody({required int unreadCount}) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Text('Erreur: $_error'),
          const SizedBox(height: 8),
          FilledButton(onPressed: _loadNotifications, child: const Text('Reessayer')),
        ],
      );
    }
    if (_items.isEmpty) {
      return ListView(
        children: const <Widget>[
          SizedBox(height: 120),
          Center(child: Text('Aucune notification.')),
        ],
      );
    }
    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(12),
      itemCount: _items.length + 1,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (_, int index) {
        if (index == 0) {
          return Text('Non lues: $unreadCount');
        }
        final _NotificationItem item = _items[index - 1];
        return Card(
          color: item.isRead ? Colors.white : const Color(0xFFE8F0FE),
          child: ListTile(
            onTap: () => context.push('/notification/${item.id}', extra: {
              'id': item.id,
              'title': item.title,
              'body': item.body,
              'createdAt': item.createdAt.toIso8601String(),
              'isRead': item.isRead,
              'tripId': item.tripId,
            }),
            leading: Icon(item.isRead ? Icons.notifications_none : Icons.notifications_active),
            title: Text(item.title),
            subtitle: Text('${item.body}\n${_fmtDateTime(item.createdAt)}'),
            isThreeLine: true,
            trailing: const Icon(Icons.chevron_right, size: 18, color: Color(0xFF8A95A8)),
          ),
        );
      },
    );
  }
}

class _NotificationItem {
  _NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.createdAt,
    required this.isRead,
    required this.tripId,
  });

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool isRead;
  final String? tripId;

  factory _NotificationItem.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic>? data =
        json['data'] is Map<String, dynamic> ? json['data'] as Map<String, dynamic> : null;
    return _NotificationItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? json['type']?.toString() ?? 'Notification',
      body: json['body']?.toString() ?? json['message']?.toString() ?? '',
      createdAt: _toDateTime(json['createdAt'] ?? json['date']) ?? DateTime.now(),
      isRead: _toBool(json['isRead'] ?? json['read'] ?? (json['readAt'] != null)),
      tripId: json['tripId']?.toString() ?? data?['tripId']?.toString(),
    );
  }

  _NotificationItem copyWith({
    String? id,
    String? title,
    String? body,
    DateTime? createdAt,
    bool? isRead,
    String? tripId,
  }) {
    return _NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      createdAt: createdAt ?? this.createdAt,
      isRead: isRead ?? this.isRead,
      tripId: tripId ?? this.tripId,
    );
  }
}

List<dynamic> _extractList(dynamic payload) => parsing.extractList(payload);

DateTime? _toDateTime(dynamic value) => parsing.toDateTime(value);

bool _toBool(dynamic value) => parsing.toBool(value);

String _fmtDateTime(DateTime dt) {
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${dt.year}-${two(dt.month)}-${two(dt.day)} ${two(dt.hour)}:${two(dt.minute)}';
}

