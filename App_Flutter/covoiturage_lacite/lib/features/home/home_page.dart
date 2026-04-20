import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_colors.dart';
import '../../core/app_text_styles.dart';
import '../../shared/widgets/shared_widgets.dart';
import '../../core/services/api_service.dart';

// ══════════════════════════════════════════════════════════════════════════════
// MODÈLES LOCAUX (adaptateurs affichage — remplacer par vrais models si besoin)
// ══════════════════════════════════════════════════════════════════════════════

class _FavPill {
  final String label;
  final IconData icon;
  final Color bg;
  final Color fg;
  const _FavPill(
      {required this.label,
      required this.icon,
      required this.bg,
      required this.fg});
}

class _StatCard {
  final String value;
  final String unit;
  final String label;
  final Color iconBg;
  final Color iconFg;
  final IconData icon;
  final String? badge;
  const _StatCard(
      {required this.value,
      required this.unit,
      required this.label,
      required this.iconBg,
      required this.iconFg,
      required this.icon,
      this.badge});
}

class _RequestCard {
  final String initials;
  final Color avatarBg;
  final Color avatarFg;
  final String name;
  final String action;
  final String timeLabel;
  final String typeLabel;
  final Color typeBg;
  final Color typeFg;
  final String routeFrom;
  final String routeTo;
  final bool hasAccept;
  final String? reservationId;
  const _RequestCard({
    required this.initials,
    required this.avatarBg,
    required this.avatarFg,
    required this.name,
    required this.action,
    required this.timeLabel,
    required this.typeLabel,
    required this.typeBg,
    required this.typeFg,
    required this.routeFrom,
    required this.routeTo,
    this.hasAccept = false,
    this.reservationId,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _api = ApiService.instance;

  bool _isSearchFocused = false;
  bool _isLoading = true;
  String? _firstName;
  List<_StatCard> _stats = [];
  List<_RequestCard> _requests = [];

  static const _favPills = [
    _FavPill(label: 'La Cité', icon: Icons.school_outlined,   bg: AppColors.blueLight,  fg: AppColors.blue),
    _FavPill(label: 'Maison',  icon: Icons.home_outlined,     bg: AppColors.tealLight,  fg: AppColors.teal),
    _FavPill(label: 'Travail', icon: Icons.work_outline,      bg: AppColors.amberLight, fg: AppColors.amber),
  ];

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final data = await _api.get('/api/dashboard/driver/me') as Map<String, dynamic>?;
      if (!mounted || data == null) return;
      final s = (data['stats'] as Map?)?.cast<String, dynamic>() ?? {};
      final f = (data['finance'] as Map?)?.cast<String, dynamic>() ?? {};
      final reqs = (data['reservationRequests'] as List?) ?? [];
      setState(() {
        _firstName = data['user']?['firstName'] as String?;
        _stats = [
          _StatCard(value: '${s['tripsCount'] ?? 0}',         unit: '',   label: 'Trajets complétés', iconBg: const Color(0xFFFDECEA), iconFg: AppColors.redMid,   icon: Icons.directions_car_outlined),
          _StatCard(value: '${s['co2SavedKg'] ?? 0}',         unit: 'kg', label: 'CO₂ économisé',     iconBg: AppColors.tealLight,    iconFg: AppColors.teal,     icon: Icons.eco_outlined),
          _StatCard(value: '${s['averageRating'] ?? '—'}',    unit: '',   label: 'Note moyenne',      iconBg: AppColors.amberLight,   iconFg: AppColors.amberMid, icon: Icons.star_outline),
          _StatCard(value: '${s['goScore'] ?? f['goScore'] ?? 0}', unit: 'pts', label: 'GoScore',    iconBg: AppColors.blueLight,    iconFg: AppColors.blue,     icon: Icons.bolt_outlined),
        ];
        _requests = reqs.map((r) {
          final p = r['passenger'] as Map? ?? {};
          final t = r['trip'] as Map? ?? {};
          final name = '${p['firstName'] ?? ''} ${p['lastName'] ?? ''}'.trim();
          final initials = ((p['firstName'] as String? ?? ' ')[0] + (p['lastName'] as String? ?? ' ')[0]).toUpperCase();
          final dep = t['departureLabel'] ?? '';
          final arr = t['arrivalLabel'] ?? '';
          return _RequestCard(
            initials: initials, name: name.isEmpty ? 'Passager' : name,
            action: 'veut rejoindre votre trajet • $dep → $arr',
            timeLabel: '', typeLabel: 'Nouvelle demande',
            avatarBg: const Color(0xFFFDECEA), avatarFg: AppColors.redMid,
            typeBg: AppColors.blueLight,        typeFg: AppColors.blue,
            routeFrom: dep, routeTo: arr, hasAccept: true,
            reservationId: r['id'] as String?,
          );
        }).toList();
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.grayBg,
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF1A56CC)),
            )
          : CustomScrollView(
        controller: _scrollCtrl,
        slivers: [
          // ── Hero + Search (white background, sticky search) ──────────
          if (!_isSearchFocused) SliverToBoxAdapter(child: _buildHeroSection()),
          SliverPersistentHeader(
            pinned: true,
            delegate: _SearchBarDelegate(
              favPills: _favPills,
              controller: _searchCtrl,
              onFocusChanged: (v) => setState(() => _isSearchFocused = v),
            ),
          ),

          // ── Trajet en cours ─────────────────────────────────────────
          const SliverToBoxAdapter(child: SectionLabel('Trajet en cours')),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _ActiveTripCard(),
            ),
          ),

          // ── Mes statistiques ─────────────────────────────────────────
          const SliverToBoxAdapter(child: SectionLabel('Mes statistiques')),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _StatsGrid(stats: _stats),
            ),
          ),

          // ── Nouvelles demandes / Mises à jour ─────────────────────────
          const SliverToBoxAdapter(
            child: SectionLabel('Nouvelles demandes'),
          ),
          SliverToBoxAdapter(
            child: _RequestsScroll(requests: _requests),
          ),

          // ── Accès rapides ─────────────────────────────────────────────
          const SliverToBoxAdapter(child: SectionLabel('Plus de fonctionnalités')),
          SliverToBoxAdapter(child: _QuickNavGrid()),

          // Bottom padding
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }

  // ── Hero Section (greeting + illustration) ─────────────────────────────────
  Widget _buildHeroSection() {
    return Container(
      color: AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bonjour, ${_firstName ?? 'Conducteur'}',
                  style: AppTextStyles.body(color: AppColors.text3),
                ),
                const SizedBox(height: 2),
                RichText(
                  text: TextSpan(
                    style: AppTextStyles.soraH1(),
                    children: const [
                      TextSpan(text: 'Où allons-nous\n'),
                      TextSpan(
                        text: "aujourd'hui ?",
                        style: TextStyle(color: AppColors.blue),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Hero illustration
          _HeroIllustration(),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// HERO ILLUSTRATION (SVG-style via CustomPaint)
// ══════════════════════════════════════════════════════════════════════════════

class _HeroIllustration extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFEEF4FF), Color(0xFFF7FAFE)],
        ),
      ),
      child: CustomPaint(painter: _HeroPainter()),
    );
  }
}

