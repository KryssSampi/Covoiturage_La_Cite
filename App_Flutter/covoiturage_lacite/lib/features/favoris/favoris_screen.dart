// lib/features/favoris/favoris_screen.dart
// Pixel-perfect d'après wireframe cite-voiturage-favoris.html
// 3 sections : Conducteurs favoris (scroll horizontal) | Lieux favoris | Alertes trajets

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/services/api_service.dart';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const _primary = Color(0xFF08316E);
const _blue = Color(0xFF1A56CC);
const _blueLight = Color(0xFFE8F0FE);
const _teal = Color(0xFF0F6E56);
const _tealLight = Color(0xFFE1F5EE);
const _tealMid = Color(0xFF1D9E75);
const _amber = Color(0xFF854F0B);
const _amberLight = Color(0xFFFAEEDA);
const _amberMid = Color(0xFFBA7517);
const _red = Color(0xFFE24B4A);
const _redLight = Color(0xFFFCEBEB);
const _bg = Color(0xFFF2F5FA);
const _surface = Color(0xFFFFFFFF);
const _text1 = Color(0xFF0D1624);
const _text2 = Color(0xFF3D4A5C);
const _text3 = Color(0xFF7A879A);
const _gray50 = Color(0xFFF8F9FC);
const _gray100 = Color(0xFFEEF0F5);
const _gray200 = Color(0xFFD8DBE5);
const _gray400 = Color(0xFF8A95A8);
const _gray600 = Color(0xFF545D6E);

const _shSm = [
  BoxShadow(color: Color(0x0F000000), blurRadius: 4, offset: Offset(0, 1)),
  BoxShadow(color: Color(0x0A000000), blurRadius: 2, offset: Offset(0, 1)),
];
const _shMd = [
  BoxShadow(color: Color(0x14000000), blurRadius: 14, offset: Offset(0, 4)),
  BoxShadow(color: Color(0x0A000000), blurRadius: 4, offset: Offset(0, 2)),
];

// ─── MOCK API SERVICE ─────────────────────────────────────────────────────────
class _ApiService {
  static final instance = _ApiService._();
  _ApiService._();

  Future<dynamic> get(String path) async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (path.contains('favorites/drivers')) return _mockDrivers;
    if (path.contains('favorites/places')) return _mockPlaces;
    if (path.contains('survey-trip-alerts')) return _mockAlerts;
    return [];
  }

  static const _mockDrivers = [
    {'id': 'd1', 'firstName': 'Marie', 'lastName': 'T.', 'avatarUrl': null, 'initials': 'MT', 'rating': 4.9, 'bg': 0xFFE8F0FE, 'fg': 0xFF1A56CC},
    {'id': 'd2', 'firstName': 'Ahmed', 'lastName': 'I.', 'avatarUrl': null, 'initials': 'AI', 'rating': 4.8, 'bg': 0xFFE1F5EE, 'fg': 0xFF0F6E56},
    {'id': 'd3', 'firstName': 'Jean', 'lastName': 'M.', 'avatarUrl': null, 'initials': 'JM', 'rating': 4.6, 'bg': 0xFFFAEEDA, 'fg': 0xFFBA7517},
    {'id': 'd4', 'firstName': 'Sophie', 'lastName': 'L.', 'avatarUrl': null, 'initials': 'SL', 'rating': 4.7, 'bg': 0xFFEDE9FB, 'fg': 0xFF5B3FA6},
  ];

  static const _mockPlaces = [
    {'id': 'p1', 'label': 'Maison', 'address': '142 rue des Érables, Laval', 'icon': 'home', 'freq': '8 min', 'iconBg': 0xFFE8F0FE, 'iconColor': 0xFF1A56CC},
    {'id': 'p2', 'label': 'Campus La Cité', 'address': '801 prom. de l\'Aviation, Ottawa', 'icon': 'school', 'freq': '22 min', 'iconBg': 0xFFE1F5EE, 'iconColor': 0xFF0F6E56},
    {'id': 'p3', 'label': 'Centre commercial', 'address': 'Place Laurier, Québec', 'icon': 'shopping', 'freq': '15 min', 'iconBg': 0xFFFAEEDA, 'iconColor': 0xFFBA7517},
  ];

  static const _mockAlerts = [
    {'id': 'a1', 'departure': 'Maison', 'arrival': 'Campus La Cité', 'timeRange': 'Lun – Ven · 07h30', 'isActive': true},
    {'id': 'a2', 'departure': 'Campus La Cité', 'arrival': 'Maison', 'timeRange': 'Lun – Ven · 17h00', 'isActive': true},
    {'id': 'a3', 'departure': 'Maison', 'arrival': 'Place Laurier', 'timeRange': 'Sam – Dim · 10h00', 'isActive': false},
  ];
}

