import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/converters/display_converters.dart';
import '../../core/services/api_service.dart';
import '../../core/utils/parsing.dart' as parsing;
import '../../shared/widgets/item_list_view.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';
  List<ConversationData> _items = <ConversationData>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dynamic payload =
          await ApiService.instance.get('/api/messages/conversations');
      final List<dynamic> rows = parsing.extractList(payload);
      if (!mounted) return;
      setState(() {
        _items = rows
            .whereType<Map<String, dynamic>>()
            .map(DisplayConverters.toConversationViewRow)
            .map(_mapConversation)
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  ConversationData _mapConversation(Map<String, dynamic> row) {
    final Map<String, dynamic>? user =
        row['otherUser'] is Map<String, dynamic> ? row['otherUser'] as Map<String, dynamic> : null;
    final String name = '${user?['firstName'] ?? row['firstName'] ?? ''} ${user?['lastName'] ?? row['lastName'] ?? ''}'.trim();
    final String finalName = name.isEmpty ? (row['title']?.toString() ?? 'Conversation') : name;
    return ConversationData(
      id: row['id']?.toString() ?? '',
      title: finalName,
      subtitle: row['lastMessage']?.toString() ?? row['preview']?.toString() ?? '',
      timeLabel: row['updatedAt']?.toString() ?? row['createdAt']?.toString() ?? '',
      unreadCount: (row['unreadCount'] as num?)?.toInt() ?? 0,
      tripId: row['tripId']?.toString() ?? row['trip']?['id']?.toString() ?? '',
    );
  }

  List<ConversationData> get _filtered {
    if (_searchQuery.isEmpty) return _items;
    final String q = _searchQuery.toLowerCase();
    return _items.where((ConversationData c) {
      return c.title.toLowerCase().contains(q) || c.subtitle.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF08316E),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ItemListView<ConversationData>(
        items: _items,
        filteredItems: _filtered,
        isLoading: _isLoading,
        error: _error,
        searchHint: 'Rechercher une conversation...',
        onRefresh: _load,
        onSearch: (String q) => setState(() => _searchQuery = q),
        emptyTitle: 'Aucune conversation',
        emptySubtitle: 'Vos conversations apparaîtront ici.',
        itemBuilder: (ConversationData data) => ConversationCard(
          data: data,
          onTap: () {
            if (data.tripId.isNotEmpty) {
              context.push('/chat/${data.tripId}');
            }
          },
        ),
      ),
    );
  }
}

class ConversationData {
  const ConversationData({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.timeLabel,
    required this.unreadCount,
    required this.tripId,
  });

  final String id;
  final String title;
  final String subtitle;
  final String timeLabel;
  final int unreadCount;
  final String tripId;
}

class ConversationCard extends StatelessWidget {
  const ConversationCard({super.key, required this.data, this.onTap});

  final ConversationData data;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: const Color(0xFF1A56CC),
        child: Text(
          data.title.isEmpty ? 'C' : data.title.substring(0, 1).toUpperCase(),
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
      ),
      title: Text(data.title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(data.subtitle, maxLines: 1, overflow: TextOverflow.ellipsis),
      trailing: data.unreadCount > 0
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF1A56CC),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                data.unreadCount > 99 ? '99+' : '${data.unreadCount}',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
              ),
            )
          : const Icon(Icons.chevron_right_rounded),
    );
  }
}