class _HeroPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..isAntiAlias = true;
    final w = size.width;
    final h = size.height;

    // --- Background buildings (left) ---
    _rect(canvas, p, const Color(0xFFE6EFFE), 0, h * .45, 25, h * .55, r: 3);
    _rect(canvas, p, const Color(0xFFDDEAFF), 30, h * .35, 20, h * .65, r: 3);

    // --- Background buildings (right) ---
    _rect(canvas, p, const Color(0xFFDDEAFF), w - 90, h * .30, 30, h * .70, r: 4);
    _rect(canvas, p, const Color(0xFFE6EFFE), w - 56, h * .40, 22, h * .60, r: 3);
    _rect(canvas, p, const Color(0xFFD8E6FF), w - 30, h * .25, 30, h * .75, r: 4);

    // Windows on right buildings
    p.color = const Color(0xFFB8CFFF).withOpacity(.6);
    for (int row = 0; row < 3; row++) {
      for (int col = 0; col < 2; col++) {
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(
              w - 87 + col * 13,
              h * .35 + row * 12,
              8,
              6,
            ),
            const Radius.circular(1),
          ),
          p,
        );
      }
    }

    // --- CAR ---
    final carPaint = Paint()..color = Colors.white..isAntiAlias = true;
    // Body
    final bodyRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * .21, h * .70, w * .59, h * .30),
      const Radius.circular(12),
    );
    canvas.drawRRect(bodyRect, carPaint);
    // Cab
    final cabRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * .26, h * .575, w * .46, h * .30),
      const Radius.circular(10),
    );
    canvas.drawRRect(cabRect, carPaint);
    // Windows
    p.color = const Color(0xFFC8DCFF);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * .29, h * .60, w * .18, h * .21),
          const Radius.circular(6)),
      p,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
          Rect.fromLTWH(w * .50, h * .60, w * .18, h * .21),
          const Radius.circular(6)),
      p,
    );
    // Wheels
    p.color = const Color(0xFFB0BECC);
    canvas.drawCircle(Offset(w * .33, h), h * .10, p);
    canvas.drawCircle(Offset(w * .67, h), h * .10, p);
    p.color = const Color(0xFFD8E2EC);
    canvas.drawCircle(Offset(w * .33, h), h * .06, p);
    canvas.drawCircle(Offset(w * .67, h), h * .06, p);
    // Headlights
    p.color = const Color(0xFFF9D27C);
    canvas.drawRRect(
        RRect.fromRectAndRadius(
            Rect.fromLTWH(w * .74, h * .75, 18, 10), const Radius.circular(3)),
        p);
    p.color = const Color(0xFFA8C4E8);
    canvas.drawRRect(
        RRect.fromRectAndRadius(
            Rect.fromLTWH(w * .21, h * .75, 18, 10), const Radius.circular(3)),
        p);
    // Door line
    p
      ..color = const Color(0xFFE0E8F4)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    canvas.drawLine(
        Offset(w * .49, h * .70), Offset(w * .49, h), p);
    p.style = PaintingStyle.fill;

    // --- PERSONS (5 silhouettes) ---
    final personsX = [w * .37, w * .47, w * .57, w * .67, w * .76];
    final personColors = [
      const Color(0xFFB8CFFE),
      const Color(0xFFC5E0FF),
      const Color(0xFFBEDAFF),
      const Color(0xFFC5E0FF),
      const Color(0xFFB8CFFE),
    ];
    final shirtColors = [
      const Color(0xFF4A80D4),
      const Color(0xFF5B9BD5),
      const Color(0xFF4A80D4),
      const Color(0xFF4A80D4),
      const Color(0xFF2D6CB5),
    ];

    for (int i = 0; i < personsX.length; i++) {
      final cx = personsX[i];
      final cy = h * .44;
      // Circle bg
      p.color = personColors[i];
      canvas.drawCircle(Offset(cx, cy), 18, p);
      // Head
      p.color = const Color(0xFFFFD6B0);
      canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy - 14), width: 20, height: 22), p);
      // Body
      p.color = shirtColors[i];
      canvas.drawRRect(
        RRect.fromRectAndRadius(
            Rect.fromLTWH(cx - 9, cy - 3, 18, 22), const Radius.circular(5)),
        p,
      );
    }
  }

  void _rect(Canvas c, Paint p, Color color, double x, double y, double w,
      double h, {double r = 0}) {
    p.color = color;
    c.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(x, y, w, h), Radius.circular(r)),
      p,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ══════════════════════════════════════════════════════════════════════════════
