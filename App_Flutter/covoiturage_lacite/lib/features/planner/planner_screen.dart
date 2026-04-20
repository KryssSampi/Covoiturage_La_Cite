// lib/features/planner/planner_screen.dart
// Planner screen — fixed encoding, consolidated, clean Dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_colors.dart';
import '../../core/app_text_styles.dart';
import '../../core/services/api_service.dart';
import '../../core/services/trip_service.dart';
import '../../shared/widgets/shared_widgets.dart';

// ─── Models ───────────────────────────────────────────────────────────────────

enum _DriverStatus { published, confirmed, inProgress, cancelled, completed }

enum _PassengerStatus { confirmed, pending, inProgress, completed }

class _CalendarCell {
  final int? day;
  final bool isToday;
  final bool isActive;
  final bool isUnavailable;
  final bool isOtherMonth;
  final bool isWeekend;
  final int tripCount;

  const _CalendarCell({
    this.day,
    this.isToday = false,
    this.isActive = false,
    this.isUnavailable = false,
    this.isOtherMonth = false,
    this.isWeekend = false,
    this.tripCount = 0,
  });
}

class _UnavailItem {
  final String title;
  final String detail;
  const _UnavailItem({required this.title, required this.detail});
}

class _DriverRide {
  final String id;
  final String time;
  final String from;
  final String to;
  final String passengerLabel;
  final double price;
  final _DriverStatus status;
  final DateTime? dateTime;
  final int pendingRequests;

  const _DriverRide({
    required this.id,
    required this.time,
    required this.from,
    required this.to,
    required this.passengerLabel,
    required this.price,
    required this.status,
    this.dateTime,
    this.pendingRequests = 0,
  });
}

class _PassengerRide {
  final String time;
  final String from;
  final String to;
  final String driverName;
  final double price;
  final _PassengerStatus status;

