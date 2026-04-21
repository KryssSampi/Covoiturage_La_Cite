import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/api_service.dart';
import '../services/auth_service.dart';

class SideNavBar extends StatelessWidget {
  const SideNavBar({
    super.key,
    required this.currentIndex,
    required this.userName,
    required this.userEmail,
    required this.roleLabel,
    required this.isDriver,
    this.hasNewsReservations = false,
    this.hasNewsStatsOrRequests = false,
    this.hasNewsPlanner = false,
    this.hasNewsMessages = false,
    this.hasNewsProfile = false,
    required this.onSwitchRole,
    required this.onNavigate,
    required this.onClose,
  });

  final int currentIndex;
  final String userName;
  final String userEmail;
  final String roleLabel;
  final bool isDriver;
  final bool hasNewsReservations;
  final bool hasNewsStatsOrRequests;
  final bool hasNewsPlanner;
  final bool hasNewsMessages;
  final bool hasNewsProfile;
  final VoidCallback onSwitchRole;
  final ValueChanged<int> onNavigate;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Positioned.fill(
          child: GestureDetector(
            onTap: onClose,
            child: Container(color: const Color(0x80000000)),
          ),
        ),
        Align(
          alignment: Alignment.centerLeft,
          child: Container(
            width: 280,
            height: double.infinity,
            color: Colors.white,
            child: SafeArea(
              child: Column(
                children: <Widget>[
                  _buildHeader(),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.only(top: 8),
                      children: <Widget>[
                        ..._primaryItems.map((item) {
                          return ListTile(
                            leading: _LeadingIcon(
                              icon: item.icon,
                              hasNews: item.hasNews,
                            ),
                            title: Text(
                              item.label,
                              style: const TextStyle(color: Color(0xFF0D1624)),
                            ),
                            selected: currentIndex == item.index,
                            selectedColor: const Color(0xFF1A56CC),
                            selectedTileColor: const Color(0xFFEFF4FF),
                            onTap: () => onNavigate(item.index),
                            dense: true,
                            visualDensity:
                                const VisualDensity(vertical: -1),
                            minLeadingWidth: 28,
                            contentPadding:
                                const EdgeInsets.symmetric(horizontal: 16),
                          );
                        }),
                        ListTile(
                          leading: _LeadingIcon(
                            icon: isDriver ? Icons.stacked_bar_chart_rounded : Icons.event_note_rounded,
                            hasNews: hasNewsReservations,
                          ),
                          title: Text(
                            isDriver ? 'Statistiques' : 'Reservations',
                            style: const TextStyle(color: Color(0xFF0D1624)),
                          ),
                          onTap: () {
                            if (isDriver) {
                              onClose();
                              context.push('/stats');
                            } else {
                              onClose();
                              context.push('/reservations');
                            }
                          },
                        ),
                        const Divider(height: 24),
                        ListTile(
                          leading: const Icon(Icons.history,
                              color: Color(0xFF1A56CC)),
                          title: const Text('Historique',
                              style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: () {
                            onClose();
                            context.push('/historique');
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.star_rounded,
                              color: Color(0xFF1A56CC)),
                          title: const Text('Favoris',
                              style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: () {
                            onClose();
                            context.push('/favoris');
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.star_outline,
                              color: Color(0xFF1A56CC)),
                          title: const Text('Mes avis',
                              style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: () {
                            onClose();
                            context.push('/reviews');
                          },
                        ),
                        if (isDriver)
                          ListTile(
                            leading: const Icon(Icons.description_outlined,
                                color: Color(0xFF1A56CC)),
                            title: const Text('Brouillons',
                                style: TextStyle(color: Color(0xFF0D1624))),
                            onTap: () {
                              onClose();
                              context.push('/brouillons');
                            },
                          ),
                        ListTile(
                          leading: const Icon(Icons.settings,
                              color: Color(0xFF1A56CC)),
                          title: const Text('Parametres',
                              style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: () {
                            onClose();
                            context.push('/profile');
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.swap_horiz_rounded,
                              color: Color(0xFF1A56CC)),
                          title: const Text('Changer de role',
                              style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: onSwitchRole,
                        ),
                        const Divider(height: 24),
                        ListTile(
                          leading: const Icon(Icons.logout,
                              color: Color(0xFFE24B4A)),
                          title: const Text(
                            'Deconnexion',
                            style: TextStyle(color: Color(0xFFE24B4A)),
                          ),
                          onTap: () async {
                            await AuthService(ApiService.instance).logout();
                            if (context.mounted) {
                              onClose();
                              context.go('/login');
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      color: const Color(0xFF08316E),
      padding: const EdgeInsets.all(24),
      child: Row(
        children: <Widget>[
          const CircleAvatar(
            radius: 40,
            backgroundColor: Colors.white24,
            child: Icon(Icons.person, color: Colors.white, size: 40),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  userName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  userEmail,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    roleLabel,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
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

  List<_PrimaryItem> get _primaryItems => <_PrimaryItem>[
        const _PrimaryItem(index: 0, icon: Icons.home_rounded, label: 'Accueil'),
        _PrimaryItem(
          index: 1,
          icon: isDriver ? Icons.assignment_turned_in_outlined : Icons.stacked_bar_chart,
          label: isDriver ? 'Demandes' : 'Statistiques',
          hasNews: hasNewsStatsOrRequests,
        ),
        _PrimaryItem(
          index: 2,
          icon: Icons.calendar_month_rounded,
          label: 'Planifier',
          hasNews: hasNewsPlanner,
        ),
        _PrimaryItem(
          index: 3,
          icon: Icons.message_outlined,
          label: 'Messages',
          hasNews: hasNewsMessages,
        ),
        _PrimaryItem(
          index: 4,
          icon: Icons.person,
          label: 'Profil',
          hasNews: hasNewsProfile,
        ),
      ];
}

class _PrimaryItem {
  const _PrimaryItem({
    required this.index,
    required this.icon,
    required this.label,
    this.hasNews = false,
  });

  final int index;
  final IconData icon;
  final String label;
  final bool hasNews;
}

class _LeadingIcon extends StatelessWidget {
  const _LeadingIcon({
    required this.icon,
    required this.hasNews,
  });

  final IconData icon;
  final bool hasNews;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: <Widget>[
        Icon(icon, color: const Color(0xFF1A56CC)),
        if (hasNews)
          Positioned(
            right: -2,
            top: -2,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: const Color(0xFFE24B4A),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
      ],
    );
  }
}
