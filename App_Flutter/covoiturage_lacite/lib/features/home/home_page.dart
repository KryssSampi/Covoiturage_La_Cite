import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/app_colors.dart';
import '../../core/app_text_styles.dart';
import '../../core/converters/display_converters.dart';
import '../../core/state/app_state.dart';
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
  final String? tripId;
  final bool hasAccept;
  final bool isDriverRequest;
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
    this.tripId,
    this.hasAccept = false,
    this.isDriverRequest = false,
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
  static const Duration _loadTimeout = Duration(seconds: 18);

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
    setState(() => _isLoading = true);
    try {
      final bool isDriver = AppStateStore.instance.isDriver;
      final List<dynamic> payloads = await Future.wait<dynamic>(<Future<dynamic>>[
        _api.get('/api/users/me'),
        isDriver
            ? _api.get('/api/trips/mine/driver')
            : _api.get('/api/reservations'),
        isDriver
            ? _api.get('/api/driver/reservation-requests')
            : _api.get('/api/passenger/reservations-enriched'),
        isDriver
            ? _api.get('/api/finances/driver/summary')
            : _api.get('/api/finances/passenger/summary'),
      ]).timeout(_loadTimeout);
      final HomeDashboardDisplay dashboard = DisplayConverters.toHomeDashboard(
        userPayload: payloads[0],
        tripsPayload: payloads[1],
        pendingPayload: payloads[2],
        financePayload: payloads[3],
      );

      if (!mounted) return;
      setState(() {
        _firstName = dashboard.firstName;
        _stats = [
          _StatCard(
            value: '${dashboard.totalTrips}',
            unit: '',
            label: 'Trajets',
            iconBg: const Color(0xFFFDECEA),
            iconFg: AppColors.redMid,
            icon: Icons.directions_car_outlined,
          ),
          _StatCard(
            value: dashboard.averageRating.toStringAsFixed(1),
            unit: '',
            label: 'Note',
            iconBg: AppColors.amberLight,
            iconFg: AppColors.amberMid,
            icon: Icons.star_outline,
          ),
          _StatCard(
            value: '${dashboard.totalPassengers}',
            unit: '',
            label: 'Passagers',
            iconBg: AppColors.tealLight,
            iconFg: AppColors.teal,
            icon: Icons.people_alt_outlined,
          ),
          _StatCard(
            value: '${dashboard.totalRevenue.toStringAsFixed(0)}',
            unit: '\$',
            label: 'Revenus',
            iconBg: AppColors.blueLight,
            iconFg: AppColors.blue,
            icon: Icons.payments_outlined,
          ),
        ];
        _requests = _extractRequests(dashboard.pendingRequests.cast<dynamic>());
        _isLoading = false;
      });
      AppStateStore.instance.setPageHasNews(
        AppNavPage.reservations,
        dashboard.pendingRequests.isNotEmpty,
      );
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _firstName ??= AppStateStore.instance.currentUser.firstName;
        _requests = const <_RequestCard>[];
        _stats = [
          _StatCard(value: '-', unit: '', label: 'Trajets', iconBg: AppColors.blueLight, iconFg: AppColors.blue, icon: Icons.directions_car_outlined),
          _StatCard(value: '-', unit: '', label: 'Note', iconBg: AppColors.amberLight, iconFg: AppColors.amberMid, icon: Icons.star_outline),
          _StatCard(value: '-', unit: '', label: 'Passagers', iconBg: AppColors.tealLight, iconFg: AppColors.teal, icon: Icons.people_alt_outlined),
          _StatCard(value: '-', unit: '\$', label: 'Revenus', iconBg: AppColors.blueLight, iconFg: AppColors.blue, icon: Icons.payments_outlined),
        ];
      });
      AppStateStore.instance.setPageHasNews(AppNavPage.reservations, false);
    }
  }

  List<_RequestCard> _extractRequests(List<dynamic> raw) {
    final bool isDriver = AppStateStore.instance.isDriver;
    return raw.take(3).map((dynamic row) {
      final Map<String, dynamic> m =
          row is Map<String, dynamic> ? row : <String, dynamic>{};
      final Map<String, dynamic> reservation =
          m['reservation'] is Map<String, dynamic>
              ? m['reservation'] as Map<String, dynamic>
              : m;
      final Map<String, dynamic> trip = m['trip'] is Map<String, dynamic>
          ? m['trip'] as Map<String, dynamic>
          : <String, dynamic>{};
      final Map<String, dynamic> passenger =
          m['passenger'] is Map<String, dynamic>
              ? m['passenger'] as Map<String, dynamic>
              : <String, dynamic>{};
      final Map<String, dynamic> driver = m['driver'] is Map<String, dynamic>
          ? m['driver'] as Map<String, dynamic>
          : <String, dynamic>{};

      final String first = isDriver
          ? '${m['passengerFirstName'] ?? passenger['firstName'] ?? m['firstName'] ?? ''}'.trim()
          : '${driver['firstName'] ?? m['driverFirstName'] ?? ''}'.trim();
      final String last = isDriver
          ? '${m['passengerLastName'] ?? passenger['lastName'] ?? m['lastName'] ?? ''}'.trim()
          : '${driver['lastName'] ?? m['driverLastName'] ?? ''}'.trim();
      final String fallbackName = isDriver ? 'Passager' : 'Conducteur';
      final String name =
          ('$first $last').trim().isEmpty ? fallbackName : ('$first $last').trim();
      final String initials = name
          .split(' ')
          .where((String e) => e.isNotEmpty)
          .take(2)
          .map((String e) => e[0].toUpperCase())
          .join();
      final String from = trip['departureLabel']?.toString() ?? '-';
      final String to = trip['arrivalLabel']?.toString() ?? '-';
      final String status = reservation['status']?.toString() ??
          m['status']?.toString() ??
          'pending';

      return _RequestCard(
        initials: initials.isEmpty ? 'P' : initials,
        avatarBg: const Color(0xFFFDECEA),
        avatarFg: AppColors.redMid,
        name: name,
        action: isDriver
            ? 'veut rejoindre votre trajet - $from -> $to'
            : 'Reservation $status - $from -> $to',
        timeLabel: _shortDate(trip['departureTime']?.toString() ?? ''),
        typeLabel: isDriver ? 'Nouvelle demande' : 'Mes reservations',
        typeBg: isDriver ? AppColors.blueLight : AppColors.tealLight,
        typeFg: isDriver ? AppColors.blue : AppColors.teal,
        routeFrom: from,
        routeTo: to,
        tripId: trip['id']?.toString() ?? reservation['tripId']?.toString(),
        hasAccept: isDriver,
        isDriverRequest: isDriver,
        reservationId: reservation['id']?.toString() ?? m['id']?.toString(),
      );
    }).toList();
  }

  String _shortDate(String raw) {
    final DateTime? dt = _parseDate(raw);
    if (dt == null) return '';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}';
  }

  DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    try {
      return DateTime.parse(v.toString()).toLocal();
    } catch (_) {
      return null;
    }
  }

  void _openSearch() {
    final String query = _searchCtrl.text.trim();
    context.push(
      '/search',
      extra: <String, dynamic>{'from': query, 'to': ''},
    );
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.grayBg,
      child: _isLoading
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Color(0xFF1A56CC)),
                  SizedBox(height: 10),
                  Text(
                    'Chargement de l''acceuil',
                    style: TextStyle(
                      color: Color(0xFF6B7280),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
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
              onSearchTap: _openSearch,
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

          // Mes options (navigation rapide)
          const SliverToBoxAdapter(child: SizedBox(height: 16)),
          SliverToBoxAdapter(child: _MesOptionsSection()),

          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }

  // ── Hero Section (background image + gradient + greeting right-aligned) ──────
  Widget _buildHeroSection() {
    return SizedBox(
      height: 220,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background image
          Image.asset(
            'assets/images/homepagebackground.png',
            fit: BoxFit.cover,
            alignment: Alignment.topCenter,
            errorBuilder: (_, __, ___) => const ColoredBox(
              color: Color(0xFFE8EEF8),
            ),
          ),
          // Gradient: transparent center → #F2F5FA bottom
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.4, 1.0],
                colors: [Colors.transparent, Color(0xFFF2F5FA)],
              ),
            ),
          ),
          // Greeting text — right-aligned, near top
          Positioned(
            top: 20,
            left: 20,
            right: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                RichText(
                  textAlign: TextAlign.end,
                  text: TextSpan(
                    style: const TextStyle(
                      fontFamily: 'OpenSans',
                      fontSize: 20,
                      color: Color(0xFF0D1624),
                    ),
                    children: [
                      const TextSpan(text: 'Bienvenue, '),
                      TextSpan(
                        text: _firstName?.isNotEmpty == true ? _firstName! : 'Conducteur',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF08316E),
                        ),
                      ),
                      const TextSpan(text: ' !'),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Content de vous voir,',
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    fontSize: 16,
                    color: Color(0xFF515151),
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Où allons-nous aujourd\'hui ?',
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF08316E),
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

// ══════════════════════════════════════════════════════════════════════════════
// SEARCH BAR (SliverPersistentHeader delegate)
// ══════════════════════════════════════════════════════════════════════════════

class _SearchBarDelegate extends SliverPersistentHeaderDelegate {
  final List<_FavPill> favPills;
  final TextEditingController controller;
  final ValueChanged<bool> onFocusChanged;
  final VoidCallback onSearchTap;

  const _SearchBarDelegate({
    required this.favPills,
    required this.controller,
    required this.onFocusChanged,
    required this.onSearchTap,
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
              GestureDetector(
                onTap: onSearchTap,
                child: const Icon(Icons.search, size: 18, color: AppColors.text3),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: controller,
                  onSubmitted: (_) => onSearchTap(),
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
    return GestureDetector(
      onTap: () {
        final String? id = card.reservationId;
        final String? tripId = card.tripId;
        if (card.isDriverRequest && id != null && id.isNotEmpty) {
          context.push('/reservation-request/$id');
          return;
        }
        if (tripId != null && tripId.isNotEmpty) {
          context.push('/trip/$tripId');
        }
      },
      child: AppCard(
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
  final String route;
  const _QuickNavItem(
      {required this.label,
      required this.icon,
      required this.bg,
      required this.fg,
      required this.route});
}

class _QuickNavGrid extends StatelessWidget {
  static const _items = [
    _QuickNavItem(
        label: 'Mes favoris',
        icon: Icons.favorite_outline,
        bg: AppColors.blueLight,
        fg: AppColors.blue,
        route: '/favoris'),
    _QuickNavItem(
        label: 'Planificateur',
        icon: Icons.calendar_today_outlined,
        bg: AppColors.tealLight,
        fg: AppColors.teal,
        route: '/search'),
    _QuickNavItem(
        label: 'Statistiques',
        icon: Icons.bar_chart_outlined,
        bg: AppColors.amberLight,
        fg: AppColors.amber,
        route: '/stats'),
    _QuickNavItem(
        label: 'Réservation',
        icon: Icons.event_outlined,
        bg: AppColors.tealLight,
        fg: AppColors.teal,
        route: '/reservations'),
    _QuickNavItem(
        label: 'Profil',
        icon: Icons.person_outline,
        bg: AppColors.amberLight,
        fg: AppColors.amber,
        route: '/profile'),
    _QuickNavItem(
        label: 'Menu',
        icon: Icons.more_horiz,
        bg: AppColors.blueLight,
        fg: AppColors.blue,
        route: '/reviews'),
  ];

  @override
  Widget build(BuildContext context) {
    final double totalWidth = MediaQuery.of(context).size.width - 16 * 2 - 12 * 2;
    final double itemWidth = totalWidth / 3;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 12,
        runSpacing: 14,
        children: _items.map((item) => SizedBox(
          width: itemWidth,
          child: _buildItem(context, item),
        )).toList(),
      ),
    );
  }

  Widget _buildItem(BuildContext context, _QuickNavItem item) {
    return GestureDetector(
      onTap: () => context.push(item.route),
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

class _MesOptionsSection extends StatelessWidget {
  const _MesOptionsSection();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 8, offset: Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 14, 16, 4),
              child: Text('Mes options', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFF0D1624))),
            ),
            _tile(context, Icons.history_rounded,      'Historique',   '/historique'),
            _tile(context, Icons.description_outlined, 'Brouillons',   '/brouillons'),
            _tile(context, Icons.bar_chart_rounded,    'Statistiques', '/stats'),
            _tile(context, Icons.reviews_outlined,     'Avis',         '/reviews'),
            _tile(context, Icons.favorite_outline,     'Favoris',      '/favoris'),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _tile(BuildContext context, IconData icon, String label, String route) {
    return ListTile(
      onTap: () => context.push(route),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
      leading: Icon(icon, color: const Color(0xFF1A56CC)),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF0D1624))),
      trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF8A95A8)),
      dense: true,
    );
  }
}


