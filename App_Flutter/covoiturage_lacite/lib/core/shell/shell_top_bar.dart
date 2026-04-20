import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ShellTopBar extends StatelessWidget {
  const ShellTopBar({
    super.key,
    required this.onMenuTap,
    required this.onBellTap,
    this.unreadCount = 0,
  });

  final VoidCallback onMenuTap;
  final VoidCallback onBellTap;
  final int unreadCount;

  @override
  Widget build(BuildContext context) {
    final bool hasUnread = unreadCount > 0;
    return Container(
      height: 52,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Color(0x12000000), width: 1),
        ),
      ),
      child: Row(
        children: <Widget>[
          SizedBox(
            width: 50,
            child: InkWell(
              onTap: onMenuTap,
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 16,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const <Widget>[
                      _Bar(width: 20),
                      _Bar(width: 14),
                      _Bar(width: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: Center(
              child: Text(
                'La Cité Covoiturage',
                style: GoogleFonts.sora(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF1A56CC),
                ),
              ),
            ),
          ),
          SizedBox(
            width: 50,
            child: InkWell(
              onTap: onBellTap,
              child: Center(
                child: Stack(
                  clipBehavior: Clip.none,
                  children: <Widget>[
                    const Icon(
                      Icons.notifications_rounded,
                      color: Color(0xFF08316E),
                      size: 22,
                    ),
                    if (hasUnread)
                      Positioned(
                        top: -4,
                        right: -8,
                        child: Container(
                          width: 18,
                          height: 18,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE24B4A),
                            borderRadius: BorderRadius.circular(9),
                            border: Border.all(color: Colors.white, width: 1.5),
                          ),
                          child: Text(
                            unreadCount > 99 ? '99+' : '$unreadCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              height: 1,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.width});

  final double width;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: 2,
      decoration: BoxDecoration(
        color: const Color(0xFF1A56CC),
        borderRadius: BorderRadius.circular(99),
      ),
    );
  }
}
