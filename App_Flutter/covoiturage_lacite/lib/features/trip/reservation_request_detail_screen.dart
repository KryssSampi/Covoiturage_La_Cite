import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';

class ReservationRequestDetailScreen extends StatefulWidget {
  const ReservationRequestDetailScreen({super.key, required this.reservationId});
  final String reservationId;

  @override
  State<ReservationRequestDetailScreen> createState() => _ReservationRequestDetailScreenState();
}

class _ReservationRequestDetailScreenState extends State<ReservationRequestDetailScreen> {
  final ApiService _api = ApiService.instance;

  bool _isLoading = true;
  bool _isBusy = false;
  String? _error;
  Map<String, dynamic>? _data;
  String? _result;

  @override
  void initState() {
    super.initState();
    _loadRequest();
  }

  Future<void> _loadRequest() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dynamic payload = await _api.get('/api/reservations/${widget.reservationId}');
      final Map<String, dynamic>? map = _extractMap(payload);
      if (!mounted) return;
      setState(() {
        _data = map;
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

  Future<void> _handleDecision(bool accept) async {
    if (_isBusy) return;
    final bool confirmed = await _showConfirmDialog();
    if (!confirmed) return;
    setState(() {
      _isBusy = true;
    });
    try {
      await _api.post(
        '/api/reservations/${widget.reservationId}/${accept ? 'accept' : 'refuse'}',
        <String, dynamic>{},
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(accept ? 'Demande acceptee' : 'Demande refusee'),
          backgroundColor: accept ? const Color(0xFF16A34A) : const Color(0xFFE24B4A),
        ),
      );
      context.pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Operation impossible: $e')),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _isBusy = false;
      });
    }
  }

  Future<bool> _showConfirmDialog() async {
    final String passengerName = _passengerName;
    final bool? ok = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirmer la décision'),
          content: Text('Voulez-vous confirmer cette décision pour $passengerName ?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Confirmer'),
            ),
          ],
        );
      },
    );
    return ok ?? false;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.arrow_back, color: Color(0xFF08316E)),
          ),
          title: const Text('Demande de réservation', style: TextStyle(color: Color(0xFF111827))),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Erreur: $_error', textAlign: TextAlign.center),
                const SizedBox(height: 8),
                FilledButton(onPressed: _loadRequest, child: const Text('Reessayer')),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF08316E)),
        ),
        title: const Text('Demande de réservation', style: TextStyle(color: Color(0xFF111827))),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeader(),
            Transform.translate(
              offset: const Offset(0, -32),
              child: Column(
                children: [
                  _buildVerificationCard(),
                  _buildTripCard(),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              child: _buildResultOrActions(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 40),
      color: const Color(0xFF08316E),
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: Colors.white,
            child: CircleAvatar(
              radius: 37,
              backgroundColor: const Color(0xFF1A56CC),
              backgroundImage: _avatarUrl.isNotEmpty ? NetworkImage(_avatarUrl) : null,
              child: _avatarUrl.isNotEmpty
                  ? null
                  : Text(
                      _initial,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            _passengerName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ...List<Widget>.generate(
                5,
                (_) => const Icon(Icons.star, size: 14, color: Color(0xFFF59E0B)),
              ),
              const SizedBox(width: 6),
              Text(
                _rating.toStringAsFixed(1),
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '$_tripCount trajets',
            style: const TextStyle(color: Colors.white70, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildVerificationCard() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🛡 Vérifications',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF08316E)),
          ),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 3.5,
            children: const [
              _InfoChip('✅ Identité vérifiée'),
              _InfoChip('🎓 Étudiant La Cité'),
              _InfoChip('✉️ Email confirmé'),
              _InfoChip('📱 Téléphone vérifié'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTripCard() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🛣 Trajet demandé',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF08316E)),
          ),
          const SizedBox(height: 10),
          _tripRow('📍', 'Départ', _departure),
          _tripRow('📍', 'Arrivée', _arrival, iconColor: const Color(0xFFE24B4A)),
          _tripRow('📅', 'Date', _dateLabel),
          _tripRow('🕐', 'Heure', _timeLabel),
          _tripRow('👥', 'Places', '$_seats place(s)'),
          _tripRow('💰', 'Prix', '${_price.toStringAsFixed(2)} \$', valueColor: const Color(0xFF16A34A)),
        ],
      ),
    );
  }

  Widget _buildResultOrActions() {
    if (_result == 'accepted') {
      return _resultBox('Demande acceptée', const Color(0xFF16A34A));
    }
    if (_result == 'refused') {
      return _resultBox('Demande refusée', const Color(0xFFDC2626));
    }
    return Row(
      children: [
        Expanded(
          child: ElevatedButton(
            onPressed: _isBusy ? null : () => _handleDecision(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF16A34A),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: _isBusy
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Accepter', style: TextStyle(color: Colors.white)),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: ElevatedButton(
            onPressed: _isBusy ? null : () => _handleDecision(false),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: const Text('Refuser', style: TextStyle(color: Colors.white)),
          ),
        ),
      ],
    );
  }

  Widget _resultBox(String text, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _tripRow(
    String emoji,
    String label,
    String value, {
    Color? valueColor,
    Color? iconColor,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 22,
            child: Text(emoji, style: TextStyle(color: iconColor)),
          ),
          SizedBox(
            width: 60,
            child: Text(
              label,
              style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: valueColor ?? const Color(0xFF1F2937),
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String get _passengerName {
    final dynamic rawPassenger = _data == null ? null : _data!['passenger'];
    final Map<String, dynamic>? passenger =
        rawPassenger is Map<String, dynamic> ? rawPassenger : null;
    final String full = '${passenger?['firstName'] ?? ''} ${passenger?['lastName'] ?? ''}'.trim();
    return full.isEmpty ? 'Passager' : full;
  }

  String get _avatarUrl {
    final dynamic rawPassenger = _data == null ? null : _data!['passenger'];
    final Map<String, dynamic>? passenger =
        rawPassenger is Map<String, dynamic> ? rawPassenger : null;
    return passenger?['avatarUrl']?.toString() ?? '';
  }

  String get _initial {
    final String name = _passengerName.trim();
    if (name.isEmpty) return 'P';
    return name[0].toUpperCase();
  }

  double get _rating {
    final dynamic rawPassenger = _data == null ? null : _data!['passenger'];
    final Map<String, dynamic>? passenger =
        rawPassenger is Map<String, dynamic> ? rawPassenger : null;
    return _toDouble(passenger?['rating'] ?? 4.5);
  }

  int get _tripCount {
    final dynamic rawPassenger = _data == null ? null : _data!['passenger'];
    final Map<String, dynamic>? passenger =
        rawPassenger is Map<String, dynamic> ? rawPassenger : null;
    return _toInt(passenger?['tripCount'] ?? 0);
  }

  Map<String, dynamic>? get _trip {
    final dynamic rawTrip = _data == null ? null : _data!['trip'];
    return rawTrip is Map<String, dynamic> ? rawTrip : null;
  }

  String get _departure =>
      _trip?['departureLabel']?.toString() ?? (_data == null ? '' : _data!['departureLabel']?.toString() ?? '');
  String get _arrival =>
      _trip?['arrivalLabel']?.toString() ?? (_data == null ? '' : _data!['arrivalLabel']?.toString() ?? '');

  DateTime? get _departureTime =>
      _toDateTime(_trip?['departureTime'] ?? (_data == null ? null : _data!['departureTime']));

  String get _dateLabel {
    final DateTime? dt = _departureTime;
    if (dt == null) return '-';
    String two(int v) => v < 10 ? '0$v' : '$v';
    return '${dt.year}-${two(dt.month)}-${two(dt.day)}';
  }

  String get _timeLabel {
    final DateTime? dt = _departureTime;
    if (dt == null) return '--:--';
    String two(int v) => v < 10 ? '0$v' : '$v';
    return '${two(dt.hour)}:${two(dt.minute)}';
  }

  int get _seats => _toInt((_data == null ? null : _data!['seats']) ?? (_data == null ? null : _data!['requestedSeats']) ?? 1);

  double get _price => _toDouble(_trip?['pricePerSeat'] ?? (_data == null ? null : _data!['price']) ?? 0);
}

class _InfoChip extends StatelessWidget {
  const _InfoChip(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(2),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(text, style: const TextStyle(fontSize: 12, color: Color(0xFF374151))),
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

double _toDouble(dynamic value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

int _toInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}
