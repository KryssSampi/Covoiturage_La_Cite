import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/models/message.dart';
import '../../core/services/api_service.dart';
import '../../core/utils/parsing.dart' as parsing;

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.tripId});

  final String tripId;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final ApiService _api = ApiService.instance;
  final TextEditingController _draftCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  Timer? _pollTimer;
  bool _isLoading = true;
  bool _isSending = false;
  String? _error;
  String? _currentUserId;
  DateTime? _tripDepartureTime;
  List<Message> _messages = <Message>[];

  bool get _isChatAvailable {
    if (_tripDepartureTime == null) return true;
    return DateTime.now().isAfter(_tripDepartureTime!.subtract(const Duration(hours: 2)));
  }

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _draftCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await Future.wait(<Future<void>>[
      _loadCurrentUser(),
      _loadTripMeta(),
      _loadMessages(showLoader: true),
    ]);
    _pollTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _loadMessages(showLoader: false),
    );
  }

  Future<void> _loadCurrentUser() async {
    try {
      final dynamic payload = await _api.get('/api/users/me');
      final Map<String, dynamic>? me = _extractMap(payload);
      if (!mounted || me == null) return;
      setState(() {
        _currentUserId = me['id']?.toString();
      });
    } catch (_) {}
  }

  Future<void> _loadTripMeta() async {
    try {
      final dynamic payload = await _api.get('/api/trips/mine/driver');
      final List<dynamic> rows = _extractList(payload);
      for (final dynamic row in rows) {
        if (row is! Map<String, dynamic>) continue;
        if (row['id']?.toString() != widget.tripId) continue;
        final DateTime? departure = _toDateTime(
          row['departureTime'] ?? row['departureDateTime'] ?? row['startTime'],
        );
        if (!mounted) return;
        setState(() {
          _tripDepartureTime = departure;
        });
        return;
      }
    } catch (_) {}
  }

  Future<void> _loadMessages({required bool showLoader}) async {
    if (showLoader) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    }
    try {
      final dynamic payload = await _api.get('/api/messages/${widget.tripId}');
      final List<dynamic> rows = _extractList(payload);
      final List<Message> loaded = rows
          .whereType<Map<String, dynamic>>()
          .map(Message.fromJson)
          .toList()
        ..sort((a, b) => a.sentAt.compareTo(b.sentAt));
      if (!mounted) return;
      setState(() {
        _messages = loaded;
      });
      _scrollToBottom();
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

  Future<void> _sendMessage() async {
    if (_isSending) return;
    final String text = _draftCtrl.text.trim();
    if (text.isEmpty) return;
    if (!_isChatAvailable) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Le chat est disponible 2h avant le depart.')),
      );
      return;
    }

    setState(() {
      _isSending = true;
    });
    try {
      await _api.post('/api/messages/${widget.tripId}', <String, dynamic>{'content': text});
      _draftCtrl.clear();
      await _loadMessages(showLoader: false);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Envoi impossible: $e')),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _isSending = false;
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollCtrl.hasClients) return;
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Conversation')),
      body: Column(
        children: <Widget>[
          if (!_isChatAvailable)
            Container(
              width: double.infinity,
              color: Colors.amber.shade100,
              padding: const EdgeInsets.all(10),
              child: const Text(
                'Le chat sera active 2 heures avant le depart.',
                textAlign: TextAlign.center,
              ),
            ),
          Expanded(child: _buildMessages()),
          _buildComposer(),
        ],
      ),
    );
  }

  Widget _buildMessages() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(child: Text('Erreur: $_error'));
    }
    if (_messages.isEmpty) {
      return const Center(child: Text('Aucun message pour ce trajet.'));
    }
    return RefreshIndicator(
      onRefresh: () => _loadMessages(showLoader: false),
      child: ListView.builder(
        controller: _scrollCtrl,
        padding: const EdgeInsets.all(12),
        itemCount: _messages.length,
        itemBuilder: (_, int index) {
          final Message msg = _messages[index];
          final bool isSelf = msg.senderId == _currentUserId;
          return Align(
            alignment: isSelf ? Alignment.centerRight : Alignment.centerLeft,
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              constraints: const BoxConstraints(maxWidth: 280),
              decoration: BoxDecoration(
                color: isSelf ? const Color(0xFF08316E) : Colors.white,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment:
                    isSelf ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    msg.content,
                    style: TextStyle(color: isSelf ? Colors.white : const Color(0xFF111827)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _fmtTime(msg.sentAt),
                    style: TextStyle(
                      fontSize: 11,
                      color: isSelf ? Colors.white70 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildComposer() {
    final bool disabled = _isSending || !_isChatAvailable;
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        color: Colors.white,
        child: Row(
          children: <Widget>[
            Expanded(
              child: TextField(
                controller: _draftCtrl,
                enabled: !disabled,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                decoration: const InputDecoration(
                  hintText: 'Ecrire un message...',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: disabled ? null : _sendMessage,
              icon: _isSending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.send),
            ),
          ],
        ),
      ),
    );
  }
}

List<dynamic> _extractList(dynamic payload) => parsing.extractList(payload);

Map<String, dynamic>? _extractMap(dynamic payload) => parsing.extractMap(payload);

DateTime? _toDateTime(dynamic value) => parsing.toDateTime(value);

String _fmtTime(DateTime dt) {
  String two(int v) => v < 10 ? '0$v' : '$v';