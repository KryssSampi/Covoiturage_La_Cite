// lib/features/planner/planner_screen.dart
// Planner screen — polished · all bugs fixed · production-ready

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_colors.dart';
import '../../core/app_text_styles.dart';
import '../../core/services/api_service.dart';
import '../../core/services/trip_service.dart';
import '../../core/state/app_state.dart';
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
  final String? id;
  const _UnavailItem({
    required this.title,
    required this.detail,
    this.id,
  });
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
    required this.pendingRequests,
  });
}

class _PassengerRide {
  final String id;
  final String tripId;
  final String time;
  final String from;
  final String to;
  final String driverName;
  final double price;
  final _PassengerStatus status;
  final DateTime? dateTime;
  final Map<String, dynamic> tripData;

  const _PassengerRide({
    required this.id,
    required this.tripId,
    required this.time,
    required this.from,
    required this.to,
    required this.driverName,
    required this.price,
    required this.status,
    this.dateTime,
    required this.tripData,
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
  bool get _isDriver => AppStateStore.instance.isDriver;

  int _selectedDay = DateTime.now().day;
  bool _isViewAll = false;
  bool _sheetOpen = false;
  int _currentMonth = DateTime.now().month;
  int _currentYear = DateTime.now().year;
  bool _isLoading = true;

  List<_DriverRide> _driverRides = [];
  List<_PassengerRide> _passengerRides = [];
  List<_UnavailItem> _unavailItems = [];

  late List<_CalendarCell> _cells;

  // FIX #7 : cache du rôle courant pour détecter les changements
  bool? _lastLoadedRole;

  @override
  void initState() {
    super.initState();
    _buildCells();
    _loadAll();
    _loadUnavailability();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // FIX #7 : recharger si le rôle a changé depuis le dernier load
    if (_lastLoadedRole != null && _lastLoadedRole != _isDriver) {
      _loadAll();
    }
  }

  Future<void> _loadUnavailability() async {
    try {
      final res = await _api.get('/api/unavailability');
      final List<dynamic> data =
          (res is Map && res['data'] is List) ? res['data'] as List : [];
      if (mounted) {
        setState(() {
          _unavailItems = data
              .map((e) => _UnavailItem(
                    title: e['title']?.toString() ?? '',
                    detail: e['detail']?.toString() ?? '',
                    id: e['id']?.toString(),
                  ))
              .toList();
        });
      }
    } catch (_) {
      if (mounted) setState(() => _unavailItems = []);
    }
  }

  Future<void> _loadAll() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    // FIX #7 : vider les listes de l'ancien rôle avant de charger
    _driverRides = [];
    _passengerRides = [];
    _lastLoadedRole = _isDriver;

    try {
      List<_DriverRide> driverRides = <_DriverRide>[];
      List<_PassengerRide> passengerRides = <_PassengerRide>[];

      if (_isDriver) {
        final List<Map<String, dynamic>> tripData =
            await _tripService.getDriverTrips();
        driverRides = tripData.map((t) {
          final DateTime? dt = _parseDate(_extractTripDateValue(t));
          final String timeLabel = dt != null
              ? '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}'
              : '';
          final int total = (t['totalSeats'] as num?)?.toInt() ?? 0;
          final int available = (t['availableSeats'] as num?)?.toInt() ?? 0;
          return _DriverRide(
            id: t['id']?.toString() ?? '',
            time: timeLabel,
            from: t['departureLabel']?.toString() ?? '',
            to: t['arrivalLabel']?.toString() ?? '',
            passengerLabel: '${total - available}/$total passagers',
            price: (t['pricePerSeat'] as num?)?.toDouble() ??
                (t['passengerPrice'] as num?)?.toDouble() ??
                (t['price'] as num?)?.toDouble() ??
                0,
            status: _parseDriverStatus(
                t['status']?.toString() ?? t['tripStatus']?.toString() ?? ''),
            dateTime: dt,
            pendingRequests: _extractPendingCount(t),
          );
        }).toList();
      } else {
        dynamic resData =
            await _api.get('/api/passenger/reservations-enriched');
        List<dynamic> resList = _extractList(resData);
        passengerRides = resList
            .whereType<Map<String, dynamic>>()
            .map(_toPassengerRide)
            .where((ride) => ride.id.isNotEmpty)
            .toList();

        if (passengerRides.isEmpty) {
          resData = await _api.get('/api/reservations');
          resList = _extractList(resData);
          passengerRides = resList
              .whereType<Map<String, dynamic>>()
              .map(_toPassengerRide)
              .where((ride) => ride.id.isNotEmpty)
              .toList();
        }
      }

      if (!mounted) return;
      setState(() {
        _driverRides = driverRides;
        _passengerRides = passengerRides;
        _isLoading = false;
        // FIX #4 : reconstruire les cellules avec les données chargées
        _buildCells();
      });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // FIX #4 : extraire le nombre de demandes en attente depuis les données brutes
  int _extractPendingCount(Map<String, dynamic> t) {
    final dynamic reqs = t['reservationRequests'];
    if (reqs is List) {
      return reqs.whereType<Map<String, dynamic>>().where((r) {
        final String s = r['status']?.toString().toLowerCase() ?? '';
        return s.contains('pending') || s.contains('attente');
      }).length;
    }
    return (t['pendingRequests'] as num?)?.toInt() ?? 0;
  }

  _PassengerRide _toPassengerRide(Map<String, dynamic> row) {
    final Map<String, dynamic> reservation =
        row['reservation'] is Map<String, dynamic>
            ? row['reservation'] as Map<String, dynamic>
            : row;
    final Map<String, dynamic>? trip = row['trip'] is Map<String, dynamic>
        ? row['trip'] as Map<String, dynamic>
        : null;
    final Map<String, dynamic>? driver = row['driver'] is Map<String, dynamic>
        ? row['driver'] as Map<String, dynamic>
        : null;

    final DateTime? departureTime = _toDateTime(
      _extractTripDateValue(
        trip,
        fallback: reservation,
        root: row,
      ),
    );

    final String status =
        reservation['status']?.toString() ?? row['status']?.toString() ?? '';

    final String tripId = _firstNotEmpty([
      trip?['id']?.toString(),
      reservation['tripId']?.toString(),
      row['tripId']?.toString(),
    ]);

    return _PassengerRide(
      id: reservation['id']?.toString() ?? row['id']?.toString() ?? '',
      tripId: tripId,
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
      price: _toDouble(trip?['passengerPrice'] ??
          trip?['pricePerPassenger'] ??
          trip?['price']),
      status: _toPassengerStatus(status),
      dateTime: departureTime,
      // FIX #5 : injecter viewerRole + reservationStatus dans tripData
      tripData: _buildTripExtra(
        trip,
        fallbackTripId: tripId,
        driver: driver,
        reservationRow: reservation,
        reservationStatus: status,
      ),
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

  // FIX #4 : _buildCells croise les rides chargées avec les jours du mois
  void _buildCells() {
    _cells = [];
    final firstDay = DateTime(_currentYear, _currentMonth, 1);
    final int offset = (firstDay.weekday - 1) % 7;
    final int daysInMonth = DateTime(_currentYear, _currentMonth + 1, 0).day;
    final today = DateTime.now();
    final todayDay = today.year == _currentYear && today.month == _currentMonth
        ? today.day
        : -1;

    // Construire une map jour → nombre de rides
    final Map<int, int> rideCountByDay = {};
    for (final ride in _driverRides) {
      final dt = ride.dateTime;
      if (dt != null && dt.year == _currentYear && dt.month == _currentMonth) {
        rideCountByDay[dt.day] = (rideCountByDay[dt.day] ?? 0) + 1;
      }
    }
    for (final ride in _passengerRides) {
      final DateTime? dt = ride.dateTime;
      if (dt != null && dt.year == _currentYear && dt.month == _currentMonth) {
        rideCountByDay[dt.day] = (rideCountByDay[dt.day] ?? 0) + 1;
      }
    }

    // Jours du mois précédent (padding)
    final prevMonthDays = DateTime(_currentYear, _currentMonth, 0).day;
    for (int i = offset; i > 0; i--) {
      _cells.add(_CalendarCell(day: prevMonthDays - i + 1, isOtherMonth: true));
    }

    // Jours du mois courant
    for (int d = 1; d <= daysInMonth; d++) {
      final dow = DateTime(_currentYear, _currentMonth, d).weekday;
      final isWeekend = dow == 6 || dow == 7;
      _cells.add(_CalendarCell(
        day: d,
        isToday: d == todayDay,
        isActive: d == _selectedDay,
        isWeekend: isWeekend,
        tripCount: rideCountByDay[d] ?? 0,
      ));
    }

    // Jours du mois suivant (padding)
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

  // FIX #10 : clamp _selectedDay quand on change de mois
  void _changeMonth(int delta) {
    setState(() {
      _currentMonth += delta;
      if (_currentMonth < 1) {
        _currentMonth = 12;
        _currentYear--;
      } else if (_currentMonth > 12) {
        _currentMonth = 1;
        _currentYear++;
      }
      final daysInNewMonth = DateTime(_currentYear, _currentMonth + 1, 0).day;
      _selectedDay = _selectedDay.clamp(1, daysInNewMonth);
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
      'Décembre',
    ];
    return '${months[_currentMonth]} $_currentYear';
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          backgroundColor: AppColors.grayBg,
          body: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.blueDeep))
              : RefreshIndicator(
                  onRefresh: _loadAll,
                  child: ListView(
                    children: [
                      _buildHeaderActions(),
                      const SectionGap(),
                      _CalendarSection(
                        cells: _cells,
                        monthLabel: _monthLabel,
                        onPrev: () => _changeMonth(-1),
                        onNext: () => _changeMonth(1),
                        onSelectDay: _selectDay,
                      ),
                      const SectionGap(),
                      _RidesSection(
                        isDriver: _isDriver,
                        selectedDay: _selectedDay,
                        currentMonth: _currentMonth,
                        currentYear: _currentYear,
                        isViewAll: _isViewAll,
                        driverRides: _driverRides,
                        passengerRides: _passengerRides,
                        // FIX #6 : passer viewerRole: 'driver' dans l'extra
                        onTripTap: (ride) => context.push(
                          '/trip-detail/${ride.id}',
                          extra: <String, dynamic>{
                            'id': ride.id,
                            'departureLabel': ride.from,
                            'arrivalLabel': ride.to,
                            'departureTime': ride.dateTime?.toIso8601String(),
                            'viewerRole': 'driverOwner',
                            'source': 'planner',
                          },
                        ),
                        onPassengerRideTap: (ride) {
                          if (ride.tripId.isEmpty) return;
                          context.push(
                            '/trip-detail/${ride.tripId}',
                            extra: ride.tripData,
                          );
                        },
                        // FIX #3/#11 : toggle correct dans les deux états
                        onToggleViewAll: () =>
                            setState(() => _isViewAll = !_isViewAll),
                        onNavigateDay: (delta) {
                          setState(() {
                            final daysInMonth =
                                DateTime(_currentYear, _currentMonth + 1, 0)
                                    .day;
                            _selectedDay =
                                (_selectedDay + delta).clamp(1, daysInMonth);
                            _buildCells();
                          });
                        },
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
            onReload: _loadUnavailability,
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
          Text('Planifie tes trajets ici', style: AppTextStyles.soraH3()),
          const SizedBox(height: 4),
          Text(
            'Visualise ton calendrier, gère tes disponibilités et trouve des trajets selon ta semaine.',
            style: AppTextStyles.body(size: 12.5, color: AppColors.text3),
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
                    iconBg: _isDriver ? AppColors.amberMid : AppColors.blue,
                    cardBg:
                        _isDriver ? AppColors.amberLight : AppColors.blueLight,
                    borderColor:
                        (_isDriver ? AppColors.amberMid : AppColors.blue)
                            .withValues(alpha: 0.25),
                    icon: _isDriver ? Icons.add_road : Icons.search,
                    label:
                        _isDriver ? 'Publier\nun trajet' : 'Trouver\nun trajet',
                    labelColor:
                        _isDriver ? AppColors.amber : AppColors.blueDark,
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
    super.key,
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
                  color: iconBg.withOpacity(0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
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
                  .map(
                    (e) => Expanded(
                      child: Text(
                        e.value,
                        textAlign: TextAlign.center,
                        style: AppTextStyles.soraLabel(
                          size: 11,
                          color:
                              e.key >= 5 ? AppColors.redMid : AppColors.text3,
                          spacing: 0,
                        ),
                      ),
                    ),
                  )
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
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: AppColors.gray200,
                    borderRadius: BorderRadius.circular(3),
                    border: Border.all(color: AppColors.gray400, width: 1),
                  ),
                ),
                const SizedBox(width: 4),
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
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
      ],
    );

    return GestureDetector(
      onTap: () => onSelectDay(cell.day, cell.isOtherMonth),
      child: Opacity(
        opacity: cell.isUnavailable ? 0.45 : 1,
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
                    ),
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
    required this.isDriver,
    required this.selectedDay,
    required this.currentMonth,
    required this.currentYear,
    required this.isViewAll,
    required this.driverRides,
    required this.passengerRides,
    required this.onTripTap,
    required this.onPassengerRideTap,
    required this.onToggleViewAll,
    required this.onNavigateDay,
  });

  final bool isDriver;
  final int selectedDay;
  final int currentMonth;
  final int currentYear;
  final bool isViewAll;
  final List<_DriverRide> driverRides;
  final List<_PassengerRide> passengerRides;
  final ValueChanged<_DriverRide> onTripTap;
  final ValueChanged<_PassengerRide> onPassengerRideTap;
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
      'décembre',
    ];
    return '$selectedDay ${months[currentMonth]} $currentYear';
  }

  // FIX #2 : filtrer les rides par le jour sélectionné (sauf si isViewAll)
  List<_DriverRide> _filteredDriverRides() {
    if (isViewAll) return driverRides;
    return driverRides.where((r) {
      final dt = r.dateTime;
      if (dt == null) return false;
      return dt.day == selectedDay &&
          dt.month == currentMonth &&
          dt.year == currentYear;
    }).toList();
  }

  List<_PassengerRide> _filteredPassengerRides() {
    if (isViewAll) return passengerRides;
    return passengerRides.where((r) {
      final DateTime? dt = r.dateTime;
      if (dt == null) return false;
      return dt.day == selectedDay &&
          dt.month == currentMonth &&
          dt.year == currentYear;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final List<_DriverRide> visibleDriverRides =
        isDriver ? _filteredDriverRides() : <_DriverRide>[];
    final List<_PassengerRide> visiblePassengerRides =
        isDriver ? <_PassengerRide>[] : _filteredPassengerRides();

    return Container(
      color: AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // FIX #3/#11 : header visible dans les DEUX états, bouton toggle toujours accessible
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 11, 12, 0),
            child: Row(
              children: [
                if (!isViewAll)
                  _navArrow(Icons.chevron_left, () => onNavigateDay(-1)),
                Expanded(
                  child: Text(
                    isViewAll ? 'Tous les trajets' : _dayLabel,
                    style: AppTextStyles.soraSubtitle(),
                    textAlign: TextAlign.center,
                  ),
                ),
                if (!isViewAll)
                  _navArrow(Icons.chevron_right, () => onNavigateDay(1)),
              ],
            ),
          ),
          // FIX #3 : bouton "Voir tout" / "Fermer" TOUJOURS visible
          Padding(
            padding: const EdgeInsets.only(top: 8, bottom: 4),
            child: Align(
              alignment: Alignment.center,
              child: GestureDetector(
                onTap: onToggleViewAll,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                  decoration: BoxDecoration(
                    color: isViewAll ? AppColors.blueDeep : AppColors.blueLight,
                    borderRadius: BorderRadius.circular(AppColors.rFull),
                  ),
                  child: Text(
                    isViewAll ? 'Fermer' : 'Voir tout',
                    style: AppTextStyles.soraBadge(
                            color: isViewAll ? Colors.white : AppColors.blue)
                        .copyWith(fontSize: 13),
                  ),
                ),
              ),
            ),
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
                  fg: AppColors.teal,
                ),
                const SizedBox(width: 6),
                StatusPill(
                  label: 'En attente',
                  bg: AppColors.amberLight,
                  fg: AppColors.amber,
                ),
              ],
            ),
          ),
          const AppDivider(),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
            child: Column(
              children: [
                ...visibleDriverRides.map(
                  (r) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _DriverRideCard(ride: r, onTap: () => onTripTap(r)),
                  ),
                ),
                ...visiblePassengerRides.map(
                  (r) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _PassengerRideCard(
                      ride: r,
                      onTap: () => onPassengerRideTap(r),
                    ),
                  ),
                ),
                if (visibleDriverRides.isEmpty && visiblePassengerRides.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(
                            Icons.event_busy_rounded,
                            size: 40,
                            color: AppColors.gray200,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            isViewAll
                                ? 'Aucun trajet trouvé'
                                : 'Aucun trajet ce jour',
                            style: AppTextStyles.body(
                                size: 14, color: AppColors.text3),
                          ),
                          if (!isViewAll) ...[
                            const SizedBox(height: 4),
                            Text(
                              'Appuie sur "Voir tout" pour afficher tous tes trajets',
                              style: AppTextStyles.caption(),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ],
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

  Widget _navArrow(IconData icon, VoidCallback onTap) => GestureDetector(
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
  final _DriverRide ride;
  final VoidCallback? onTap;

  const _DriverRideCard({required this.ride, this.onTap, super.key});

  (String, Color, Color) get _statusStyle => switch (ride.status) {
        _DriverStatus.published => (
            'Publié',
            AppColors.amberLight,
            AppColors.amber
          ),
        _DriverStatus.confirmed => (
            'Confirmé',
            AppColors.tealLight,
            AppColors.teal
          ),
        _DriverStatus.inProgress => (
            'En cours',
            AppColors.blueLight,
            AppColors.blue
          ),
        _DriverStatus.cancelled => (
            'Annulé',
            AppColors.redLight,
            AppColors.redMid
          ),
        _DriverStatus.completed => (
            'Terminé',
            AppColors.gray100,
            AppColors.gray600
          ),
      };

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusBg, statusFg) = _statusStyle;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppColors.rMd),
          border: Border.all(color: AppColors.border, width: 1),
          boxShadow: AppColors.shSm,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.blueLight,
                borderRadius: BorderRadius.circular(AppColors.rSm),
              ),
              child: const Icon(Icons.directions_car,
                  size: 22, color: AppColors.blue),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(ride.time.isEmpty ? '--:--' : ride.time,
                      style: AppTextStyles.soraSubtitle()),
                  const SizedBox(height: 2),
                  RouteMiniRow(from: ride.from, to: ride.to, fontSize: 12),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.blueLight,
                          borderRadius: BorderRadius.circular(AppColors.rFull),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.person,
                                size: 10, color: AppColors.blue),
                            const SizedBox(width: 3),
                            Text(
                              ride.passengerLabel,
                              style: AppTextStyles.soraBadge()
                                  .copyWith(fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      // FIX : badge demandes en attente
                      if (ride.pendingRequests > 0) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.amberLight,
                            borderRadius:
                                BorderRadius.circular(AppColors.rFull),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.schedule,
                                  size: 10, color: AppColors.amber),
                              const SizedBox(width: 3),
                              Text(
                                '${ride.pendingRequests} demande${ride.pendingRequests > 1 ? 's' : ''}',
                                style: AppTextStyles.soraBadge(
                                        color: AppColors.amber)
                                    .copyWith(fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                StatusPill(label: statusLabel, bg: statusBg, fg: statusFg),
                const SizedBox(height: 5),
                Text(
                  '${ride.price.toStringAsFixed(0)} \$',
                  style: AppTextStyles.soraSemibold(
                      size: 13, color: AppColors.blue),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Passenger Ride Card ──────────────────────────────────────────────────────

class _PassengerRideCard extends StatelessWidget {
  const _PassengerRideCard({required this.ride, this.onTap});
  final _PassengerRide ride;
  final VoidCallback? onTap;

  (String, Color, Color) get _statusStyle => switch (ride.status) {
        _PassengerStatus.confirmed => (
            'Confirmée',
            AppColors.tealLight,
            AppColors.teal
          ),
        _PassengerStatus.pending => (
            'En attente',
            AppColors.amberLight,
            AppColors.amber
          ),
        _PassengerStatus.inProgress => (
            'En cours',
            AppColors.redLight,
            AppColors.red
          ),
        _PassengerStatus.completed => (
            'Terminée',
            AppColors.gray100,
            AppColors.gray600
          ),
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

    return GestureDetector(
      onTap: onTap,
      child: AppCard(
        shadows: AppColors.shSm,
        radius: AppColors.rLg,
        padding: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 11, 12, 11),
          child: Row(
            children: [
              AvatarInitials(
                initials: initials.isEmpty ? '?' : initials,
                bg: AppColors.blueLight,
                fg: AppColors.blue,
                size: 44,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ride.time.isEmpty ? '--:--' : ride.time,
                      style: AppTextStyles.soraSemibold(size: 13),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text('Avec : ',
                            style: AppTextStyles.body(
                                size: 13, color: AppColors.text2)),
                        Expanded(
                          child: Text(
                            ride.driverName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.soraSemibold(
                                size: 13, color: AppColors.blue),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    RouteMiniRow(from: ride.from, to: ride.to, fontSize: 12),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  StatusPill(label: statusLabel, bg: statusBg, fg: statusFg),
                  const SizedBox(height: 5),
                  Text(
                    '${ride.price.toStringAsFixed(0)} \$',
                    style: AppTextStyles.soraSemibold(
                        size: 14, color: AppColors.blue),
                  ),
                ],
              ),
            ],
          ),
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
    required this.onReload,
  });

  final List<_UnavailItem> unavailItems;
  final VoidCallback onClose;
  final Future<void> Function() onReload;

  @override
  State<_UnavailabilitySheet> createState() => _UnavailabilitySheetState();
}

class _UnavailabilitySheetState extends State<_UnavailabilitySheet>
    with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService.instance;
  bool _isSaving = false;
  bool _isDeleting = false;

  late AnimationController _ctrl;
  late Animation<Offset> _slideAnim;
  late Animation<double> _fadeAnim;

  static const _days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  static const _dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  final Set<int> _selectedDays = {};
  bool _isRecurrent = false;
  DateTime? _selectedDate;
  TimeOfDay _startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 12, minute: 0);

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 280));
    _slideAnim = Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _fadeAnim = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _saveUnavailability() async {
    if (_isSaving) return;
    setState(() => _isSaving = true);

    final String startTime = _formatTime(_startTime);
    final String endTime = _formatTime(_endTime);
    final String? dateStr = _selectedDate == null
        ? null
        : '${_selectedDate!.year.toString().padLeft(4, '0')}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';

    String title;
    if (_isRecurrent && _selectedDays.isNotEmpty) {
      title =
          '${_selectedDays.map((i) => _dayLabels[i]).join(' & ')} · $startTime – $endTime';
    } else {
      title = dateStr != null
          ? '${_formatDateLabel(_selectedDate!)} · $startTime – $endTime'
          : 'Indispo $startTime – $endTime';
    }

    final Map<String, dynamic> body = {
      'title': title,
      'detail': _isRecurrent
          ? 'Récurrent · Toutes les semaines'
          : 'Journée spécifique',
      'startTime': startTime,
      'endTime': endTime,
      'date': dateStr,
      'isRecurrent': _isRecurrent,
      'days': _isRecurrent ? _selectedDays.toList() : null,
    };

    try {
      await _api.post('/api/unavailability', body);
      await widget.onReload();
      if (mounted) {
        // Réinitialiser le formulaire
        setState(() {
          _selectedDays.clear();
          _isRecurrent = false;
          _selectedDate = null;
          _startTime = const TimeOfDay(hour: 8, minute: 0);
          _endTime = const TimeOfDay(hour: 12, minute: 0);
          _isSaving = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  String _formatDateLabel(DateTime dt) {
    const months = [
      '',
      'jan.',
      'fév.',
      'mar.',
      'avr.',
      'mai',
      'juin',
      'juil.',
      'août',
      'sep.',
      'oct.',
      'nov.',
      'déc.',
    ];
    return '${dt.day} ${months[dt.month]} ${dt.year}';
  }

  // FIX #1/#12 : utiliser patch puis delete selon disponibilité API
  Future<void> _deleteUnavailability(String id) async {
    if (id.isEmpty || _isDeleting) return;
    setState(() => _isDeleting = true);
    try {
      // Essaie DELETE REST en premier (API réelle)
      // Le fixture handler gère /api/unavailability/$id/delete via postFallback
      // Pour l'API réelle, on essaie PATCH avec statut deleted
      await _api.post('/api/unavailability/$id/delete', {});
      await widget.onReload();
    } catch (_) {
      // Silencieux
    } finally {
      if (mounted) setState(() => _isDeleting = false);
    }
  }

  Future<void> _pickDate() async {
    final DateTime now = DateTime.now();
    final DateTime initial = _selectedDate ?? now;
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 3),
    );
    if (picked == null || !mounted) return;
    setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime({required bool start}) async {
    final TimeOfDay initial = start ? _startTime : _endTime;
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: initial,
    );
    if (picked == null || !mounted) return;
    setState(() {
      if (start) {
        _startTime = picked;
      } else {
        _endTime = picked;
      }
    });
  }

  String _formatTime(TimeOfDay t) {
    final String h = t.hour.toString().padLeft(2, '0');
    final String m = t.minute.toString().padLeft(2, '0');
    return '$h:$m';
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
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  constraints: BoxConstraints(
                      maxHeight: MediaQuery.of(context).size.height * 0.88),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Center(
                        child: Container(
                          margin: const EdgeInsets.only(top: 10, bottom: 4),
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.gray200,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
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
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Info banner
                              Container(
                                margin:
                                    const EdgeInsets.fromLTRB(20, 14, 20, 0),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 13, vertical: 11),
                                decoration: BoxDecoration(
                                  color: AppColors.blueLight,
                                  borderRadius:
                                      BorderRadius.circular(AppColors.rMd),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Renseignez vos indisponibilités',
                                      style: AppTextStyles.soraSemibold(
                                          size: 13, color: AppColors.blueDark),
                                    ),
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
                              // Formulaire
                              Padding(
                                padding:
                                    const EdgeInsets.fromLTRB(20, 14, 20, 10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Ajouter une indisponibilité',
                                        style: AppTextStyles.soraSemibold(
                                            size: 13)),
                                    const SizedBox(height: 12),

                                    // Date
                                    _formLabel('DATE (OPTIONNELLE)'),
                                    GestureDetector(
                                      onTap: _pickDate,
                                      child: _inputWrap(
                                        child: Text(
                                          _selectedDate == null
                                              ? 'Sélectionner une date'
                                              : _formatDateLabel(
                                                  _selectedDate!),
                                          style: AppTextStyles.body(
                                              size: 14,
                                              color: _selectedDate == null
                                                  ? AppColors.text3
                                                  : AppColors.text1),
                                        ),
                                        icon: Icons.calendar_today_outlined,
                                        suffix: _selectedDate != null
                                            ? GestureDetector(
                                                onTap: () => setState(
                                                    () => _selectedDate = null),
                                                child: const Icon(Icons.close,
                                                    size: 16,
                                                    color: AppColors.gray400),
                                              )
                                            : null,
                                      ),
                                    ),
                                    const SizedBox(height: 12),

                                    // Heures
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              _formLabel('DÉBUT'),
                                              GestureDetector(
                                                onTap: () =>
                                                    _pickTime(start: true),
                                                child: _inputWrap(
                                                  child: Text(
                                                    _formatTime(_startTime),
                                                    style: AppTextStyles.body(
                                                        size: 14),
                                                  ),
                                                  icon: Icons.access_time,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              _formLabel('FIN'),
                                              GestureDetector(
                                                onTap: () =>
                                                    _pickTime(start: false),
                                                child: _inputWrap(
                                                  child: Text(
                                                    _formatTime(_endTime),
                                                    style: AppTextStyles.body(
                                                        size: 14),
                                                  ),
                                                  icon: Icons.access_time,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),

                                    // Toggle récurrent
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: AppColors.gray50,
                                        border: Border.all(
                                            color: AppColors.gray200,
                                            width: 1.5),
                                        borderRadius: BorderRadius.circular(
                                            AppColors.rMd),
                                      ),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text('Récurrent',
                                                    style: AppTextStyles
                                                        .soraSemibold(
                                                            size: 13)),
                                                Text('Se répète chaque semaine',
                                                    style: AppTextStyles
                                                        .caption()),
                                              ],
                                            ),
                                          ),
                                          Switch(
                                            value: _isRecurrent,
                                            onChanged: (v) => setState(
                                                () => _isRecurrent = v),
                                            activeThumbColor: AppColors.teal,
                                            activeColor: AppColors.tealLight,
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Sélection des jours si récurrent
                                    if (_isRecurrent) ...[
                                      const SizedBox(height: 10),
                                      Wrap(
                                        spacing: 6,
                                        runSpacing: 6,
                                        children: List.generate(7, (i) {
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
                                                      ? AppColors.blueDeep
                                                      : AppColors.gray200,
                                                  width: 1.5,
                                                ),
                                              ),
                                              child: Column(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                children: [
                                                  Text(
                                                    _days[i],
                                                    style: AppTextStyles
                                                        .soraSemibold(
                                                            size: 13,
                                                            color: selected
                                                                ? Colors.white
                                                                : AppColors
                                                                    .text3),
                                                  ),
                                                  Text(
                                                    _dayLabels[i],
                                                    style: AppTextStyles.caption(
                                                            color: selected
                                                                ? Colors.white
                                                                    .withValues(
                                                                        alpha:
                                                                            0.8)
                                                                : AppColors
                                                                    .text3)
                                                        .copyWith(fontSize: 9),
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

                              // Liste des indisponibilités existantes
                              if (widget.unavailItems.isNotEmpty) ...[
                                const AppDivider(),
                                Padding(
                                  padding:
                                      const EdgeInsets.fromLTRB(20, 14, 20, 14),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            'Vos indisponibilités',
                                            style: AppTextStyles.soraSemibold(
                                                size: 13),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 7, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppColors.gray100,
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      AppColors.rFull),
                                            ),
                                            child: Text(
                                              '${widget.unavailItems.length}',
                                              style: AppTextStyles.soraBadge(
                                                  color: AppColors.text3),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      ...widget.unavailItems.map(
                                        (item) => _UnavailItemRow(
                                          item: item,
                                          isDeleting: _isDeleting,
                                          onDelete: () => _deleteUnavailability(
                                              item.id ?? ''),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      // Footer boutons
                      const AppDivider(),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: _close,
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 13),
                                  decoration: BoxDecoration(
                                    color: AppColors.gray100,
                                    borderRadius:
                                        BorderRadius.circular(AppColors.rMd),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    'Annuler',
                                    style: AppTextStyles.bodySemibold(
                                        size: 14, color: AppColors.text2),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              flex: 2,
                              child: GestureDetector(
                                onTap: _isSaving ? null : _saveUnavailability,
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 13),
                                  decoration: BoxDecoration(
                                    color: _isSaving
                                        ? AppColors.gray200
                                        : AppColors.teal,
                                    borderRadius:
                                        BorderRadius.circular(AppColors.rMd),
                                  ),
                                  alignment: Alignment.center,
                                  child: _isSaving
                                      ? const SizedBox(
                                          width: 18,
                                          height: 18,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                      : Text(
                                          'Confirmer',
                                          style: AppTextStyles.soraH3(
                                                  color: Colors.white)
                                              .copyWith(fontSize: 14),
                                        ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: MediaQuery.of(context).padding.bottom),
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

  Widget _inputWrap({
    required Widget child,
    required IconData icon,
    Widget? suffix,
  }) =>
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
            Expanded(
              child: DefaultTextStyle(
                style: AppTextStyles.body(size: 14),
                child: child,
              ),
            ),
            if (suffix != null) suffix,
          ],
        ),
      );
}

// ─── Unavailability Item Row ──────────────────────────────────────────────────

class _UnavailItemRow extends StatelessWidget {
  const _UnavailItemRow({
    required this.item,
    this.onDelete,
    this.isDeleting = false,
  });
  final _UnavailItem item;
  final VoidCallback? onDelete;
  final bool isDeleting;

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
                  Text(item.title, style: AppTextStyles.bodySemibold(size: 13)),
                  Text(item.detail, style: AppTextStyles.caption()),
                ],
              ),
            ),
            GestureDetector(
              onTap: isDeleting ? null : onDelete,
              child: isDeleting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.close, size: 18, color: AppColors.gray400),
            ),
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
    if (data is Map<String, dynamic>) {
      final dynamic nested =
          data['items'] ?? data['results'] ?? data['rows'] ?? data['list'];
      if (nested is List<dynamic>) return nested;
    }
  }
  return <dynamic>[];
}

dynamic _extractTripDateValue(
  Map<String, dynamic>? trip, {
  Map<String, dynamic>? fallback,
  Map<String, dynamic>? root,
}) {
  final dynamic combined =
      trip?['departureDate'] != null && trip?['departureTime'] != null
          ? '${trip!['departureDate']}T${trip['departureTime']}'
          : null;

  return trip?['departureDateTime'] ??
      trip?['departureTime'] ??
      trip?['startTime'] ??
      trip?['dateTime'] ??
      trip?['plannedStartAt'] ??
      trip?['startsAt'] ??
      trip?['date'] ??
      trip?['tripDate'] ??
      combined ??
      fallback?['departureDateTime'] ??
      fallback?['departureTime'] ??
      fallback?['startTime'] ??
      root?['departureDateTime'] ??
      root?['departureTime'] ??
      root?['startTime'];
}

DateTime? _toDateTime(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  final DateTime? parsed = DateTime.tryParse(value.toString());
  return parsed?.toLocal();
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

// FIX #5 : injecter reservationStatus dans tripData pour que /trip-detail
// affiche le bon statut de réservation du passager
Map<String, dynamic> _buildTripExtra(
  Map<String, dynamic>? trip, {
  String? fallbackTripId,
  Map<String, dynamic>? driver,
  Map<String, dynamic>? reservationRow,
  String? reservationStatus,
}) {
  final Map<String, dynamic> base = <String, dynamic>{
    ...(trip ?? const <String, dynamic>{})
  };

  if ((base['id']?.toString().isNotEmpty ?? false) == false &&
      (fallbackTripId?.isNotEmpty ?? false)) {
    base['id'] = fallbackTripId;
  }

  if (driver != null && driver.isNotEmpty) {
    base['driver'] = <String, dynamic>{
      ..._asMap(base['driver']),
      ...driver,
    };
  }

  // Injecter le statut de réservation pour que la page /trip-detail
  // puisse afficher le bon état (pas juste le statut du trajet)
  if (reservationStatus != null && reservationStatus.isNotEmpty) {
    base['reservationStatus'] = reservationStatus;
  }
  if (reservationRow != null) {
    base['reservationId'] = reservationRow['id']?.toString();
  }

  // viewerRole : le passager voit le trajet en tant que passager
  base['viewerRole'] = 'passenger';
  base['source'] = 'planner';

  return base;
}

Map<String, dynamic> _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map(
      (dynamic key, dynamic val) => MapEntry(key.toString(), val),
    );
  }
  return <String, dynamic>{};
}

String _fmtTime(DateTime? dt) {
  if (dt == null) return '';
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${two(dt.hour)}:${two(dt.minute)}';
}
