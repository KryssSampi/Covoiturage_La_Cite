class TripTimeDisplayUtils {
  const TripTimeDisplayUtils._();

  static const List<String> _weekdaysFr = <String>[
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  static String formatRelativeDayWithTime(DateTime dateTime) {
    final DateTime local = dateTime.toLocal();
    final DateTime now = DateTime.now();
    final DateTime today = DateTime(now.year, now.month, now.day);
    final DateTime tripDay = DateTime(local.year, local.month, local.day);
    final int deltaDays = tripDay.difference(today).inDays;
    final String hour = _hhmm(local);

    if (deltaDays == 0) return 'Aujourd\'hui $hour';
    if (deltaDays == 1) return 'Demain $hour';
    if (deltaDays == -1) return 'Hier $hour';

    final String weekday = _weekdaysFr[(local.weekday - 1).clamp(0, 6)];
    return '$weekday $hour';
  }

  static String _hhmm(DateTime value) {
    final String h = value.hour.toString().padLeft(2, '0');
    final String m = value.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}
