// lib/features/profile/profile_screen.dart
// CORRECTIONS :
//   1. TabController recréé si length change après chargement profil (évite crash)
//   2. Onglet Véhicule : champs liés à des controllers → sauvegarde fonctionnelle
//   3. _LabeledField accepte un controller optionnel

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_colors.dart';
import '../../core/converters/display_converters.dart';
import '../../core/services/api_service.dart';
import '../../core/services/auth_service.dart';

// ─── Models ───────────────────────────────────────────────────────────────────

class UsualTrip {
  final String departure;
  final String arrival;
  const UsualTrip({required this.departure, required this.arrival});
}

class ReviewItem {
  final String reviewerName;
  final String comment;
  final double rating;
  final String date;
  const ReviewItem({
    required this.reviewerName,
    required this.comment,
    required this.rating,
    required this.date,
  });
}

class PublicTrip {
  final String departure;
  final String arrival;
  final String date;
  final String time;
  final double price;
  final int seats;
  const PublicTrip({
    required this.departure,
    required this.arrival,
    required this.date,
    required this.time,
    required this.price,
    required this.seats,
  });
}

class UserProfile {
  String firstName;
  String lastName;
  String email;
  String? avatarUrl;
  bool isVerified;
  String schoolRole;
  String appRole;
  int goScore;
  int totalTrips;
  double averageRating;
  int co2SavedKg;
  bool showGoScore;
  bool showTripsCount;
  bool showRating;
  bool showCo2;
  bool musicAccepted;
  bool petsAccepted;
  bool smokingAccepted;
  String conversationLevel;
  bool emailPrimordiales;
  bool emailSecondaires;
  bool emailNegligeables;
  bool pushPrimordiales;
  bool pushSecondaires;
  bool pushNegligeables;
  bool showPhoneNumber;
  bool showLastName;
  bool allowAffinityTracking;
  List<String> languagesSpoken;
  List<UsualTrip> usualTrips;
  List<ReviewItem> reviews;
  List<PublicTrip> recentTrips;

