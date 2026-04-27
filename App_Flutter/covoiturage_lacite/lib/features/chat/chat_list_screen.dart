import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/services/api_service.dart';
import '../../core/state/app_state.dart';
import '../../core/utils/parsing.dart' as parsing;

// ─── ÉCRAN LISTE DES CONVERSATIONS ────────────────────────────────────────────
// Charge les conversations depuis /api/messages/conversations (endpoint dédié)
// Fallback sur /api/trips/mine/driver + /api/trips/mine/passenger
// Propage otherUserName, otherUserInitials, tripRoute vers ChatScreen

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final ApiService _api = ApiService.instance;
  bool _isLoading = true;
  String? _error;
  List<_ConversationItem> _conversations = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (mounted)
      setState(() {
        _isLoading = true;
        _error = null;
      });
    try {
      // Priorité : endpoint conversations dédié
      final List<_ConversationItem> convs = await _fetchConversations();
      if (!mounted) return;
      setState(() {
        _conversations = convs;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<List<_ConversationItem>> _fetchConversations() async {
    // Essai 1 : /api/messages/conversations (ConversationSummaryDto)
    try {
      final payload = await _api.get('/api/messages/conversations');
      final rows = parsing.extractList(payload);
      if (rows.isNotEmpty) {
        return rows
            .whereType<Map<String, dynamic>>()
            .map(_ConversationItem.fromConversationDto)
            .toList()
          ..sort((a, b) => (b.lastMessageAt ?? DateTime(0))
              .compareTo(a.lastMessageAt ?? DateTime(0)));
      }
    } catch (_) {}

    // Essai 2 : fusionner les trajets conducteur + passager
    final isDriver = AppStateStore.instance.isDriver;
    final paths = isDriver
        ? ['/api/trips/mine/driver', '/api/trips/mine/passenger']
        : ['/api/trips/mine/passenger', '/api/trips/mine/driver'];

    final results = await Future.wait(paths.map(_fetchTripsAsList));
    final seen = <String>{};
    final merged = <_ConversationItem>[];
    for (final list in results) {
      for (final item in list) {
        if (seen.add(item.tripId)) merged.add(item);
      }
    }
    merged.sort((a, b) => (b.departureTime ?? DateTime(0))
        .compareTo(a.departureTime ?? DateTime(0)));
    return merged;
  }

  Future<List<_ConversationItem>> _fetchTripsAsList(String path) async {
    try {
      final payload = await _api.get(path);
      final rows = parsing.extractList(payload);
      return rows
          .whereType<Map<String, dynamic>>()
          .map(_ConversationItem.fromTripJson)
          .where((c) => c.tripId.isNotEmpty)
          .toList();
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
            _buildHeader(),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _load,
                color: const Color(0xFF1A56CC),
                child: _buildBody(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 16, 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0x0F000000))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Messages',
              style: GoogleFonts.sora(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0D1624)),
            ),
          ),
          if (_conversations.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF1A56CC),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '${_conversations.length}',
                style: GoogleFonts.sora(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white),
              ),
            ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: _isLoading ? null : _load,
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF7A879A)),
            splashRadius: 20,
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
          child: CircularProgressIndicator(color: Color(0xFF1A56CC)));
    }
    if (_error != null) {
      return _buildError();
    }
    if (_conversations.isEmpty) {
      return _buildEmpty();
    }
    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: _conversations.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _ConversationTile(
        item: _conversations[i],
        onTap: () => _openChat(_conversations[i]),
      ),
    );
  }

  void _openChat(_ConversationItem item) {
    final chatAvailable = item.departureTime == null ||
        DateTime.now().isAfter(
          item.departureTime!.subtract(const Duration(hours: 2)),
        );

    if (!chatAvailable) {
      final dep = item.departureTime!;
      final remaining = dep.difference(DateTime.now());
      final hoursLeft = remaining.inHours + 2;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Chat disponible ~${hoursLeft}h avant le départ',
            style: GoogleFonts.dmSans(color: Colors.white),
          ),
          backgroundColor: const Color(0xFF854F0B),
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    context.push(
      '/chat/${item.tripId}',
      extra: <String, dynamic>{
        'tripId': item.tripId,
        'otherUserName': item.otherUserName,
        'otherUserInitials': item.otherUserInitials,
        'otherUserAvatarUrl': item.otherUserAvatarUrl,
        'tripRoute': item.tripRoute,
        'tripDepartureTime': item.departureTime?.toIso8601String(),
        'isDriver': AppStateStore.instance.isDriver,
      },
    );
  }

  Widget _buildEmpty() {
    return ListView(
      children: [
        const SizedBox(height: 80),
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F0FE),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.chat_bubble_outline_rounded,
                    size: 40, color: Color(0xFF1A56CC)),
              ),
              const SizedBox(height: 20),
              Text(
                'Aucune conversation',
                style: GoogleFonts.sora(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0D1624)),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  'Vos conversations apparaîtront ici\ndès que vous aurez un trajet confirmé.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.dmSans(
                      fontSize: 13, color: const Color(0xFF7A879A)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildError() {
    return ListView(
      children: [
        const SizedBox(height: 80),
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: const Color(0xFFFCEBEB),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.wifi_off_rounded,
                    size: 40, color: Color(0xFFE24B4A)),
              ),
              const SizedBox(height: 20),
              Text(
                'Erreur de connexion',
                style: GoogleFonts.sora(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0D1624)),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.dmSans(
                      fontSize: 12, color: const Color(0xFF7A879A)),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh_rounded),
                label: Text('Réessayer',
                    style: GoogleFonts.sora(fontWeight: FontWeight.w600)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1A56CC),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── TUILE CONVERSATION ────────────────────────────────────────────────────────

