import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';

class NotificationDetailScreen extends StatefulWidget {
  const NotificationDetailScreen({
    super.key,
    required this.notificationId,
    this.initialData,
  });

  final String notificationId;
  final Map<String, dynamic>? initialData;

  @override
  State<NotificationDetailScreen> createState() => _NotificationDetailScreenState();
}

class _NotificationDetailScreenState extends State<NotificationDetailScreen> {
  final ApiService _api = ApiService.instance;
  bool _isLoading = true;
  _NotificationVm? _vm;

  @override
  void initState() {
    super.initState();
    if (widget.initialData != null) {
      _vm = _NotificationVm.fromJson(widget.initialData!);
      _isLoading = false;
    }
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    try {
      final dynamic payload = await _api.get('/api/notifications/${widget.notificationId}');
      final Map<String, dynamic>? map = _extractMap(payload);
      if (map == null || !mounted) {
        return;
      }
      setState(() {
        _vm = _NotificationVm.fromJson(map).mergeFallback(_vm);
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final _NotificationVm? vm = _vm;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF08316E)),
          onPressed: () => context.pop(),
        ),
        title: const Text('Notification', style: TextStyle(color: Color(0xFF111827))),
      ),
      body: _isLoading && vm == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(vm),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      vm?.message ?? '',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF374151),
                        height: 1.5,
                      ),
                    ),
                  ),
                  if (vm != null && (vm.tripId != null || vm.tripData != null))
                    _sectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'TRAJET CONCERNE',
                            style: TextStyle(
                              fontSize: 10,
                              letterSpacing: 1,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF08316E),
                            ),
                          ),
                          const SizedBox(height: 10),
                          _detailRow('Depart', _tripDeparture(vm)),
                          _detailRow('Arrivee', _tripArrival(vm)),
                          _detailRow('Date', _tripDate(vm)),
                          _detailRow('Heure', _tripTime(vm)),
                        ],
                      ),
                    ),
                  if (vm != null && ((vm.passengerName ?? '').isNotEmpty || (vm.driverName ?? '').isNotEmpty))
                    _sectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'PARTIES CONCERNEES',
                            style: TextStyle(
                              fontSize: 10,
                              letterSpacing: 1,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF08316E),
                            ),
                          ),
                          const SizedBox(height: 10),
                          _detailRow('Passager', vm.passengerName ?? '-'),
                          _detailRow('Conducteur', vm.driverName ?? '-'),
                        ],
                      ),
                    ),
                  if (vm != null && vm.review != null)
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'AVIS RECU',
                            style: TextStyle(
                              fontSize: 10,
                              letterSpacing: 1,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF92400E),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _stars(vm.reviewRating),
                            style: const TextStyle(fontSize: 16),
                          ),
                          if ((vm.reviewComment ?? '').isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              vm.reviewComment!,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF374151),
                                height: 1.4,
                              ),
                            ),
                          ],
                          const SizedBox(height: 6),
                          Text(
                            'Par ${vm.reviewerName ?? '-'}',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                          ),
                        ],
                      ),
                    ),
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Notification automatique - La Cite Covoiturage',
                      style: TextStyle(fontSize: 10, color: Color(0xFF9CA3AF)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader(_NotificationVm? vm) {
    final String typeLabel = vm?.typeLabel ?? 'Notification';
    final DateTime? createdAt = vm?.createdAt;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: _typeBg(typeLabel),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.notifications, color: _typeFg(typeLabel)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      typeLabel,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: _typeFg(typeLabel),
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'De : La Cite Covoiturage',
                      style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _chip('📅 ${_dateLabel(createdAt)}'),
              _chip('🕐 ${_timeLabel(createdAt)}'),
              _chip(
                '✉️ ${(vm?.isRead ?? false) ? 'Lu' : 'Non lu'}',
                color: (vm?.isRead ?? false) ? const Color(0xFF16A34A) : const Color(0xFFD97706),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _chip(String text, {Color? color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: (color ?? const Color(0xFF64748B)).withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color ?? const Color(0xFF475569),
        ),
      ),
    );
  }

  Widget _sectionCard({required Widget child}) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: child,
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(
            width: 90,
            child: Text(
              '• $label',
              style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1F2937),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _tripDeparture(_NotificationVm vm) {
    final Map<String, dynamic>? trip = vm.tripData;
    return _firstNotEmpty([
      trip?['departureLabel'],
      trip?['fromLabel'],
      trip?['departureCity'],
      trip?['from'],
      '-',
    ]);
  }

  String _tripArrival(_NotificationVm vm) {
    final Map<String, dynamic>? trip = vm.tripData;
    return _firstNotEmpty([
      trip?['arrivalLabel'],
      trip?['toLabel'],
      trip?['arrivalCity'],
      trip?['to'],
      '-',
    ]);
  }

  String _tripDate(_NotificationVm vm) {
    final DateTime? dt = _toDateTime(vm.tripData?['departureTime'] ?? vm.tripData?['departureDateTime']);
    return _dateLabel(dt);
  }

  String _tripTime(_NotificationVm vm) {
    final DateTime? dt = _toDateTime(vm.tripData?['departureTime'] ?? vm.tripData?['departureDateTime']);
    return _timeLabel(dt);
  }

  Color _typeBg(String type) {
    final String t = type.toLowerCase();
    if (t.contains('reservation')) return const Color(0xFFE8F0FE);
    if (t.contains('review') || t.contains('avis')) return const Color(0xFFFAEEDA);
    if (t.contains('security') || t.contains('securite')) return const Color(0xFFFCEBEB);
    return const Color(0xFFE8F0FE);
  }

  Color _typeFg(String type) {
    final String t = type.toLowerCase();
    if (t.contains('reservation')) return const Color(0xFF08316E);
    if (t.contains('review') || t.contains('avis')) return const Color(0xFF92400E);
    if (t.contains('security') || t.contains('securite')) return const Color(0xFFDC2626);
    return const Color(0xFF08316E);
  }

  String _dateLabel(DateTime? dt) {
    if (dt == null) return '-';
    String two(int v) => v < 10 ? '0$v' : '$v';
    return '${dt.year}-${two(dt.month)}-${two(dt.day)}';
  }

  String _timeLabel(DateTime? dt) {
    if (dt == null) return '--:--';
    String two(int v) => v < 10 ? '0$v' : '$v';
    return '${two(dt.hour)}:${two(dt.minute)}';
  }

  String _stars(int rating) {
    final int safe = rating < 0 ? 0 : (rating > 5 ? 5 : rating);
    if (safe == 0) return '☆';
    return List<String>.filled(safe, '⭐').join();
  }
}

class _NotificationVm {
  _NotificationVm({
    required this.typeLabel,
    required this.message,
    required this.createdAt,
    required this.isRead,
    required this.tripId,
    required this.tripData,
    required this.passengerName,
    required this.driverName,
    required this.review,
    required this.reviewRating,
    required this.reviewComment,
    required this.reviewerName,
  });

  final String typeLabel;
  final String message;
  final DateTime? createdAt;
  final bool isRead;
  final String? tripId;
  final Map<String, dynamic>? tripData;
  final String? passengerName;
  final String? driverName;
  final Map<String, dynamic>? review;
  final int reviewRating;
  final String? reviewComment;
  final String? reviewerName;

  factory _NotificationVm.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic>? data =
        json['data'] is Map<String, dynamic> ? json['data'] as Map<String, dynamic> : null;
    final Map<String, dynamic>? review =
        json['review'] is Map<String, dynamic> ? json['review'] as Map<String, dynamic> : null;
    final Map<String, dynamic>? tripFromData =
        data != null && data['trip'] is Map<String, dynamic> ? data['trip'] as Map<String, dynamic> : null;
    return _NotificationVm(
      typeLabel: _firstNotEmpty([json['type'], json['title'], 'Notification']),
      message: _firstNotEmpty([json['body'], json['message'], json['content'], '']),
      createdAt: _toDateTime(json['createdAt']),
      isRead: _toBool(json['isRead'] ?? (json['readAt'] != null)),
      tripId: json['tripId']?.toString() ?? data?['tripId']?.toString(),
      tripData: json['trip'] is Map<String, dynamic>
          ? json['trip'] as Map<String, dynamic>
          : tripFromData,
      passengerName: json['passengerName']?.toString() ?? data?['passengerName']?.toString(),
      driverName: json['driverName']?.toString() ?? data?['driverName']?.toString(),
      review: review,
      reviewRating: _toInt(review?['rating']),
      reviewComment: review?['comment']?.toString(),
      reviewerName: review?['reviewerName']?.toString() ??
          review?['authorName']?.toString() ??
          review?['from']?.toString(),
    );
  }

  _NotificationVm mergeFallback(_NotificationVm? fallback) {
    if (fallback == null) return this;
    return _NotificationVm(
      typeLabel: typeLabel.isEmpty ? fallback.typeLabel : typeLabel,
      message: message.isEmpty ? fallback.message : message,
      createdAt: createdAt ?? fallback.createdAt,
      isRead: isRead,
      tripId: tripId ?? fallback.tripId,
      tripData: tripData ?? fallback.tripData,
      passengerName: passengerName ?? fallback.passengerName,
      driverName: driverName ?? fallback.driverName,
      review: review ?? fallback.review,
      reviewRating: reviewRating == 0 ? fallback.reviewRating : reviewRating,
      reviewComment: reviewComment ?? fallback.reviewComment,
      reviewerName: reviewerName ?? fallback.reviewerName,
    );
  }
}

Map<String, dynamic>? _extractMap(dynamic payload) {
  if (payload is Map<String, dynamic>) {
    final dynamic data = payload['data'];
    if (data is Map<String, dynamic>) return data;
    return payload;
  }
  return null;
}

DateTime? _toDateTime(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  return DateTime.tryParse(value.toString());
}

bool _toBool(dynamic value) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  final String s = value?.toString().toLowerCase() ?? '';
  return s == 'true' || s == '1';
}

int _toInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

String _firstNotEmpty(List<dynamic> values) {
  for (final dynamic value in values) {
    final String s = value?.toString().trim() ?? '';
    if (s.isNotEmpty) return s;
  }
  return '';
}
