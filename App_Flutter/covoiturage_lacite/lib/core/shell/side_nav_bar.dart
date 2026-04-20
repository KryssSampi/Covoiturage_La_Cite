import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/api_service.dart';
import '../services/auth_service.dart';

class SideNavBar extends StatelessWidget {
  const SideNavBar({
    super.key,
    required this.currentIndex,
    required this.onNavigate,
    required this.onClose,
  });

  final int currentIndex;
  final ValueChanged<int> onNavigate;
  final VoidCallback onClose;

  static const List<_PrimaryItem> _primaryItems = <_PrimaryItem>[
    _PrimaryItem(index: 0, icon: Icons.home_rounded, label: 'Accueil'),
    _PrimaryItem(index: 1, icon: Icons.stacked_bar_chart, label: 'Statistiques'),
    _PrimaryItem(index: 2, icon: Icons.calendar_month_rounded, label: 'Planifier'),
    _PrimaryItem(index: 3, icon: Icons.message_outlined, label: 'Messages'),
    _PrimaryItem(index: 4, icon: Icons.person, label: 'Profil'),
  ];

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
                  Container(
                    width: double.infinity,
                    color: const Color(0xFF08316E),
                    padding: const EdgeInsets.all(24),
                    child: const Row(
                      children: <Widget>[
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.white24,
                          child: Icon(Icons.person, color: Colors.white, size: 40),
                        ),
                        SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                'Utilisateur',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'etudiant@lacite.ca',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.only(top: 8),
                      children: <Widget>[
                        ..._primaryItems.map((item) {
                          return ListTile(
                            leading: Icon(item.icon, color: const Color(0xFF1A56CC)),
                            title: Text(
                              item.label,
                              style: const TextStyle(color: Color(0xFF0D1624)),
                            ),
                            selected: currentIndex == item.index,
                            selectedColor: const Color(0xFF1A56CC),
                            selectedTileColor: const Color(0xFFEFF4FF),
                            onTap: () => onNavigate(item.index),
                            dense: true,
                            visualDensity: const VisualDensity(vertical: -1),
                            minLeadingWidth: 28,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                            trailing: null,
                            subtitle: null,
                          );
                        }),
                        const Divider(height: 24),
                        ListTile(
                          leading: const Icon(Icons.history, color: Color(0xFF1A56CC)),
                          title: const Text('Historique', style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: () {
                            onClose();
                            context.push('/historique');
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.star_rounded, color: Color(0xFF1A56CC)),
                          title: const Text('Favoris', style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: () {
                            onClose();
                            context.push('/favoris');
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.star_outline, color: Color(0xFF1A56CC)),
                          title: const Text('Mes avis', style: TextStyle(color: Color(0xFF0D1624))),
                          onTap: () {
                            onClose();
                            context.push('/reviews');
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.settings, color: Color(0xFF1A56CC)),
                          title: const Text('Paramètres', style: TextStyle(color: Color(0xFF0D1624))),
                          onTap:() {
                             onClose ();
                          context.push('/settings');
                          }
                        ),
                        const Divider(height: 24),
                        ListTile(
                          leading: const Icon(Icons.logout, color: Color(0xFFE24B4A)),
                          title: const Text(
                            'Déconnexion',
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
}

class _PrimaryItem {
  const _PrimaryItem({
    required this.index,
    required this.icon,
    required this.label,
  });

  final int index;
  final IconData icon;
  final String label;
}
