// lib/features/settings/app_settings_screen.dart
// Paramètres de l'application — La Cité Covoiturage
// Config app uniquement : affichage · accessibilité · PIN local · cache · confidentialité · aide · à propos

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/app_colors.dart';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const _kVersion    = '1.4.2';
const _kBuild      = '2026.04';
const _kSupportUrl = 'https://lacite.ca/support';
const _kPrivacyUrl = 'https://lacite.ca/confidentialite';
const _kTermsUrl   = 'https://lacite.ca/conditions';
const _kStoreUrl   = 'https://apps.apple.com/app/la-cite';

// ─── CLÉS SharedPreferences ───────────────────────────────────────────────────

const _kPrefDarkMode      = 'pref_dark_mode';
const _kPrefCompact       = 'pref_compact';
const _kPrefLanguage      = 'pref_language';
const _kPrefDistanceUnit  = 'pref_distance_unit';
const _kPrefTextScale     = 'pref_text_scale';
const _kPrefHighContrast  = 'pref_high_contrast';
const _kPrefReduceMotion  = 'pref_reduce_motion';
const _kPrefAnalytics     = 'pref_analytics';
const _kPrefCrashReports  = 'pref_crash_reports';
const _kPrefPinEnabled    = 'pref_pin_enabled';
const _kPrefPinCode       = 'pref_pin_code';

// ─── HELPERS TYPO ─────────────────────────────────────────────────────────────

TextStyle _sora({
  double size = 14,
  FontWeight weight = FontWeight.w600,
  Color color = AppColors.text1,
}) =>
    GoogleFonts.sora(fontSize: size, fontWeight: weight, color: color);

TextStyle _dm({
  double size = 13,
  FontWeight weight = FontWeight.w400,
  Color color = AppColors.text2,
}) =>
    GoogleFonts.dmSans(fontSize: size, fontWeight: weight, color: color);

// ─── SCREEN ───────────────────────────────────────────────────────────────────

class AppSettingsScreen extends StatefulWidget {
  const AppSettingsScreen({super.key});

  @override
  State<AppSettingsScreen> createState() => _AppSettingsScreenState();
}

class _AppSettingsScreenState extends State<AppSettingsScreen> {
  // ── Affichage ──────────────────────────────────────────
  bool   _darkMode     = false;
  bool   _compactMode  = false;
  String _language     = 'fr';
  String _distanceUnit = 'km';

  // ── Accessibilité ──────────────────────────────────────
  double _textScale    = 1.0;
  bool   _highContrast = false;
  bool   _reduceMotion = false;

  // ── PIN local ──────────────────────────────────────────
  bool _pinEnabled = false;

  // ── Confidentialité ────────────────────────────────────
  bool _analytics    = true;
  bool _crashReports = true;