  const _PassengerRide({
    required this.time,
    required this.from,
    required this.to,
    required this.driverName,
    required this.price,
    required this.status,
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  final ApiService _api = ApiService.instance;
  final TripService _tripService = TripService(ApiService.instance);

  int _selectedDay = DateTime.now().day;
  bool _isViewAll = false;
  bool _sheetOpen = false;
  int _currentMonth = DateTime.now().month;
  int _currentYear = DateTime.now().year;
  bool _isLoading = true;

  List<_DriverRide> _driverRides = [];
  List<_PassengerRide> _passengerRides = [];

  final _unavailItems = const [
    _UnavailItem(
      title: 'Lundi & Jeudi · 08:00 – 12:00',
      detail: 'Récurrent · Toutes les semaines',
    ),
    _UnavailItem(
      title: '20 avr. 2026 · 07:00 – 23:59',
      detail: 'Journée spécifique',
    ),
  ];

  late List<_CalendarCell> _cells;

  @override
  void initState() {
    super.initState();
    _buildCells();
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() => _isLoading = true);
    try {
      final List<Map<String, dynamic>> tripData =
          await _tripService.getDriverTrips();
      final dynamic resData = await _api.get('/api/reservations');
      final List<dynamic> resList = _extractList(resData);

      final List<_PassengerRide> passenger = resList
          .whereType<Map<String, dynamic>>()
          .map(_toPassengerRide)
          .toList();

      final List<_DriverRide> driverRides = tripData.map((t) {
        final DateTime? dt = _parseDate(
            t['departureTime'] ?? t['departureDateTime'] ?? '');
        final String timeLabel = dt != null
            ? '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}'
            : '';
        return _DriverRide(
          id: t['id']?.toString() ?? '',
          time: timeLabel,
          from: t['departureLabel']?.toString() ?? '',
          to: t['arrivalLabel']?.toString() ?? '',
          passengerLabel:
              '${((t['totalSeats'] as num?)?.toInt() ?? 0) - ((t['availableSeats'] as num?)?.toInt() ?? 0)}/${(t['totalSeats'] as num?)?.toInt() ?? 0} passagers',
          price: (t['price'] as num?)?.toDouble() ?? 0,
          status: _parseDriverStatus(t['status']?.toString() ?? ''),
          dateTime: dt,
        );
      }).toList();

      if (!mounted) return;
      setState(() {
        _driverRides = driverRides;
        _passengerRides = passenger;
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  _PassengerRide _toPassengerRide(Map<String, dynamic> row) {
    final Map<String, dynamic>? trip = row['trip'] is Map<String, dynamic>
        ? row['trip'] as Map<String, dynamic>
        : null;
    final Map<String, dynamic>? driver =
        row['driver'] is Map<String, dynamic>
            ? row['driver'] as Map<String, dynamic>
            : null;
    final DateTime? departureTime = _toDateTime(
      trip?['departureTime'] ??
          trip?['departureDateTime'] ??
          trip?['startTime'],
    );
    final String status = row['status']?.toString() ?? '';
    return _PassengerRide(
      time: _fmtTime(departureTime),
      from: _firstNotEmpty([
        trip?['departureLabel'],
        trip?['fromLabel'],
        trip?['departureCity'],
        trip?['from'],
      ]),
      to: _firstNotEmpty([
        trip?['arrivalLabel'],
        trip?['toLabel'],
        trip?['arrivalCity'],
        trip?['to'],
      ]),
      driverName: _fullName(
        firstName: driver?['firstName']?.toString(),
        lastName: driver?['lastName']?.toString(),
        fallback: 'Conducteur',
      ),
      price: _toDouble(
          trip?['passengerPrice'] ??
              trip?['pricePerPassenger'] ??
              trip?['price']),
      status: _toPassengerStatus(status),
    );
  }

  _PassengerStatus _toPassengerStatus(String status) {
    final s = status.toLowerCase();
    if (s.contains('confirm') || s.contains('accept')) {
      return _PassengerStatus.confirmed;
    }
    if (s.contains('progress') || s.contains('started')) {
      return _PassengerStatus.inProgress;
    }
    if (s.contains('complete') || s.contains('done')) {
      return _PassengerStatus.completed;
    }
    return _PassengerStatus.pending;
  }

  _DriverStatus _parseDriverStatus(String s) {
    switch (s.toLowerCase()) {
      case 'published':
      case 'draft':
        return _DriverStatus.published;
      case 'confirmed':
      case 'accepted':
        return _DriverStatus.confirmed;
      case 'in_progress':
      case 'inprogress':
      case 'started':
        return _DriverStatus.inProgress;
      case 'cancelled':
      case 'canceled':
        return _DriverStatus.cancelled;
      case 'completed':
        return _DriverStatus.completed;
      default:
        return _DriverStatus.published;
    }
  }

  DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    try {
      return DateTime.parse(v.toString()).toLocal();
    } catch (_) {
      return null;
    }
  }

  void _buildCells() {
    _cells = [];
    final firstDay = DateTime(_currentYear, _currentMonth, 1);
    // Monday-first offset: Mon=0, Tue=1 ... Sun=6
    final int offset = (firstDay.weekday - 1) % 7;
    final int daysInMonth =
        DateTime(_currentYear, _currentMonth + 1, 0).day;
    final today = DateTime.now();
    final todayDay = today.year == _currentYear &&
            today.month == _currentMonth
        ? today.day
        : -1;

    // Previous month padding
    final prevMonthDays =
        DateTime(_currentYear, _currentMonth, 0).day;
    for (int i = offset; i > 0; i--) {
      _cells.add(_CalendarCell(
          day: prevMonthDays - i + 1, isOtherMonth: true));
    }

    // Current month
    for (int d = 1; d <= daysInMonth; d++) {
      final dow = DateTime(_currentYear, _currentMonth, d).weekday;
      final isWeekend = dow == 6 || dow == 7;
      _cells.add(_CalendarCell(
        day: d,
        isToday: d == todayDay,
        isActive: d == _selectedDay,
        isWeekend: isWeekend,
      ));
    }

    // Next month padding
    int next = 1;
    while (_cells.length % 7 != 0) {
      _cells.add(_CalendarCell(day: next++, isOtherMonth: true));
    }
  }

  void _selectDay(int? day, bool isOtherMonth) {
    if (day == null || isOtherMonth) return;
    setState(() {
      _selectedDay = day;
      _isViewAll = false;
      _buildCells();
    });
  }

  String get _monthLabel {
    const months = [
      '',
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre'
    ];
    return '${months[_currentMonth]} $_currentYear';
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          backgroundColor: AppColors.grayBg,
          floatingActionButton: FloatingActionButton(
            onPressed: () => context.push('/create-trip'),
            backgroundColor: AppColors.blue,
            foregroundColor: Colors.white,
            child: const Icon(Icons.add_rounded),
          ),
          body: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                      color: AppColors.blueDeep))
              : RefreshIndicator(
                  onRefresh: _loadAll,
                  child: ListView(
                    children: [
                      _buildHeaderActions(),
                      const SectionGap(),
                      _CalendarSection(
                        cells: _cells,
                        monthLabel: _monthLabel,
                        onPrev: () => setState(() {
                          _currentMonth--;
                          if (_currentMonth < 1) {
                            _currentMonth = 12;
                            _currentYear--;
                          }
                          _buildCells();
                        }),
                        onNext: () => setState(() {
                          _currentMonth++;
                          if (_currentMonth > 12) {
                            _currentMonth = 1;
                            _currentYear++;
                          }
                          _buildCells();
                        }),
                        onSelectDay: _selectDay,
                      ),
                      const SectionGap(),
                      _RidesSection(
                        selectedDay: _selectedDay,
                        currentMonth: _currentMonth,
                        currentYear: _currentYear,
                        isViewAll: _isViewAll,
                        driverRides: _driverRides,
                        passengerRides: _passengerRides,
                        onTripTap: (ride) => context.push(
                          '/trip/${ride.id}',
                          extra: <String, dynamic>{
                            'id': ride.id,
                            'departureLabel': ride.from,
                            'arrivalLabel': ride.to,
                            'departureTime':
                                ride.dateTime?.toIso8601String(),
                          },
                        ),
                        onToggleViewAll: () =>
                            setState(() => _isViewAll = !_isViewAll),
                        onNavigateDay: (delta) => setState(() {
                          final daysInMonth = DateTime(
                                  _currentYear, _currentMonth + 1, 0)
                              .day;
                          _selectedDay =
                              (_selectedDay + delta).clamp(1, daysInMonth);
                          _buildCells();
                        }),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
        ),
        if (_sheetOpen)
          _UnavailabilitySheet(
            unavailItems: _unavailItems,
            onClose: () => setState(() => _sheetOpen = false),
          ),
      ],
    );
  }

  Widget _buildHeaderActions() {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Planifie tes trajets ici',
              style: AppTextStyles.soraH3()),
          const SizedBox(height: 4),
          Text(
            'Visualise ton calendrier, gère tes disponibilités et trouve des trajets selon ta semaine.',
            style:
                AppTextStyles.body(size: 12.5, color: AppColors.text3),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _sheetOpen = true),
                  child: _ActionBtn(
                    iconBg: AppColors.teal,
                    cardBg: AppColors.tealLight,
                    borderColor: AppColors.teal.withValues(alpha: 0.25),
                    icon: Icons.calendar_today,
                    label: 'Mes\ndisponibilités',
                    labelColor: AppColors.teal,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: () => context.push('/search'),
                  child: _ActionBtn(
                    iconBg: AppColors.blue,
                    cardBg: AppColors.blueLight,
                    borderColor:
                        AppColors.blue.withValues(alpha: 0.25),
                    icon: Icons.search,
                    label: 'Trouver\nun trajet',
                    labelColor: AppColors.blueDark,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Action Button ────────────────────────────────────────────────────────────

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({
    required this.iconBg,
    required this.cardBg,
    required this.borderColor,
    required this.icon,
    required this.label,
    required this.labelColor,
  });

  final Color iconBg;
  final Color cardBg;
  final Color borderColor;
  final IconData icon;
  final String label;
  final Color labelColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: cardBg,
        border: Border.all(color: borderColor, width: 1.5),
        borderRadius: BorderRadius.circular(AppColors.rLg),
        boxShadow: AppColors.shSm,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(AppColors.rMd),
              boxShadow: [
                BoxShadow(
                  color: iconBg.withValues(alpha: 0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Icon(icon, size: 22, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: AppTextStyles.soraSemibold(size: 11.5, color: labelColor),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ─── Calendar Section ─────────────────────────────────────────────────────────

class _CalendarSection extends StatelessWidget {
  const _CalendarSection({
    required this.cells,
    required this.monthLabel,
    required this.onPrev,
    required this.onNext,
    required this.onSelectDay,
  });

  final List<_CalendarCell> cells;
  final String monthLabel;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final void Function(int? day, bool isOtherMonth) onSelectDay;

  Color _dotColor(int count) {
    const colors = [
      Color(0xFF2D9D6A),
      Color(0xFF3BAA5A),
      Color(0xFF70BB40),
      Color(0xFFA8C030),
      Color(0xFFD4AB1A),
      Color(0xFFE07B18),
      Color(0xFFE24B4A),
    ];
    return colors[(count - 1).clamp(0, colors.length - 1)];
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                _CalArrow(onTap: onPrev, icon: Icons.chevron_left),
                Expanded(
                  child: Text(
                    monthLabel,
                    style: AppTextStyles.soraTitle(),
                    textAlign: TextAlign.center,
                  ),
                ),
                _CalArrow(onTap: onNext, icon: Icons.chevron_right),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: ['L', 'M', 'M', 'J', 'V', 'S', 'D']
                  .asMap()
                  .entries
                  .map((e) => Expanded(
                        child: Text(
                          e.value,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.soraLabel(
                            size: 11,
                            color: e.key >= 5
                                ? AppColors.redMid
                                : AppColors.text3,
                            spacing: 0,
                          ),
                        ),
                      ))
                  .toList(),
            ),
          ),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 14),
            child: GridView.count(
              crossAxisCount: 7,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 3,
              mainAxisSpacing: 3,
              children: cells.map(_buildCell).toList(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                _legendDot(const Color(0xFF2D9D6A)),
                const SizedBox(width: 4),
                Text('1', style: AppTextStyles.caption()),
                const SizedBox(width: 6),
                Expanded(
                  child: Container(
                    height: 3,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(1.5),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2D9D6A), Color(0xFFE24B4A)],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                _legendDot(AppColors.redMid),
                const SizedBox(width: 4),
                Text('7+ trajets / jour', style: AppTextStyles.caption()),
                const SizedBox(width: 12),
                Text('Indisponible', style: AppTextStyles.caption()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _legendDot(Color c) => Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      );

  Widget _buildCell(_CalendarCell cell) {
    if (cell.day == null) return const SizedBox.shrink();

    Widget content = Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          '${cell.day}',
          style: AppTextStyles.soraSemibold(
            size: 13,
            color: cell.isActive
                ? Colors.white
                : cell.isToday
                    ? AppColors.blue
                    : cell.isOtherMonth
                        ? AppColors.gray400
                        : AppColors.text1,
          ),
        ),
        if (cell.tripCount > 0)
          Container(
            width: 20,
            height: 20,
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              color: _dotColor(cell.tripCount),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              '${cell.tripCount}',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w700),
            ),
          ),
      ],
    );

    return GestureDetector(
      onTap: () => onSelectDay(cell.day, cell.isOtherMonth),
      child: Opacity(
        opacity: cell.isUnavailable ? .45 : 1,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: cell.isActive
                ? AppColors.blueDeep
                : cell.isToday
                    ? AppColors.blueLight
                    : Colors.transparent,
            borderRadius: BorderRadius.circular(
                cell.isActive || cell.isToday ? AppColors.rMd : AppColors.rSm),
            border: cell.isToday && !cell.isActive
                ? Border.all(color: AppColors.blue, width: 2)
                : null,
            boxShadow: cell.isActive
                ? [
                    BoxShadow(
                      color: AppColors.blueDeep.withValues(alpha: 0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    )
                  ]
                : null,
          ),
          child: content,
        ),
      ),
    );
  }
}

class _CalArrow extends StatelessWidget {
  const _CalArrow({required this.onTap, required this.icon});
  final VoidCallback onTap;
  final IconData icon;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: AppColors.gray50,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.gray200, width: 1.5),
          ),
          child: Icon(icon, size: 18, color: AppColors.text2),
        ),
      );
}

