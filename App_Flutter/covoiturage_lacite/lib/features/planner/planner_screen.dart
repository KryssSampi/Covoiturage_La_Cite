import 'package:flutter/material.dart';

import '../../core/app_colors.dart';
import '../../core/app_text_styles.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/shared_widgets.dart';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MODÃˆLES LOCAUX
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
  final String time;
  final String from;
  final String to;
  final String passengerLabel;
  final double price;
  final _DriverStatus status;
  final int pendingRequests;
  const _DriverRide({
    required this.time,
    required this.from,
    required this.to,
    required this.passengerLabel,
    required this.price,
    required this.status,
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

class _DriverTrip {
  final String id;
  final String departureLabel;
  final String arrivalLabel;
  final String departureDate;
  final String departureTime;
  final String status;
  final int currentPassengers;
  final int maxPassengers;
  final double price;

  const _DriverTrip({
    required this.id,
    required this.departureLabel,
    required this.arrivalLabel,
    required this.departureDate,
    required this.departureTime,
    required this.status,
    required this.currentPassengers,
    required this.maxPassengers,
    required this.price,
  });

  factory _DriverTrip.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic v) {
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse('$v') ?? 0;
    }

    double toDouble(dynamic v) {
      if (v is double) return v;
      if (v is num) return v.toDouble();
      return double.tryParse('$v') ?? 0;
    }

    return _DriverTrip(
      id: '${json['id'] ?? ''}',
      departureLabel: '${json['departureLabel'] ?? json['departure'] ?? ''}',
      arrivalLabel: '${json['arrivalLabel'] ?? json['arrival'] ?? json['destination'] ?? ''}',
      departureDate: '${json['departureDate'] ?? json['date'] ?? ''}',
      departureTime: '${json['departureTime'] ?? json['time'] ?? ''}',
      status: '${json['status'] ?? ''}',
      currentPassengers: toInt(json['currentPassengers']),
      maxPassengers: toInt(json['maxPassengers']),
      price: toDouble(json['price']),
    );
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  final ApiService _api = ApiService.instance;
  int _selectedDay = 19; // today fixture
  bool _isViewAll = false;
  bool _sheetOpen = false;
  int _currentMonth = 4; // April
  int _currentYear = 2026;
  bool _isLoading = true;
  List<_DriverTrip> _trips = <_DriverTrip>[];

  // â”€â”€ Fixtures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  List<_DriverRide> _driverRides = <_DriverRide>[];

  List<_PassengerRide> _passengerRides = <_PassengerRide>[];

  final _unavailItems = const [
    _UnavailItem(
      title: 'Lundi & Jeudi Â· 08:00 â€“ 12:00',
      detail: 'RÃ©current Â· Toutes les semaines',
    ),
    _UnavailItem(
      title: '20 avr. 2026 Â· 07:00 â€“ 23:59',
      detail: 'JournÃ©e spÃ©cifique',
    ),
  ];

  // Calendar cells for April 2026 (starts Tuesday = offset 1 monday-first)
  late List<_CalendarCell> _cells;

  @override
  void initState() {
    super.initState();
    _buildCells();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    List<_DriverTrip> driverTrips = <_DriverTrip>[];
    List<_PassengerRide> passenger = <_PassengerRide>[];

    try {
      dynamic data = await _api.get('/api/planner/trips');
      data = (data is List) ? data : await _api.get('/api/trips/mine');
      final list = data is List ? data : <dynamic>[];
      driverTrips = list
          .whereType<Map<String, dynamic>>()
          .map(_DriverTrip.fromJson)
          .toList();
    } catch (_) {
      driverTrips = <_DriverTrip>[];
    }

    try {
      final dynamic reservationsPayload = await _api.get('/api/reservations');
      final List<dynamic> reservationRows = _extractList(reservationsPayload);
      passenger = reservationRows
          .whereType<Map<String, dynamic>>()
          .map(_toPassengerRide)
          .toList();
    } catch (_) {
      passenger = <_PassengerRide>[];
    }

    if (!mounted) return;
    setState(() {
      _trips = driverTrips;
      _driverRides = _trips.map(_toDriverRide).toList();
      _passengerRides = passenger;
      _isLoading = false;
    });
  }

  _DriverRide _toDriverRide(_DriverTrip t) {
    _DriverStatus status;
    switch (t.status.toLowerCase()) {
      case 'confirmed':
      case 'accepted':
        status = _DriverStatus.confirmed;
        break;
      case 'inprogress':
      case 'in_progress':
      case 'started':
        status = _DriverStatus.inProgress;
        break;
      case 'cancelled':
      case 'canceled':
        status = _DriverStatus.cancelled;
        break;
      case 'completed':
        status = _DriverStatus.completed;
        break;
      default:
        status = _DriverStatus.published;
    }
    return _DriverRide(
      time: t.departureTime,
      from: t.departureLabel,
      to: t.arrivalLabel,
      passengerLabel: '${t.currentPassengers}/${t.maxPassengers} passagers',
      price: t.price,
      status: status,
      pendingRequests: 0,
    );
  }

  _PassengerRide _toPassengerRide(Map<String, dynamic> row) {
    final Map<String, dynamic>? trip =
        row['trip'] is Map<String, dynamic> ? row['trip'] as Map<String, dynamic> : null;
    final Map<String, dynamic>? driver =
        row['driver'] is Map<String, dynamic> ? row['driver'] as Map<String, dynamic> : null;
    final DateTime? departureTime = _toDateTime(
      trip?['departureTime'] ?? trip?['departureDateTime'] ?? trip?['startTime'],
    );
    final String status = row['status']?.toString() ?? '';
    return _PassengerRide(
      time: _fmtTime(departureTime),
      from: _firstNotEmpty(<dynamic>[
        trip?['departureLabel'],
        trip?['fromLabel'],
        trip?['departureCity'],
        trip?['from'],
      ]),
      to: _firstNotEmpty(<dynamic>[
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
        trip?['passengerPrice'] ?? trip?['pricePerPassenger'] ?? trip?['price'],
      ),
      status: _toPassengerStatus(status),
    );
  }

  _PassengerStatus _toPassengerStatus(String status) {
    final s = status.toLowerCase();
    if (s.contains('confirm') || s.contains('accept')) return _PassengerStatus.confirmed;
    if (s.contains('progress') || s.contains('started')) return _PassengerStatus.inProgress;
    if (s.contains('complete') || s.contains('done')) return _PassengerStatus.completed;
    return _PassengerStatus.pending;
  }

  void _buildCells() {
    _cells = [];
    // April 2026: 1st = Wednesday â†’ offset=2 (Mon-first: Mon=0 â€¦ Wed=2)
    const offset = 2;
    const daysInMonth = 30;
    final today = 19;

    // Prev month trailing days
    for (int i = offset; i > 0; i--) {
      _cells.add(_CalendarCell(day: 31 - i + 1, isOtherMonth: true));
    }
    // Current month
    final tripDays = {2: 1, 5: 2, 8: 3, 12: 1, 14: 2, 17: 1, 19: 3, 22: 2, 25: 1};
    final unavailDays = {20, 21};
    for (int d = 1; d <= daysInMonth; d++) {
      final isWeekend = ((d + offset - 1) % 7) >= 5;
      _cells.add(_CalendarCell(
        day: d,
        isToday: d == today,
        isActive: d == _selectedDay,
        isUnavailable: unavailDays.contains(d),
        isWeekend: isWeekend,
        tripCount: tripDays[d] ?? 0,
      ));
    }
    // Next month padding to complete 35 cells
    int next = 1;
    while (_cells.length < 35) {
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
      '', 'Janvier', 'FÃ©vrier', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'AoÃ»t', 'Septembre', 'Octobre', 'Novembre', 'DÃ©cembre'
    ];
    return '${months[_currentMonth]} $_currentYear';
  }

  @override
  Widget build(BuildContext context) {
    final int tripCount = _trips.length;
    return Stack(
      children: [
        Scaffold(
          backgroundColor: AppColors.grayBg,
          body: ListView(
            children: [
              // â”€â”€ Header actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              _buildHeaderActions(),
              const SectionGap(),

              // â”€â”€ Calendar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

              // â”€â”€ Rides section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              _RidesSection(
                selectedDay: _selectedDay,
                isViewAll: _isViewAll,
                driverRides: _driverRides,
                passengerRides: _passengerRides,
                onToggleViewAll: () =>
                    setState(() => _isViewAll = !_isViewAll),
                onNavigateDay: (delta) => setState(() {
                  _selectedDay = (_selectedDay + delta).clamp(1, 30);
                  _buildCells();
                }),
              ),
              if (!_isLoading && tripCount == 0)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('Aucun trajet planifiÃ© pour le moment.'),
                ),

              const SizedBox(height: 32),
            ],
          ),
        ),

        // â”€â”€ Bottom sheet overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (_isLoading)
          const Positioned.fill(
            child: ColoredBox(
              color: Color(0x66000000),
              child: Center(
                child: CircularProgressIndicator(color: AppColors.blueDeep),
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

  // â”€â”€ Header: Mes disponibilitÃ©s + Trouver un trajet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Widget _buildHeaderActions() {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ðŸ“… Planifie tes trajets ici',
              style: AppTextStyles.soraH3()),
          const SizedBox(height: 4),
          Text(
            'Visualise ton calendrier, gÃ¨re tes disponibilitÃ©s et trouve des trajets selon ta semaine.',
            style: AppTextStyles.body(size: 12.5, color: AppColors.text3),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              // Mes disponibilitÃ©s
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _sheetOpen = true),
                  child: _ActionBtn(
                    iconBg: AppColors.teal,
                    cardBg: AppColors.tealLight,
                    borderColor: AppColors.teal.withOpacity(.25),
                    icon: Icons.calendar_today,
                    label: 'Mes\ndisponibilitÃ©s',
                    labelColor: AppColors.teal,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Trouver un trajet
              Expanded(
                child: _ActionBtn(
                  iconBg: AppColors.blue,
                  cardBg: AppColors.blueLight,
                  borderColor: AppColors.blue.withOpacity(.25),
                  icon: Icons.search,
                  label: 'Trouver\nun trajet',
                  labelColor: AppColors.blueDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

List<dynamic> _extractList(dynamic payload) {
  if (payload is List<dynamic>) return payload;
  if (payload is Map<String, dynamic>) {
    final dynamic data = payload['data'] ?? payload['items'] ?? payload['results'];
    if (data is List<dynamic>) return data;
  }
  return <dynamic>[];
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

// â”€â”€ Action button card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class _ActionBtn extends StatelessWidget {
  final Color iconBg;
  final Color cardBg;
  final Color borderColor;
  final IconData icon;
  final String label;
  final Color labelColor;

  const _ActionBtn({
    required this.iconBg,
    required this.cardBg,
    required this.borderColor,
    required this.icon,
    required this.label,
    required this.labelColor,
  });

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
                  color: iconBg.withOpacity(.35),
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CALENDAR SECTION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class _CalendarSection extends StatelessWidget {
  final List<_CalendarCell> cells;
  final String monthLabel;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final void Function(int? day, bool isOtherMonth) onSelectDay;

  const _CalendarSection({
    required this.cells,
    required this.monthLabel,
    required this.onPrev,
    required this.onNext,
    required this.onSelectDay,
  });

  // Dot color by trip count (1â†’green, 7+â†’red)
  Color _dotColor(int count) {
    const colors = [
      Color(0xFF2D9D6A), // 1
      Color(0xFF3BAA5A), // 2
      Color(0xFF70BB40), // 3
      Color(0xFFA8C030), // 4
      Color(0xFFD4AB1A), // 5
      Color(0xFFE07B18), // 6
      Color(0xFFE24B4A), // 7+
    ];
    return colors[(count - 1).clamp(0, colors.length - 1)];
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      child: Column(
        children: [
          // Nav row
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

          // Days of week header
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

          // Grid
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

          // Legend
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
                Text('âŠ˜ indisponible', style: AppTextStyles.caption()),
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
                      color: AppColors.blueDeep.withOpacity(.35),
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
  final VoidCallback onTap;
  final IconData icon;
  const _CalArrow({required this.onTap, required this.icon});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
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
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RIDES SECTION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class _RidesSection extends StatelessWidget {
  final int selectedDay;
  final bool isViewAll;
  final List<_DriverRide> driverRides;
  final List<_PassengerRide> passengerRides;
  final VoidCallback onToggleViewAll;
  final void Function(int delta) onNavigateDay;

  const _RidesSection({
    required this.selectedDay,
    required this.isViewAll,
    required this.driverRides,
    required this.passengerRides,
    required this.onToggleViewAll,
    required this.onNavigateDay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Day nav
          if (!isViewAll)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 11, 12, 10),
              child: Row(
                children: [
                  _navArrow(Icons.chevron_left, () => onNavigateDay(-1)),
                  Expanded(
                    child: Text(
                      'Dimanche $selectedDay avril 2026',
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

          // Status bar
          const AppDivider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text('Statut du jour :',
                    style: AppTextStyles.caption()),
                const SizedBox(width: 8),
                StatusPill(
                    label: '2 ConfirmÃ©es',
                    bg: AppColors.tealLight,
                    fg: AppColors.teal),
                const SizedBox(width: 6),
                StatusPill(
                    label: '1 En attente',
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

          // Rides list
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
            child: Column(
              children: [
                ...driverRides.map((r) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _DriverRideCard(ride: r),
                    )),
                ...passengerRides.map((r) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _PassengerRideCard(ride: r),
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _navArrow(IconData icon, VoidCallback onTap) {
    return GestureDetector(
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
}

// â”€â”€ Driver Ride Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class _DriverRideCard extends StatelessWidget {
  final _DriverRide ride;
  const _DriverRideCard({required this.ride});

  (String label, Color bg, Color fg) get _statusStyle {
    switch (ride.status) {
      case _DriverStatus.published:
        return ('PubliÃ©e', AppColors.tealLight, AppColors.teal);
      case _DriverStatus.confirmed:
        return ('ConfirmÃ©e', AppColors.tealLight, AppColors.teal);
      case _DriverStatus.inProgress:
        return ('En cours', AppColors.redLight, AppColors.red);
      case _DriverStatus.cancelled:
        return ('AnnulÃ©e', AppColors.amberLight, AppColors.amber);
      case _DriverStatus.completed:
        return ('TerminÃ©e', AppColors.gray100, AppColors.gray600);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusBg, statusFg) = _statusStyle;

    return AppCard(
      shadows: AppColors.shSm,
      radius: AppColors.rLg,
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 11, 12, 9),
            child: Row(
              children: [
                // Car thumb
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
                      Text(ride.time, style: AppTextStyles.soraSubtitle()),
                      const SizedBox(height: 2),
                      RouteMiniRow(from: ride.from, to: ride.to, fontSize: 12),
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
                    Text('${ride.price.toStringAsFixed(0)} CAD',
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
                    decoration: BoxDecoration(
                        color: AppColors.amberMid, shape: BoxShape.circle),
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
                  decoration: BoxDecoration(
                    border:
                        Border.all(color: AppColors.redMid, width: 1.5),
                    borderRadius: BorderRadius.circular(AppColors.rFull),
                  ),
                  child: Text('Annuler',
                      style: AppTextStyles.button(color: AppColors.redMid)
                          .copyWith(fontSize: 11.5)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// â”€â”€ Passenger Ride Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class _PassengerRideCard extends StatelessWidget {
  final _PassengerRide ride;
  const _PassengerRideCard({required this.ride});

  (String label, Color bg, Color fg) get _statusStyle {
    switch (ride.status) {
      case _PassengerStatus.confirmed:
        return ('ConfirmÃ©e', AppColors.tealLight, AppColors.teal);
      case _PassengerStatus.pending:
        return ('En attente', AppColors.amberLight, AppColors.amber);
      case _PassengerStatus.inProgress:
        return ('En cours', AppColors.redLight, AppColors.red);
      case _PassengerStatus.completed:
        return ('TerminÃ©e', AppColors.gray100, AppColors.gray600);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (statusLabel, statusBg, statusFg) = _statusStyle;
    final initials = ride.driverName.split(' ').map((w) => w[0]).take(2).join();

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
                  Text(ride.time, style: AppTextStyles.soraSemibold(size: 13)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text('Avec : ',
                          style:
                              AppTextStyles.body(size: 13, color: AppColors.text2)),
                      Text(ride.driverName,
                          style: AppTextStyles.soraSemibold(
                              size: 13, color: AppColors.blue)),
                    ],
                  ),
                  const SizedBox(height: 3),
                  RouteMiniRow(from: ride.from, to: ride.to, fontSize: 12),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                StatusPill(label: statusLabel, bg: statusBg, fg: statusFg),
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// UNAVAILABILITY BOTTOM SHEET
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

class _UnavailabilitySheet extends StatefulWidget {
  final List<_UnavailItem> unavailItems;
  final VoidCallback onClose;

  const _UnavailabilitySheet({
    required this.unavailItems,
    required this.onClose,
  });

  @override
  State<_UnavailabilitySheet> createState() => _UnavailabilitySheetState();
}

class _UnavailabilitySheetState extends State<_UnavailabilitySheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<Offset> _slideAnim;
  late Animation<double> _fadeAnim;

  final _days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  final _dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  final Set<int> _selectedDays = {};
  bool _isRecurrent = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 280));
    _slideAnim = Tween<Offset>(
            begin: const Offset(0, 1), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _fadeAnim =
        Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
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
          color: Colors.black.withOpacity(.45),
          child: GestureDetector(
            onTap: () {}, // absorb taps inside
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
                      maxHeight: MediaQuery.of(context).size.height * .88),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Handle
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
                      // Title row
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('Mes disponibilitÃ©s',
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

                      // Scrollable content
                      Flexible(
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Info banner
                              Container(
                                margin: const EdgeInsets.fromLTRB(20, 14, 20, 0),
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
                                    Text('Renseignez vos indisponibilitÃ©s',
                                        style: AppTextStyles.soraSemibold(
                                            size: 13, color: AppColors.blueDark)),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Indiquez les pÃ©riodes oÃ¹ vous n\'Ãªtes pas disponible. Cela nous permet de vous suggÃ©rer des trajets plus pertinents.',
                                      style: AppTextStyles.body(
                                          size: 12.5,
                                          color: AppColors.blueDark),
                                    ),
                                  ],
                                ),
                              ),

                              // Form
                              Padding(
                                padding: const EdgeInsets.fromLTRB(20, 14, 20, 10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Ajouter une indisponibilitÃ©',
                                        style: AppTextStyles.soraSemibold(
                                            size: 13)),
                                    const SizedBox(height: 12),
                                    // Date field
                                    _formLabel('DATE (OPTIONNELLE)'),
                                    _inputWrap(
                                      child: const Text('SÃ©lectionner une date'),
                                      icon: Icons.calendar_today_outlined,
                                    ),
                                    const SizedBox(height: 12),
                                    // Start time
                                    _formLabel('HEURE DE DÃ‰BUT'),
                                    _inputWrap(
                                      child: const Text('08:00'),
                                      icon: Icons.access_time,
                                    ),
                                    const SizedBox(height: 12),
                                    // End time
                                    _formLabel('HEURE DE FIN'),
                                    _inputWrap(
                                      child: const Text('12:00'),
                                      icon: Icons.access_time,
                                    ),
                                    const SizedBox(height: 12),
                                    // Recurrent toggle
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
                                                Text('RÃ©current',
                                                    style: AppTextStyles
                                                        .soraSemibold(
                                                            size: 13)),
                                                Text(
                                                    'Se rÃ©pÃ¨te chaque semaine',
                                                    style: AppTextStyles
                                                        .caption()),
                                              ],
                                            ),
                                          ),
                                          Switch(
                                            value: _isRecurrent,
                                            onChanged: (v) => setState(
                                                () => _isRecurrent = v),
                                            activeColor: AppColors.teal,
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Weekday picker
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
                                              if (selected)
                                                _selectedDays.remove(i);
                                              else
                                                _selectedDays.add(i);
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
                                                    width: 1.5),
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
                                                    style: AppTextStyles
                                                        .caption(
                                                            color: selected
                                                                ? Colors.white
                                                                    .withOpacity(.8)
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

                              // Existing unavailabilities
                              if (widget.unavailItems.isNotEmpty) ...[
                                const AppDivider(),
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                      20, 14, 20, 14),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('Vos indisponibilitÃ©s',
                                          style: AppTextStyles.soraSemibold(
                                              size: 13)),
                                      const SizedBox(height: 10),
                                      ...widget.unavailItems
                                          .map((item) => _UnavailItemRow(
                                              item: item)),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      // CTA footer
                      const AppDivider(),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
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

  Widget _inputWrap({required Widget child, required IconData icon}) {
    return Container(
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
}

class _UnavailItemRow extends StatelessWidget {
  final _UnavailItem item;
  const _UnavailItemRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
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
}