// SEARCH BAR (SliverPersistentHeader delegate)
// ══════════════════════════════════════════════════════════════════════════════

class _SearchBarDelegate extends SliverPersistentHeaderDelegate {
  final List<_FavPill> favPills;
  final TextEditingController controller;
  final ValueChanged<bool> onFocusChanged;

  const _SearchBarDelegate({
    required this.favPills,
    required this.controller,
    required this.onFocusChanged,
  });

  @override
  double get minExtent => _height;
  @override
  double get maxExtent => _height;
  double get _height => 76;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: overlapsContent
            ? const Border(bottom: BorderSide(color: AppColors.border))
            : const Border(bottom: BorderSide(color: AppColors.border)),
        boxShadow: overlapsContent
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                )
              ]
            : null,
      ),
      child: Focus(
        onFocusChange: onFocusChanged,
        child: Container(
          height: 50,
          decoration: BoxDecoration(
            color: AppColors.gray50,
            borderRadius: BorderRadius.circular(AppColors.rFull),
            border:
                Border.all(color: AppColors.gray200, width: 1.5),
          ),
          child: Row(
            children: [
              const SizedBox(width: 16),
              const Icon(Icons.search, size: 18, color: AppColors.text3),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: controller,
                  style: AppTextStyles.searchText(),
                  decoration: InputDecoration(
                    hintText: 'Rechercher une destination…',
                    hintStyle: AppTextStyles.searchPlaceholder(),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              // Favorite pills
              SizedBox(
                height: 50,
                width: 156,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 6, vertical: 9),
                  itemCount: favPills.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 6),
                  itemBuilder: (_, i) {
                    final pill = favPills[i];
                    return GestureDetector(
                      onTap: () => controller.text = pill.label,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: pill.bg,
                          borderRadius:
                              BorderRadius.circular(AppColors.rFull),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(pill.icon, size: 13, color: pill.fg),
                            const SizedBox(width: 4),
                            Text(
                              pill.label,
                              style: AppTextStyles.soraBadge(color: pill.fg)
                                  .copyWith(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _SearchBarDelegate oldDelegate) =>
      favPills != oldDelegate.favPills;
}

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVE TRIP CARD
// ══════════════════════════════════════════════════════════════════════════════

class _ActiveTripCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AppCard(
      shadows: AppColors.shMd,
      radius: AppColors.rLg,
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          // Top: thumb + info + price
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            child: Row(
              children: [
                // Mini city thumbnail
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppColors.blueLight, Color(0xFFC8D9F8)],
                    ),
                    borderRadius: BorderRadius.circular(AppColors.rMd),
                  ),
                  child: const Icon(Icons.location_city,
                      size: 36, color: AppColors.blue),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('07:40', style: AppTextStyles.soraSubtitle()),
                      const SizedBox(height: 3),
                      RouteMiniRow(from: 'Campus La Cité', to: "Place d'Orléans"),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.blueLight,
                          borderRadius: BorderRadius.circular(AppColors.rFull),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.person, size: 11, color: AppColors.blue),
                            const SizedBox(width: 4),
                            Text('2/3 passagers',
                                style: AppTextStyles.soraBadge()
                                    .copyWith(fontSize: 11.5)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    StatusPill(
                        label: 'En cours',
                        bg: AppColors.redLight,
                        fg: AppColors.redMid),
                    const SizedBox(height: 6),
                    Text('5 CAD',
                        style: AppTextStyles.soraSubtitle(color: AppColors.blue)),
                  ],
                ),
              ],
            ),
          ),
          // Bottom: status + progress
          const AppDivider(),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 9, 14, 12),
            child: Row(
              children: [
                // Pulsing dot
                _PulsingDot(color: AppColors.redMid),
                const SizedBox(width: 6),
                Text('En cours',
                    style: AppTextStyles.soraSemibold(
                        size: 12, color: AppColors.redMid)),
                const SizedBox(width: 10),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(3),
                    child: LinearProgressIndicator(
                      value: .38,
                      backgroundColor: AppColors.gray200,
                      valueColor:
                          const AlwaysStoppedAnimation(AppColors.redMid),
                      minHeight: 6,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text('7 min',
                    style: AppTextStyles.soraSubtitle(color: AppColors.blue)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  final Color color;
  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1500))
      ..repeat(reverse: true);
    _anim = Tween<double>(begin: 1.0, end: .5).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Opacity(
        opacity: _anim.value,
        child: Container(
          width: 8,
          height: 8,
          decoration:
              BoxDecoration(color: widget.color, shape: BoxShape.circle),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// STATS GRID (2 × 2)
// ══════════════════════════════════════════════════════════════════════════════

class _StatsGrid extends StatelessWidget {
  final List<_StatCard> stats;
  const _StatsGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.6,
      children: stats.map(_buildCard).toList(),
    );
  }

  Widget _buildCard(_StatCard s) {
    return AppCard(
      shadows: AppColors.shSm,
      radius: AppColors.rLg,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: s.iconBg,
              borderRadius: BorderRadius.circular(AppColors.rMd),
            ),
            child: Icon(s.icon, size: 24, color: s.iconFg),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(s.value, style: AppTextStyles.soraNumber()),
                    if (s.unit.isNotEmpty) ...[
                      const SizedBox(width: 2),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(s.unit,
                            style: AppTextStyles.caption()),
                      ),
                    ],
                  ],
                ),
                Text(s.label,
                    style: AppTextStyles.caption(),
                    overflow: TextOverflow.ellipsis),
                if (s.badge != null)
                  Container(
                    margin: const EdgeInsets.only(top: 3),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.greenLight,
                      borderRadius:
                          BorderRadius.circular(AppColors.rFull),
                    ),
                    child: Text(s.badge!,
                        style: AppTextStyles.soraBadge(
                            color: AppColors.green)
                            .copyWith(fontSize: 10)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// REQUESTS HORIZONTAL SCROLL
// ══════════════════════════════════════════════════════════════════════════════

class _RequestsScroll extends StatelessWidget {
  final List<_RequestCard> requests;
  const _RequestsScroll({required this.requests});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 168,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: requests.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) => _RequestCardWidget(card: requests[i]),
      ),
    );
  }
}