  UserProfile({
    this.firstName = '',
    this.lastName = '',
    this.email = '',
    this.avatarUrl,
    this.isVerified = false,
    this.schoolRole = 'etudiant',
    this.appRole = 'Conducteur',
    this.goScore = 0,
    this.totalTrips = 0,
    this.averageRating = 0.0,
    this.co2SavedKg = 0,
    this.showGoScore = true,
    this.showTripsCount = true,
    this.showRating = true,
    this.showCo2 = true,
    this.musicAccepted = false,
    this.petsAccepted = false,
    this.smokingAccepted = false,
    this.conversationLevel = 'moderate',
    this.emailPrimordiales = true,
    this.emailSecondaires = true,
    this.emailNegligeables = false,
    this.pushPrimordiales = true,
    this.pushSecondaires = false,
    this.pushNegligeables = false,
    this.showPhoneNumber = false,
    this.showLastName = true,
    this.allowAffinityTracking = true,
    this.languagesSpoken = const ['Français', 'English'],
    this.usualTrips = const [],
    this.reviews = const [],
    this.recentTrips = const [],
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic v) {
      if (v is double) return v;
      if (v is num) return v.toDouble();
      return double.tryParse('$v') ?? 0;
    }

    int toInt(dynamic v) {
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse('$v') ?? 0;
    }

    final prefs = json['preferences'] as Map<String, dynamic>? ?? {};
    final notif = json['notifications'] as Map<String, dynamic>? ?? {};
    final privacy = json['privacy'] as Map<String, dynamic>? ?? {};
    final stats = json['stats'] as Map<String, dynamic>? ?? {};
    final visibility = json['visibility'] as Map<String, dynamic>? ?? {};

    return UserProfile(
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      avatarUrl: json['avatarUrl']?.toString(),
      isVerified: json['isVerified'] == true,
      schoolRole: json['schoolRole']?.toString() ?? 'etudiant',
      appRole: json['role']?.toString() ?? 'Conducteur',
      goScore: toInt(stats['goScore'] ?? json['goScore']),
      totalTrips: toInt(stats['totalTrips'] ?? json['totalTrips']),
      averageRating: toDouble(stats['averageRating'] ?? json['averageRating']),
      co2SavedKg: toInt(stats['co2SavedKg'] ?? json['co2SavedKg']),
      showGoScore: visibility['showGoScore'] != false,
      showTripsCount: visibility['showTripsCount'] != false,
      showRating: visibility['showRating'] != false,
      showCo2: visibility['showCo2'] != false,
      musicAccepted: prefs['musicAccepted'] == true,
      petsAccepted: prefs['petsAccepted'] == true,
      smokingAccepted: prefs['smokingAccepted'] == true,
      conversationLevel: prefs['conversationLevel']?.toString() ?? 'moderate',
      emailPrimordiales: notif['emailPrimordiales'] != false,
      emailSecondaires: notif['emailSecondaires'] != false,
      emailNegligeables: notif['emailNegligeables'] == true,
      pushPrimordiales: notif['pushPrimordiales'] != false,
      pushSecondaires: notif['pushSecondaires'] == true,
      pushNegligeables: notif['pushNegligeables'] == true,
      showPhoneNumber: privacy['showPhoneNumber'] == true,
      showLastName: privacy['showLastName'] != false,
      allowAffinityTracking: privacy['allowAffinityTracking'] != false,
      languagesSpoken: (json['languagesSpoken'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Français'],
    );
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with TickerProviderStateMixin {
  final ApiService _api = ApiService.instance;

  late TabController _tabController;

  List<String> get _tabs {
    final bool isDriver =
        _profile.appRole.toLowerCase().contains('conducteur') ||
            _profile.appRole.toLowerCase().contains('driver');
    return [
      'Mon Profil',
      'Visibilité',
      'Ambiance',
      'Notifications',
      'Confidentialité',
      if (isDriver) 'Véhicule',
      'Sécurité',
    ];
  }

  bool _isLoading = true;
  bool _saved = false;
  String? _error;

  late UserProfile _profile;

  // ── Profil controllers ────────────────────────────────────────────────────
  late TextEditingController _firstNameCtrl;
  late TextEditingController _lastNameCtrl;
  late TextEditingController _notifEmailCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _bioCtrl;
  String _schoolRole = 'etudiant';

  // ── Véhicule controllers ──────────────────────────────────────────────────
  late TextEditingController _vMakeCtrl;
  late TextEditingController _vModelCtrl;
  late TextEditingController _vYearCtrl;
  late TextEditingController _vColorCtrl;
  late TextEditingController _vPlateCtrl;
  int _vSeats = 3;

  static const Map<String, String> _schoolRoleItems = {
    'etudiant': 'Étudiant',
    'professeur': 'Professeur',
    'membredupersonnel': 'Membre du personnel',
    'administrateur': 'Administrateur',
  };

  @override
  void initState() {
    super.initState();
    _profile = UserProfile();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _firstNameCtrl = TextEditingController();
    _lastNameCtrl = TextEditingController();
    _notifEmailCtrl = TextEditingController();
    _phoneCtrl = TextEditingController();
    _bioCtrl = TextEditingController();
    _vMakeCtrl = TextEditingController();
    _vModelCtrl = TextEditingController();
    _vYearCtrl = TextEditingController();
    _vColorCtrl = TextEditingController();
    _vPlateCtrl = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _notifEmailCtrl.dispose();
    _phoneCtrl.dispose();
    _bioCtrl.dispose();
    _vMakeCtrl.dispose();
    _vModelCtrl.dispose();
    _vYearCtrl.dispose();
    _vColorCtrl.dispose();
    _vPlateCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dynamic data = await _api.get('/api/users/me');
      final Map<String, dynamic> json = DisplayConverters.extractMap(data);
      final Map<String, dynamic> displayJson =
          DisplayConverters.toProfileViewJson(json);
      if (!mounted) return;
      final profile = UserProfile.fromJson(displayJson);

      // Calculer l'ancienne longueur AVANT de mettre à jour _profile
      final int oldLen = _tabs.length;

      setState(() {
        _profile = profile;
        _firstNameCtrl.text = profile.firstName;
        _lastNameCtrl.text = profile.lastName;
        _notifEmailCtrl.text = profile.email;
        _schoolRole = _normalizeSchoolRole(profile.schoolRole);
        _isLoading = false;
      });

      // Recréer le TabController si le nombre d'onglets a changé
      // (ex: passager → conducteur ou inversement)
      if (_tabs.length != oldLen) {
        final int currentIndex =
            _tabController.index.clamp(0, _tabs.length - 1);
        _tabController.dispose();
        _tabController = TabController(
          length: _tabs.length,
          vsync: this,
          initialIndex: currentIndex,
        );
        if (mounted) setState(() {});
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _saveChanges() async {
    try {
      await _api.patch('/api/users/me', {
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim(),
        'notificationEmail': _notifEmailCtrl.text.trim().isEmpty
            ? null
            : _notifEmailCtrl.text.trim(),
        'phoneNumber':
            _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        'bio': _bioCtrl.text.trim().isEmpty ? null : _bioCtrl.text.trim(),
        'languagesSpoken': _profile.languagesSpoken,
        'canBeDriver': _profile.appRole.toLowerCase().contains('conducteur') ||
            _profile.appRole.toLowerCase().contains('driver'),
        'preferences': {
          'musicAccepted': _profile.musicAccepted,
          'petsAccepted': _profile.petsAccepted,
          'smokingAccepted': _profile.smokingAccepted,
          'conversationLevel': _profile.conversationLevel,
        },
        'notifications': {
          'emailPrimordiales': _profile.emailPrimordiales,
          'emailSecondaires': _profile.emailSecondaires,
          'emailNegligeables': _profile.emailNegligeables,
          'pushPrimordiales': _profile.pushPrimordiales,
          'pushSecondaires': _profile.pushSecondaires,
          'pushNegligeables': _profile.pushNegligeables,
        },
        'privacy': {
          'showPhoneNumber': _profile.showPhoneNumber,
          'showLastName': _profile.showLastName,
          'allowAffinityTracking': _profile.allowAffinityTracking,
        },
        'visibility': {
          'showGoScore': _profile.showGoScore,
          'showTripsCount': _profile.showTripsCount,
          'showRating': _profile.showRating,
          'showCo2': _profile.showCo2,
        },
      });
      await _loadProfile();
      if (!mounted) return;
      setState(() => _saved = true);
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) setState(() => _saved = false);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur: $e'),
          backgroundColor: AppColors.redMid,
        ),
      );
    }
  }

  // ── Véhicule ──────────────────────────────────────────────────────────────

  Future<void> _saveVehicleFromTab() async {
    final String make = _vMakeCtrl.text.trim();
    final String model = _vModelCtrl.text.trim();
    if (make.isEmpty || model.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Marque et modèle requis')),
      );
      return;
    }
    try {
      await _api.post('/api/vehicles', <String, dynamic>{
        'make': make,
        'model': model,
        'year': int.tryParse(_vYearCtrl.text.trim()) ?? 0,
        'color': _vColorCtrl.text.trim(),
        'licensePlate': _vPlateCtrl.text.trim(),
        'capacity': _vSeats,
        // Champs legacy pour le fixture
        'label': '$make $model'.trim(),
        'plate': _vPlateCtrl.text.trim(),
        'maxPassengers': _vSeats,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Véhicule enregistré')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur enregistrement véhicule: $e')),
      );
    }
  }

  // ── Langues ───────────────────────────────────────────────────────────────

  Future<void> _addLanguage() async {
    final TextEditingController ctrl = TextEditingController();
    final String? value = await showDialog<String>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        title: const Text('Ajouter une langue'),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: const InputDecoration(hintText: 'Ex: Espagnol'),
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => Navigator.of(dialogContext).pop(ctrl.text.trim()),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(dialogContext).pop(ctrl.text.trim()),
            child: const Text('Ajouter'),
          ),
        ],
      ),
    );
    final String lang = value?.trim() ?? '';
    if (lang.isEmpty) return;
    if (_profile.languagesSpoken
        .any((l) => l.toLowerCase() == lang.toLowerCase())) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Langue déjà présente')),
      );
      return;
    }
    setState(
        () => _profile.languagesSpoken = [..._profile.languagesSpoken, lang]);
  }

  // ── Mot de passe ──────────────────────────────────────────────────────────

  Future<void> _changePassword() async {
    final TextEditingController currentCtrl = TextEditingController();
    final TextEditingController nextCtrl = TextEditingController();
    final TextEditingController confirmCtrl = TextEditingController();

    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        title: const Text('Changer le mot de passe'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: currentCtrl,
              obscureText: true,
              decoration:
                  const InputDecoration(labelText: 'Mot de passe actuel'),
            ),
            TextField(
              controller: nextCtrl,
              obscureText: true,
              decoration:
                  const InputDecoration(labelText: 'Nouveau mot de passe'),
            ),
            TextField(
              controller: confirmCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Confirmer'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Valider'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final String nextPwd = nextCtrl.text.trim();
    if (nextPwd.isEmpty || nextPwd != confirmCtrl.text.trim()) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vérification du nouveau mot de passe invalide'),
        ),
      );
      return;
    }

    try {
      await _api.post('/api/users/change-password', <String, dynamic>{
        'currentPassword': currentCtrl.text,
        'newPassword': nextPwd,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mot de passe mis à jour')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur changement mot de passe: $e')),
      );
    }
  }

  // ── Suppression compte ────────────────────────────────────────────────────

  Future<void> _deleteAccount() async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        title: const Text('Supprimer le compte'),
        content: const Text(
          'Cette action supprime définitivement votre compte et déconnecte immédiatement le profil courant.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
            ),
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await _api.post('/api/users/me/delete', <String, dynamic>{});
      await AuthService(_api).logout();
      if (!mounted) return;
      context.go('/login');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Suppression impossible: $e')),
      );
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.blue)),
      );
    }
    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline,
                  size: 48, color: AppColors.redMid),
              const SizedBox(height: 12),
              Text(_error!),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadProfile,
                style:
                    ElevatedButton.styleFrom(backgroundColor: AppColors.blue),
                child: const Text('Réessayer',
                    style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    final bool isDriver =
        _profile.appRole.toLowerCase().contains('conducteur') ||
            _profile.appRole.toLowerCase().contains('driver');

    return Scaffold(
      backgroundColor: AppColors.grayBg,
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          _buildSliverHeader(),
          SliverToBoxAdapter(child: _buildIdentityCard()),
          SliverToBoxAdapter(child: _buildTabBar()),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildMonProfilTab(),
            _buildVisibiliteTab(),
            _buildAmbianceTab(),
            _buildNotificationsTab(),
            _buildConfidentialiteTab(),
            if (isDriver) _buildVehicleTab(),
            _buildSecurityTab(),
          ],
        ),
      ),
      bottomNavigationBar: _buildSaveButton(),
    );
  }

  // ── Sliver Header ─────────────────────────────────────────────────────────

  SliverAppBar _buildSliverHeader() {
    return SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      backgroundColor: AppColors.blue,
      centerTitle: true,
      title: const Text(
        'Mon Profil',
        style: TextStyle(
            fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white),
      ),
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
            ),
            Positioned(
              right: 12,
              bottom: 60,
              child: GestureDetector(
                onTap: _showChangeCoverSheet,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.15),
                        blurRadius: 6,
                      )
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.edit, size: 12, color: AppColors.blue),
                      const SizedBox(width: 4),
                      Text(
                        'Changer la photo\nde couverture',
                        style: TextStyle(
                          fontSize: 10,
                          color: AppColors.blue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 0,
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
                            ? Image.network(
                                _profile.avatarUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _initials(),
                              )
                            : _initials(),
                      ),
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: GestureDetector(
                        onTap: _showChangeAvatarSheet,
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: const Icon(Icons.camera_alt,
                              size: 14, color: Color(0xFF6B7280)),
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
    );
  }

  Widget _initials() => Container(
        color: const Color(0xFFBFDBFE),
        child: Center(
          child: Text(
            '${_profile.firstName.isNotEmpty ? _profile.firstName[0] : ''}${_profile.lastName.isNotEmpty ? _profile.lastName[0] : ''}',
            style: const TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.bold,
              color: AppColors.blue,
            ),
          ),
        ),
      );

  // ── Identity Card ─────────────────────────────────────────────────────────

  Widget _buildIdentityCard() {
    return Container(
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
                const Icon(Icons.verified, color: AppColors.blue, size: 20),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            _profile.schoolRole,
            style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
          ),
          Text(
            'Rôle — ${_profile.appRole}',
            style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
          ),
        ],
      ),
    );
  }

  // ── Tab Bar ───────────────────────────────────────────────────────────────

  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      child: TabBar(
        controller: _tabController,
        isScrollable: true,
        tabAlignment: TabAlignment.start,
        labelColor: AppColors.blue,
        unselectedLabelColor: const Color(0xFF6B7280),
        indicatorColor: AppColors.blue,
        indicatorWeight: 2.5,
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 13),
        tabs: _tabs.map((t) => Tab(text: t)).toList(),
      ),
    );
  }

  // ── Save Button ───────────────────────────────────────────────────────────

  Widget _buildSaveButton() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: ElevatedButton(
          onPressed: _saveChanges,
          style: ElevatedButton.styleFrom(
            backgroundColor: _saved ? AppColors.teal : AppColors.blue,
            foregroundColor: Colors.white,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            elevation: 0,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_saved ? Icons.check : Icons.save_outlined, size: 18),
              const SizedBox(width: 8),
              Text(
                _saved ? 'Enregistré !' : 'Enregistrer les modifications',
                style:
                    const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ONGLET 1 — MON PROFIL
  // ════════════════════════════════════════════════════════════

  Widget _buildMonProfilTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Mon Profil',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text(
            'Gérez vos données de base visibles par les autres membres.',
            style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 20),
          _sectionLabel('Courriel institutionnel'),
          _readonlyField(_profile.email),
          const SizedBox(height: 14),
          _sectionLabel('Courriel de notification (optionnel)'),
          _editableField(
            controller: _notifEmailCtrl,
            hint: 'ex: mon.email@gmail.com',
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionLabel('Prénom'),
                    _editableField(controller: _firstNameCtrl),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionLabel('Nom'),
                    _editableField(controller: _lastNameCtrl),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _sectionLabel('Téléphone'),
          _editableField(
            controller: _phoneCtrl,
            hint: 'ex: 613-555-0101',
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 14),
          _sectionLabel("Rôle à l'école"),
          _buildDropdown(
            value: _schoolRoleItems.containsKey(_schoolRole)
                ? _schoolRole
                : 'etudiant',
            items: _schoolRoleItems,
            onChanged: (v) => setState(() => _schoolRole = v!),
          ),
          const SizedBox(height: 14),
          _sectionLabel('Bio'),
          TextFormField(
            controller: _bioCtrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Ajoutez une bio pour vous présenter...',
              hintStyle:
                  const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
              filled: true,
              fillColor: Colors.white,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFF60A5FA)),
              ),
            ),
          ),
          const SizedBox(height: 14),
          _sectionLabel('Langues parlées'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ..._profile.languagesSpoken.map(
                (l) => Chip(
                  label: Text(l,
                      style: const TextStyle(
                          fontSize: 12, color: Color(0xFF1D4ED8))),
                  backgroundColor: const Color(0xFFEFF6FF),
                  side: BorderSide.none,
                  deleteIcon: const Icon(Icons.close,
                      size: 14, color: Color(0xFF93C5FD)),
                  onDeleted: () {
                    setState(() {
                      _profile.languagesSpoken = _profile.languagesSpoken
                          .where((x) => x != l)
                          .toList();
                    });
                  },
                ),
              ),
              ActionChip(
                label: const Text('+ Ajouter',
                    style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                backgroundColor: const Color(0xFFF9FAFB),
                side: const BorderSide(color: Color(0xFFE5E7EB)),
                onPressed: _addLanguage,
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildPublicProfilePreview(),
        ],
      ),
    );
  }

  Widget _buildPublicProfilePreview() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(),
        const SizedBox(height: 12),
        const Text('Aperçu du profil public',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.4,
          children: [
            _statCard(Icons.speed, const Color(0xFFDCFCE7),
                const Color(0xFF16A34A), 'Go Score', '${_profile.goScore}'),
            _statCard(Icons.directions_car, const Color(0xFFDDEFFE),
                const Color(0xFF2563EB), 'Trajets', '${_profile.totalTrips}'),
            _statCard(
                Icons.star,
                const Color(0xFFF3E8FF),
                const Color(0xFF9333EA),
                'Note',
                _profile.averageRating.toStringAsFixed(1)),
            _statCard(
                Icons.eco,
                const Color(0xFFDCFCE7),
                const Color(0xFF16A34A),
                'CO₂ évité',
                '${(_profile.co2SavedKg / 1000).toStringAsFixed(1)}T'),
          ],
        ),
      ],
    );
  }

  Widget _statCard(
      IconData icon, Color bg, Color iconColor, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
                color: bg, borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 10, color: Color(0xFF6B7280))),
                Text(value,
                    style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF111827))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ONGLET 2 — VISIBILITÉ
  // ════════════════════════════════════════════════════════════

  Widget _buildVisibiliteTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Visibilité du Profil',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text(
            'Contrôlez les informations visibles sur votre profil public.',
            style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 20),
          _toggleRow('Go Score (votre score global)', _profile.showGoScore,
              (v) => setState(() => _profile.showGoScore = v)),
          _toggleRow('Nombre de trajets (expérience)', _profile.showTripsCount,
              (v) => setState(() => _profile.showTripsCount = v)),
          _toggleRow('Note globale (évaluations moyennes)', _profile.showRating,
              (v) => setState(() => _profile.showRating = v)),
          _toggleRow('Économie CO₂ (impact écologique)', _profile.showCo2,
              (v) => setState(() => _profile.showCo2 = v)),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ONGLET 3 — AMBIANCE TRAJET
  // ════════════════════════════════════════════════════════════

  Widget _buildAmbianceTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Ambiance Trajet',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text(
            'Indiquez vos préférences pour une meilleure expérience collective.',
            style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 20),
          GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            children: [
              _ambianceTile(
                  Icons.chat_bubble_outline,
                  'Parler',
                  _profile.conversationLevel != 'quiet',
                  (v) => setState(() =>
                      _profile.conversationLevel = v ? 'moderate' : 'quiet')),
              _ambianceTile(Icons.music_note, 'Musique', _profile.musicAccepted,
                  (v) => setState(() => _profile.musicAccepted = v)),
              _ambianceTile(Icons.pets, 'Animaux', _profile.petsAccepted,
                  (v) => setState(() => _profile.petsAccepted = v)),
              _ambianceTile(
                  Icons.smoking_rooms,
                  'Fumer',
                  _profile.smokingAccepted,
                  (v) => setState(() => _profile.smokingAccepted = v)),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Niveau de conversation',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Row(
            children: ['quiet', 'moderate', 'chatty'].map((level) {
              final labels = {
                'quiet': 'Silencieux',
                'moderate': 'Modéré',
                'chatty': 'Bavard',
              };
              final selected = _profile.conversationLevel == level;
              return Expanded(
                child: GestureDetector(
                  onTap: () =>
                      setState(() => _profile.conversationLevel = level),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: selected ? const Color(0xFFEFF6FF) : Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color:
                            selected ? AppColors.blue : const Color(0xFFE5E7EB),
                        width: selected ? 2 : 1,
                      ),
                    ),
                    child: Text(
                      labels[level]!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight:
                            selected ? FontWeight.w600 : FontWeight.normal,
                        color:
                            selected ? AppColors.blue : const Color(0xFF6B7280),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _ambianceTile(
      IconData icon, String label, bool value, ValueChanged<bool> onChanged) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: value ? const Color(0xFFEFF6FF) : const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: value ? AppColors.blue : const Color(0xFFE5E7EB),
            width: value ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                size: 24,
                color: value ? AppColors.blue : const Color(0xFF9CA3AF)),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: value ? AppColors.blue : const Color(0xFF6B7280),
                )),
            const SizedBox(height: 4),
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: value ? AppColors.blue : Colors.transparent,
                border: Border.all(
                  color: value ? AppColors.blue : const Color(0xFFD1D5DB),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ONGLET 4 — NOTIFICATIONS
  // ════════════════════════════════════════════════════════════

  Widget _buildNotificationsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Notifications',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Configurez vos préférences de notification.',
              style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          const SizedBox(height: 20),
          _sectionHeader('Notifications par Email'),
          _notifCard('Réservations et annulations', _profile.emailPrimordiales,
              (v) => setState(() => _profile.emailPrimordiales = v)),
          _notifCard('Rappels et correspondances', _profile.emailSecondaires,
              (v) => setState(() => _profile.emailSecondaires = v)),
          _notifCard('Conseils et promotions', _profile.emailNegligeables,
              (v) => setState(() => _profile.emailNegligeables = v)),
          const SizedBox(height: 20),
          _sectionHeader('Notifications Push'),
          _notifCard('Réservations et annulations', _profile.pushPrimordiales,
              (v) => setState(() => _profile.pushPrimordiales = v)),
          _notifCard('Rappels et correspondances', _profile.pushSecondaires,
              (v) => setState(() => _profile.pushSecondaires = v)),
          _notifCard('Conseils et promotions', _profile.pushNegligeables,
              (v) => setState(() => _profile.pushNegligeables = v)),
        ],
      ),
    );
  }

  Widget _notifCard(String label, bool value, ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: ListTile(
        title: Text(label,
            style: const TextStyle(fontSize: 13, color: Color(0xFF374151))),
        trailing: _buildSwitch(value, onChanged),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ONGLET 5 — CONFIDENTIALITÉ
  // ════════════════════════════════════════════════════════════

  Widget _buildConfidentialiteTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Confidentialité',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Contrôlez qui peut voir vos informations personnelles.',
              style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          const SizedBox(height: 20),
          _privacyCard(
              'Afficher mon numéro de téléphone',
              'Les autres utilisateurs pourront voir votre numéro',
              _profile.showPhoneNumber,
              (v) => setState(() => _profile.showPhoneNumber = v)),
          _privacyCard(
              'Afficher mon nom de famille',
              'Affiche votre nom complet sur votre profil public',
              _profile.showLastName,
              (v) => setState(() => _profile.showLastName = v)),
          _privacyCard(
              "Suivi d'affinité",
              "Autoriser l'analyse de vos préférences pour améliorer les suggestions",
              _profile.allowAffinityTracking,
              (v) => setState(() => _profile.allowAffinityTracking = v)),
          const SizedBox(height: 30),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _showLogoutDialog,
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Déconnexion',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.redMid,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _privacyCard(String label, String description, bool value,
      ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF374151))),
                const SizedBox(height: 2),
                Text(description,
                    style: const TextStyle(
                        fontSize: 11, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          const SizedBox(width: 10),
          _buildSwitch(value, onChanged),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ONGLET 6 — VÉHICULE (conducteurs seulement)
  // ════════════════════════════════════════════════════════════

  Widget _buildVehicleTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _SectionCard(
          title: 'Mon véhicule',
          children: [
            _LabeledField(
              label: 'Marque',
              controller: _vMakeCtrl,
              hint: 'Toyota',
            ),
            const SizedBox(height: 12),
            _LabeledField(
              label: 'Modèle',
              controller: _vModelCtrl,
              hint: 'Corolla',
            ),
            const SizedBox(height: 12),
            _LabeledField(
              label: 'Année',
              controller: _vYearCtrl,
              hint: '2020',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            _LabeledField(
              label: 'Couleur',
              controller: _vColorCtrl,
              hint: 'Bleu nuit',
            ),
            const SizedBox(height: 12),
            _LabeledField(
              label: 'Plaque',
              controller: _vPlateCtrl,
              hint: 'ABC-1234',
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('Places disponibles',
                    style: TextStyle(fontSize: 13, color: Color(0xFF374151))),
                const Spacer(),
                Row(
                  children: [
                    IconButton(
                      onPressed:
                          _vSeats > 1 ? () => setState(() => _vSeats--) : null,
                      icon: const Icon(Icons.remove_circle_outline),
                      color: AppColors.blue,
                      iconSize: 22,
                    ),
                    Text('$_vSeats',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    IconButton(
                      onPressed:
                          _vSeats < 7 ? () => setState(() => _vSeats++) : null,
                      icon: const Icon(Icons.add_circle_outline),
                      color: AppColors.blue,
                      iconSize: 22,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _saveVehicleFromTab,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.blue,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 48),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: const Text('Enregistrer le véhicule'),
        ),
      ],
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ONGLET 7 — SÉCURITÉ
  // ════════════════════════════════════════════════════════════

  Widget _buildSecurityTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _SectionCard(
          title: 'Actions du compte',
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.logout, color: Color(0xFFDC2626)),
              title: const Text('Se déconnecter',
                  style: TextStyle(
                      color: Color(0xFFDC2626), fontWeight: FontWeight.w600)),
              onTap: _showLogoutDialog,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.lock_outline, color: AppColors.blue),
              title: const Text('Changer le mot de passe',
                  style: TextStyle(
                      color: AppColors.blue, fontWeight: FontWeight.w600)),
              onTap: _changePassword,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading:
                  const Icon(Icons.delete_forever, color: Color(0xFFDC2626)),
              title: const Text('Supprimer le compte',
                  style: TextStyle(
                      color: Color(0xFFDC2626), fontWeight: FontWeight.w600)),
              onTap: _deleteAccount,
            ),
          ],
        ),
      ],
    );
  }

  // ── Utility Widgets ───────────────────────────────────────────────────────

  Widget _sectionLabel(String label) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(label,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Color(0xFF374151))),
      );

  Widget _sectionHeader(String label) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(label,
            style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF374151))),
      );

  Widget _readonlyField(String value) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        decoration: BoxDecoration(
          color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Text(value,
            style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
      );

  Widget _editableField({
    required TextEditingController controller,
    String? hint,
    TextInputType keyboardType = TextInputType.text,
  }) =>
      TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        style: const TextStyle(fontSize: 13),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          suffixIcon:
              const Icon(Icons.edit, size: 14, color: Color(0xFF9CA3AF)),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF60A5FA)),
          ),
        ),
      );

  Widget _buildDropdown({
    required String value,
    required Map<String, String> items,
    required ValueChanged<String?> onChanged,
  }) =>
      DropdownButtonFormField<String>(
        value: value,
        decoration: InputDecoration(
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF60A5FA)),
          ),
        ),
        items: items.entries
            .map((e) => DropdownMenuItem(
                value: e.key,
                child: Text(e.value, style: const TextStyle(fontSize: 13))))
            .toList(),
        onChanged: onChanged,
      );

  String _normalizeSchoolRole(String raw) {
    final String normalized = raw
        .toLowerCase()
        .replaceAll('é', 'e')
        .replaceAll('è', 'e')
        .replaceAll('ê', 'e')
        .replaceAll('à', 'a')
        .replaceAll('â', 'a')
        .replaceAll("'", '')
        .replaceAll('-', '')
        .replaceAll(' ', '');

    if (_schoolRoleItems.containsKey(normalized)) return normalized;
    if (normalized.contains('prof')) return 'professeur';
    if (normalized.contains('admin')) return 'administrateur';
    if (normalized.contains('personnel') || normalized.contains('employ')) {
      return 'membredupersonnel';
    }
    return 'etudiant';
  }

  Widget _toggleRow(String label, bool value, ValueChanged<bool> onChanged) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            Expanded(
                child: Text(label,
                    style: const TextStyle(
                        fontSize: 13, color: Color(0xFF374151)))),
            _buildSwitch(value, onChanged),
          ],
        ),
      );

  Widget _buildSwitch(bool value, ValueChanged<bool> onChanged) =>
      GestureDetector(
        onTap: () => onChanged(!value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 46,
          height: 26,
          decoration: BoxDecoration(
            color: value ? AppColors.tealMid : const Color(0xFFD1D5DB),
            borderRadius: BorderRadius.circular(13),
          ),
          child: AnimatedAlign(
            duration: const Duration(milliseconds: 200),
            alignment: value ? Alignment.centerRight : Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.all(3),
              child: Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
        ),
      );

  // ── Bottom Sheets ─────────────────────────────────────────────────────────

  void _showChangeCoverSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: const Color(0xFFD1D5DB),
                    borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            const Text('Changer la photo de couverture',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ListTile(
              leading:
                  Icon(Icons.photo_library_outlined, color: AppColors.blue),
              title: const Text('Choisir depuis la galerie'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: Icon(Icons.camera_alt_outlined, color: AppColors.blue),
              title: const Text('Prendre une photo'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  void _showChangeAvatarSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: const Color(0xFFD1D5DB),
                    borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            const Text('Changer la photo de profil',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ListTile(
              leading:
                  Icon(Icons.photo_library_outlined, color: AppColors.blue),
              title: const Text('Choisir depuis la galerie'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: Icon(Icons.camera_alt_outlined, color: AppColors.blue),
              title: const Text('Prendre une photo'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading:
                  const Icon(Icons.delete_outline, color: AppColors.redMid),
              title: const Text('Supprimer la photo',
                  style: TextStyle(color: AppColors.redMid)),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Déconnexion',
            style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await AuthService(_api).logout();
              if (mounted) context.go('/login');
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.redMid,
                foregroundColor: Colors.white),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );
  }
}

// ── Shared Widgets ─────────────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Color(0xFF111827))),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}

/// Champ labellisé — accepte un controller OU une initialValue (pas les deux).
class _LabeledField extends StatelessWidget {
  const _LabeledField({
    required this.label,
    this.controller,
    this.initialValue,
    this.readOnly = false,
    this.hint,
    this.keyboardType,
    this.obscureText = false,
  });

  final String label;
  final TextEditingController? controller;
  final String? initialValue;
  final bool readOnly;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscureText;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF374151))),
        const SizedBox(height: 4),
        TextFormField(
          // Si controller fourni, ignorer initialValue (sinon erreur Flutter)
          controller: controller,
          initialValue: controller != null ? null : initialValue,
          readOnly: readOnly,
          keyboardType: keyboardType,
          obscureText: obscureText,
          style: const TextStyle(fontSize: 14, color: Color(0xFF111827)),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
            filled: true,
            fillColor: readOnly ? const Color(0xFFF9FAFB) : Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide:
                  const BorderSide(color: Color(0xFF1A56DB), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}
