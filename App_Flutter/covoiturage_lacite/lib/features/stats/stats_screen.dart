// lib/features/stats/stats_screen.dart
// GoBoard / Statistiques / Finances (3 tabs) — clean encoding

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/services/api_service.dart';
import '../../core/state/app_state.dart';

// ─── Color tokens ─────────────────────────────────────────────────────────────
class _C {
  static const blue = Color(0xFF1A56CC);
  static const blueDark = Color(0xFF0D3A8C);
  static const blueDeep = Color(0xFF08316E);
  static const blueLight = Color(0xFFE8F0FE);
  static const blueMid = Color(0xFF2D7DD2);
  static const teal = Color(0xFF0F6E56);
  static const tealLight = Color(0xFFE1F5EE);
  static const tealMid = Color(0xFF1D9E75);
  static const green = Color(0xFF3B6D11);
  static const greenLight = Color(0xFFEAF3DE);
  static const amber = Color(0xFF854F0B);
  static const amberLight = Color(0xFFFAEEDA);
  static const amberMid = Color(0xFFBA7517);
  static const red = Color(0xFFA32D2D);
  static const redLight = Color(0xFFFCEBEB);
  static const redMid = Color(0xFFE24B4A);
  static const grayBg = Color(0xFFF2F5FA);
  static const gray50 = Color(0xFFF8F9FC);
  static const gray100 = Color(0xFFEEF0F5);
  static const gray200 = Color(0xFFD8DBE5);
  static const gray400 = Color(0xFF8A95A8);
  static const gray600 = Color(0xFF545D6E);
  static const surface = Color(0xFFFFFFFF);
  static const text1 = Color(0xFF0D1624);
  static const text2 = Color(0xFF3D4A5C);
  static const text3 = Color(0xFF7A879A);
  static const border = Color(0x12000000);
}