// ─── Rides Section ────────────────────────────────────────────────────────────

class _RidesSection extends StatelessWidget {
  const _RidesSection({
    required this.selectedDay,
    required this.currentMonth,
    required this.currentYear,
    required this.isViewAll,
    required this.driverRides,
    required this.passengerRides,
    required this.onTripTap,
    required this.onToggleViewAll,
    required this.onNavigateDay,
  });

  final int selectedDay;
  final int currentMonth;
  final int currentYear;
  final bool isViewAll;
  final List<_DriverRide> driverRides;
  final List<_PassengerRide> passengerRides;
  final ValueChanged<_DriverRide> onTripTap;
  final VoidCallback onToggleViewAll;
  final void Function(int delta) onNavigateDay;

  String get _dayLabel {
    const months = [
      '',
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre'
    ];
    return '$selectedDay ${months[currentMonth]} $currentYear';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isViewAll)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 11, 12, 10),
              child: Row(
                children: [
                  _navArrow(Icons.chevron_left, () => onNavigateDay(-1)),
                  Expanded(
                    child: Text(
                      _dayLabel,
                      style: AppTextStyles.soraSubtitle(),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  _navArrow(Icons.chevron_right, () => onNavigateDay(1)),
                ],
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 11, 16, 10),
              child: Text('Tous les trajets',
                  style: AppTextStyles.caption()),
            ),
          const AppDivider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text('Statut du jour :', style: AppTextStyles.caption()),
                const SizedBox(width: 8),
                StatusPill(
                    label: 'Confirmés',
                    bg: AppColors.tealLight,
                    fg: AppColors.teal),
                const SizedBox(width: 6),
                StatusPill(
                    label: 'En attente',
                    bg: AppColors.amberLight,
                    fg: AppColors.amber),
                const Spacer(),
                GestureDetector(
                  onTap: onToggleViewAll,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: isViewAll
                          ? AppColors.blueDeep
                          : AppColors.blueLight,
                      borderRadius: BorderRadius.circular(AppColors.rFull),
                    ),
                    child: Text(
                      isViewAll ? 'Fermer' : 'Voir tout',
                      style: AppTextStyles.soraBadge(
                              color: isViewAll
                                  ? Colors.white
                                  : AppColors.blue)
                          .copyWith(fontSize: 11),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const AppDivider(),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
            child: Column(
              children: [
                ...driverRides.map((r) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _DriverRideCard(ride: r, onTap: () => onTripTap(r)),
                    )),
                ...passengerRides.map((r) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _PassengerRideCard(ride: r),
                    )),
                if (driverRides.isEmpty && passengerRides.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Text(
                        'Aucun trajet ce jour',
                        style: AppTextStyles.body(
                            size: 14, color: AppColors.text3),
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

  Widget _navArrow(IconData icon, VoidCallback onTap) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: AppColors.gray50,
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: AppColors.gray200),
          ),
          child: Icon(icon, size: 16, color: AppColors.text2),
        ),
      );
}