// ─── HELPERS TYPO ─────────────────────────────────────────────────────────────

TextStyle _sora({
  double size = 14,
  FontWeight weight = FontWeight.w600,
  Color color = _text1,
  double? letterSpacing,
}) =>
    GoogleFonts.sora(fontSize: size, fontWeight: weight, color: color, letterSpacing: letterSpacing);

TextStyle _dm({
  double size = 13,
  FontWeight weight = FontWeight.w400,
  Color color = _text1,
}) =>
    GoogleFonts.dmSans(fontSize: size, fontWeight: weight, color: color);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

class FavorisScreen extends StatefulWidget {
  const FavorisScreen({super.key});

  @override
  State<FavorisScreen> createState() => _FavorisScreenState();
}

class _FavorisScreenState extends State<FavorisScreen> {
  bool _isLoading = true;
  List<dynamic> _drivers = [];
  List<dynamic> _places = [];
  List<dynamic> _alerts = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final dynamic data = await ApiService.instance.get('/api/favorites');
      final dynamic body = (data is Map<String, dynamic>) ? (data['data'] ?? data) : data;
      if (mounted) {
        setState(() {
          _drivers = _extractList(
            body is Map<String, dynamic> ? (body['drivers'] ?? body['favoriteDrivers']) : <dynamic>[],
          );
          _places = _extractList(
            body is Map<String, dynamic> ? (body['places'] ?? body['favoritePlaces']) : <dynamic>[],
          );
          _alerts = _extractList(
            body is Map<String, dynamic> ? (body['alerts'] ?? body['tripAlerts']) : <dynamic>[],
          );
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List) return data;
    if (data is Map) {
      return (data['items'] ?? data['data'] ?? data['results'] ?? <dynamic>[]) as List<dynamic>;
    }
    return <dynamic>[];
  }

  void _removeDriver(String id) {
    setState(() => _drivers.removeWhere((d) => d['id'] == id));
    _showToast('Conducteur retiré des favoris');
  }

  void _removePlace(String id) {
    setState(() => _places.removeWhere((p) => p['id'] == id));
    _showToast('Lieu supprimé');
  }

  void _toggleAlert(String id, bool value) {
    setState(() {
      final idx = _alerts.indexWhere((a) => a['id'] == id);
      if (idx != -1) {
        _alerts[idx] = Map.from(_alerts[idx] as Map)..['isActive'] = value;
      }
    });
  }

  void _showToast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: _sora(size: 13, color: Colors.white)),
        backgroundColor: const Color(0xFF2C3345),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: _primary,
        title: Text('Mes Favoris', style: _sora(size: 20, weight: FontWeight.w700, color: Colors.white)),
        leading: const BackButton(color: Colors.white),
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: _primary))
                  : RefreshIndicator(
                      onRefresh: _load,
                      color: _primary,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // ── CONDUCTEURS FAVORIS ──
                            _SectionHeader(
                              icon: Icons.person_pin_rounded,
                              iconBg: _blueLight,
                              iconColor: _blue,
                              title: 'Conducteurs favoris',
                              count: _drivers.length,
                              btnLabel: '+ Ajouter',
                              btnColor: _blue,
                              btnBg: _blueLight,
                              onAdd: () => _showAddDriverSheet(),
                            ),
                            if (_drivers.isEmpty)
                              _EmptyState('Aucun conducteur favori')
                            else
                              SizedBox(
                                height: 118,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                  itemCount: _drivers.length,
                                  itemBuilder: (ctx, i) => _DriverPill(
                                    driver: _drivers[i] as Map,
                                    onDelete: () => _removeDriver(_drivers[i]['id'] as String),
                                  ),
                                ),
                              ),

                            // ── LIEUX FAVORIS ──
                            _SectionHeader(
                              icon: Icons.place_rounded,
                              iconBg: _tealLight,
                              iconColor: _teal,
                              title: 'Lieux favoris',
                              count: _places.length,
                              btnLabel: '+ Ajouter',
                              btnColor: _teal,
                              btnBg: _tealLight,
                              onAdd: () => _showAddPlaceSheet(),
                            ),
                            if (_places.isEmpty)
                              _EmptyState('Aucun lieu favori')
                            else
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Column(
                                  children: _places
                                      .map((p) => _PlaceCard(
                                            place: p as Map,
                                            onDelete: () => _removePlace(p['id'] as String),
                                          ))
                                      .toList(),
                                ),
                              ),

                            // ── ALERTES TRAJETS ──
                            _SectionHeader(
                              icon: Icons.notifications_active_rounded,
                              iconBg: _amberLight,
                              iconColor: _amberMid,
                              title: 'Alertes trajets',
                              count: _alerts.length,
                              btnLabel: '🔍 Rechercher',
                              btnColor: _amberMid,
                              btnBg: _amberLight,
                              onAdd: () {},
                            ),
                            if (_alerts.isEmpty)
                              _EmptyState('Aucune alerte configurée')
                            else
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Column(
                                  children: _alerts
                                      .map((a) => _AlertCard(
                                            alert: a as Map,
                                            onToggle: (v) => _toggleAlert(a['id'] as String, v),
                                          ))
                                      .toList(),
                                ),
                              ),

                            const SizedBox(height: 32),
                          ],
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddDriverSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: _surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      isScrollControlled: true,
      builder: (_) => const _AddDriverSheet(),
    );
  }

  void _showAddPlaceSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: _surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      isScrollControlled: true,
      builder: (_) => const _AddPlaceSheet(),
    );
  }
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.title,
    required this.count,
    required this.btnLabel,
    required this.btnColor,
    required this.btnBg,
    required this.onAdd,
  });

  final IconData icon;
  final Color iconBg, iconColor;
  final String title;
  final int count;
  final String btnLabel;
  final Color btnColor, btnBg;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
      child: Row(
        children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor, size: 17),
          ),
          const SizedBox(width: 8),
          Text(title, style: _sora(size: 14, weight: FontWeight.w700)),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
            decoration: BoxDecoration(color: _gray100, borderRadius: BorderRadius.circular(999)),
            child: Text('$count', style: _sora(size: 11, weight: FontWeight.w700, color: _text3)),
          ),
          const Spacer(),
          GestureDetector(
            onTap: onAdd,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 7),
              decoration: BoxDecoration(color: btnBg, borderRadius: BorderRadius.circular(999)),
              child: Text(btnLabel, style: _sora(size: 12, weight: FontWeight.w700, color: btnColor)),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── DRIVER PILL ──────────────────────────────────────────────────────────────

