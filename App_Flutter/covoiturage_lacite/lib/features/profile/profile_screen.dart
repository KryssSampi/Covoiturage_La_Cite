import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
// ...existing code...

  // ── SLIVER HEADER (Banner + Avatar) ──────────────────────────
  SliverAppBar _buildSliverHeader() {
    return SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      backgroundColor: AppColors.blue,
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
            // Banner image / gradient
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF1A3A6B), Color(0xFF0A5DA6)],
                ),
              ),
              child: Opacity(
                opacity: 0.15,
                child: Image.network(
                  'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                  errorBuilder: (_, __, ___) => const SizedBox(),
                ),
              ),
            ),
            // Bouton changer photo de couverture
            Positioned(
              right: 12,
              bottom: 60,
              child: GestureDetector(
                onTap: () => _showChangeCoverSheet(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 6)
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.edit, size: 12, color: AppColors.blue),
                      const SizedBox(width: 4),
                      Text(
                        'Changer la photo\nde couverture',
                        style: TextStyle(fontSize: 10, color: AppColors.blue, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            // Avatar
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
                            ? Image.network(_profile.avatarUrl!, fit: BoxFit.cover)
                            : Container(
                                color: const Color(0xFFBFDBFE),
                                child: Center(
                                  child: Text(
                                    '${_profile.firstName[0]}${_profile.lastName[0]}',
                                    style: const TextStyle(
                                      fontSize: 30,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.blue,
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
                        onTap: () => _showChangeAvatarSheet(),
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
    );
  }

  // ── IDENTITÉ ──────────────────────────────────────────────────
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
    );
  }

  // ── TABBAR ────────────────────────────────────────────────────
  Widget _buildTabBar() {
    return Container(
      color: Colors.white,
      child: TabBar(
        controller: _tabController,
        isScrollable: true,
        tabAlignment: TabAlignment.start,
        labelColor: AppColors.blueLight,
        unselectedLabelColor: const Color(0xFF6B7280),
        indicatorColor: AppColors.blueLight,
        indicatorWeight: 2.5,
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 13),
        tabs: _tabs.map((t) => Tab(text: t)).toList(),
      ),
    );
  }

  // ── SAVE BUTTON ───────────────────────────────────────────────
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
            backgroundColor: _saved ? AppColors.green : AppColors.blueLight,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            elevation: 0,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_saved ? Icons.check : Icons.save_outlined, size: 18),
              const SizedBox(width: 8),
              Text(
                _saved ? 'Enregistré !' : 'Enregistrer les modifications',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
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

          // Courriel institutionnel (lecture seule)
          _sectionLabel('Courriel institutionnel'),
          _readonlyField(_profile.email),
          const SizedBox(height: 14),

          // Courriel notification
          _sectionLabel('Courriel de notification (optionnel)'),
          _editableField(
            controller: _notifEmailCtrl,
            hint: 'ex: mon.email@gmail.com',
            keyboardType: TextInputType.emailAddress,
          ),
          const Padding(
            padding: EdgeInsets.only(top: 4, bottom: 14),
            child: Text(
              'Recevez vos notifications sur ce courriel secondaire.',
              style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
            ),
          ),

          // Prénom & Nom
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

          // Téléphone
          _sectionLabel('Téléphone'),
          _editableField(
            controller: _phoneCtrl,
            hint: 'ex: 613-555-0101',
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 14),

          // Rôle à l'école
          _sectionLabel('Rôle à l\'école'),
          _buildDropdown(
            value: _schoolRole,
            items: const {
              'etudiant': 'Étudiant',
              'professeur': 'Professeur',
              'membredupersonnel': 'Membre du personnel',
              'administrateur': 'Administrateur',
            },
            onChanged: (v) => setState(() => _schoolRole = v!),
          ),
          const SizedBox(height: 14),

          // Bio
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

          // Langues parlées
          _sectionLabel('Langues parlées'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ..._profile.languagesSpoken.map(
                (l) => Chip(
                  label: Text(l, style: const TextStyle(fontSize: 12, color: Color(0xFF1D4ED8))),
                  backgroundColor: const Color(0xFFEFF6FF),
                  side: BorderSide.none,
                  deleteIcon: const Icon(Icons.close, size: 14, color: Color(0xFF93C5FD)),
                  onDeleted: () {},
                ),
              ),
              ActionChip(
                label: const Text('+ Ajouter', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                backgroundColor: const Color(0xFFF9FAFB),
                side: const BorderSide(color: Color(0xFFE5E7EB)),
                onPressed: () {},
              ),
            ],
          ),
          const SizedBox(height: 24),

          // ── Aperçu profil public ──
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
        const Text(
          'Aperçu du profil public',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),

        // Stats
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.4,
          children: [
            _statCard(Icons.speed, const Color(0xFFDCFCE7), const Color(0xFF16A34A), 'Go Score', '${_profile.goScore}'),
            _statCard(Icons.directions_car, const Color(0xFFDDEFFE), const Color(0xFF2563EB), 'Trajets', '${_profile.totalTrips}'),
            _statCard(Icons.star, const Color(0xFFF3E8FF), const Color(0xFF9333EA), 'Note', _profile.averageRating.toStringAsFixed(1)),
            _statCard(Icons.eco, const Color(0xFFDCFCE7), const Color(0xFF16A34A), 'CO₂ évité', '${(_profile.co2SavedKg / 1000).toStringAsFixed(1)}T'),
          ],
        ),
        const SizedBox(height: 16),

        // Trajets habituels
        if (_profile.usualTrips.isNotEmpty) ...[
          const Text('Trajets habituels', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ..._profile.usualTrips.map((t) => _usualTripCard(t)),
          const SizedBox(height: 16),
        ],

        // Derniers avis
        if (_profile.reviews.isNotEmpty) ...[
          const Text('Derniers avis', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ..._profile.reviews.take(2).map((r) => _reviewCard(r)),
          const SizedBox(height: 16),
        ],

        // Trajets publiés
        if (_profile.recentTrips.isNotEmpty) ...[
          const Text('Trajets publiés', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ..._profile.recentTrips.map((t) => _tripCard(t)),
        ],
      ],
    );
  }

  Widget _statCard(IconData icon, Color bg, Color iconColor, String label, String value) {
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
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF6B7280))),
                Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF111827))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _usualTripCard(UsualTrip trip) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Row(
        children: [
          Expanded(child: Text(trip.departure, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500))),
          const Icon(Icons.arrow_forward, size: 14, color: AppColors.blue),
          const SizedBox(width: 6),
          Expanded(child: Text(trip.arrival, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500))),
          const Spacer(),
          _pillButton(
            label: 'S\'abonner',
            icon: Icons.notifications_outlined,
            color: const Color(0xFF1A56DB),
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _reviewCard(ReviewItem r) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: const Color(0xFFBFDBFE),
            child: Text(r.reviewerName[0], style: const TextStyle(color: AppColors.blue, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(r.reviewerName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.blue)),
                    const SizedBox(width: 6),
                    Text(r.date, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                  ],
                ),
                const SizedBox(height: 2),
                Text(r.comment, style: const TextStyle(fontSize: 12, color: Color(0xFF4B5563))),
              ],
            ),
          ),
          _starRating(r.rating),
        ],
      ),
    );
  }

  Widget _tripCard(PublicTrip trip) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 12, color: Color(0xFF3B82F6)),
                    const SizedBox(width: 4),
                    Text(trip.departure, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4),
                      child: Icon(Icons.arrow_forward, size: 10, color: Color(0xFF9CA3AF)),
                    ),
                    Flexible(child: Text(trip.arrival, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
                  ],
                ),
                const SizedBox(height: 2),
                Text('${trip.date} · ${trip.time}', style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('${trip.price.toStringAsFixed(0)}\$', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1A56DB))),
              Text('${trip.seats} place${trip.seats > 1 ? 's' : ''}', style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
            ],
          ),
          const SizedBox(width: 8),
          _pillButton(label: 'Réserver', icon: Icons.add_circle_outline, color: const Color(0xFF1A56DB), onTap: () {}),
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
          const Text('Visibilité du Profil', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Contrôlez les informations visibles sur votre profil public.', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          const SizedBox(height: 20),
          _toggleRow('Go Score (votre score global)', _profile.showGoScore, (v) => setState(() => _profile.showGoScore = v)),
          _toggleRow('Nombre de trajets (expérience)', _profile.showTripsCount, (v) => setState(() => _profile.showTripsCount = v)),
          _toggleRow('Note globale (évaluations moyennes)', _profile.showRating, (v) => setState(() => _profile.showRating = v)),
          _toggleRow('Économie CO₂ (impact écologique)', _profile.showCo2, (v) => setState(() => _profile.showCo2 = v)),
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
          const Text('Ambiance Trajet', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Indiquez vos préférences pour une meilleure expérience collective.', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          const SizedBox(height: 20),
          GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            children: [
              _ambianceTile(Icons.chat_bubble_outline, 'Parler', _profile.conversationLevel != 'quiet',
                  (v) => setState(() => _profile.conversationLevel = v ? 'moderate' : 'quiet')),
              _ambianceTile(Icons.music_note, 'Musique', _profile.musicAccepted,
                  (v) => setState(() => _profile.musicAccepted = v)),
              _ambianceTile(Icons.pets, 'Animaux', _profile.petsAccepted,
                  (v) => setState(() => _profile.petsAccepted = v)),
              _ambianceTile(Icons.smoking_rooms, 'Fumer', _profile.smokingAccepted,
                  (v) => setState(() => _profile.smokingAccepted = v)),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Niveau de conversation', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Row(
            children: ['quiet', 'moderate', 'chatty'].map((level) {
              final labels = {'quiet': 'Silencieux', 'moderate': 'Modéré', 'chatty': 'Bavard'};
              final selected = _profile.conversationLevel == level;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _profile.conversationLevel = level),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: selected ? const Color(0xFFEFF6FF) : Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: selected ? AppColors.blueLight : const Color(0xFFE5E7EB), width: selected ? 2 : 1),
                    ),
                    child: Text(labels[level]!, textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: selected ? FontWeight.w600 : FontWeight.normal, color: selected ? AppColors.blueLight : const Color(0xFF6B7280))),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _ambianceTile(IconData icon, String label, bool value, ValueChanged<bool> onChanged) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: value ? const Color(0xFFEFF6FF) : const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: value ? AppColors.blueLight : const Color(0xFFE5E7EB), width: value ? 2 : 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 24, color: value ? AppColors.blueLight : const Color(0xFF9CA3AF)),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: value ? AppColors.blueLight : const Color(0xFF6B7280))),
            const SizedBox(height: 4),
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: value ? AppColors.blueLight : Colors.transparent,
                border: Border.all(color: value ? AppColors.blueLight : const Color(0xFFD1D5DB)),
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
          const Text('Notifications', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Configurez vos préférences de notification.', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          const SizedBox(height: 20),

          _sectionHeader('Notifications par Email'),
          _notifCard('Réservations et annulations', _profile.emailPrimordiales, (v) => setState(() => _profile.emailPrimordiales = v)),
          _notifCard('Rappels et correspondances', _profile.emailSecondaires, (v) => setState(() => _profile.emailSecondaires = v)),
          _notifCard('Conseils et promotions', _profile.emailNegligeables, (v) => setState(() => _profile.emailNegligeables = v)),

          const SizedBox(height: 20),
          _sectionHeader('Notifications Push'),
          _notifCard('Réservations et annulations', _profile.pushPrimordiales, (v) => setState(() => _profile.pushPrimordiales = v)),
          _notifCard('Rappels et correspondances', _profile.pushSecondaires, (v) => setState(() => _profile.pushSecondaires = v)),
          _notifCard('Conseils et promotions', _profile.pushNegligeables, (v) => setState(() => _profile.pushNegligeables = v)),
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
        title: Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF374151))),
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
          const Text('Confidentialité', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Contrôlez qui peut voir vos informations personnelles.', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          const SizedBox(height: 20),
          _privacyCard('Afficher mon numéro de téléphone', 'Les autres utilisateurs pourront voir votre numéro', _profile.showPhoneNumber, (v) => setState(() => _profile.showPhoneNumber = v)),
          _privacyCard('Afficher mon nom de famille', 'Affiche votre nom complet sur votre profil public', _profile.showLastName, (v) => setState(() => _profile.showLastName = v)),
          _privacyCard('Suivi d\'affinité', 'Autoriser l\'analyse de vos préférences pour améliorer les suggestions', _profile.allowAffinityTracking, (v) => setState(() => _profile.allowAffinityTracking = v)),
          const SizedBox(height: 30),

          // Déconnexion
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: () => _showLogoutDialog(),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Déconnexion', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.red,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _privacyCard(String label, String description, bool value, ValueChanged<bool> onChanged) {
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
                Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
                const SizedBox(height: 2),
                Text(description, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          const SizedBox(width: 10),
          _buildSwitch(value, onChanged),
        ],
      ),
    );
  }

