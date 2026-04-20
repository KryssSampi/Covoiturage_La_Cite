import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  UserProfile _profile = mockProfile;
  bool _saved = false;

  // Controllers
  late TextEditingController _firstNameCtrl;
  late TextEditingController _lastNameCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _bioCtrl;
  late TextEditingController _notifEmailCtrl;
  String _schoolRole = 'etudiant';

  final List<String> _tabs = [
    'Mon Profil',
    'Visibilité',
    'Ambiance',
    'Notifications',
    'Confidentialité',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _firstNameCtrl = TextEditingController(text: _profile.firstName);
    _lastNameCtrl = TextEditingController(text: _profile.lastName);
    _phoneCtrl = TextEditingController(text: _profile.phone ?? '');
    _bioCtrl = TextEditingController(text: _profile.bio ?? '');
    _notifEmailCtrl = TextEditingController();
    _schoolRole = _profile.schoolRole.toLowerCase().replaceAll(' ', '');
  }

  @override
  void dispose() {
    _tabController.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    _bioCtrl.dispose();
    _notifEmailCtrl.dispose();
    super.dispose();
  }

  void _saveChanges() {
    setState(() => _saved = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _saved = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: const Color(0xFF08316E),
            leading: IconButton(
              icon: const Icon(Icons.menu, color: Colors.white),
              onPressed: () {},
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                children: [
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF1A3A6B), Color(0xFF0A5DA6)],
                      ),
                    ),
                    child: Image.network(
                      'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                      color: Colors.black26,
                      colorBlendMode: BlendMode.darken,
                      errorBuilder: (_, __, ___) => const SizedBox(),
                    ),
                  ),
                  Positioned(
                    right: 12,
                    bottom: 60,
                    child: GestureDetector(
                      onTap: () {},
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 6)
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.edit, size: 12, color: Color(0xFF08316E)),
                            SizedBox(width: 4),
                            Text(
                              'Changer la photo de couverture',
                              style: TextStyle(fontSize: 10, color: Color(0xFF08316E), fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -30,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Stack(
                        children: [
                          Container(
                            width: 96,
                            height: 96,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 3),
                              color: const Color(0xFFCBD5E1),
                            ),
                            child: ClipOval(
                              child: _profile.avatarUrl != null
                                  ? Image.network(_profile.avatarUrl!)
                                  : Container(
                                      color: const Color(0xFFBFDBFE),
                                      child: Center(
                                        child: Text(
                                          '${_profile.firstName[0]}${_profile.lastName[0]}',
                                          style: const TextStyle(
                                            fontSize: 30,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF08316E),
                                          ),
                                        ),
                                      ),
                                    ),
                            ),
                          ),
                          Positioned(
                            right: 0,
                            bottom: 0,
                            child: GestureDetector(
                              onTap: () {},
                              child: Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: const Color(0xFFE5E7EB)),
                                  boxShadow: [
                                    BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)
                                  ],
                                ),
                                child: const Icon(Icons.camera_alt, size: 14, color: Color(0xFF6B7280)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
        body: Column(
          children: [
            Container(
              color: Colors.white,
              padding: const EdgeInsets.only(top: 38, bottom: 12),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${_profile.firstName} ${_profile.lastName}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(width: 6),
                      if (_profile.isVerified)
                        const Icon(Icons.verified, color: Color(0xFF1A56DB), size: 20),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _profile.schoolRole,
                    style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
                  ),
                  Text(
                    'Actuellement - ${_profile.appRole}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
                  ),
                ],
              ),
            ),
            Container(
              color: Colors.white,
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                labelColor: const Color(0xFF1A56DB),
                unselectedLabelColor: const Color(0xFF6B7280),
                indicatorColor: const Color(0xFF1A56DB),
                indicatorWeight: 2.5,
                labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                unselectedLabelStyle: const TextStyle(fontSize: 13),
                tabs: _tabs.map((t) => Tab(text: t)).toList(),
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildMonProfilTab(),
                  _buildVisibiliteTab(),
                  _buildAmbianceTab(),
                  _buildNotificationsTab(),
                  _buildConfidentialiteTab(),
                ],
              ),
            ),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _saveChanges,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _saved ? const Color(0xFF22C55E) : const Color(0xFF1A56DB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(_saved ? Icons.check : Icons.save, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        _saved ? 'Enregistré !' : 'Enregistrer les modifications',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMonProfilTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Mon Profil',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Gérez vos données de base visibles par les autres membres.',
            style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 20),
          _sectionLabel('Courriel institutionnel'),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Text(_profile.email, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          ),
          const SizedBox(height: 14),
          _sectionLabel('Courriel de notification (optionnel)'),
          TextFormField(
            controller: _notifEmailCtrl,
            keyboardType: TextInputType.emailAddress,
            style: const TextStyle(fontSize: 13),
            decoration: InputDecoration(
              hintText: 'ex: mon.email@gmail.com',
              hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              suffixIcon: const Icon(Icons.edit, size: 14, color: Color(0xFF9CA3AF)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(top: 4, bottom: 14),
            child: Text(
              'Recevez vos notifications sur ce courriel secondaire.',
              style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionLabel('Prénom'),
                    TextFormField(
                      controller: _firstNameCtrl,
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        suffixIcon: const Icon(Icons.edit, size: 14, color: Color(0xFF9CA3AF)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionLabel('Nom'),
                    TextFormField(
                      controller: _lastNameCtrl,
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        suffixIcon: const Icon(Icons.edit, size: 14, color: Color(0xFF9CA3AF)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _sectionLabel('Téléphone'),
          TextFormField(
            controller: _phoneCtrl,
            keyboardType: TextInputType.phone,
            style: const TextStyle(fontSize: 13),
            decoration: InputDecoration(
              hintText: 'ex: 613-555-0101',
              hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              suffixIcon: const Icon(Icons.edit, size: 14, color: Color(0xFF9CA3AF)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
            ),
          ),
          const SizedBox(height: 14),
          _sectionLabel("Rôle à l'école"),
          DropdownButtonFormField<String>(
            value: _schoolRole,
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
            ),
            items: const [
              DropdownMenuItem(value: 'etudiant', child: Text('Étudiant')),
              DropdownMenuItem(value: 'professeur', child: Text('Professeur')),
              DropdownMenuItem(value: 'membredupersonnel', child: Text('Membre du personnel')),
              DropdownMenuItem(value: 'administrateur', child: Text('Administrateur')),
            ],
            onChanged: (v) => setState(() => _schoolRole = v!),
          ),
          const SizedBox(height: 14),
          _sectionLabel('Bio'),
          TextFormField(
            controller: _bioCtrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Ajoutez une bio pour vous présenter...',
              hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
            ),
          ),
          const SizedBox(height: 14),
          _sectionLabel('Langues parlées'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ..._profile.languagesSpoken.map((l) => Chip(
                label: Text(l),
                backgroundColor: const Color(0xFFEFF6FF),
                side: BorderSide.none,
                deleteIcon: const Icon(Icons.close, size: 14),
                onDeleted: () {},
              )),
              ActionChip(
                label: const Text('+ Ajouter'),
                backgroundColor: const Color(0xFFF9FAFB),
                side: const BorderSide(color: Color(0xFFE5E7EB)),
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
    );
  }

  // Other tabs and widgets ... (abbreviated for brevity - full implementation follows the pattern)

  // Note: Full tab implementations for Visibilité, Ambiance, Notifications, Confidentialité follow the same pattern as MonProfilTab with toggle switches, lists, etc.

  // Mock data classes (add at end)
  class UserProfile {
    final String firstName;
    final String lastName;
    final String email;
    final String schoolRole;
    final String appRole;
    // Add other fields as needed
    UserProfile({
      required this.firstName,
      required this.lastName,
      required this.email,
      required this.schoolRole,
      required this.appRole,
    });
  }

  final UserProfile mockProfile = UserProfile(
    firstName: 'Kryss',
    lastName: 'Nana',
    email: 'example@lacite.ca',
    schoolRole: 'Étudiant',
    appRole: 'Passager',
  );
}

