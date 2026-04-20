import 'package:flutter/material.dart';

import '../../features/chat/chat_list_screen.dart';
import '../../features/home/home_page.dart';
import '../../features/planner/planner_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/stats/stats_screen.dart';
import 'custom_tab_bar.dart';
import 'shell_top_bar.dart';
import 'side_nav_bar.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<AppShell> createState() => AppShellState();
}

class AppShellState extends State<AppShell> {
  AppShellState();

  static AppShellState? of(BuildContext context) {
    return context.findAncestorStateOfType<AppShellState>();
  }

  static const List<String> _tabs = <String>[
    'Accueil',
    'Statistiques',
    'Planifier',
    'Messages',
    'Profil',
  ];

  late int _currentIndex;
  bool _sideNavOpen = false;
  bool _showLoader = false;

  late final List<Widget> _bodies = <Widget>[
    const HomePage(),
    const StatsScreen(),
    const PlannerScreen(),
    const ChatListScreen(),
    const ProfileScreen(),
  ];

  int get currentIndex => _currentIndex;
  bool get sideNavOpen => _sideNavOpen;

  void setTab(int index) {
    if (index < 0 || index >= _bodies.length) return;
    setState(() => _currentIndex = index);
  }

  void setLoading(bool value) {
    if (_showLoader == value) return;
    setState(() => _showLoader = value);
  }

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex.clamp(0, _tabs.length - 1).toInt();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(
        top: true,
        bottom: false,
        child: Column(
          children: <Widget>[
            ShellTopBar(
              onMenuTap: () => setState(() => _sideNavOpen = !_sideNavOpen),
              onBellTap: () => setState(() => _currentIndex = 3),
              unreadCount: 0,
            ),
            Expanded(
              child: Stack(
                children: <Widget>[
                  IndexedStack(index: _currentIndex, children: _bodies),
                  if (_showLoader)
                    Positioned.fill(
                      child: ColoredBox(
                        color: const Color(0x66000000),
                        child: Center(
                          child: Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            alignment: Alignment.center,
                            child: const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2.4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  if (_sideNavOpen)
                    SideNavBar(
                      currentIndex: _currentIndex,
                      onClose: () => setState(() => _sideNavOpen = false),
                      onNavigate: (int i) {
                        setState(() {
                          _currentIndex = i;
                          _sideNavOpen = false;
                        });
                      },
                    ),
                ],
              ),
            ),
            CustomTabBar(
              currentIndex: _currentIndex,
              onTap: (int i) => setState(() => _currentIndex = i),
            ),
          ],
        ),
      ),
    );
  }
}