// ===========================================================================
// ONGLET 4 — VEHICULE
// ===========================================================================
class _VehicleTab extends StatelessWidget {
  const _VehicleTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _SectionCard(
          title: 'Mon vehicule',
          children: [
            _LabeledField(label: 'Marque', initialValue: 'Honda'),
            const SizedBox(height: 12),
            _LabeledField(label: 'Modele', initialValue: 'Civic'),
            const SizedBox(height: 12),
            _LabeledField(label: 'Annee', initialValue: '2019',
                keyboardType: TextInputType.number),
            const SizedBox(height: 12),
            _LabeledField(label: 'Couleur', initialValue: 'Gris'),
            const SizedBox(height: 12),
            _LabeledField(label: 'Plaque', initialValue: 'ABC-123'),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('Places disponibles',
                    style:
                        TextStyle(fontSize: 13, color: Color(0xFF374151))),
                const Spacer(),
                _SeatsCounter(),
              ],
            ),
          ],
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1A56DB),
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 48),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
          ),
          child: const Text('Enregistrer le vehicule'),
        ),
      ],
    );
  }
}

class _SeatsCounter extends StatefulWidget {
  @override
  State<_SeatsCounter> createState() => _SeatsCounterState();
}

class _SeatsCounterState extends State<_SeatsCounter> {
  int _seats = 3;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          onPressed: _seats > 1 ? () => setState(() => _seats--) : null,
          icon: const Icon(Icons.remove_circle_outline),
          color: const Color(0xFF1A56DB),
          iconSize: 22,
        ),
        Text('$_seats',
            style: const TextStyle(
                fontSize: 16, fontWeight: FontWeight.bold)),
        IconButton(
          onPressed: _seats < 7 ? () => setState(() => _seats++) : null,
          icon: const Icon(Icons.add_circle_outline),
          color: const Color(0xFF1A56DB),
          iconSize: 22,
        ),
      ],
    );
  }
}