class _DriverPill extends StatelessWidget {
  const _DriverPill({required this.driver, required this.onDelete});
  final Map driver;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final bg = Color(driver['bg'] as int? ?? 0xFFE8F0FE);
    final fg = Color(driver['fg'] as int? ?? 0xFF1A56CC);
    final initials = driver['initials'] as String? ?? '?';
    final name = driver['firstName'] as String? ?? '';
    final rating = driver['rating'] as double?;
    final avatarUrl = driver['avatarUrl'] as String?;

    return Container(
      width: 90,
      margin: const EdgeInsets.only(right: 10),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: _shSm,
      ),
      padding: const EdgeInsets.all(10),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: bg,
                backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                child: avatarUrl == null
                    ? Text(initials, style: _sora(size: 14, weight: FontWeight.w700, color: fg))
                    : null,
              ),
              Positioned(
                top: 0,
                right: 0,
                child: GestureDetector(
                  onTap: onDelete,
                  child: Container(
                    width: 16, height: 16,
                    decoration: BoxDecoration(
                      color: _redLight,
                      shape: BoxShape.circle,
                      border: Border.all(color: _surface, width: 1),
                    ),
                    child: const Icon(Icons.close_rounded, size: 10, color: _red),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            name,
            style: _sora(size: 11, weight: FontWeight.w700),
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
          if (rating != null)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 11),
                const SizedBox(width: 2),
                Text('$rating', style: _dm(size: 11, color: _text3)),
              ],
            ),
        ],
      ),
    );
  }
}

