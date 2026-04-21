import 'package:flutter/material.dart';

class CustomTabBar extends StatelessWidget {
  const CustomTabBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.isDriver,
    this.hasNewsByIndex = const <int, bool>{},
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final bool isDriver;
  final Map<int, bool> hasNewsByIndex;

  static const List<IconData> _icons = <IconData>[
    Icons.home_rounded,
    Icons.stacked_bar_chart_rounded,
    Icons.calendar_month_rounded,
    Icons.message_outlined,
    Icons.person_rounded,
  ];
  static const List<IconData> _driverIcons = <IconData>[
    Icons.home_rounded,
    Icons.assignment_turned_in_outlined,
    Icons.calendar_month_rounded,
    Icons.message_outlined,
    Icons.person_rounded,
  ];

  static const List<String> _labels = <String>[
    'Accueil',
    'Stats',
    'Planifier',
    'Messages',
    'Profil',
  ];
  static const List<String> _driverLabels = <String>[
    'Accueil',
    'Demandes',
    'Planifier',
    'Messages',
    'Profil',
  ];
  static const List<int> _visualOrder = <int>[1, 2, 0, 3, 4];

  @override
  Widget build(BuildContext context) {
    final double bottomPadding = MediaQuery.of(context).padding.bottom;
    final List<String> labels = isDriver ? _driverLabels : _labels;
    final List<IconData> icons = isDriver ? _driverIcons : _icons;

    return Container(
      height: 68 + bottomPadding,
      padding: EdgeInsets.only(bottom: bottomPadding),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Color(0x18000000),
            blurRadius: 12,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SizedBox(
        height: 68,
        child: Row(
          children: List<Widget>.generate(_visualOrder.length, (int slot) {
            final int index = _visualOrder[slot];
            final bool selected = currentIndex == index;

            return Expanded(
              child: InkWell(
                onTap: () => onTap(index),
                child: Center(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    curve: Curves.easeOut,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: selected
                          ? const Color(0xFF1A56CC)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: _Item(
                      icon: icons[index],
                      label: labels[index],
                      color: selected
                          ? Colors.white
                          : const Color(0xFF7A879A),
                      hasNews: hasNewsByIndex[index] == true,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({
    required this.icon,
    required this.label,
    required this.color,
    required this.hasNews,
  });

  final IconData icon;
  final String label;
  final Color color;
  final bool hasNews;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            Icon(icon, size: 22, color: color),
            if (hasNews)
              Positioned(
                top: -2,
                right: -4,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE24B4A),
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: color,
            fontWeight: FontWeight.w600,
            height: 1.1,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