  // ── Cache ──────────────────────────────────────────────
  String _cacheSize     = '…';
  bool   _clearingCache = false;

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPrefs();
    _computeCacheSize();
  }

  // ─── Chargement ────────────────────────────────────────────────────────────

  Future<void> _loadPrefs() async {
    final p = await SharedPreferences.getInstance();
    setState(() {
      _darkMode      = p.getBool(_kPrefDarkMode)      ?? false;
      _compactMode   = p.getBool(_kPrefCompact)        ?? false;
      _language      = p.getString(_kPrefLanguage)     ?? 'fr';
      _distanceUnit  = p.getString(_kPrefDistanceUnit) ?? 'km';
      _textScale     = p.getDouble(_kPrefTextScale)    ?? 1.0;
      _highContrast  = p.getBool(_kPrefHighContrast)   ?? false;
      _reduceMotion  = p.getBool(_kPrefReduceMotion)   ?? false;
      _analytics     = p.getBool(_kPrefAnalytics)      ?? true;
      _crashReports  = p.getBool(_kPrefCrashReports)   ?? true;
      _pinEnabled    = p.getBool(_kPrefPinEnabled)     ?? false;
      _isLoading     = false;
    });
  }

  Future<void> _save(Future<bool> Function(SharedPreferences) fn) async {
    final p = await SharedPreferences.getInstance();
    await fn(p);
  }

  // ─── Cache ─────────────────────────────────────────────────────────────────

  Future<void> _computeCacheSize() async {
    try {
      final tmp = await getTemporaryDirectory();
      int bytes = 0;
      tmp.listSync(recursive: true).forEach((e) {
        if (e is File) bytes += e.lengthSync();
      });
      setState(() => _cacheSize = _formatBytes(bytes));
    } catch (_) {
      setState(() => _cacheSize = 'N/A');
    }
  }

  String _formatBytes(int b) {
    if (b < 1024)    return '${b} o';
    if (b < 1048576) return '${(b / 1024).toStringAsFixed(1)} Ko';
    return '${(b / 1048576).toStringAsFixed(1)} Mo';
  }

  Future<void> _clearCache() async {
    setState(() => _clearingCache = true);
    try {
      final tmp = await getTemporaryDirectory();
      if (tmp.existsSync()) tmp.deleteSync(recursive: true);
      await tmp.create();
    } catch (_) {}
    await _computeCacheSize();
    setState(() => _clearingCache = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Cache vidé avec succès', style: _dm(color: Colors.white)),
          backgroundColor: AppColors.teal,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  // ─── PIN ───────────────────────────────────────────────────────────────────

  Future<void> _togglePin(bool value) async {
    if (value) {
      final pin = await _showPinCreationSheet();
      if (pin != null && pin.length == 4) {
        final p = await SharedPreferences.getInstance();
        await p.setBool(_kPrefPinEnabled, true);
        await p.setString(_kPrefPinCode, pin);
        setState(() => _pinEnabled = true);
      }
    } else {
      final p      = await SharedPreferences.getInstance();
      final stored = p.getString(_kPrefPinCode) ?? '';
      final ok     = await _showPinVerifySheet(stored);
      if (ok) {
        await p.setBool(_kPrefPinEnabled, false);
        await p.remove(_kPrefPinCode);
        setState(() => _pinEnabled = false);
      }
    }
  }

  Future<void> _changePin() async {
    final p   = await SharedPreferences.getInstance();
    final old = p.getString(_kPrefPinCode) ?? '';
    final ok  = await _showPinVerifySheet(old);
    if (!ok) return;
    final newPin = await _showPinCreationSheet(isChange: true);
    if (newPin != null && newPin.length == 4) {
      await p.setString(_kPrefPinCode, newPin);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Code PIN modifié', style: _dm(color: Colors.white)),
          backgroundColor: AppColors.teal,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ));
      }
    }
  }

  // ─── URL launcher ──────────────────────────────────────────────────────────

  Future<void> _open(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  // ─── BUILD ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.grayBg,
        body: Center(child: CircularProgressIndicator(color: AppColors.blueDeep)),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.grayBg,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _section(
                    icon: Icons.palette_outlined,
                    color: AppColors.blueDeep,
                    title: 'AFFICHAGE',
                    children: _affichageTiles(),
                  ),
                  _section(
                    icon: Icons.accessibility_new_outlined,
                    color: const Color(0xFF6750A4),
                    title: 'ACCESSIBILITÉ',
                    children: _accessibiliteTiles(),
                  ),
                  _section(
                    icon: Icons.lock_outline,
                    color: AppColors.teal,
                    title: 'SÉCURITÉ LOCALE',
                    children: _securiteTiles(),
                  ),
                  _section(
                    icon: Icons.storage_outlined,
                    color: const Color(0xFF854F0B),
                    title: 'GESTION DU CACHE',
                    children: _cacheTiles(),
                  ),
                  _section(
                    icon: Icons.shield_outlined,
                    color: AppColors.red,
                    title: 'CONFIDENTIALITÉ',
                    children: _confidentialiteTiles(),
                  ),
                  _section(
                    icon: Icons.help_outline,
                    color: const Color(0xFF1A56CC),
                    title: 'AIDE',
                    children: _aideTiles(),
                  ),
                  _section(
                    icon: Icons.info_outline,
                    color: AppColors.text2,
                    title: 'À PROPOS',
                    children: _aProposTiles(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── APP BAR ───────────────────────────────────────────────────────────────

  Widget _buildAppBar() => SliverAppBar(
        pinned: true,
        expandedHeight: 80,
        backgroundColor: AppColors.blueDeep,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Colors.white, size: 20),
          onPressed: () => context.pop(),
        ),
        flexibleSpace: FlexibleSpaceBar(
          titlePadding: const EdgeInsets.only(left: 56, bottom: 14),
          title: Text('Paramètres de l\'app',
              style: _sora(size: 17, color: Colors.white)),
          background: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.blueDeep, Color(0xFF1A56CC)],
              ),
            ),
          ),
        ),
      );

  // ─── SECTION WRAPPER ───────────────────────────────────────────────────────

  Widget _section({
    required IconData icon,
    required Color color,
    required String title,
    required List<Widget> children,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 4, bottom: 10),
              child: Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Icon(icon, size: 15, color: color),
                  ),
                  const SizedBox(width: 9),
                  Text(title,
                      style: _sora(
                          size: 11,
                          weight: FontWeight.w700,
                          color: color)
                          .copyWith(letterSpacing: 0.9)),
                ],
              ),
            ),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.blueDeep.withOpacity(0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Column(children: children),
              ),
            ),
          ],
        ),
      );

  // ─── AFFICHAGE ─────────────────────────────────────────────────────────────

  List<Widget> _affichageTiles() => [
        _switchTile(
          icon: Icons.dark_mode_outlined,
          label: 'Mode sombre',
          subtitle: 'Thème sombre pour l\'interface',
          value: _darkMode,
          onChanged: (v) {
            setState(() => _darkMode = v);
            _save((p) => p.setBool(_kPrefDarkMode, v));
            HapticFeedback.lightImpact();
          },
        ),
        _divider(),
        _switchTile(
          icon: Icons.view_compact_outlined,
          label: 'Mode compact',
          subtitle: 'Réduit l\'espacement des éléments',
          value: _compactMode,
          onChanged: (v) {
            setState(() => _compactMode = v);
            _save((p) => p.setBool(_kPrefCompact, v));
            HapticFeedback.lightImpact();
          },
        ),
        _divider(),
        _pickerTile(
          icon: Icons.language_outlined,
          label: 'Langue',
          current: _language == 'fr' ? 'Français' : 'English',
          onTap: () => _showPickerSheet(
            title: 'Langue de l\'application',
            options: const [
              _PickerOpt('fr', 'Français', '🇫🇷'),
              _PickerOpt('en', 'English',  '🇬🇧'),
            ],
            current: _language,
            onSelect: (v) {
              setState(() => _language = v);
              _save((p) => p.setString(_kPrefLanguage, v));
            },
          ),
        ),
        _divider(),
        _pickerTile(
          icon: Icons.straighten_outlined,
          label: 'Unité de distance',
          current: _distanceUnit.toUpperCase(),
          onTap: () => _showPickerSheet(
            title: 'Unité de distance',
            options: const [
              _PickerOpt('km', 'Kilomètres (km)', '📏'),
              _PickerOpt('mi', 'Miles (mi)',       '📐'),
            ],
            current: _distanceUnit,
            onSelect: (v) {
              setState(() => _distanceUnit = v);
              _save((p) => p.setString(_kPrefDistanceUnit, v));
            },
          ),
        ),
      ];

  // ─── ACCESSIBILITÉ ─────────────────────────────────────────────────────────

  List<Widget> _accessibiliteTiles() => [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.text_fields_outlined,
                      size: 20, color: AppColors.text2),
                  const SizedBox(width: 12),
                  Text('Taille du texte', style: _sora(size: 14)),
                  const Spacer(),
                  Text(
                    _textScale <= 0.85
                        ? 'Petit'
                        : _textScale >= 1.3
                            ? 'Très grand'
                            : _textScale >= 1.15
                                ? 'Grand'
                                : 'Normal',
                    style: _dm(size: 12, color: AppColors.blueDeep),
                  ),
                ],
              ),
              SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  activeTrackColor: AppColors.blueDeep,
                  thumbColor: AppColors.blueDeep,
                  inactiveTrackColor: AppColors.grayBg,
                  overlayColor: AppColors.blueDeep.withOpacity(0.1),
                  trackHeight: 3,
                ),
                child: Slider(
                  value: _textScale,
                  min: 0.85,
                  max: 1.3,
                  divisions: 3,
                  onChanged: (v) {
                    setState(() => _textScale = v);
                    _save((p) => p.setDouble(_kPrefTextScale, v));
                    HapticFeedback.selectionClick();
                  },
                ),
              ),
            ],
          ),
        ),
        _divider(),
        _switchTile(
          icon: Icons.contrast_outlined,
          label: 'Contraste élevé',
          subtitle: 'Améliore la lisibilité du texte',
          value: _highContrast,
          onChanged: (v) {
            setState(() => _highContrast = v);
            _save((p) => p.setBool(_kPrefHighContrast, v));
            HapticFeedback.lightImpact();
          },
        ),
        _divider(),
        _switchTile(
          icon: Icons.animation_outlined,
          label: 'Réduire les animations',
          subtitle: 'Simplifie les transitions visuelles',
          value: _reduceMotion,
          onChanged: (v) {
            setState(() => _reduceMotion = v);
            _save((p) => p.setBool(_kPrefReduceMotion, v));
            HapticFeedback.lightImpact();
          },
        ),
      ];

  // ─── SÉCURITÉ LOCALE (PIN) ─────────────────────────────────────────────────

  List<Widget> _securiteTiles() => [
        _switchTile(
          icon: Icons.pin_outlined,
          label: 'Code PIN à 4 chiffres',
          subtitle: 'Verrouille l\'application au premier plan',
          value: _pinEnabled,
          onChanged: _togglePin,
        ),
        if (_pinEnabled) ...[
          _divider(),
          _navTile(
            icon: Icons.edit_outlined,
            label: 'Modifier le code PIN',
            onTap: _changePin,
          ),
        ],
      ];

  // ─── CACHE ─────────────────────────────────────────────────────────────────

  List<Widget> _cacheTiles() => [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              const Icon(Icons.folder_outlined, size: 20, color: AppColors.text2),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Espace temporaire utilisé', style: _sora(size: 14)),
                    const SizedBox(height: 2),
                    Text('Images, cartes et données mises en cache',
                        style: _dm(size: 12)),
                  ],
                ),
              ),
              Text(_cacheSize,
                  style: _sora(
                      size: 13,
                      color: AppColors.blueDeep,
                      weight: FontWeight.w700)),
            ],
          ),
        ),
        _divider(),
        InkWell(
          onTap: _clearingCache ? null : _clearCache,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                const Icon(Icons.delete_sweep_outlined,
                    size: 20, color: AppColors.red),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Vider le cache',
                          style: _sora(size: 14, color: AppColors.red)),
                      const SizedBox(height: 2),
                      Text('Supprime les fichiers temporaires',
                          style: _dm(size: 12)),
                    ],
                  ),
                ),
                if (_clearingCache)
                  const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.red))
                else
                  const Icon(Icons.arrow_forward_ios_rounded,
                      size: 14, color: AppColors.text2),
              ],
            ),
          ),
        ),
      ];

  // ─── CONFIDENTIALITÉ ───────────────────────────────────────────────────────

  List<Widget> _confidentialiteTiles() => [
        _switchTile(
          icon: Icons.bar_chart_outlined,
          label: 'Statistiques d\'utilisation',
          subtitle: 'Données anonymisées pour améliorer l\'app',
          value: _analytics,
          onChanged: (v) {
            setState(() => _analytics = v);
            _save((p) => p.setBool(_kPrefAnalytics, v));
            HapticFeedback.lightImpact();
          },
        ),
        _divider(),
        _switchTile(
          icon: Icons.bug_report_outlined,
          label: 'Rapports de plantage',
          subtitle: 'Aide à corriger les erreurs automatiquement',
          value: _crashReports,
          onChanged: (v) {
            setState(() => _crashReports = v);
            _save((p) => p.setBool(_kPrefCrashReports, v));
            HapticFeedback.lightImpact();
          },
        ),
        _divider(),
        _navTile(
          icon: Icons.policy_outlined,
          label: 'Politique de confidentialité',
          onTap: () => _open(_kPrivacyUrl),
          trailing: const Icon(Icons.open_in_new_rounded,
              size: 14, color: AppColors.text2),
        ),
      ];

  // ─── AIDE ──────────────────────────────────────────────────────────────────

  List<Widget> _aideTiles() => [
        _navTile(
          icon: Icons.help_center_outlined,
          label: 'Centre d\'aide',
          onTap: () => _open(_kSupportUrl),
          trailing: const Icon(Icons.open_in_new_rounded,
              size: 14, color: AppColors.text2),
        ),
        _divider(),
        _navTile(
          icon: Icons.chat_bubble_outline,
          label: 'Contacter le support',
          onTap: () => _open('mailto:support@lacite.ca'),
          trailing: const Icon(Icons.open_in_new_rounded,
              size: 14, color: AppColors.text2),
        ),
        _divider(),
        _navTile(
          icon: Icons.flag_outlined,
          label: 'Signaler un problème',
          onTap: _showReportSheet,
        ),
      ];

  // ─── À PROPOS ──────────────────────────────────────────────────────────────

  List<Widget> _aProposTiles() => [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              const Icon(Icons.apps_outlined, size: 20, color: AppColors.text2),
              const SizedBox(width: 12),
              Expanded(child: Text('Version', style: _sora(size: 14))),
              Text('$_kVersion ($_kBuild)',
                  style: _dm(size: 12, color: AppColors.text2)),
            ],
          ),
        ),
        _divider(),
        _navTile(
          icon: Icons.description_outlined,
          label: 'Conditions d\'utilisation',
          onTap: () => _open(_kTermsUrl),
          trailing: const Icon(Icons.open_in_new_rounded,
              size: 14, color: AppColors.text2),
        ),
        _divider(),
        _navTile(
          icon: Icons.library_books_outlined,
          label: 'Licences open source',
          onTap: () => showLicensePage(
            context: context,
            applicationName: 'La Cité Covoiturage',
            applicationVersion: _kVersion,
          ),
        ),
        _divider(),
        _navTile(
          icon: Icons.star_outline_rounded,
          label: 'Évaluer l\'application',
          onTap: () => _open(_kStoreUrl),
          trailing: const Icon(Icons.open_in_new_rounded,
              size: 14, color: AppColors.text2),
        ),
      ];

  // ─── TILES GÉNÉRIQUES ──────────────────────────────────────────────────────

  Widget _switchTile({
    required IconData icon,
    required String label,
    String? subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) =>
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppColors.text2),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: _sora(size: 14)),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle, style: _dm(size: 12)),
                  ],
                ],
              ),
            ),
            _AppSwitch(value: value, onChanged: onChanged),
          ],
        ),
      );

  Widget _navTile({
    required IconData icon,
    required String label,
    String? subtitle,
    required VoidCallback onTap,
    Widget? trailing,
  }) =>
      InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Icon(icon, size: 20, color: AppColors.text2),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: _sora(size: 14)),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(subtitle, style: _dm(size: 12)),
                    ],
                  ],
                ),
              ),
              trailing ??
                  const Icon(Icons.arrow_forward_ios_rounded,
                      size: 14, color: AppColors.text2),
            ],
          ),
        ),
      );

  Widget _pickerTile({
    required IconData icon,
    required String label,
    required String current,
    required VoidCallback onTap,
  }) =>
      InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Icon(icon, size: 20, color: AppColors.text2),
              const SizedBox(width: 12),
              Expanded(child: Text(label, style: _sora(size: 14))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.blueDeep.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(current,
                    style: _sora(size: 12, color: AppColors.blueDeep)),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.arrow_forward_ios_rounded,
                  size: 14, color: AppColors.text2),
            ],
          ),
        ),
      );

  Widget _divider() => const Divider(
        height: 1, thickness: 1, indent: 48,
        color: Color(0xFFF0F2F5),
      );

  // ─── BOTTOM SHEETS ─────────────────────────────────────────────────────────

  void _showPickerSheet({
    required String title,
    required List<_PickerOpt> options,
    required String current,
    required ValueChanged<String> onSelect,
  }) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _PickerSheet(
        title: title,
        options: options,
        current: current,
        onSelect: (v) {
          onSelect(v);
          Navigator.pop(context);
        },
      ),
    );
  }

  void _showReportSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _ReportSheet(),
    );
  }

  Future<String?> _showPinCreationSheet({bool isChange = false}) =>
      showModalBottomSheet<String>(
        context: context,
        backgroundColor: Colors.white,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (_) => _PinInputSheet(
          title: isChange ? 'Nouveau code PIN' : 'Créer un code PIN',
          subtitle: 'Saisissez 4 chiffres pour sécuriser l\'application',
          confirmMode: true,
        ),
      );

  Future<bool> _showPinVerifySheet(String storedPin) async {
    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _PinInputSheet(
        title: 'Confirmer le code PIN',
        subtitle: 'Entrez votre code PIN actuel',
        confirmMode: false,
      ),
    );
    return result == storedPin;
  }
}

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────