// ===========================================================================
// ONGLET 5 — SECURITE
// ===========================================================================
class _SecurityTab extends StatelessWidget {
  const _SecurityTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _SectionCard(
          title: 'Mot de passe',
          children: [
            _LabeledField(
              label: 'Mot de passe actuel',
              obscureText: true,
            ),
            const SizedBox(height: 12),
            _LabeledField(
              label: 'Nouveau mot de passe',
              obscureText: true,
            ),
            const SizedBox(height: 12),
            _LabeledField(
              label: 'Confirmer le mot de passe',
              obscureText: true,
            ),
          ],
        ),
        const SizedBox(height: 16),
        _SectionCard(
          title: 'Sessions actives',
          children: [
            _SessionItem(
              device: 'iPhone 14',
              location: 'Montreal, QC',
              isCurrent: true,
            ),
            const Divider(height: 24),
            _SessionItem(
              device: 'MacBook Pro',
              location: 'Laval, QC',
              isCurrent: false,
            ),
          ],
        ),
        const SizedBox(height: 16),
        _SectionCard(
          title: 'Danger',
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.logout, color: Color(0xFFDC2626)),
              title: const Text('Se deconnecter',
                  style: TextStyle(
                      color: Color(0xFFDC2626),
                      fontWeight: FontWeight.w600)),
              onTap: () {
                // TODO : logout
              },
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.delete_forever,
                  color: Color(0xFFDC2626)),
              title: const Text('Supprimer le compte',
                  style: TextStyle(
                      color: Color(0xFFDC2626),
                      fontWeight: FontWeight.w600)),
              onTap: () {
                // TODO : delete account dialog
              },
            ),
          ],
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1A56DB),
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 48),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
          ),
          child: const Text('Changer le mot de passe'),
        ),
      ],
    );
  }
}

