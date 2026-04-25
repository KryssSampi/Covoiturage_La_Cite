import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/home/home_page.dart';
import '../../features/messages/messages_screen.dart';
import '../../features/planner/planner_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/stats/stats_screen.dart';
import '../../features/trip/reservation_screen.dart';
import '../services/api_service.dart';
import '../services/trip_service.dart';
import '../state/app_state.dart';
import 'custom_tab_bar.dart';
import 'shell_top_bar.dart';
import 'side_nav_bar.dart';

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  ConsumerState<AppShell> createState() => AppShellState();
}

class AppShellState extends ConsumerState<AppShell> {
  AppShellState();

  static AppShellState? of(BuildContext context) {
    return context.findAncestorStateOfType<AppShellState>();
  }

  late int _currentIndex;
  bool _sideNavOpen = false;
  bool _showLoader = false;
  final TripService _tripService = TripService(ApiService.instance);

  int get currentIndex => _currentIndex;
  bool get sideNavOpen => _sideNavOpen;

  void setTab(int index) {
    if (index < 0 || index > 4) return;
    setState(() => _currentIndex = index);
  }

  void setLoading(bool value) {
    if (_showLoader == value) return;
    setState(() => _showLoader = value);
  }

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex.clamp(0, 4);
  }

  Widget _bodyForIndex(int index, bool isDriver) {
    switch (index) {
      case 0:
        return const HomePage();
      case 1:
        return isDriver
            ? ReservationScreen(
                tripService: _tripService,
                isDriver: true,
                embedded: true,
              )
            : const StatsScreen();
      case 2:
        return const PlannerScreen();
      case 3:
        return const MessagesScreen();
      case 4:
        return const ProfileScreen();
      default:
        return const SizedBox.shrink();
    }
  }

  void _switchRole(AppUserMode mode) {
    AppStateStore.instance.switchMode(mode);
    setState(() {
      _sideNavOpen = false;
      _currentIndex = 0;
    });
  }

  void _clearNewsForIndex(int index, bool isDriver) {
    final AppStateStore appState = AppStateStore.instance;
    if (index == 0) appState.clearPageNews(AppNavPage.home);
    if (index == 1) {
      appState.clearPageNews(
        isDriver ? AppNavPage.reservations : AppNavPage.stats,
      );
    }
    if (index == 2) appState.clearPageNews(AppNavPage.planner);
    if (index == 3) appState.clearPageNews(AppNavPage.messages);
    if (index == 4) appState.clearPageNews(AppNavPage.profile);
  }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(appStateProvider);
    final String fullName =
        '${appState.currentUser.firstName} ${appState.currentUser.lastName}'.trim();

    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      bottomNavigationBar: CustomTabBar(
        currentIndex: _currentIndex,
        isDriver: appState.isDriver,
        hasNewsByIndex: <int, bool>{
          0: appState.hasNews(AppNavPage.home),
          1: appState.isDriver
              ? appState.hasNews(AppNavPage.reservations)
              : appState.hasNews(AppNavPage.stats),
          2: appState.hasNews(AppNavPage.planner),
          3: appState.hasNews(AppNavPage.messages),
          4: appState.hasNews(AppNavPage.profile),
        },
        onTap: (int i) {
          setState(() => _currentIndex = i);
          _clearNewsForIndex(i, appState.isDriver);
        },
      ),
      body: SafeArea(
        top: true,
        bottom: false,
        child: Stack(
          children: <Widget>[
            Column(
              children: <Widget>[
                ShellTopBar(
                  onMenuTap: () => setState(() => _sideNavOpen = !_sideNavOpen),
                  onBellTap: () {
                    AppStateStore.instance.clearPageNews(AppNavPage.notifications);
                    context.push('/notifications');
                  },
                  unreadCount: appState.hasNews(AppNavPage.notifications) ? 1 : 0,
                ),
                _RoleSwitchBar(
                  fullName: fullName.isEmpty ? 'Utilisateur' : fullName,
                  isDriver: appState.isDriver,
                  onRoleChanged: (AppUserMode mode) => _switchRole(mode),
                ),
                if (appState.usingFixtures)
                  _FallbackBanner(message: appState.networkIssue),
                Expanded(
                  child: _bodyForIndex(_currentIndex, appState.isDriver),
                ),
              ],
            ),
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
              Positioned.fill(
                child: SideNavBar(
                  currentIndex: _currentIndex,
                  userName: fullName.isEmpty ? 'Utilisateur' : fullName,
                  userEmail: appState.currentUser.email,
                  roleLabel: appState.isDriver ? 'Conducteur' : 'Passager',
                  isDriver: appState.isDriver,
                  hasNewsReservations: appState.hasNews(AppNavPage.reservations),
                  hasNewsStatsOrRequests: appState.isDriver
                      ? appState.hasNews(AppNavPage.reservations)
                      : appState.hasNews(AppNavPage.stats),
                  hasNewsPlanner: appState.hasNews(AppNavPage.planner),
                  hasNewsMessages: appState.hasNews(AppNavPage.messages),
                  hasNewsProfile: appState.hasNews(AppNavPage.profile),
                  onSwitchRole: () => _switchRole(
                    appState.isDriver
                        ? AppUserMode.passenger
                        : AppUserMode.driver,
                  ),
                  onClose: () => setState(() => _sideNavOpen = false),
                  onNavigate: (int i) {
                    setState(() {
                      _currentIndex = i;
                      _sideNavOpen = false;
                    });
                    _clearNewsForIndex(i, appState.isDriver);
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _RoleSwitchBar extends StatelessWidget {
  const _RoleSwitchBar({
    required this.fullName,
    required this.isDriver,
    required this.onRoleChanged,
  });

  final String fullName;
  final bool isDriver;
  final ValueChanged<AppUserMode> onRoleChanged;

  @override
  Widget build(BuildContext context) {
    final Color activeColor = const Color(0xFF08316E);
    final Color inactiveColor = const Color(0xFFEEF0F5);

    Widget roleChip({
      required String label,
      required bool selected,
      required VoidCallback onTap,
    }) {
      return Expanded(
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: selected ? activeColor : inactiveColor,
              borderRadius: BorderRadius.circular(999),
            ),
            alignment: Alignment.center,
            child: Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : const Color(0xFF3D4A5C),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(
              fullName,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Color(0xFF0D1624),
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 220,
            child: Row(
              children: <Widget>[
                roleChip(
                  label: 'Passager',
                  selected: !isDriver,
                  onTap: () => onRoleChanged(AppUserMode.passenger),
                ),
                const SizedBox(width: 6),
                roleChip(
                  label: 'Conducteur',
                  selected: isDriver,
                  onTap: () => onRoleChanged(AppUserMode.driver),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FallbackBanner extends StatefulWidget {
  const _FallbackBanner({required this.message});

  final String? message;

  @override
  State<_FallbackBanner> createState() => _FallbackBannerState();
}

class _FallbackBannerState extends State<_FallbackBanner> {
  bool _visible = true;

  @override
  void didUpdateWidget(covariant _FallbackBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Si le message change, on réaffiche la bannière
    if (widget.message != oldWidget.message) {
      setState(() => _visible = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_visible || (widget.message == null || widget.message!.isEmpty)) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      color: const Color(0xFFFFF7E6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: <Widget>[
          const Icon(Icons.info_outline, size: 16, color: Color(0xFF9A6700)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              widget.message ??
                  'Mode fixtures actif: affichage des données locales de secours.',
              style: const TextStyle(
                color: Color(0xFF9A6700),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          GestureDetector(
            onTap: () => setState(() => _visible = false),
            child: const Padding(
              padding: EdgeInsets.only(left: 8),
              child: Icon(Icons.close, size: 18, color: Color(0xFF9A6700)),
            ),
          ),
        ],
      ),
    );
  }
}