/// Toggle animé maison (identique aux autres toggles de l'app)
class _AppSwitch extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const _AppSwitch({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => onChanged(!value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeInOut,
          width: 44,
          height: 26,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(13),
            color: value ? AppColors.teal : const Color(0xFFD1D5DB),
          ),
          child: Padding(
            padding: const EdgeInsets.all(3),
            child: AnimatedAlign(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeInOut,
              alignment:
                  value ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black12,
                        blurRadius: 4,
                        offset: Offset(0, 1))
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}

/// Option de sélection
class _PickerOpt {
  final String value;
  final String label;
  final String flag;
  const _PickerOpt(this.value, this.label, this.flag);
}

/// Bottom sheet de sélection générique
class _PickerSheet extends StatelessWidget {
  final String title;
  final List<_PickerOpt> options;
  final String current;
  final ValueChanged<String> onSelect;

  const _PickerSheet({
    required this.title,
    required this.options,
    required this.current,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                    color: const Color(0xFFE5E7EB),
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),
            Text(title,
                style: GoogleFonts.sora(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.text1)),
            const SizedBox(height: 16),
            ...options.map((o) => InkWell(
                  onTap: () => onSelect(o.value),
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        vertical: 12, horizontal: 8),
                    child: Row(
                      children: [
                        Text(o.flag,
                            style: const TextStyle(fontSize: 22)),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Text(o.label,
                              style: GoogleFonts.dmSans(
                                  fontSize: 15,
                                  fontWeight: current == o.value
                                      ? FontWeight.w700
                                      : FontWeight.w400,
                                  color: AppColors.text1)),
                        ),
                        if (current == o.value)
                          const Icon(Icons.check_circle_rounded,
                              color: AppColors.teal, size: 20),
                      ],
                    ),
                  ),
                )),
          ],
        ),
      );
}