class _SessionItem extends StatelessWidget {
  final String device;
  final String location;
  final bool isCurrent;

  const _SessionItem({
    required this.device,
    required this.location,
    required this.isCurrent,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          device.contains('iPhone') || device.contains('Android')
              ? Icons.smartphone_rounded
              : Icons.laptop_mac_rounded,
          color: const Color(0xFF6B7280),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(device,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: Color(0xFF111827))),
              Text(location,
                  style: const TextStyle(
                      fontSize: 12, color: Color(0xFF6B7280))),
            ],
          ),
        ),
        if (isCurrent)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text('Actuelle',
                style: TextStyle(
                    fontSize: 11,
                    color: Color(0xFF1A56DB),
                    fontWeight: FontWeight.w600)),
          )
        else
          TextButton(
            onPressed: () {},
            child: const Text('Revoquer',
                style:
                    TextStyle(fontSize: 12, color: Color(0xFFDC2626))),
          ),
      ],
    );
  }
}

  // ──────────────────────────────────────────────────────────────
  //  WIDGETS UTILITAIRES
  // ──────────────────────────────────────────────────────────────

  Widget _sectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
    );
  }

  Widget _sectionHeader(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
    );
  }

  Widget _readonlyField(String value) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Text(value, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
    );
  }

  Widget _editableField({
    required TextEditingController controller,
    String? hint,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        suffixIcon: const Icon(Icons.edit, size: 14, color: Color(0xFF9CA3AF)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required Map<String, String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
      ),
      items: items.entries
          .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 13))))
          .toList(),
      onChanged: onChanged,
    );
  }

  Widget _toggleRow(String label, bool value, ValueChanged<bool> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF374151)))),
          _buildSwitch(value, onChanged),
        ],
      ),
    );
  }

  Widget _buildSwitch(bool value, ValueChanged<bool> onChanged) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 46,
        height: 26,
        decoration: BoxDecoration(
          color: value ? kGreen : const Color(0xFFD1D5DB),
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
              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
            ),
          ),
        ),
      ),
    );
  }

  Widget _starRating(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        if (i < rating.floor()) return const Icon(Icons.star, size: 14, color: Color(0xFFF59E0B));
        if (i < rating) return const Icon(Icons.star_half, size: 14, color: Color(0xFFF59E0B));
        return const Icon(Icons.star_border, size: 14, color: Color(0xFFD1D5DB));
      }),
    );
  }

  Widget _pillButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 11, color: Colors.white),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────
  //  BOTTOM SHEETS & DIALOGS
  // ──────────────────────────────────────────────────────────────

  void _showChangeCoverSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFD1D5DB), borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            const Text('Changer la photo de couverture', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ListTile(leading: const Icon(Icons.photo_library_outlined, color: AppColors.blue), title: const Text('Choisir depuis la galerie'), onTap: () => Navigator.pop(context)),
            ListTile(leading: const Icon(Icons.camera_alt_outlined, color: AppColors.blue), title: const Text('Prendre une photo'), onTap: () => Navigator.pop(context)),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _showChangeAvatarSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFD1D5DB), borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            const Text('Changer la photo de profil', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ListTile(leading: const Icon(Icons.photo_library_outlined, color: kPrimary), title: const Text('Choisir depuis la galerie'), onTap: () => Navigator.pop(context)),
            ListTile(leading: const Icon(Icons.camera_alt_outlined, color: kPrimary), title: const Text('Prendre une photo'), onTap: () => Navigator.pop(context)),
            ListTile(leading: const Icon(Icons.delete_outline, color: AppColors.red), title: const Text('Supprimer la photo', style: TextStyle(color: AppColors.red)), onTap: () => Navigator.pop(context)),
            const SizedBox(height: 8),
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
        title: const Text('Déconnexion', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.red, foregroundColor: Colors.white),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );
  }
}