// ─── Driver Ride Card ─────────────────────────────────────────────────────────

class _DriverRideCard extends StatelessWidget {
  const _DriverRideCard({required this.ride, this.onTap});
  final _DriverRide ride;
  final VoidCallback? onTap;

  (String, Color, Color) get _statusStyle => switch (ride.status) {
        _DriverStatus.published => ('Publiée', AppColors.tealLight, AppColors.teal),
        _DriverStatus.confirmed => ('Confirmée', AppColors.tealLight, AppColors.teal),
        _DriverStatus.inProgress => ('En cours', AppColors.redLight, AppColors.red),
        _DriverStatus.cancelled => ('Annulée', AppColors.amberLight, AppColors.amber),
        _DriverStatus.completed => ('Terminée', AppColors.gray100, AppColors.gray600),
      };

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusBg, statusFg) = _statusStyle;
    return GestureDetector(
      onTap: onTap,
      child: AppCard(
        shadows: AppColors.shSm,
        radius: AppColors.rLg,
        padding: EdgeInsets.zero,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 11, 12, 9),
              child: Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppColors.blueLight, Color(0xFFC8D9F8)],
                      ),
                      borderRadius: BorderRadius.circular(AppColors.rMd),
                    ),
                    child: const Icon(Icons.directions_car,
                        size: 32, color: AppColors.blue),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(ride.time,
                            style: AppTextStyles.soraSubtitle()),
                        const SizedBox(height: 2),
                        RouteMiniRow(
                            from: ride.from, to: ride.to, fontSize: 12),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.blueLight,
                            borderRadius:
                                BorderRadius.circular(AppColors.rFull),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.person,
                                  size: 10, color: AppColors.blue),
                              const SizedBox(width: 3),
                              Text(ride.passengerLabel,
                                  style: AppTextStyles.soraBadge()
                                      .copyWith(fontSize: 11)),
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
                          label: statusLabel, bg: statusBg, fg: statusFg),
                      const SizedBox(height: 5),
                      Text(
                          '${ride.price.toStringAsFixed(0)} CAD',
                          style: AppTextStyles.soraSemibold(
                              size: 13, color: AppColors.blue)),
                    ],
                  ),
                ],
              ),
            ),
            const AppDivider(),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 7, 12, 10),
              child: Row(
                children: [
                  if (ride.pendingRequests > 0) ...[
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                          color: AppColors.amberMid,
                          shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '${ride.pendingRequests} demande(s) en attente',
                      style: AppTextStyles.soraSemibold(
                          size: 12, color: AppColors.amberMid),
                    ),
                  ] else
                    const Spacer(),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 11, vertical: 5),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: AppColors.redMid, width: 1.5),
                      borderRadius:
                          BorderRadius.circular(AppColors.rFull),
                    ),
                    child: Text('Annuler',
                        style: AppTextStyles.button(
                                color: AppColors.redMid)
                            .copyWith(fontSize: 11.5)),
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