/// Saisie + confirmation de PIN à 4 chiffres
class _PinInputSheet extends StatefulWidget {
  final String title;
  final String subtitle;
  final bool confirmMode;

  const _PinInputSheet({
    required this.title,
    required this.subtitle,
    required this.confirmMode,
  });

  @override
  State<_PinInputSheet> createState() => _PinInputSheetState();
}

class _PinInputSheetState extends State<_PinInputSheet> {
  String _pin        = '';
  String _pinConfirm = '';
  bool   _confirming = false;
  bool   _error      = false;
  String _errorMsg   = '';

  void _onDigit(String d) {
    setState(() => _error = false);
    if (!_confirming) {
      if (_pin.length < 4) {
        _pin += d;
        setState(() {});
        if (_pin.length == 4 && widget.confirmMode) {
          Future.delayed(const Duration(milliseconds: 200),
              () => setState(() => _confirming = true));
        } else if (_pin.length == 4 && !widget.confirmMode) {
          Future.delayed(const Duration(milliseconds: 200),
              () => Navigator.pop(context, _pin));
        }
      }
    } else {
      if (_pinConfirm.length < 4) {
        _pinConfirm += d;
        setState(() {});
        if (_pinConfirm.length == 4) {
          Future.delayed(const Duration(milliseconds: 200), () {
            if (_pinConfirm == _pin) {
              Navigator.pop(context, _pin);
            } else {
              setState(() {
                _pinConfirm = '';
                _error      = true;
                _errorMsg   = 'Les codes ne correspondent pas';
              });
            }
          });
        }
      }
    }
  }

