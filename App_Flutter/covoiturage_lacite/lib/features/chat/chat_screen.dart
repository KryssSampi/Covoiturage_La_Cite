// ============================================================
// lib/features/chat/chat_screen.dart
// Messagerie in-trip améliorée — Version Mobile Flutter
// Inspirée du composant web (ConversationHeader + MessageList + MessageInput)
// ============================================================

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/models/message.dart';
import '../../core/services/api_service.dart';
import '../../core/utils/parsing.dart' as parsing;

// ─────────────────────────────────────────────────────────────
// ÉCRAN CHAT AMÉLIORÉ
// ─────────────────────────────────────────────────────────────
class ChatScreen extends StatefulWidget {
  const ChatScreen({
    super.key,
    required this.tripId,
    this.tripDepartureTime,
    this.otherUserName,
    this.otherUserInitials,
    this.otherUserAvatarUrl,
    this.isDriver = false,
    this.tripRoute,
  });

  final String tripId;
  final DateTime? tripDepartureTime;
  final String? otherUserName;
  final String? otherUserInitials;
  final String? otherUserAvatarUrl;
  final bool isDriver;
  final String? tripRoute; // "Départ → Arrivée"

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with TickerProviderStateMixin {
  final ApiService _api = ApiService.instance;
  final TextEditingController _draftCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  final FocusNode _inputFocus = FocusNode();
  Timer? _pollTimer;
  bool _isLoading = true;
  bool _isSending = false;
  bool _isOnline = false;
  String? _error;
  String? _currentUserId;
  DateTime? _tripDepartureTime;
  List<_ChatMessage> _messages = [];
  bool _showScrollDown = false;
  String? _replyTo;

  // Typing animation
  late AnimationController _typingCtrl;
  late Animation<double> _typingAnim;

  bool get _isChatAvailable {
    final dep = _tripDepartureTime ?? widget.tripDepartureTime;
    if (dep == null) return true;
    return DateTime.now().isAfter(dep.subtract(const Duration(hours: 2)));
  }

  @override
  void initState() {
    super.initState();
    _typingCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..repeat(reverse: true);
    _typingAnim = CurvedAnimation(parent: _typingCtrl, curve: Curves.easeInOut);
    _scrollCtrl.addListener(_onScroll);
    _bootstrap();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _typingCtrl.dispose();
    _draftCtrl.dispose();
    _scrollCtrl.dispose();
    _inputFocus.dispose();
    super.dispose();
  }

  void _onScroll() {
    final atBottom = _scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 100;
    if (atBottom != !_showScrollDown) {
      setState(() => _showScrollDown = !atBottom);
    }
  }

  Future<void> _bootstrap() async {
    await Future.wait([_loadCurrentUser(), _loadTripMeta(), _loadMessages(showLoader: true)]);
    _pollTimer = Timer.periodic(const Duration(seconds: 10), (_) => _loadMessages(showLoader: false));
  }

  Future<void> _loadCurrentUser() async {
    try {
      final payload = await _api.get('/api/users/me');
      final me = parsing.extractMap(payload);
      if (!mounted || me == null) return;
      setState(() => _currentUserId = me['id']?.toString());
    } catch (_) {}
  }

  Future<void> _loadTripMeta() async {
    if (widget.tripDepartureTime != null) {
      _tripDepartureTime = widget.tripDepartureTime;
      return;
    }
    try {
      final payload = await _api.get('/api/trips/${widget.tripId}');
      final map = parsing.extractMap(payload);
      final dt = parsing.toDateTime(map?['departureTime'] ?? map?['departureDateTime']);
      if (!mounted) return;
      setState(() => _tripDepartureTime = dt);
    } catch (_) {}
  }

  Future<void> _loadMessages({required bool showLoader}) async {
    if (showLoader && mounted) setState(() { _isLoading = true; _error = null; });
    try {
      final payload = await _api.get('/api/messages/${widget.tripId}');
      final rows = parsing.extractList(payload);
      final loaded = rows.whereType<Map<String, dynamic>>().map(_ChatMessage.fromJson).toList()
        ..sort((a, b) => a.sentAt.compareTo(b.sentAt));
      if (!mounted) return;
      final wasAtBottom = !_showScrollDown;
      setState(() => _messages = loaded);
      if (wasAtBottom) _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendMessage() async {
    if (_isSending) return;
    final text = _draftCtrl.text.trim();
    if (text.isEmpty) return;
    if (!_isChatAvailable) {
      _showSnack('Le chat est disponible 2h avant le départ.', isError: true);
      return;
    }
    setState(() { _isSending = true; _replyTo = null; });
    _draftCtrl.clear();
    try {
      await _api.post('/api/messages/${widget.tripId}', {'content': text});
      await _loadMessages(showLoader: false);
      _scrollToBottom();
    } catch (e) {
      _showSnack('Envoi impossible: $e', isError: true);
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: GoogleFonts.dmSans(fontSize: 13)),
        backgroundColor: isError ? const Color(0xFFE24B4A) : const Color(0xFF0F6E56),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // ── BUILD ─────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FC),
      body: Column(
        children: [
          _buildHeader(),
          if (!_isChatAvailable) _buildUnavailableBanner(),
          Expanded(
            child: Stack(
              children: [
                _buildMessageList(),
                if (_showScrollDown)
                  Positioned(
                    bottom: 8,
                    right: 16,
                    child: _ScrollDownBtn(onTap: _scrollToBottom),
                  ),
              ],
            ),
          ),
          _buildComposer(),
          SizedBox(height: bottomInset > 0 ? 0 : MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────
  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF051f4a), Color(0xFF0d4490)],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Top row: back + title + actions
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 8, 8, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => context.pop(),
                  ),
                  // Avatar
                  _HeaderAvatar(
                    name: widget.otherUserName ?? 'Utilisateur',
                    initials: widget.otherUserInitials ?? '?',
                    avatarUrl: widget.otherUserAvatarUrl,
                    isOnline: _isOnline,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.otherUserName ?? 'Conversation',
                          style: GoogleFonts.sora(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: Colors.white),
                        ),
                        if (widget.tripRoute != null)
                          Text(
                            widget.tripRoute!,
                            style: GoogleFonts.dmSans(
                                fontSize: 11,
                                color: Colors.white70),
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                  // Action buttons
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                    onPressed: () => _loadMessages(showLoader: true),
                    tooltip: 'Actualiser',
                  ),
                  if (widget.isDriver)
                    IconButton(
                      icon: const Icon(Icons.campaign_outlined, color: Colors.white70, size: 20),
                      onPressed: _showBroadcastSheet,
                      tooltip: 'Diffuser à tous',
                    ),
                ],
              ),
            ),
            // Chat availability indicator
            if (_isChatAvailable)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                child: Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF7EFFD4),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Chat actif · Trajet en cours',
                      style: GoogleFonts.sora(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF7EFFD4)),
                    ),
                  ],
                ),
              )
            else
              const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildUnavailableBanner() {
    final dep = _tripDepartureTime ?? widget.tripDepartureTime;
    final remaining = dep != null
        ? dep.difference(DateTime.now()).inHours + 2
        : 2;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: const Color(0xFFFAEEDA),
      child: Row(
        children: [
          const Icon(Icons.lock_clock, size: 16, color: Color(0xFFBA7517)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Chat disponible ~${remaining}h avant le départ.',
              style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF854F0B)),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // MESSAGE LIST
  // ─────────────────────────────────────────────────────────
  Widget _buildMessageList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF08316E)));
    }
    if (_error != null) {
      return _ErrorState(message: _error!, onRetry: () => _loadMessages(showLoader: true));
    }
    if (_messages.isEmpty) {
      return _EmptyChatState(
        name: widget.otherUserName ?? 'votre interlocuteur',
      );
    }
    return RefreshIndicator(
      onRefresh: () => _loadMessages(showLoader: false),
      color: const Color(0xFF08316E),
      child: ListView.builder(
        controller: _scrollCtrl,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        itemCount: _messages.length,
        itemBuilder: (_, i) {
          final msg = _messages[i];
          final isSelf = msg.senderId == _currentUserId;
          final showDate = i == 0 ||
              !_isSameDay(_messages[i - 1].sentAt, msg.sentAt);
          final showAvatar = !isSelf &&
              (i == _messages.length - 1 || _messages[i + 1].senderId == _currentUserId);

          return Column(
            children: [
              if (showDate) _DateDivider(date: msg.sentAt),
              _MessageBubble(
                message: msg,
                isSelf: isSelf,
                showAvatar: showAvatar,
                senderName: isSelf ? null : widget.otherUserName,
                senderInitials: isSelf ? null : (widget.otherUserInitials ?? '?'),
                avatarUrl: isSelf ? null : widget.otherUserAvatarUrl,
                onLongPress: () => _showMessageActions(msg),
              ),
            ],
          );
        },
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // COMPOSER
  // ─────────────────────────────────────────────────────────
  Widget _buildComposer() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: const Color(0xFF08316E).withOpacity(0.09))),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, -2)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_replyTo != null) _buildReplyPreview(),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Text input
                Expanded(
                  child: Container(
                    constraints: const BoxConstraints(minHeight: 44, maxHeight: 120),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F4FB),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: _inputFocus.hasFocus
                            ? const Color(0xFF08316E).withOpacity(0.4)
                            : const Color(0xFF08316E).withOpacity(0.1),
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _draftCtrl,
                            focusNode: _inputFocus,
                            enabled: _isChatAvailable,
                            minLines: 1,
                            maxLines: 5,
                            textInputAction: TextInputAction.newline,
                            style: GoogleFonts.dmSans(fontSize: 14, color: const Color(0xFF0D1624)),
                            decoration: InputDecoration(
                              hintText: _isChatAvailable
                                  ? 'Écrire un message…'
                                  : 'Chat indisponible',
                              hintStyle: GoogleFonts.dmSans(
                                  fontSize: 13,
                                  color: const Color(0xFF8A95A8)),
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.fromLTRB(14, 10, 4, 10),
                            ),
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                        // Clear button
                        if (_draftCtrl.text.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(right: 6, bottom: 6),
                            child: GestureDetector(
                              onTap: () => setState(() => _draftCtrl.clear()),
                              child: const Icon(Icons.close, size: 16, color: Color(0xFF8A95A8)),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Send button
                GestureDetector(
                  onTap: _isChatAvailable && _draftCtrl.text.trim().isNotEmpty && !_isSending
                      ? _sendMessage
                      : null,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: _draftCtrl.text.trim().isNotEmpty && _isChatAvailable
                          ? const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFF08316E), Color(0xFF1A5CB0)],
                            )
                          : null,
                      color: _draftCtrl.text.trim().isEmpty || !_isChatAvailable
                          ? const Color(0xFFEEF0F5)
                          : null,
                      shape: BoxShape.circle,
                      boxShadow: _draftCtrl.text.trim().isNotEmpty && _isChatAvailable
                          ? [
                              BoxShadow(
                                  color: const Color(0xFF08316E).withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2)),
                            ]
                          : null,
                    ),
                    child: Center(
                      child: _isSending
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Icon(
                              Icons.send_rounded,
                              size: 18,
                              color: _draftCtrl.text.trim().isNotEmpty && _isChatAvailable
                                  ? Colors.white
                                  : const Color(0xFF8A95A8),
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReplyPreview() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 8, 4),
      color: const Color(0xFFE8F0FE),
      child: Row(
        children: [
          Container(width: 3, height: 32, color: const Color(0xFF08316E), decoration: BoxDecoration(borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Réponse',
                    style: GoogleFonts.sora(fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFF08316E))),
                Text(_replyTo ?? '',
                    style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF545D6E)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => setState(() => _replyTo = null),
            child: const Icon(Icons.close, size: 16, color: Color(0xFF8A95A8)),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // BROADCAST SHEET (driver)
  // ─────────────────────────────────────────────────────────
  void _showBroadcastSheet() {
    final ctrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFD8DBE5), borderRadius: BorderRadius.circular(2))),
              ),
              const SizedBox(height: 16),
              Text('📢 Diffuser à tous les passagers',
                  style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.w700, color: const Color(0xFF08316E))),
              const SizedBox(height: 4),
              Text('Ce message sera envoyé à tous les passagers de ce trajet.',
                  style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF7A879A))),
              const SizedBox(height: 14),
              TextField(
                controller: ctrl,
                autofocus: true,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Ex: Je suis en route, 5 minutes de retard...',
                  hintStyle: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF8A95A8)),
                  filled: true,
                  fillColor: const Color(0xFFF8F9FC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFD8DBE5))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFD8DBE5))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF08316E))),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () async {
                    final text = ctrl.text.trim();
                    if (text.isEmpty) return;
                    Navigator.pop(context);
                    try {
                      await _api.post('/api/messages/${widget.tripId}/broadcast', {'content': text});
                      _showSnack('Message diffusé à tous les passagers.');
                      await _loadMessages(showLoader: false);
                    } catch (_) {
                      _showSnack('Erreur lors de la diffusion.', isError: true);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFBA7517),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text('Envoyer à tous',
                      style: GoogleFonts.sora(fontSize: 14, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // MESSAGE ACTIONS
  // ─────────────────────────────────────────────────────────
  void _showMessageActions(_ChatMessage msg) {
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: const Color(0xFFD8DBE5), borderRadius: BorderRadius.circular(2)),
            ),
            ListTile(
              leading: const Icon(Icons.reply_outlined, color: Color(0xFF08316E)),
              title: Text('Répondre', style: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(context);
                setState(() => _replyTo = msg.content);
                _inputFocus.requestFocus();
              },
            ),
            ListTile(
              leading: const Icon(Icons.copy_outlined, color: Color(0xFF08316E)),
              title: Text('Copier', style: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(context);
                Clipboard.setData(ClipboardData(text: msg.content));
                _showSnack('Message copié.');
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}

// ─────────────────────────────────────────────────────────────
// CHAT MESSAGE MODEL ÉTENDU
// ─────────────────────────────────────────────────────────────
class _ChatMessage {
  final String id;
  final String senderId;
  final String content;
  final DateTime sentAt;
  final bool isRead;

  const _ChatMessage({
    required this.id,
    required this.senderId,
    required this.content,
    required this.sentAt,
    this.isRead = false,
  });

  factory _ChatMessage.fromJson(Map<String, dynamic> j) => _ChatMessage(
        id: j['id']?.toString() ?? '',
        senderId: j['senderId']?.toString() ?? '',
        content: j['content']?.toString() ?? '',
        sentAt: DateTime.tryParse(j['sentAt']?.toString() ?? '') ?? DateTime.now(),
        isRead: j['isRead'] as bool? ?? false,
      );
}

// ─────────────────────────────────────────────────────────────
// COMPOSANTS UI CHAT
// ─────────────────────────────────────────────────────────────

class _HeaderAvatar extends StatelessWidget {
  const _HeaderAvatar({
    required this.name,
    required this.initials,
    this.avatarUrl,
    required this.isOnline,
  });
  final String name;
  final String initials;
  final String? avatarUrl;
  final bool isOnline;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (avatarUrl != null && avatarUrl!.isNotEmpty)
          CircleAvatar(radius: 20, backgroundImage: NetworkImage(avatarUrl!))
        else
          CircleAvatar(
            radius: 20,
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Text(
              initials,
              style: GoogleFonts.sora(
                  fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
            ),
          ),
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: const Color(0xFF7EFFD4),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF051f4a), width: 1.5),
              ),
            ),
          ),
      ],
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
    required this.isSelf,
    required this.showAvatar,
    this.senderName,
    this.senderInitials,
    this.avatarUrl,
    this.onLongPress,
  });
  final _ChatMessage message;
  final bool isSelf;
  final bool showAvatar;
  final String? senderName;
  final String? senderInitials;
  final String? avatarUrl;
  final VoidCallback? onLongPress;

  String _fmtTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        top: 2,
        bottom: 2,
        left: isSelf ? 48 : 0,
        right: isSelf ? 0 : 48,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: isSelf ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          // Other user avatar
          if (!isSelf) ...[
            if (showAvatar)
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: _MiniAvatar(
                    initials: senderInitials ?? '?',
                    avatarUrl: avatarUrl),
              )
            else
              const SizedBox(width: 30),
          ],
          // Bubble
          GestureDetector(
            onLongPress: onLongPress,
            child: Column(
              crossAxisAlignment: isSelf ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                if (!isSelf && senderName != null && showAvatar)
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 2),
                    child: Text(
                      senderName!,
                      style: GoogleFonts.sora(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF08316E)),
                    ),
                  ),
                Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width *
                        (isSelf ? 0.72 : 0.62),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: isSelf
                        ? const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Color(0xFF08316E), Color(0xFF1A5CB0)],
                          )
                        : null,
                    color: isSelf ? null : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isSelf ? 16 : 4),
                      bottomRight: Radius.circular(isSelf ? 4 : 16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isSelf
                            ? const Color(0xFF08316E).withOpacity(0.2)
                            : Colors.black.withOpacity(0.06),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    border: isSelf
                        ? null
                        : Border.all(
                            color: const Color(0xFF08316E).withOpacity(0.09)),
                  ),
                  child: Text(
                    message.content,
                    style: GoogleFonts.dmSans(
                      fontSize: 14,
                      color: isSelf ? Colors.white : const Color(0xFF0D1624),
                      height: 1.4,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 3, left: 4, right: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _fmtTime(message.sentAt),
                        style: GoogleFonts.dmSans(
                            fontSize: 10,
                            color: const Color(0xFF7A879A)),
                      ),
                      if (isSelf) ...[
                        const SizedBox(width: 3),
                        Icon(
                          message.isRead ? Icons.done_all : Icons.done,
                          size: 12,
                          color: message.isRead
                              ? const Color(0xFF08316E)
                              : const Color(0xFF8A95A8),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniAvatar extends StatelessWidget {
  const _MiniAvatar({required this.initials, this.avatarUrl});
  final String initials;
  final String? avatarUrl;

  @override
  Widget build(BuildContext context) {
    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      return CircleAvatar(radius: 14, backgroundImage: NetworkImage(avatarUrl!));
    }
    return CircleAvatar(
      radius: 14,
      backgroundColor: const Color(0xFFE8F0FE),
      child: Text(
        initials,
        style: GoogleFonts.sora(
            fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFF08316E)),
      ),
    );
  }
}

class _DateDivider extends StatelessWidget {
  const _DateDivider({required this.date});
  final DateTime date;

  String _label() {
    final now = DateTime.now();
    if (date.year == now.year && date.month == now.month && date.day == now.day) return "Aujourd'hui";
    final yesterday = now.subtract(const Duration(days: 1));
    if (date.year == yesterday.year && date.month == yesterday.month && date.day == yesterday.day) return 'Hier';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(child: Divider(color: const Color(0xFF08316E).withOpacity(0.08))),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(
              _label(),
              style: GoogleFonts.sora(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF7A879A)),
            ),
          ),
          Expanded(child: Divider(color: const Color(0xFF08316E).withOpacity(0.08))),
        ],
      ),
    );
  }
}