// ─── PLACE CARD ───────────────────────────────────────────────────────────────

class _PlaceCard extends StatelessWidget {
  const _PlaceCard({required this.place, required this.onDelete});
  final Map place;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final iconBg = Color(place['iconBg'] as int? ?? 0xFFE8F0FE);
    final iconColor = Color(place['iconColor'] as int? ?? 0xFF1A56CC);
    final icon = _iconForType(place['icon'] as String? ?? 'home');

    return Container(
      margin: const EdgeInsets.only(bottom: 9),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x12000000)),
        boxShadow: _shSm,
      ),
      padding: const EdgeInsets.all(13),
      child: Row(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(place['label'] as String? ?? '', style: _sora(size: 14, weight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(
                  place['address'] as String? ?? '',
                  style: _dm(size: 12, color: _text3),
                  overflow: TextOverflow.ellipsis,
                ),
                if (place['freq'] != null) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(color: _gray50, borderRadius: BorderRadius.circular(999)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.access_time_rounded, size: 11, color: _text3),
                        const SizedBox(width: 4),
                        Text(place['freq'] as String, style: _dm(size: 11, color: _text3)),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded, color: _gray400, size: 20),
            onPressed: onDelete,
            splashRadius: 20,
          ),
        ],
      ),
    );
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'school': return Icons.school_rounded;
      case 'work': return Icons.work_outline_rounded;
      case 'shopping': return Icons.shopping_bag_outlined;
      default: return Icons.home_rounded;
    }
  }
}

// ─── ALERT CARD ───────────────────────────────────────────────────────────────

class _AlertCard extends StatelessWidget {
  const _AlertCard({required this.alert, required this.onToggle});
  final Map alert;
  final void Function(bool) onToggle;