  void _onDelete() {
    setState(() {
      _error = false;
      if (_confirming) {
        if (_pinConfirm.isNotEmpty) {
          _pinConfirm = _pinConfirm.substring(0, _pinConfirm.length - 1);
        }
      } else {
        if (_pin.isNotEmpty) {
          _pin = _pin.substring(0, _pin.length - 1);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final current  = _confirming ? _pinConfirm : _pin;
    final title    = _confirming ? 'Confirmer le code PIN' : widget.title;
    final subtitle = _confirming ? 'Ressaisissez le même code' : widget.subtitle;

    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          left: 24, right: 24, top: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                  color: const Color(0xFFE5E7EB),
                  borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 24),
          Text(title,
              style: GoogleFonts.sora(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.text1)),
          const SizedBox(height: 6),
          Text(subtitle,
              style: GoogleFonts.dmSans(
                  fontSize: 13, color: AppColors.text2),
              textAlign: TextAlign.center),
          const SizedBox(height: 32),
          // Points PIN
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (i) {
              final filled = i < current.length;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.symmetric(horizontal: 10),
                width: 16, height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _error
                      ? AppColors.red
                      : filled
                          ? AppColors.blueDeep
                          : const Color(0xFFE5E7EB),
                  border: (!filled && !_error)
                      ? Border.all(color: const Color(0xFFD1D5DB))
                      : null,
                ),
              );
            }),
          ),
          if (_error) ...[
            const SizedBox(height: 10),
            Text(_errorMsg,
                style: GoogleFonts.dmSans(
                    fontSize: 12, color: AppColors.red)),
          ],
          const SizedBox(height: 32),
          // Clavier numérique
          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.2,
            children: [
              ...['1','2','3','4','5','6','7','8','9'].map(_numKey),
              const SizedBox.shrink(),
              _numKey('0'),
              InkWell(
                onTap: _onDelete,
                borderRadius: BorderRadius.circular(12),
                child: const Center(
                  child: Icon(Icons.backspace_outlined,
                      size: 22, color: AppColors.text2),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _numKey(String d) => InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          _onDigit(d);
        },
        borderRadius: BorderRadius.circular(12),
        child: Center(
          child: Text(d,
              style: GoogleFonts.sora(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                  color: AppColors.text1)),
        ),
      );
}

/// Formulaire de signalement de problème
class _ReportSheet extends StatefulWidget {
  const _ReportSheet();