class _ScrollDownBtn extends StatelessWidget {
  const _ScrollDownBtn({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFF08316E),
            shape: BoxShape.circle,
            boxShadow: const [
              BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 2)),
            ],
          ),
          child: const Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 20),
        ),
      );
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.title, required this.subtitle, this.action});
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF0F5),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 32, color: const Color(0xFF8A95A8)),
              ),
              const SizedBox(height: 16),
              Text(title,
                  style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.w700),
                  textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text(subtitle,
                  style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF7A879A)),
                  textAlign: TextAlign.center),
              if (action != null) ...[const SizedBox(height: 16), action!],
            ],
          ),
        ),
      );
}

class _EmptyChat extends StatelessWidget {
  const _EmptyChat({required this.name});
  final String name;

  @override
  Widget build(BuildContext context) => Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: const BoxDecoration(
              color: Color(0xFFE8F0FE),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.chat_bubble_outline, size: 32, color: Color(0xFF08316E)),
          ),
          const SizedBox(height: 16),
          Text('Aucun message avec $name',
              style: GoogleFonts.sora(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0D1624)),
              textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text('Envoyez le premier message pour démarrer.',
              style: GoogleFonts.dmSans(fontSize: 13, color: const Color(0xFF7A879A)),
              textAlign: TextAlign.center),
        ],
      );
}

// Wrapper pour les différents états vides spécifiques au chat
class _EmptyChatState extends StatelessWidget {
  const _EmptyChatState({required this.name});
  final String name;

  @override
  Widget build(BuildContext context) => Center(child: _EmptyChat(name: name));
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded, size: 48, color: Color(0xFFE24B4A)),
            const SizedBox(height: 12),
            Text('Connexion impossible',
                style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            Text(message,
                style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF7A879A)),
                textAlign: TextAlign.center,
                maxLines: 2),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: Text('Réessayer', style: GoogleFonts.sora(fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF08316E),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      );
}