// ─── Passenger Ride Card ──────────────────────────────────────────────────────

class _PassengerRideCard extends StatelessWidget {
  const _PassengerRideCard({required this.ride});
  final _PassengerRide ride;

  (String, Color, Color) get _statusStyle => switch (ride.status) {
        _PassengerStatus.confirmed =>
          ('Confirmée', AppColors.tealLight, AppColors.teal),
        _PassengerStatus.pending =>
          ('En attente', AppColors.amberLight, AppColors.amber),
        _PassengerStatus.inProgress =>
          ('En cours', AppColors.redLight, AppColors.red),
        _PassengerStatus.completed =>
          ('Terminée', AppColors.gray100, AppColors.gray600),
      };

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusBg, statusFg) = _statusStyle;
    final initials = ride.driverName
        .split(' ')
        .where((w) => w.isNotEmpty)
        .map((w) => w[0])
        .take(2)
        .join();

    return AppCard(
      shadows: AppColors.shSm,
      radius: AppColors.rLg,
      padding: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 11, 12, 11),
        child: Row(
          children: [
            AvatarInitials(
                initials: initials,
                bg: AppColors.blueLight,
                fg: AppColors.blue,
                size: 44),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(ride.time,
                      style:
                          AppTextStyles.soraSemibold(size: 13)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text('Avec : ',
                          style: AppTextStyles.body(
                              size: 13, color: AppColors.text2)),
                      Text(ride.driverName,
                          style: AppTextStyles.soraSemibold(
                              size: 13, color: AppColors.blue)),
                    ],
                  ),
                  const SizedBox(height: 3),
                  RouteMiniRow(
                      from: ride.from, to: ride.to, fontSize: 12),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                StatusPill(
                    label: statusLabel, bg: statusBg, fg: statusFg),
                const SizedBox(height: 5),
                Text('${ride.price.toStringAsFixed(0)} CAD',
                    style: AppTextStyles.soraSemibold(
                        size: 14, color: AppColors.blue)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Unavailability Sheet ─────────────────────────────────────────────────────

class _UnavailabilitySheet extends StatefulWidget {
  const _UnavailabilitySheet({
    required this.unavailItems,
    required this.onClose,
  });

  final List<_UnavailItem> unavailItems;
  final VoidCallback onClose;

  @override
  State<_UnavailabilitySheet> createState() =>
      _UnavailabilitySheetState();
}

class _UnavailabilitySheetState extends State<_UnavailabilitySheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<Offset> _slideAnim;
  late Animation<double> _fadeAnim;

  static const _days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  static const _dayLabels = [
    'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'
  ];
  final Set<int> _selectedDays = {};
  bool _isRecurrent = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 280));
    _slideAnim = Tween<Offset>(
            begin: const Offset(0, 1), end: Offset.zero)
        .animate(
            CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _fadeAnim = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _close() async {
    await _ctrl.reverse();
    widget.onClose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _close,
      child: FadeTransition(
        opacity: _fadeAnim,
        child: Container(
          color: Colors.black.withValues(alpha: 0.45),
          child: GestureDetector(
            onTap: () {},
            child: Align(
              alignment: Alignment.bottomCenter,
              child: SlideTransition(
                position: _slideAnim,
                child: Container(
                  decoration: const BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.vertical(
                        top: Radius.circular(24)),
                  ),
                  constraints: BoxConstraints(
                      maxHeight:
                          MediaQuery.of(context).size.height * .88),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Center(
                        child: Container(
                          margin: const EdgeInsets.only(
                              top: 10, bottom: 4),
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.gray200,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      Padding(
                        padding:
                            const EdgeInsets.fromLTRB(20, 4, 20, 12),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('Mes disponibilités',
                                  style: AppTextStyles.soraH3()),
                            ),
                            GestureDetector(
                              onTap: _close,
                              child: Container(
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  color: AppColors.gray100,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close,
                                    size: 16, color: AppColors.text2),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const AppDivider(),
                      Flexible(
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              Container(
                                margin: const EdgeInsets.fromLTRB(
                                    20, 14, 20, 0),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 13, vertical: 11),
                                decoration: BoxDecoration(
                                  color: AppColors.blueLight,
                                  borderRadius: BorderRadius.circular(
                                      AppColors.rMd),
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                        'Renseignez vos indisponibilités',
                                        style: AppTextStyles.soraSemibold(
                                            size: 13,
                                            color: AppColors.blueDark)),
                                    const SizedBox(height: 4),
                                    Text(
                                      "Indiquez les périodes où vous n'êtes pas disponible.",
                                      style: AppTextStyles.body(
                                          size: 12.5,
                                          color: AppColors.blueDark),
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.fromLTRB(
                                    20, 14, 20, 10),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text('Ajouter une indisponibilité',
                                        style: AppTextStyles.soraSemibold(
                                            size: 13)),
                                    const SizedBox(height: 12),
                                    _formLabel('DATE (OPTIONNELLE)'),
                                    _inputWrap(
                                      child: const Text(
                                          'Sélectionner une date'),
                                      icon: Icons.calendar_today_outlined,
                                    ),
                                    const SizedBox(height: 12),
                                    _formLabel('HEURE DE DÉBUT'),
                                    _inputWrap(
                                        child: const Text('08:00'),
                                        icon: Icons.access_time),
                                    const SizedBox(height: 12),
                                    _formLabel('HEURE DE FIN'),
                                    _inputWrap(
                                        child: const Text('12:00'),
                                        icon: Icons.access_time),
                                    const SizedBox(height: 12),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: AppColors.gray50,
                                        border: Border.all(
                                            color: AppColors.gray200,
                                            width: 1.5),
                                        borderRadius:
                                            BorderRadius.circular(
                                                AppColors.rMd),
                                      ),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment
                                                      .start,
                                              children: [
                                                Text('Récurrent',
                                                    style: AppTextStyles
                                                        .soraSemibold(
                                                            size: 13)),
                                                Text(
                                                    'Se répète chaque semaine',
                                                    style: AppTextStyles
                                                        .caption()),
                                              ],
                                            ),
                                          ),
                                          Switch(
                                            value: _isRecurrent,
                                            onChanged: (v) => setState(
                                                () => _isRecurrent = v),
                                            activeThumbColor:
                                                AppColors.teal,
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (_isRecurrent) ...[
                                      const SizedBox(height: 10),
                                      Wrap(
                                        spacing: 6,
                                        runSpacing: 6,
                                        children:
                                            List.generate(7, (i) {
                                          final selected =
                                              _selectedDays.contains(i);
                                          return GestureDetector(
                                            onTap: () => setState(() {
                                              if (selected) {
                                                _selectedDays.remove(i);
                                              } else {
                                                _selectedDays.add(i);
                                              }
                                            }),
                                            child: AnimatedContainer(
                                              duration: const Duration(
                                                  milliseconds: 150),
                                              width: 44,
                                              height: 52,
                                              decoration: BoxDecoration(
                                                color: selected
                                                    ? AppColors.blueDeep
                                                    : AppColors.gray100,
                                                borderRadius:
                                                    BorderRadius.circular(
                                                        AppColors.rSm),
                                                border: Border.all(
                                                    color: selected
                                                        ? AppColors
                                                            .blueDeep
                                                        : AppColors
                                                            .gray200,
                                                    width: 1.5),
                                              ),
                                              child: Column(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .center,
                                                children: [
                                                  Text(
                                                    _days[i],
                                                    style: AppTextStyles
                                                        .soraSemibold(
                                                            size: 13,
                                                            color: selected
                                                                ? Colors
                                                                    .white
                                                                : AppColors
                                                                    .text3),
                                                  ),
                                                  Text(
                                                    _dayLabels[i],
                                                    style: AppTextStyles
                                                        .caption(
                                                            color: selected
                                                                ? Colors
                                                                    .white
                                                                    .withValues(
                                                                        alpha:
                                                                            0.8)
                                                                : AppColors
                                                                    .text3)
                                                        .copyWith(
                                                            fontSize: 9),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          );
                                        }),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              if (widget.unavailItems.isNotEmpty) ...[
                                const AppDivider(),
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                      20, 14, 20, 14),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('Vos indisponibilités',
                                          style: AppTextStyles.soraSemibold(
                                              size: 13)),
                                      const SizedBox(height: 10),
                                      ...widget.unavailItems.map(
                                          (item) =>
                                              _UnavailItemRow(item: item)),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const AppDivider(),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(
                            20, 14, 20, 20),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: _close,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 13),
                                  decoration: BoxDecoration(
                                    color: AppColors.gray100,
                                    borderRadius: BorderRadius.circular(
                                        AppColors.rMd),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text('Annuler',
                                      style: AppTextStyles.bodySemibold(
                                          size: 14,
                                          color: AppColors.text2)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              flex: 2,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 13),
                                decoration: BoxDecoration(
                                  color: AppColors.teal,
                                  borderRadius: BorderRadius.circular(
                                      AppColors.rMd),
                                ),
                                alignment: Alignment.center,
                                child: Text('Confirmer',
                                    style: AppTextStyles.soraH3(
                                            color: Colors.white)
                                        .copyWith(fontSize: 14)),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                          height: MediaQuery.of(context).padding.bottom),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _formLabel(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: AppTextStyles.soraLabel(size: 12)),
      );

  Widget _inputWrap(
      {required Widget child, required IconData icon}) =>
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.gray50,
          border: Border.all(color: AppColors.gray200, width: 1.5),
          borderRadius: BorderRadius.circular(AppColors.rMd),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: AppColors.gray400),
            const SizedBox(width: 8),
            DefaultTextStyle(
              style: AppTextStyles.body(size: 14),
              child: child,
            ),
          ],
        ),
      );
}

class _UnavailItemRow extends StatelessWidget {
  const _UnavailItemRow({required this.item});
  final _UnavailItem item;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.gray50,
          borderRadius: BorderRadius.circular(AppColors.rMd),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.redLight,
                borderRadius: BorderRadius.circular(AppColors.rSm),
              ),
              child: const Icon(Icons.info_outline,
                  size: 15, color: AppColors.redMid),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title,
                      style: AppTextStyles.bodySemibold(size: 13)),
                  Text(item.detail, style: AppTextStyles.caption()),
                ],
              ),
            ),
            const Icon(Icons.close, size: 18, color: AppColors.gray400),
          ],
        ),
      );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

List<dynamic> _extractList(dynamic payload) {
  if (payload is List<dynamic>) return payload;
  if (payload is Map<String, dynamic>) {
    final dynamic data =
        payload['data'] ?? payload['items'] ?? payload['results'];
    if (data is List<dynamic>) return data;
  }
  return [];
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

String _firstNotEmpty(List<dynamic> values) {
  for (final dynamic value in values) {
    final String s = value?.toString().trim() ?? '';
    if (s.isNotEmpty) return s;
  }
  return '';
}

String _fullName({
  required String? firstName,
  required String? lastName,
  required String fallback,
}) {
  final String full = '${firstName ?? ''} ${lastName ?? ''}'.trim();
  return full.isEmpty ? fallback : full;
}

String _fmtTime(DateTime? dt) {
  if (dt == null) return '--:--';
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${two(dt.hour)}:${two(dt.minute)}';
}