  @override
  State<_ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends State<_ReportSheet> {
  String _category = 'bug';
  final _ctrl      = TextEditingController();
  bool  _sending   = false;

  static const _cats = [
    ('bug',   'Bogue / erreur',         Icons.bug_report_outlined),
    ('perf',  'Performance lente',      Icons.speed_outlined),
    ('ux',    'Problème d\'interface',  Icons.design_services_outlined),
    ('other', 'Autre',                  Icons.more_horiz_outlined),
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            left: 20, right: 20, top: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                    color: const Color(0xFFE5E7EB),
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),
            Text('Signaler un problème',
                style: GoogleFonts.sora(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.text1)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8, runSpacing: 8,
              children: _cats.map((c) {
                final sel = _category == c.$1;
                return ChoiceChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(c.$3, size: 14,
                          color: sel ? Colors.white : AppColors.text2),
                      const SizedBox(width: 4),
                      Text(c.$2),
                    ],
                  ),
                  selected: sel,
                  selectedColor: AppColors.blueDeep,
                  labelStyle: GoogleFonts.dmSans(
                      fontSize: 12,
                      color: sel ? Colors.white : AppColors.text2),
                  backgroundColor: Colors.white,
                  side: BorderSide(
                      color: sel
                          ? AppColors.blueDeep
                          : const Color(0xFFE5E7EB)),
                  onSelected: (_) => setState(() => _category = c.$1),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _ctrl,
              maxLines: 4,
              style: GoogleFonts.dmSans(
                  fontSize: 14, color: AppColors.text1),
              decoration: InputDecoration(
                hintText: 'Décrivez le problème rencontré…',
                hintStyle: GoogleFonts.dmSans(
                    fontSize: 13, color: AppColors.text2),
                filled: true,
                fillColor: AppColors.grayBg,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.all(14),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _sending
                    ? null
                    : () async {
                        setState(() => _sending = true);
                        await Future.delayed(
                            const Duration(milliseconds: 600));
                        if (context.mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Signalement envoyé, merci !',
                                  style: GoogleFonts.dmSans(
                                      color: Colors.white)),
                              backgroundColor: AppColors.teal,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius:
                                      BorderRadius.circular(12)),
                            ),
                          );
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.blueDeep,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: _sending
                    ? const SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : Text('Envoyer',
                        style: GoogleFonts.sora(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.white)),
              ),
            ),
          ],
        ),
      );
}