// ===========================================================================
// WIDGETS COMMUNS
// ===========================================================================

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color iconColor;

  const _StatChip({
    required this.icon,
    required this.value,
    required this.label,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor, size: 18),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: Color(0xFF111827))),
              Text(label,
                  style: const TextStyle(
                      fontSize: 11, color: Color(0xFF6B7280))),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SectionCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
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

class _LabeledField extends StatelessWidget {
  final String label;
  final TextEditingController? controller;
  final String? initialValue;
  final bool readOnly;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscureText;

  const _LabeledField({
    required this.label,
    this.controller,
    this.initialValue,
    this.readOnly = false,
    this.hint,
    this.keyboardType,
    this.obscureText = false,
  });

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
          controller: controller,
          initialValue: controller == null ? initialValue : null,
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
              borderSide: const BorderSide(
                  color: Color(0xFF1A56DB), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

class _PreferenceToggle extends StatefulWidget {
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _PreferenceToggle({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  @override
  State<_PreferenceToggle> createState() => _PreferenceToggleState();
}

class _PreferenceToggleState extends State<_PreferenceToggle> {
  late bool _value;

  @override
  void initState() {
    super.initState();
    _value = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: Text(widget.label,
                style: const TextStyle(
                    fontSize: 13, color: Color(0xFF374151))),
          ),
          Switch(
            value: _value,
            onChanged: (v) {
              setState(() => _value = v);
              widget.onChanged(v);
            },
            activeColor: const Color(0xFF1A56DB),
          ),
        ],
      ),
    );
  }
}
