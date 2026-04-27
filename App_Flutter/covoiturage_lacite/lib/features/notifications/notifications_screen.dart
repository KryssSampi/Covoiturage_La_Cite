// lib/features/notifications/notifications_screen.dart
// Reconstitution complète — M1 Vague 1
// Améliorations : marquer-lu individuel · badge shell mis à jour · états complets

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';
import '../../core/state/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/parsing.dart' as parsing;

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
  List<_NotifItem> _items = <_NotifItem>[];

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
      final dynamic payload = await _api.get('/api/notifications');
      final List<dynamic> rows = parsing.extractList(payload);
      final List<_NotifItem> items = rows
          .whereType<Map<String, dynamic>>()
          .map(_NotifItem.fromJson)
          .toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      if (!mounted) return;
      setState(() {
        _items = items;
        _isLoading = false;
      });
      _syncShellBadge();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _markRead(String id) async {
    try {
      await _api.patch('/api/notifications/$id/read', <String, dynamic>{});
      if (!mounted) return;
      setState(() {
        _items = _items
            .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
            .toList();
      });
      _syncShellBadge();
    } catch (_) {
      // Silent — pas critique
    }
  }

  Future<void> _markAllRead() async {
    if (_isMarkingAll) return;
    setState(() => _isMarkingAll = true);
    try {
      await _api.patch('/api/notifications/read-all', <String, dynamic>{});
      if (!mounted) return;
      setState(() {
        _items = _items.map((n) => n.copyWith(isRead: true)).toList();
      });
      _syncShellBadge();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Toutes les notifications sont lues.'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Opération impossible : $e')),
      );
    } finally {
      if (mounted) setState(() => _isMarkingAll = false);
    }
  }

  void _syncShellBadge() {
    final bool hasUnread = _items.any((n) => !n.isRead);
    AppStateStore.instance.setPageHasNews(AppNavPage.notifications, hasUnread);
  }

  Future<void> _onNotifTap(_NotifItem item) async {
    // Marquer comme lu immédiatement
    if (!item.isRead) {
      unawaited(_markRead(item.id));
    }
    if (!mounted) return;
    context.push(
      '/notification/${item.id}',
      extra: <String, dynamic>{
        'id': item.id,
        'title': item.title,
        'body': item.body,
        'createdAt': item.createdAt.toIso8601String(),
        'isRead': true,
        'tripId': item.tripId,
        'type': item.typeRaw,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final int unreadCount = _items.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: AppColors.grayBg,
      appBar: AppBar(
        backgroundColor: AppColors.blueDeep,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Notifications',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 17,
              ),
            ),
            if (unreadCount > 0)
              Text(
                '$unreadCount non lue${unreadCount > 1 ? 's' : ''}',
                style: const TextStyle(color: Colors.white70, fontSize: 11),
              ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: <Widget>[
          IconButton(
            tooltip: 'Rafraîchir',
            onPressed: _isLoading ? null : _load,
            icon: const Icon(Icons.refresh, color: Colors.white),
          ),
          if (unreadCount > 0)
            TextButton(
              onPressed: _isMarkingAll ? null : _markAllRead,
              child: Text(
                _isMarkingAll ? '...' : 'Tout lire',
                style: const TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.blue,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return _ErrorView(message: _error!, onRetry: _load);
    }

    if (_items.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: const <Widget>[
          SizedBox(height: 80),
          _EmptyView(),
        ],
      );
    }

    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
      itemCount: _items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (_, int index) => _NotifCard(
        item: _items[index],
        onTap: () => _onNotifTap(_items[index]),
      ),
    );
  }
}

// ─── Card ─────────────────────────────────────────────────────────────────────

class _NotifCard extends StatelessWidget {
  const _NotifCard({required this.item, this.onTap});

  final _NotifItem item;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final _NotifStyle style = _styleFor(item.typeRaw);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: item.isRead ? AppColors.surface : AppColors.blueLight,
          borderRadius: AppRadius.md,
          border: Border.all(
            color: item.isRead
                ? AppColors.border
                : AppColors.blue.withOpacity(0.25),
            width: item.isRead ? 1 : 1.5,
          ),
          boxShadow: AppShadows.sm,
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              // Icône type
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: style.bg,
                  borderRadius: AppRadius.sm,
                ),
                child: Icon(style.icon, color: style.fg, size: 22),
              ),
              const SizedBox(width: 12),
              // Contenu
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            item.title,
                            style: AppText.soraSemiBold13.copyWith(
                              fontWeight: item.isRead
                                  ? FontWeight.w500
                                  : FontWeight.w700,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _relativeTime(item.createdAt),
                          style: AppText.dmBody12,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.body,
                      style: AppText.dmBody12.copyWith(
                        color: AppColors.text2,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Dot non lu
              if (!item.isRead) ...<Widget>[
                const SizedBox(width: 8),
                Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.only(top: 4),
                  decoration: const BoxDecoration(
                    color: AppColors.blue,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Style par type ───────────────────────────────────────────────────────────

class _NotifStyle {
  const _NotifStyle({required this.bg, required this.fg, required this.icon});
  final Color bg;
  final Color fg;
  final IconData icon;
}

_NotifStyle _styleFor(String type) {
  final String t = type.toLowerCase();
  if (t.contains('reservation') && t.contains('received')) {
    return const _NotifStyle(
      bg: Color(0xFFE8F0FE),
      fg: Color(0xFF1A56CC),
      icon: Icons.assignment_turned_in_rounded,
    );
  }
  if (t.contains('accepted') || t.contains('confirmed')) {
    return const _NotifStyle(
      bg: Color(0xFFE1F5EE),
      fg: Color(0xFF0F6E56),
      icon: Icons.check_circle_rounded,
    );
  }
  if (t.contains('refused') ||
      t.contains('cancelled') ||
      t.contains('cancel')) {
    return const _NotifStyle(
      bg: Color(0xFFFCEBEB),
      fg: Color(0xFFE24B4A),
      icon: Icons.cancel_rounded,
    );
  }
  if (t.contains('started') ||
      t.contains('progress') ||
      t.contains('starting')) {
    return const _NotifStyle(
      bg: Color(0xFFFAEEDA),
      fg: Color(0xFFBA7517),
      icon: Icons.schedule_rounded,
    );
  }
  if (t.contains('completed') || t.contains('done')) {
    return const _NotifStyle(
      bg: Color(0xFFEEF0F5),
      fg: Color(0xFF545D6E),
      icon: Icons.done_all_rounded,
    );
  }
  if (t.contains('review') || t.contains('avis')) {
    return const _NotifStyle(
      bg: Color(0xFFFEF3C7),
      fg: Color(0xFF92400E),
      icon: Icons.star_rounded,
    );
  }
  if (t.contains('penalty') || t.contains('penalt')) {
    return const _NotifStyle(
      bg: Color(0xFFFCEBEB),
      fg: Color(0xFFE24B4A),
      icon: Icons.warning_rounded,
    );
  }
  if (t.contains('badge') || t.contains('challenge') || t.contains('goscore')) {
    return const _NotifStyle(
      bg: Color(0xFFE1F5EE),
      fg: Color(0xFF0F6E56),
      icon: Icons.emoji_events_rounded,
    );
  }
  if (t.contains('sos') || t.contains('security') || t.contains('securite')) {
    return const _NotifStyle(
      bg: Color(0xFFFCEBEB),
      fg: Color(0xFFE24B4A),
      icon: Icons.security_rounded,
    );
  }
  return const _NotifStyle(
    bg: Color(0xFFEEF0F5),
    fg: Color(0xFF545D6E),
    icon: Icons.info_outline_rounded,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

String _relativeTime(DateTime dt) {
  final Duration diff = DateTime.now().difference(dt);
  if (diff.inMinutes < 1) return 'À l\'instant';
  if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
  if (diff.inHours < 24) return 'Il y a ${diff.inHours} h';
  if (diff.inDays < 7) return 'Il y a ${diff.inDays} j';
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${two(dt.day)}/${two(dt.month)}';
}

// Ignore unawaited intentionnellement (fire-and-forget)
void unawaited(Future<void> future) {}

// ─── États vides ──────────────────────────────────────────────────────────────

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.gray100,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.notifications_none_rounded,
                size: 32,
                color: AppColors.gray400,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Aucune notification',
              style: TextStyle(
                fontFamily: 'Sora',
                fontWeight: FontWeight.w700,
                fontSize: 16,
                color: AppColors.text1,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Vous serez notifié des réservations,\ntrajets et avis ici.',
              style: TextStyle(
                fontFamily: 'DM Sans',
                fontSize: 13,
                color: AppColors.text3,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                color: Color(0xFFFCEBEB),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.wifi_off_rounded,
                size: 32,
                color: Color(0xFFE24B4A),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Connexion impossible',
              style: TextStyle(
                fontFamily: 'Sora',
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(fontSize: 12, color: Color(0xFF7A879A)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1A56CC),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Modèle ───────────────────────────────────────────────────────────────────

class _NotifItem {
  const _NotifItem({
    required this.id,
    required this.title,
    required this.body,
    required this.createdAt,
    required this.isRead,
    required this.typeRaw,
    this.tripId,
  });

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool isRead;
  final String typeRaw;
  final String? tripId;

  factory _NotifItem.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic>? data = json['data'] is Map<String, dynamic>
        ? json['data'] as Map<String, dynamic>
        : null;

    final String typeRaw = json['type']?.toString() ?? '';
    final String title = json['title']?.toString().isNotEmpty == true
        ? json['title']!.toString()
        : _typeLabel(typeRaw);

    return _NotifItem(
      id: json['id']?.toString() ?? '',
      title: title,
      body: json['body']?.toString() ?? json['message']?.toString() ?? '',
      createdAt: parsing.toDateTime(json['createdAt'] ?? json['date']) ??
          DateTime.now(),
      isRead: parsing
          .toBool(json['isRead'] ?? json['read'] ?? (json['readAt'] != null)),
      typeRaw: typeRaw,
      tripId: json['tripId']?.toString() ??
          data?['tripId']?.toString() ??
          json['relatedTripId']?.toString(),
    );
  }

  _NotifItem copyWith({bool? isRead}) {
    return _NotifItem(
      id: id,
      title: title,
      body: body,
      createdAt: createdAt,
      isRead: isRead ?? this.isRead,
      typeRaw: typeRaw,
      tripId: tripId,
    );
  }
}

String _typeLabel(String type) {
  final String t = type.toLowerCase();
  if (t.contains('reservationreceived')) return 'Nouvelle réservation';
  if (t.contains('reservationaccepted')) return 'Réservation acceptée';
  if (t.contains('reservationrefused')) return 'Réservation refusée';
  if (t.contains('reservationcancelled') || t.contains('tripcancelled'))
    return 'Réservation annulée';
  if (t.contains('tripreminder') || t.contains('tripstarting'))
    return 'Trajet bientôt';
  if (t.contains('tripstarted')) return 'Trajet démarré';
  if (t.contains('tripcompleted')) return 'Trajet terminé';
  if (t.contains('newreview')) return 'Nouvel avis';
  if (t.contains('penalty')) return 'Pénalité appliquée';
  if (t.contains('badge')) return 'Badge obtenu';
  if (t.contains('challenge')) return 'Défi complété';
  if (t.contains('sos')) return 'Alerte SOS';
  if (t.contains('welcome')) return 'Bienvenue';
  if (t.contains('gotask')) return 'Mission GoBoard';
  if (t.contains('goscore')) return 'GoScore atteint';
  if (t.contains('recommended')) return 'Trajet recommandé';
  if (t.contains('document')) return 'Document validé';
  if (t.contains('payment')) return 'Paiement traité';
  return 'Notification';
}