class _RequestCardWidget extends StatelessWidget {
  final _RequestCard card;
  const _RequestCardWidget({required this.card});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      shadows: AppColors.shSm,
      radius: AppColors.rLg,
      padding: EdgeInsets.zero,
      child: SizedBox(
        width: 300,
        child: Column(
          children: [
            // Top
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AvatarInitials(
                    initials: card.initials,
                    bg: card.avatarBg,
                    fg: card.avatarFg,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(card.name,
                                  style: AppTextStyles.soraSubtitle(),
                                  overflow: TextOverflow.ellipsis),
                            ),
                            Text(card.timeLabel,
                                style: AppTextStyles.caption()),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(card.action,
                            style: AppTextStyles.body(size: 12.5),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 4),
                        StatusPill(
                            label: card.typeLabel,
                            bg: card.typeBg,
                            fg: card.typeFg),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Bottom
            const AppDivider(),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
              child: Row(
                children: [
                  Expanded(
                    child: RouteMiniRow(
                        from: card.routeFrom, to: card.routeTo),
                  ),
                  const SizedBox(width: 8),
                  if (card.hasAccept) ...[
                    _smallBtn('Refuser', AppColors.gray100, AppColors.gray600),
                    const SizedBox(width: 6),
                    _smallBtn('Accepter', AppColors.blue, AppColors.surface),
                  ] else
                    _smallBtn('Voir →', AppColors.blueLight, AppColors.blue),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _smallBtn(String label, Color bg, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(AppColors.rSm),
        ),
        child:
            Text(label, style: AppTextStyles.button(color: fg).copyWith(fontSize: 12)),
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUICK NAV GRID (3 colonnes)
// ══════════════════════════════════════════════════════════════════════════════

class _QuickNavItem {
  final String label;
  final IconData icon;
  final Color bg;
  final Color fg;
  const _QuickNavItem(
      {required this.label,
      required this.icon,
      required this.bg,
      required this.fg});
}

class _QuickNavGrid extends StatelessWidget {
  static const _items = [
    _QuickNavItem(
        label: 'Mes favoris',
        icon: Icons.favorite_outline,
        bg: AppColors.blueLight,
        fg: AppColors.blue),
    _QuickNavItem(
        label: 'Planificateur',
        icon: Icons.calendar_today_outlined,
        bg: AppColors.tealLight,
        fg: AppColors.teal),
    _QuickNavItem(
        label: 'Statistiques',
        icon: Icons.bar_chart_outlined,
        bg: AppColors.amberLight,
        fg: AppColors.amber),
    _QuickNavItem(
        label: 'Réservation',
        icon: Icons.event_outlined,
        bg: AppColors.tealLight,
        fg: AppColors.teal),
    _QuickNavItem(
        label: 'Profil',
        icon: Icons.person_outline,
        bg: AppColors.amberLight,
        fg: AppColors.amber),
    _QuickNavItem(
        label: 'Menu',
        icon: Icons.more_horiz,
        bg: AppColors.blueLight,
        fg: AppColors.blue),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.count(
        crossAxisCount: 3,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 12,
        mainAxisSpacing: 14,
        childAspectRatio: .95,
        children: _items.map(_buildItem).toList(),
      ),
    );
  }

  Widget _buildItem(_QuickNavItem item) {
    return GestureDetector(
      onTap: () {},
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: item.bg,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(item.icon, size: 28, color: item.fg),
          ),
          const SizedBox(height: 6),
          Text(item.label,
              style: AppTextStyles.body(size: 12, color: AppColors.text2),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