  @override
  Widget build(BuildContext context) {
    final isActive = alert['isActive'] as bool? ?? false;
    final dep = alert['departure'] as String? ?? '';
    final arr = alert['arrival'] as String? ?? '';
    final timeRange = alert['timeRange'] as String? ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 9),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x12000000)),
        boxShadow: _shSm,
      ),
      child: Column(
        children: [
          // Top: route + badge
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 11, 14, 9),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('$dep → $arr', style: _sora(size: 13, weight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: _blue, shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          Text(dep, style: _dm(size: 12, color: _text2)),
                          Expanded(child: Container(margin: const EdgeInsets.symmetric(horizontal: 6), height: 1.5, color: _gray200)),
                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: _red, shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          Text(arr, style: _dm(size: 12, color: _text2)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                  decoration: BoxDecoration(
                    color: isActive ? _tealLight : _gray100,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    isActive ? 'Active' : 'En pause',
                    style: _sora(size: 11, weight: FontWeight.w700, color: isActive ? _teal : _gray600),
                  ),
                ),
              ],
            ),
          ),
          // Chips fréquence
          const Divider(height: 1, color: Color(0x12000000)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _gray50,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: _gray200),
                  ),
                  child: Text(timeRange, style: _sora(size: 11, weight: FontWeight.w700, color: _text3)),
                ),
              ],
            ),
          ),
          // Toggle + voir
          const Divider(height: 1, color: Color(0x12000000)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            child: Row(
              children: [
                Switch(
                  value: isActive,
                  onChanged: onToggle,
                  activeColor: _tealMid,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                const SizedBox(width: 8),
                Text(
                  isActive ? 'Active' : 'En pause',
                  style: _sora(size: 12, weight: FontWeight.w700, color: _text2),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () {},
                  child: Text(
                    'Voir les trajets →',
                    style: _sora(size: 12, weight: FontWeight.w700, color: _blue),
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

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  const _EmptyState(this.message);
  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: Text(message, style: GoogleFonts.dmSans(fontSize: 13, color: _gray400)),
      ),
    );
  }
}

// ─── ADD DRIVER SHEET ─────────────────────────────────────────────────────────

class _AddDriverSheet extends StatefulWidget {
  const _AddDriverSheet();

  @override
  State<_AddDriverSheet> createState() => _AddDriverSheetState();
}

class _AddDriverSheetState extends State<_AddDriverSheet> {
  final _ctrl = TextEditingController();
  final Set<String> _selected = {};
  List<Map> _results = [];

  static const _pool = [
    {'id': 's1', 'name': 'Amélie Tremblay', 'meta': 'Conductrice · 4.9 ★', 'initials': 'AT', 'bg': 0xFFE8F0FE, 'fg': 0xFF1A56CC, 'verified': true},
    {'id': 's2', 'name': 'Kevin Nguyen', 'meta': 'Conducteur · 4.7 ★', 'initials': 'KN', 'bg': 0xFFE1F5EE, 'fg': 0xFF0F6E56, 'verified': false},
    {'id': 's3', 'name': 'Fatima Benali', 'meta': 'Conductrice · 4.8 ★', 'initials': 'FB', 'bg': 0xFFFAEEDA, 'fg': 0xFFBA7517, 'verified': true},
    {'id': 's4', 'name': 'Lucas Moreau', 'meta': 'Conducteur · 4.6 ★', 'initials': 'LM', 'bg': 0xFFEDE9FB, 'fg': 0xFF5B3FA6, 'verified': false},
    {'id': 's5', 'name': 'Jade Ouellet', 'meta': 'Conductrice · 4.9 ★', 'initials': 'JO', 'bg': 0xFFE8F0FE, 'fg': 0xFF1A56CC, 'verified': true},
  ];

  void _search(String q) {
    setState(() {
      _results = q.length < 2
          ? []
          : _pool.where((d) => d['name']!.toString().toLowerCase().contains(q.toLowerCase())).toList();
    });
  }

  void _toggle(String id) {
    setState(() {
      if (_selected.contains(id)) _selected.remove(id); else _selected.add(id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      maxChildSize: 0.92,
      builder: (_, scrollCtrl) => Column(
        children: [
          // Handle
          Center(
            child: Container(
              width: 40, height: 4, margin: const EdgeInsets.only(top: 12, bottom: 4),
              decoration: BoxDecoration(color: _gray200, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: [
                const Icon(Icons.person_rounded, color: _text1, size: 18),
                const SizedBox(width: 8),
                Text('Ajouter un conducteur', style: _sora(size: 16, weight: FontWeight.w700)),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: _text3),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              decoration: BoxDecoration(
                color: _gray50,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: _gray200),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              child: Row(
                children: [
                  const Icon(Icons.search_rounded, color: _gray400, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      onChanged: _search,
                      style: _dm(size: 14),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: 'Rechercher un conducteur…',
                        hintStyle: _dm(size: 14, color: _gray400),
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_selected.isNotEmpty)
            Container(
              margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(color: _blueLight, borderRadius: BorderRadius.circular(10)),
              child: Row(
                children: [
                  Text('${_selected.length} sélectionné(s)', style: _sora(size: 12, color: _primary)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => setState(() => _selected.clear()),
                    child: Text('Tout désélectionner', style: _sora(size: 12, color: _red)),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 8),
          Expanded(
            child: _results.isEmpty && _ctrl.text.length < 2
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.group_outlined, size: 40, color: _gray200),
                        const SizedBox(height: 10),
                        Text('Trouvez un conducteur', style: _sora(size: 13, color: _text3)),
                        const SizedBox(height: 4),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 40),
                          child: Text(
                            'Saisissez un nom pour rechercher parmi les conducteurs de La Cité.',
                            style: _dm(size: 12, color: _text3),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView(
                    controller: scrollCtrl,
                    children: _results.map((d) {
                      final id = d['id'] as String;
                      final isSelected = _selected.contains(id);
                      return GestureDetector(
                        onTap: () => _toggle(id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? _blueLight.withOpacity(0.5) : Colors.transparent,
                            border: const Border(bottom: BorderSide(color: Color(0x0D000000))),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 22, height: 22,
                                decoration: BoxDecoration(
                                  color: isSelected ? _blue : Colors.transparent,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: isSelected ? _blue : _gray200, width: 1.5),
                                ),
                                child: isSelected ? const Icon(Icons.check_rounded, color: Colors.white, size: 12) : null,
                              ),
                              const SizedBox(width: 12),
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: Color(d['bg'] as int),
                                child: Text(
                                  d['initials'] as String,
                                  style: _sora(size: 12, weight: FontWeight.w700, color: Color(d['fg'] as int)),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(d['name'] as String, style: _sora(size: 13, weight: FontWeight.w700)),
                                    Text(d['meta'] as String, style: _dm(size: 11, color: _text3)),
                                    if (d['verified'] == true)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 2),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                          decoration: BoxDecoration(color: _tealLight, borderRadius: BorderRadius.circular(999)),
                                          child: Text('✓ Vérifié', style: _sora(size: 10, weight: FontWeight.w700, color: _teal)),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
          ),
          // CTA footer
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0x0D000000))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(color: _gray100, borderRadius: BorderRadius.circular(14)),
                      child: Center(child: Text('Annuler', style: _sora(size: 14, color: _text2))),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        color: _teal,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(child: Text('Enregistrer', style: _sora(size: 14, color: Colors.white))),
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
}

// ─── ADD PLACE SHEET ──────────────────────────────────────────────────────────

class _AddPlaceSheet extends StatefulWidget {
  const _AddPlaceSheet();

  @override
  State<_AddPlaceSheet> createState() => _AddPlaceSheetState();
}

class _AddPlaceSheetState extends State<_AddPlaceSheet> {
  final _searchCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  Map<String, String>? _selectedSuggestion;

  static const _mockAddresses = [
    {'label': 'Campus La Cité', 'address': '950 rue de la Gappe, Gatineau, QC'},
    {'label': 'Gare d\'Ottawa', 'address': '200 Tremblay Rd, Ottawa, ON'},
    {'label': 'Place d\'Orléans', 'address': '110 Place d\'Orléans Dr, Ottawa, ON'},
    {'label': 'Rideau Centre', 'address': '50 Rideau St, Ottawa, ON'},
    {'label': 'Carleton University', 'address': '1125 Colonel By Dr, Ottawa, ON'},
    {'label': 'Université d\'Ottawa', 'address': '75 Laurier Ave E, Ottawa, ON'},
  ];

  List<Map<String, String>> _suggestions = [];

  void _onSearch(String q) {
    setState(() {
      _selectedSuggestion = null;
      _suggestions = q.length < 2
          ? []
          : _mockAddresses
              .where((a) =>
                  a['label']!.toLowerCase().contains(q.toLowerCase()) ||
                  a['address']!.toLowerCase().contains(q.toLowerCase()))
              .take(5)
              .cast<Map<String, String>>()
              .toList();
    });
  }

  void _selectSuggestion(Map<String, String> s) {
    setState(() {
      _selectedSuggestion = s;
      _searchCtrl.text = s['address']!;
      if (_nameCtrl.text.isEmpty) _nameCtrl.text = s['label']!;
      _suggestions = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 600),
        decoration: const BoxDecoration(
          color: _surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40, height: 4, margin: const EdgeInsets.only(top: 12, bottom: 4),
                decoration: BoxDecoration(color: _gray200, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
              child: Row(
                children: [
                  const Icon(Icons.place_rounded, color: _text1, size: 18),
                  const SizedBox(width: 8),
                  Text('Ajouter un lieu favori', style: _sora(size: 16, weight: FontWeight.w700)),
                  const Spacer(),
                  IconButton(icon: const Icon(Icons.close_rounded, color: _text3), onPressed: () => Navigator.pop(context)),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0x12000000)),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Search
                    Container(
                      decoration: BoxDecoration(
                        color: _gray50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _selectedSuggestion != null ? _blue : _gray200, width: 1.5),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: Row(
                        children: [
                          const Icon(Icons.search_rounded, color: _gray400, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: _searchCtrl,
                              onChanged: _onSearch,
                              style: _dm(size: 14),
                              decoration: InputDecoration(
                                border: InputBorder.none,
                                hintText: 'Rechercher une adresse…',
                                hintStyle: _dm(size: 14, color: _gray400),
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Suggestions
                    if (_suggestions.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Container(
                        decoration: BoxDecoration(
                          color: _surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _blue, width: 1.5),
                        ),
                        child: Column(
                          children: _suggestions.asMap().entries.map((e) {
                            final s = e.value;
                            final isLast = e.key == _suggestions.length - 1;
                            return GestureDetector(
                              onTap: () => _selectSuggestion(s),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                decoration: BoxDecoration(
                                  border: isLast ? null : const Border(bottom: BorderSide(color: Color(0x0D000000))),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.place_rounded, color: _text3, size: 16),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(s['label']!, style: _sora(size: 13, weight: FontWeight.w700)),
                                          Text(s['address']!, style: _dm(size: 11, color: _text3), overflow: TextOverflow.ellipsis),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    // Name
                    Text('PSEUDONYME DU LIEU', style: _sora(size: 10, color: _text3, letterSpacing: 0.6)),
                    const SizedBox(height: 6),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _gray200, width: 1.5),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: Row(
                        children: [
                          const Text('✏️', style: TextStyle(fontSize: 14)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: _nameCtrl,
                              style: _dm(size: 14),
                              decoration: InputDecoration(
                                border: InputBorder.none,
                                hintText: 'Ex : Campus du matin…',
                                hintStyle: _dm(size: 14, color: _gray400),
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Presets
                    const SizedBox(height: 12),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: ['🏠 Maison', '🎓 École', '💼 Travail', '🏋️ Gym', '🌟 Autre']
                            .map((p) => GestureDetector(
                                  onTap: () => _nameCtrl.text = p,
                                  child: Container(
                                    margin: const EdgeInsets.only(right: 7),
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: _blueLight,
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(p, style: _sora(size: 12, weight: FontWeight.w700, color: _blue)),
                                  ),
                                ))
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
            const Divider(height: 1, color: Color(0x12000000)),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(color: _gray100, borderRadius: BorderRadius.circular(14)),
                        child: Center(child: Text('Annuler', style: _sora(size: 14, color: _text2))),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: GestureDetector(
                      onTap: _selectedSuggestion != null ? () => Navigator.pop(context) : null,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: _selectedSuggestion != null ? _blue : _gray200,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Center(child: Text('Enregistrer', style: _sora(size: 14, color: Colors.white))),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