class _ConversationTile extends StatelessWidget {
  const _ConversationTile({required this.item, required this.onTap});
  final _ConversationItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final chatAvailable = item.departureTime == null ||
        DateTime.now().isAfter(
          item.departureTime!.subtract(const Duration(hours: 2)),
        );
    final hasUnread = (item.unreadCount ?? 0) > 0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
                color: Color(0x0F000000), blurRadius: 4, offset: Offset(0, 1)),
            BoxShadow(
                color: Color(0x0A000000), blurRadius: 2, offset: Offset(0, 1)),
          ],
          border: hasUnread
              ? Border.all(
                  color: const Color(0xFF1A56CC).withOpacity(0.3), width: 1.5)
              : Border.all(color: const Color(0x12000000)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              // Avatar
              _Avatar(
                name: item.otherUserName ?? 'Utilisateur',
                initials: item.otherUserInitials ?? '?',
                avatarUrl: item.otherUserAvatarUrl,
                chatAvailable: chatAvailable,
              ),
              const SizedBox(width: 12),
              // Infos
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.otherUserName ?? 'Utilisateur',
                            style: GoogleFonts.sora(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF0D1624)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (item.lastMessageAt != null)
                          Text(
                            _formatTime(item.lastMessageAt!),
                            style: GoogleFonts.dmSans(
                                fontSize: 11,
                                color: hasUnread
                                    ? const Color(0xFF1A56CC)
                                    : const Color(0xFF7A879A),
                                fontWeight: hasUnread
                                    ? FontWeight.w700
                                    : FontWeight.w400),
                          ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    if (item.tripRoute != null)
                      Text(
                        item.tripRoute!,
                        style: GoogleFonts.dmSans(
                            fontSize: 11,
                            color: const Color(0xFF1A56CC),
                            fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.lastMessage?.isNotEmpty == true
                                ? item.lastMessage!
                                : chatAvailable
                                    ? 'Chat actif — tapez pour écrire'
                                    : 'Chat disponible 2h avant le départ',
                            style: GoogleFonts.dmSans(
                              fontSize: 12,
                              color: hasUnread
                                  ? const Color(0xFF0D1624)
                                  : const Color(0xFF7A879A),
                              fontWeight:
                                  hasUnread ? FontWeight.w600 : FontWeight.w400,
                            ),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                        ),
                        if (hasUnread) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1A56CC),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                '${item.unreadCount}',
                                style: GoogleFonts.sora(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (!chatAvailable && item.departureTime != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.lock_clock,
                              size: 11, color: Color(0xFFBA7517)),
                          const SizedBox(width: 4),
                          Text(
                            'Départ le ${_formatDate(item.departureTime!)}',
                            style: GoogleFonts.dmSans(
                                fontSize: 11, color: const Color(0xFF854F0B)),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                chatAvailable
                    ? Icons.chevron_right_rounded
                    : Icons.lock_outline_rounded,
                color: chatAvailable
                    ? const Color(0xFF1A56CC)
                    : const Color(0xFFD8DBE5),
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    }
    return '${dt.day}/${dt.month}';
  }

  String _formatDate(DateTime dt) {
    const months = [
      '',
      'jan',
      'fév',
      'mar',
      'avr',
      'mai',
      'jun',
      'jul',
      'aoû',
      'sep',
      'oct',
      'nov',
      'déc'
    ];
    return '${dt.day} ${months[dt.month]}';
  }
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

class _Avatar extends StatelessWidget {
  const _Avatar({
    required this.name,
    required this.initials,
    this.avatarUrl,
    required this.chatAvailable,
  });
  final String name;
  final String initials;
  final String? avatarUrl;
  final bool chatAvailable;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (avatarUrl != null && avatarUrl!.isNotEmpty)
          CircleAvatar(
            radius: 24,
            backgroundImage: NetworkImage(avatarUrl!),
            backgroundColor: const Color(0xFFE8F0FE),
          )
        else
          CircleAvatar(
            radius: 24,
            backgroundColor: chatAvailable
                ? const Color(0xFF1A56CC)
                : const Color(0xFFD8DBE5),
            child: Text(
              initials.length > 2 ? initials.substring(0, 2) : initials,
              style: GoogleFonts.sora(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Colors.white),
            ),
          ),
        if (chatAvailable)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: const Color(0xFF1D9E75),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}

// ─── MODÈLE CONVERSATION ──────────────────────────────────────────────────────

class _ConversationItem {
  final String tripId;
  final String? otherUserName;
  final String? otherUserInitials;
  final String? otherUserAvatarUrl;
  final String? tripRoute;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final DateTime? departureTime;
  final int? unreadCount;

  const _ConversationItem({
    required this.tripId,
    this.otherUserName,
    this.otherUserInitials,
    this.otherUserAvatarUrl,
    this.tripRoute,
    this.lastMessage,
    this.lastMessageAt,
    this.departureTime,
    this.unreadCount,
  });

  /// Depuis ConversationSummaryDto (GET /api/messages/conversations)
  factory _ConversationItem.fromConversationDto(Map<String, dynamic> json) {
    final String name = json['otherUserName']?.toString() ?? '';
    final List<String> parts =
        name.split(' ').where((p) => p.isNotEmpty).toList();
    final String initials = parts.isEmpty
        ? '?'
        : parts.length == 1
            ? parts[0].substring(0, 1).toUpperCase()
            : '${parts[0][0]}${parts[1][0]}'.toUpperCase();

    final String dep = json['tripLabel']?.toString() ?? '';
    final String tripRoute = dep.isNotEmpty ? dep : null ?? '';

    return _ConversationItem(
      tripId: json['tripId']?.toString() ?? '',
      otherUserName: name.isNotEmpty ? name : 'Utilisateur',
      otherUserInitials: initials,
      otherUserAvatarUrl: json['otherUserAvatar']?.toString(),
      tripRoute: tripRoute.isNotEmpty ? tripRoute : null,
      lastMessage: json['lastMessageContent']?.toString(),
      lastMessageAt: parsing.toDateTime(json['lastMessageAt']),
      unreadCount: json['unreadCount'] as int? ?? 0,
    );
  }

  /// Depuis un trip JSON (fallback GET /api/trips/mine/driver ou /passenger)
  factory _ConversationItem.fromTripJson(Map<String, dynamic> json) {
    final Map<String, dynamic> driver = _asMap(json['driver']);
    final String firstName = driver['firstName']?.toString() ?? '';
    final String lastName = driver['lastName']?.toString() ?? '';
    final String name = '$firstName $lastName'.trim();
    final String initials = name.isEmpty
        ? '?'
        : name
            .split(' ')
            .where((p) => p.isNotEmpty)
            .map((p) => p[0])
            .take(2)
            .join()
            .toUpperCase();

    final String dep = json['departureLabel']?.toString() ??
        json['departureAddress']?.toString() ??
        '';
    final String arr = json['arrivalLabel']?.toString() ??
        json['arrivalAddress']?.toString() ??
        '';
    final String route = (dep.isNotEmpty && arr.isNotEmpty)
        ? '$dep → $arr'
        : dep.isNotEmpty
            ? dep
            : '';

    final DateTime? departureTime = parsing.toDateTime(
      json['departureTime'] ?? json['departureDateTime'],
    );

    return _ConversationItem(
      tripId: json['id']?.toString() ?? '',
      otherUserName: name.isNotEmpty ? name : 'Conducteur',
      otherUserInitials: initials,
      otherUserAvatarUrl: driver['avatarUrl']?.toString(),
      tripRoute: route.isNotEmpty ? route : null,
      lastMessage: null,
      lastMessageAt: departureTime,
      departureTime: departureTime,
      unreadCount: 0,
    );
  }

  static Map<String, dynamic> _asMap(dynamic v) {
    if (v is Map<String, dynamic>) return v;
    if (v is Map) return v.map((k, val) => MapEntry(k.toString(), val));
    return {};
  }
}