const _shSm = [
  BoxShadow(color: Color(0x0F000000), blurRadius: 4, offset: Offset(0, 1))
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class StatsScreen extends StatefulWidget {
  const StatsScreen({super.key});

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

enum _Tab { goboard, stats, finance }

enum _StatPeriod { sevenDays, currentMonth, threeMonths, all }

enum _FinPeriod { sevenDays, currentMonth, threeMonths, all }

class _StatsScreenState extends State<StatsScreen>
    with SingleTickerProviderStateMixin {
  _Tab _tab = _Tab.goboard;
  _StatPeriod _statPeriod = _StatPeriod.currentMonth;
  _FinPeriod _finPeriod = _FinPeriod.currentMonth;
  late final TabController _tabController;
  bool _isLoading = true;
  List<dynamic> _rankings = [];
  Map<String, dynamic> _myStats = {};
  Map<String, dynamic> _finances = {};

  Map<String, dynamic> get _stats =>
      (_myStats['stats'] as Map?)?.cast<String, dynamic>() ?? _myStats;

  Map<String, dynamic> get _finance => _finances;

  List<Map<String, dynamic>> get _goTasks =>
      _rankings.whereType<Map<String, dynamic>>().toList();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadStats();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    try {
      final dynamic goboard = await ApiService.instance.get('/api/goboard/rankings');
      final dynamic stats = await ApiService.instance.get('/api/stats/me');
      final dynamic finance = await ApiService.instance.get('/api/stats/finances');
      if (!mounted) return;
      setState(() {
        _rankings = _extractList(goboard);
        _myStats = (stats is Map<String, dynamic>)
            ? ((stats['data'] is Map<String, dynamic>)
                ? stats['data'] as Map<String, dynamic>
                : stats)
            : {};
        _finances = (finance is Map<String, dynamic>)
            ? ((finance['data'] is Map<String, dynamic>)
                ? finance['data'] as Map<String, dynamic>
                : finance)
            : {};
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _rankings = [];
          _myStats = {};
          _finances = {};
          _isLoading = false;
        });
      }
    }
  }

  String _display(dynamic value) {
    if (value == null) return '—';
    final text = '$value'.trim();
    return text.isEmpty ? '—' : text;
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List) return data;
    if (data is Map) {
      return (data['items'] ?? data['data'] ?? data['results'] ?? [])
          as List<dynamic>;
    }
    return [];
  }

  Future<void> _withdrawBalance() async {
    final double available =
        double.tryParse(_display(_finance['availableBalance']).replaceAll(',', '.')) ?? 0;
    final TextEditingController ctrl =
        TextEditingController(text: available > 0 ? available.toStringAsFixed(2) : '');
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        title: const Text('Retirer un montant'),
        content: TextField(
          controller: ctrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(labelText: 'Montant (CAD)'),
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Confirmer'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    final double amount = double.tryParse(ctrl.text.replaceAll(',', '.')) ?? 0;
    if (amount <= 0) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Montant invalide')),
      );
      return;
    }

    try {
      await ApiService.instance.post(
        '/api/finances/withdraw',
        <String, dynamic>{'amount': amount},
      );
      await _loadStats();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Retrait envoye')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Retrait impossible: $e')),
      );
    }
  }

  void _openFinanceHistory() {
    context.push('/historique');
  }

  @override
  Widget build(BuildContext context) {
    final bool isDriver = AppStateStore.instance.isDriver;
    final bool showBack = isDriver && Navigator.canPop(context);
    return Scaffold(
      backgroundColor: _C.grayBg,
      appBar: AppBar(
        backgroundColor: _C.blueDeep,
        title: const Text('Statistiques',
            style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w700)),
        automaticallyImplyLeading: false,
        leading: showBack
            ? IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.of(context).maybePop(),
              )
            : null,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadStats,
          )
        ],
      ),
      body: Column(
        children: [
          const SizedBox(height: 8),
          _buildTabBar(),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: _C.blue))
                : IndexedStack(
                    index: _tab.index,
                    children: [
                      _GoboardTab(
                          goTasks: _goTasks,
                          goScore: _display(_stats['goScore'] ??
                              _finance['goScore'])),
                      _buildStatsTab(),
                      _buildFinanceTab(),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  // ─── Tab Bar ────────────────────────────────────────────────────────────────
  Widget _buildTabBar() {
    final bool isDriver = AppStateStore.instance.isDriver;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      decoration: const BoxDecoration(
        color: _C.surface,
        border: Border(bottom: BorderSide(color: _C.border)),
        boxShadow: [
          BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 8,
              offset: Offset(0, 2))
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
              color: _C.gray100,
              borderRadius: BorderRadius.circular(20)),
          child: Row(
            children: [
              _tabBtn(
                  _Tab.goboard,
                  'GoBoard',
                  Icons.emoji_events_rounded,
                  const LinearGradient(
                      colors: [_C.teal, _C.tealMid])),
              _tabBtn(
                  _Tab.stats,
                  'Statistiques',
                  Icons.bar_chart_rounded,
                  const LinearGradient(
                      colors: [_C.blueDeep, _C.blueMid])),
              if (isDriver)
                _tabBtn(
                    _Tab.finance,
                    'Finances',
                    Icons.account_balance_wallet_rounded,
                    const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF854F0B), Color(0xFFBA7517)])),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tabBtn(
      _Tab t, String label, IconData icon, Gradient activeGrad) {
    final isActive = _tab == t;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tab = t),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding:
              const EdgeInsets.symmetric(vertical: 9, horizontal: 4),
          decoration: BoxDecoration(
            gradient: isActive ? activeGrad : null,
            borderRadius: BorderRadius.circular(14),
            boxShadow: isActive
                ? [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2))
                  ]
                : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon,
                  size: 14,
                  color: isActive ? Colors.white : _C.text3),
              const SizedBox(width: 5),
              Text(label,
                  style: GoogleFonts.sora(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isActive ? Colors.white : _C.text3)),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Stats Tab ───────────────────────────────────────────────────────────────
  Widget _buildStatsTab() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Period selector
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                _periodBtn('7 jours', _StatPeriod.sevenDays),
                const SizedBox(width: 6),
                _periodBtn('Ce mois', _StatPeriod.currentMonth),
                const SizedBox(width: 6),
                _periodBtn('3 mois', _StatPeriod.threeMonths),
                const SizedBox(width: 6),
                _periodBtn('Tout', _StatPeriod.all),
              ],
            ),
          ),
          // KPI Grid
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.05,
              children: [
                _kpiCard(
                    icon: Icons.directions_car_rounded,
                    iconBg: const Color(0xFFFDECEA),
                    iconColor: _C.redMid,
                    value: _display(_stats['tripsCount']),
                    unit: '',
                    label: 'Trajets complétés',
                    trend: 'vs mois précédent',
                    trendUp: true),
                _kpiCard(
                    icon: Icons.eco_rounded,
                    iconBg: _C.tealLight,
                    iconColor: _C.teal,
                    value: _display(_stats['co2SavedKg']),
                    unit: 'kg',
                    label: 'CO₂ économisé',
                    trend: 'Impact écologique',
                    trendUp: true),
                _kpiCard(
                    icon: Icons.attach_money_rounded,
                    iconBg: _C.blueLight,
                    iconColor: _C.blue,
                    value: _display(_finance['monthlyRevenue'] ??
                        _stats['monthlyRevenue']),
                    unit: '\$',
                    label: 'Revenus ce mois',
                    trend: 'Gains nets',
                    trendUp: true),
                _kpiCard(
                    icon: Icons.star_rounded,
                    iconBg: const Color(0xFFFAEEDA),
                    iconColor: const Color(0xFFF59E0B),
                    value: _display(_stats['averageRating']),
                    unit: '★',
                    label: 'Note moyenne',
                    trend: 'Évaluations',
                    trendUp: true),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Ratings card
          _sectionHead('Évaluations reçues',
              '${_display(_stats['reviewsCount'])} avis'),
          _card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Column(
                    children: [
                      Text(
                          _display(_stats['averageRating']),
                          style: GoogleFonts.sora(
                              fontSize: 40,
                              fontWeight: FontWeight.w800,
                              color: _C.text1)),
                      const Text('★★★★★',
                          style: TextStyle(
                              color: Color(0xFFF59E0B),
                              fontSize: 16,
                              letterSpacing: 2)),
                      Text(
                          '${_display(_stats['reviewsCount'])} avis',
                          style: GoogleFonts.dmSans(
                              fontSize: 11, color: _C.text3)),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      children: [
                        _ratingRow(5, 0.52, 11),
                        _ratingRow(4, 0.48, 10),
                        _ratingRow(3, 0.0, 0),
                        _ratingRow(2, 0.0, 0),
                        _ratingRow(1, 0.0, 0),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Badges
          _sectionHead('Mes badges', '4 obtenus'),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 0.85,
              children: [
                _badgeCard('🎓', 'Étudiant Cité', 'Jan. 2026', '', false),
                _badgeCard('✅', 'Confirmé', 'Fév. 2026', '', false),
                _badgeCard('🌱', 'Éco-Débutant', 'Juin 2026', '', false),
                _badgeCard('★', 'La Cité', 'Fév. 2026', '', false),
                _badgeCard('💎', 'Expert', '', '51–100 trajets', true),
                _badgeCard('⏰', 'Ponctuel', '', '95% ponct.', true),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _periodBtn(String label, _StatPeriod p) {
    final isActive = _statPeriod == p;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _statPeriod = p),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? _C.blueDeep : _C.surface,
            borderRadius: BorderRadius.circular(999),
            border: isActive
                ? null
                : Border.all(color: _C.gray200, width: 1.5),
            boxShadow: isActive
                ? const [
                    BoxShadow(
                        color: Color(0x33000000),
                        blurRadius: 8,
                        offset: Offset(0, 2))
                  ]
                : [],
          ),
          child: Center(
            child: Text(label,
                style: GoogleFonts.sora(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: isActive ? Colors.white : _C.text3)),
          ),
        ),
      ),
    );
  }

  Widget _kpiCard({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String value,
    required String unit,
    required String label,
    required String trend,
    required bool trendUp,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _C.border),
        boxShadow: _shSm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              const SizedBox(width: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(value,
                      style: GoogleFonts.sora(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: _C.text1,
                          height: 1)),
                  if (unit.isNotEmpty) ...[
                    const SizedBox(width: 2),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Text(unit,
                          style: GoogleFonts.sora(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: _C.text3)),
                    ),
                  ],
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(label,
              style: GoogleFonts.dmSans(
                  fontSize: 11.5, color: _C.text3)),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                  trendUp
                      ? Icons.arrow_upward_rounded
                      : Icons.arrow_downward_rounded,
                  size: 10,
                  color: trendUp ? _C.tealMid : _C.redMid),
              const SizedBox(width: 3),
              Flexible(
                child: Text(trend,
                    style: GoogleFonts.dmSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: trendUp ? _C.tealMid : _C.redMid),
                    overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _ratingRow(int stars, double fill, int count) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          SizedBox(
              width: 16,
              child: Text('$stars',
                  style: GoogleFonts.dmSans(
                      fontSize: 12, color: _C.text3),
                  textAlign: TextAlign.right)),
          const SizedBox(width: 8),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: fill,
                backgroundColor: _C.gray100,
                valueColor: const AlwaysStoppedAnimation(
                    Color(0xFFF59E0B)),
                minHeight: 6,
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
              width: 14,
              child: Text('$count',
                  style: GoogleFonts.dmSans(
                      fontSize: 11, color: _C.text3))),
        ],
      ),
    );
  }

  Widget _badgeCard(String emoji, String name, String date,
      String progress, bool locked) {
    return Opacity(
      opacity: locked ? 0.45 : 1.0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(8, 12, 8, 10),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _C.border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 26)),
            const SizedBox(height: 6),
            Text(name,
                textAlign: TextAlign.center,
                style: GoogleFonts.sora(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: _C.text1)),
            if (date.isNotEmpty) ...[
              const SizedBox(height: 3),
              Text(date,
                  style: GoogleFonts.dmSans(
                      fontSize: 10, color: _C.text3)),
            ],
            if (progress.isNotEmpty) ...[
              const SizedBox(height: 3),
              Text(progress,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.sora(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: _C.blue),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],
          ],
        ),
      ),
    );
  }

  // ─── Finance Tab ─────────────────────────────────────────────────────────────
  Widget _buildFinanceTab() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Balance hero
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [_C.blueDeep, Color(0xFF0D4FA0)]),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SOLDE DISPONIBLE',
                    style: GoogleFonts.sora(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white60,
                        letterSpacing: 0.7)),
                const SizedBox(height: 6),
                Text('${_display(_finance['availableBalance'])} \$',
                    style: GoogleFonts.sora(
                        fontSize: 40,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                        child: _balanceSub('En transit',
                            '${_display(_finance['inTransit'])} \$',
                            false)),
                    const SizedBox(width: 10),
                    Expanded(
                        child: _balanceSub('Pénalités',
                            '${_display(_finance['penalties'])} \$',
                            true)),
                    const SizedBox(width: 10),
                    Expanded(
                        child: _balanceSub(
                            'IBAN', '***-2918', false)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                        child: _balanceBtn('Retirer',
                            white: true, onTap: _withdrawBalance)),
                    const SizedBox(width: 10),
                    Expanded(
                        child: _balanceBtn('Historique',
                            white: false, onTap: _openFinanceHistory)),
                  ],
                ),
              ],
            ),
          ),
          // Period selector
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                _finPeriodBtn('7 jours', _FinPeriod.sevenDays),
                const SizedBox(width: 6),
                _finPeriodBtn('Ce mois', _FinPeriod.currentMonth),
                const SizedBox(width: 6),
                _finPeriodBtn('3 mois', _FinPeriod.threeMonths),
                const SizedBox(width: 6),
                _finPeriodBtn('Tout', _FinPeriod.all),
              ],
            ),
          ),
          // Summary
          _sectionHead('Résumé financier', ''),
          _card(
            child: Column(
              children: [
                _resumeGrid(),
                const Divider(height: 1, color: _C.border),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _progressRow(
                          'Revenus bruts',
                          '${_display(_finance['grossRevenue'])} \$',
                          0.8,
                          _C.tealMid),
                      const SizedBox(height: 10),
                      _progressRow(
                          'Revenus nets',
                          '${_display(_finance['netRevenue'])} \$',
                          0.68,
                          _C.blue),
                      const SizedBox(height: 10),
                      _progressRow(
                          'Objectif mensuel',
                          '${_display(_finance['monthlyRevenue'])} \$ / ${_display(_finance['monthlyGoal'])} \$',
                          0.20,
                          _C.amberMid),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Revenue chart
          _sectionHead('Revenus hebdomadaires', ''),
          _card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: _revenueBarChart(),
            ),
          ),
          const SizedBox(height: 10),
          // Transactions
          _sectionHead('Dernières transactions', ''),
          _card(
            child: Column(
              children: [
                _txItem(true, 'Réservation mise en attente', '27 mars',
                    '-6,00 \$', false),
                _txItem(false, 'Retrait vers Desjardins', '27 mars',
                    '-150,00 \$', false),
                _txItem(true, 'Dépôt initial de test', '23 déc.',
                    '+2 700,00 \$', true),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _balanceSub(String label, String value, bool isRed) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: GoogleFonts.sora(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white60)),
          const SizedBox(height: 3),
          Text(value,
              style: GoogleFonts.sora(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: isRed
                      ? const Color(0xFFFFB3B3)
                      : Colors.white)),
        ],
      ),
    );
  }

  Widget _balanceBtn(String label,
      {required bool white, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 46,
        decoration: BoxDecoration(
          color: white
              ? Colors.white
              : Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(14),
          border: white
              ? null
              : Border.all(
                  color: Colors.white.withValues(alpha: 0.3),
                  width: 1.5),
        ),
        child: Center(
          child: Text(label,
              style: GoogleFonts.sora(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: white ? _C.blueDeep : Colors.white)),
        ),
      ),
    );
  }

  Widget _finPeriodBtn(String label, _FinPeriod p) {
    final isActive = _finPeriod == p;
    return GestureDetector(
      onTap: () => setState(() => _finPeriod = p),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isActive ? _C.amberMid : _C.surface,
          borderRadius: BorderRadius.circular(999),
          border: isActive
              ? null
              : Border.all(color: _C.gray200, width: 1.5),
          boxShadow: isActive
              ? const [
                  BoxShadow(
                      color: Color(0x30BA7517),
                      blurRadius: 8,
                      offset: Offset(0, 2))
                ]
              : [],
        ),
        child: Text(label,
            style: GoogleFonts.sora(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isActive ? Colors.white : _C.text3)),
      ),
    );
  }

  Widget _resumeGrid() {
    final cells = [
      ('Gain mensuel', '${_display(_finance['monthlyRevenue'])} \$',
          _C.tealMid, 'Sem. actuelle'),
      ('Gain semaine', '${_display(_finance['weeklyRevenue'])} \$',
          _C.blue, ''),
      ('Commission (15%)',
          '${_display(_finance['commission'])} \$', _C.amberMid,
          'Plateforme'),
      ('Trajets payants',
          _display(_stats['paidTrips'] ?? _stats['tripsCount']),
          _C.blue, 'complétés'),
    ];
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.55,
      children: cells.map((c) {
        return Container(
          padding: const EdgeInsets.all(14),
          decoration:
              const BoxDecoration(border: Border(right: BorderSide(color: _C.border), bottom: BorderSide(color: _C.border))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(c.$1,
                  style: GoogleFonts.dmSans(
                      fontSize: 11, color: _C.text3)),
              const SizedBox(height: 4),
              Text(c.$2,
                  style: GoogleFonts.sora(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: c.$3)),
              if (c.$4.isNotEmpty)
                Text(c.$4,
                    style: GoogleFonts.dmSans(
                        fontSize: 11, color: _C.text3)),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _progressRow(
      String label, String valLabel, double fill, Color color) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
                child: Text(label,
                    style: GoogleFonts.dmSans(
                        fontSize: 12, color: _C.text2))),
            Text(valLabel,
                style: GoogleFonts.sora(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: color)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: fill,
            minHeight: 8,
            backgroundColor: _C.gray100,
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
      ],
    );
  }

  Widget _revenueBarChart() {
    const bars = [
      (label: 'S12', value: '10,2\$', fill: 1.0, empty: false),
      (label: 'S13', value: '—', fill: 0.15, empty: true),
      (label: 'S14', value: '10,2\$', fill: 1.0, empty: false),
      (label: 'S16', value: '10,2\$', fill: 1.0, empty: false),
      (label: 'S18', value: '10,2\$', fill: 1.0, empty: false),
    ];
    return SizedBox(
      height: 120,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: bars.map((b) {
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(b.value,
                      style: GoogleFonts.dmSans(
                          fontSize: 9,
                          color: _C.text3,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 3),
                  SizedBox(
                    height: 86,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Flexible(
                          flex: (b.fill * 10).round().clamp(1, 10),
                          child: Container(
                            decoration: BoxDecoration(
                              color: b.empty ? _C.redLight : null,
                              gradient: b.empty
                                  ? null
                                  : const LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                          _C.tealMid,
                                          Color(0xFF0A8A60)
                                        ]),
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(4),
                                topRight: Radius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(b.label,
                      style: GoogleFonts.dmSans(
                          fontSize: 9,
                          color: _C.text3,
                          fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _txItem(bool first, String name, String date, String amount,
      bool isCredit) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
      decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: _C.border))),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: isCredit ? _C.tealMid : _C.redMid,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: GoogleFonts.dmSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: _C.text1),
                    overflow: TextOverflow.ellipsis),
                Text(date,
                    style: GoogleFonts.dmSans(
                        fontSize: 11, color: _C.text3)),
              ],
            ),
          ),
          Text(amount,
              style: GoogleFonts.sora(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isCredit ? _C.tealMid : _C.redMid)),
        ],
      ),
    );
  }

  // ─── Shared Helpers ───────────────────────────────────────────────────────────
  Widget _sectionHead(String title, String trailing) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
      child: Row(
        children: [
          Expanded(
              child: Text(title,
                  style: GoogleFonts.sora(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: _C.text1))),
          if (trailing.isNotEmpty)
            Text(trailing,
                style: GoogleFonts.dmSans(
                    fontSize: 12, color: _C.text3)),
        ],
      ),
    );
  }

  Widget _card({required Widget child}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _C.border),
        boxShadow: _shSm,
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}

// ─── GoBoard Tab ──────────────────────────────────────────────────────────────

class _GoboardTab extends StatelessWidget {
  const _GoboardTab({required this.goTasks, required this.goScore});

  final List<Map<String, dynamic>> goTasks;
  final String goScore;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildGoScoreHero(),
          _sectionHead('Go!Tâches', '30 pts à portée'),
          _card(
            child: Column(
              children: goTasks.isNotEmpty
                  ? goTasks.map((task) => _taskItem(
                        done: task['done'] == true ||
                            task['isDone'] == true ||
                            task['completed'] == true,
                        title:
                            '${task['title'] ?? task['name'] ?? 'Tâche'}',
                        desc:
                            '${task['desc'] ?? task['description'] ?? ''}',
                        pts: int.tryParse('${task['points'] ?? 0}') ?? 0,
                      )).toList()
                  : [
                      _taskItem(
                          done: false,
                          title: 'Aucune tâche',
                          desc: 'Les tâches apparaîtront ici.',
                          pts: 0)
                    ],
            ),
          ),
          const SizedBox(height: 10),
          _sectionHead('Classement du mois', '8 participants'),
          _card(
            child: Column(
              children: [
                _rankItem(
                    rank: 1,
                    medal: '🥇',
                    initials: 'ML',
                    avatarBg: const Color(0xFFFEF3C7),
                    avatarFg: const Color(0xFF92400E),
                    name: 'Marie-Claude L.',
                    score: 980,
                    isMe: false),
                _rankItem(
                    rank: 2,
                    medal: '🥈',
                    initials: 'JP',
                    avatarBg: const Color(0xFFEEF0F5),
                    avatarFg: const Color(0xFF545D6E),
                    name: 'Jean-Pierre M.',
                    score: 942,
                    isMe: false),
                _rankItem(
                    rank: 3,
                    medal: '🥉',
                    initials: 'SB',
                    avatarBg: const Color(0xFFFAEEDA),
                    avatarFg: const Color(0xFF854F0B),
                    name: 'Sofia B.',
                    score: 895,
                    isMe: false),
                _rankItem(
                    rank: 4,
                    medal: '',
                    initials: 'Moi',
                    avatarBg: const Color(0xFFE8F0FE),
                    avatarFg: const Color(0xFF1A56CC),
                    name: 'Vous',
                    score: 520,
                    isMe: true),
                _rankItem(
                    rank: 5,
                    medal: '',
                    initials: 'PD',
                    avatarBg: const Color(0xFFE1F5EE),
                    avatarFg: const Color(0xFF0F6E56),
                    name: 'Pauline D.',
                    score: 310,
                    isMe: false),
              ],
            ),
          ),
          const SizedBox(height: 10),
          _sectionHead('Défis Écologiques', 'Réduire CO₂'),
          _card(
            child: Column(
              children: [
                _ecoChallenge(
                    emoji: '🌱',
                    name: 'Éco-Débutant',
                    desc: 'Faites vos premiers pas — 10 kg CO₂.',
                    progress: 1.0,
                    status: 'Complété',
                    statusBg: const Color(0xFFE1F5EE),
                    statusFg: const Color(0xFF0F6E56),
                    target: 'Cible : 10 kg CO₂'),
                _ecoChallenge(
                    emoji: '🌿',
                    name: 'Éco-Conscient',
                    desc: 'Atteignez 50 kg de CO₂ économisés.',
                    progress: 1.0,
                    status: 'Complété',
                    statusBg: const Color(0xFFE1F5EE),
                    statusFg: const Color(0xFF0F6E56),
                    target: 'Cible : 50 kg CO₂'),
                _ecoChallenge(
                    emoji: '🌳',
                    name: 'Éco-Warrior',
                    desc: 'Devenez champion — 200 kg de CO₂.',
                    progress: 0.73,
                    status: 'En cours',
                    statusBg: const Color(0xFFFAEEDA),
                    statusFg: const Color(0xFF854F0B),
                    target: 'Cible : 200 kg CO₂'),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildGoScoreHero() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F6E56), Color(0xFF0A5C47)]),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('MON GOSCORE',
                      style: GoogleFonts.sora(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white70,
                          letterSpacing: 0.7)),
                  const SizedBox(height: 4),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                            text: goScore,
                            style: GoogleFonts.sora(
                                fontSize: 44,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                height: 1)),
                        TextSpan(
                            text: ' / 1000',
                            style: GoogleFonts.sora(
                                fontSize: 18,
                                fontWeight: FontWeight.w400,
                                color: Colors.white54)),
                      ],
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  children: [
                    const Text('#4', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 6),
                    Text('ce mois',
                        style: GoogleFonts.sora(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(5),
            child: LinearProgressIndicator(
              value: 0.52,
              minHeight: 10,
              backgroundColor: Colors.white.withValues(alpha: 0.2),
              valueColor: AlwaysStoppedAnimation(
                  Colors.white.withValues(alpha: 0.85)),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text('0',
                  style: GoogleFonts.dmSans(
                      fontSize: 11, color: Colors.white54)),
              const Spacer(),
              Text('Intermédiaire',
                  style: GoogleFonts.dmSans(
                      fontSize: 11, color: Colors.white54)),
              const Spacer(),
              Text('1000',
                  style: GoogleFonts.dmSans(
                      fontSize: 11, color: Colors.white54)),
            ],
          ),
        ],
      ),
    );
  }

  static Widget _card({required Widget child}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x12000000)),
        boxShadow: const [
          BoxShadow(
              color: Color(0x0F000000),
              blurRadius: 4,
              offset: Offset(0, 1))
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }

  static Widget _sectionHead(String title, String trailing) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
      child: Row(
        children: [
          Expanded(
              child: Text(title,
                  style: GoogleFonts.sora(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF0D1624)))),
          if (trailing.isNotEmpty)
            Text(trailing,
                style: GoogleFonts.dmSans(
                    fontSize: 12, color: const Color(0xFF7A879A))),
        ],
      ),
    );
  }

  static Widget _taskItem(
      {required bool done,
      required String title,
      required String desc,
      required int pts}) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
          border: Border(
              bottom: BorderSide(color: Color(0x12000000)))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: done
                  ? const Color(0xFF1D9E75)
                  : Colors.transparent,
              shape: BoxShape.circle,
              border: done
                  ? null
                  : Border.all(
                      color: const Color(0xFFD8DBE5), width: 2),
            ),
            child: done
                ? const Icon(Icons.check_rounded,
                    size: 12, color: Colors.white)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.sora(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: done
                            ? const Color(0xFF7A879A)
                            : const Color(0xFF0D1624),
                        decoration: done
                            ? TextDecoration.lineThrough
                            : null)),
                const SizedBox(height: 2),
                Text(desc,
                    style: GoogleFonts.dmSans(
                        fontSize: 11.5,
                        color: const Color(0xFF7A879A),
                        height: 1.3)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Text('+$pts',
              style: GoogleFonts.sora(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: done
                      ? const Color(0xFF1D9E75)
                      : const Color(0xFF1A56CC))),
        ],
      ),
    );
  }

  static Widget _rankItem({
    required int rank,
    required String medal,
    required String initials,
    required Color avatarBg,
    required Color avatarFg,
    required String name,
    required int score,
    required bool isMe,
  }) {
    return Container(
      color: isMe ? const Color(0xFFE8F0FE) : Colors.transparent,
      padding: const EdgeInsets.fromLTRB(16, 11, 16, 11),
      child: Row(
        children: [
          SizedBox(
            width: 24,
            child: medal.isNotEmpty
                ? Text(medal,
                    style: const TextStyle(fontSize: 18),
                    textAlign: TextAlign.center)
                : Text('#$rank',
                    style: GoogleFonts.sora(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF1A56CC)),
                    textAlign: TextAlign.center),
          ),
          const SizedBox(width: 12),
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
                color: avatarBg, shape: BoxShape.circle),
            child: Center(
              child: Text(initials,
                  style: GoogleFonts.sora(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: avatarFg)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(name,
                style: GoogleFonts.sora(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isMe
                        ? const Color(0xFF1A56CC)
                        : const Color(0xFF0D1624))),
          ),
          Text('$score',
              style: GoogleFonts.sora(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isMe
                      ? const Color(0xFF1A56CC)
                      : const Color(0xFF0D1624))),
        ],
      ),
    );
  }

  static Widget _ecoChallenge({
    required String emoji,
    required String name,
    required String desc,
    required double progress,
    required String status,
    required Color statusBg,
    required Color statusFg,
    required String target,
  }) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text.rich(
                  TextSpan(children: [
                    TextSpan(
                        text: '$emoji ',
                        style: const TextStyle(fontSize: 14)),
                    TextSpan(
                        text: name,
                        style: GoogleFonts.sora(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF0D1624))),
                  ]),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(999)),
                child: Text(status,
                    style: GoogleFonts.sora(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: statusFg)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(desc,
              style: GoogleFonts.dmSans(
                  fontSize: 11.5,
                  color: const Color(0xFF7A879A),
                  height: 1.3)),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: const Color(0xFFEEF0F5),
              valueColor: AlwaysStoppedAnimation(statusFg),
            ),
          ),
          const SizedBox(height: 5),
          Row(
            children: [
              Expanded(
                  child: Text(target,
                      style: GoogleFonts.dmSans(
                          fontSize: 11,
                          color: const Color(0xFF7A879A)))),
              Text('${(progress * 100).round()}%',
                  style: GoogleFonts.sora(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: statusFg)),
            ],
          ),
        ],
      ),
    );
  }
}
