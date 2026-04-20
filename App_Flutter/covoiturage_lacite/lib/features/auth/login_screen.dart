import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/services/api_service.dart';
import '../../core/services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final _auth = AuthService(ApiService.instance);

  bool _isLoading = false;
  String? _errorMessage;

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  static const Color _primary = Color(0xFF08316e);
  static const Color _accent = Color(0xFF4F46E5);
  static const Color _bg = Color(0xFFF8F9FA);
  static const Color _textSecondary = Color(0xFF6B7280);

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero)
        .animate(CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut));
    _fadeCtrl.forward();
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _emailController.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) {
    return RegExp(r'@(?:collegelacite\.ca|lacitec\.on\.ca)$', caseSensitive: false)
        .hasMatch(email);
  }

  Future<void> _sendOtp() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final email = _emailController.text.trim();
    if (!_isValidEmail(email)) {
      setState(() {
        _errorMessage = 'Veuillez entrer une adresse @collegelacite.ca ou @lacitec.on.ca';
      });
      return;
    }
    setState(() { _isLoading = true; _errorMessage = null; });
    try {
      await _auth.requestOtp(email);
      if (!mounted) return;
      context.go('/otp?email=${Uri.encodeComponent(email)}');
    } on DioException catch (e) {
      setState(() {
        _errorMessage = e.response?.data?['message'] as String? ??
            'Erreur lors de l\'envoi du code. Réessayez.';
      });
    } catch (_) {
      setState(() { _errorMessage = 'Erreur lors de l\'envoi du code. Réessayez.'; });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));
    return Scaffold(
      backgroundColor: _bg,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SlideTransition(
            position: _slideAnim,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 80),
                    Center(
                      child: Container(
                        width: 100, height: 100,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: _primary.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 8))],
                        ),
                        padding: const EdgeInsets.all(10),
                        child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text('Covoiturage La Cité',
                        style: GoogleFonts.openSans(fontSize: 24, fontWeight: FontWeight.w700, color: const Color(0xFF1A1A1A)),
                        textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    Text('Entrez votre courriel institutionnel',
                        style: GoogleFonts.openSans(fontSize: 16, color: _textSecondary),
                        textAlign: TextAlign.center),
                    const SizedBox(height: 48),
                    Text('Courriel institutionnel',
                        style: GoogleFonts.openSans(fontSize: 14, fontWeight: FontWeight.w600, color: const Color(0xFF374151))),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _sendOtp(),
                        style: GoogleFonts.openSans(fontSize: 16, color: const Color(0xFF111827)),
                        decoration: InputDecoration(
                          hintText: 'nom@collegelacite.ca',
                          hintStyle: GoogleFonts.openSans(color: const Color(0xFF9CA3AF)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                          border: InputBorder.none,
                          errorStyle: const TextStyle(height: 0),
                        ),
                        validator: (v) => (v == null || v.trim().isEmpty) ? '' : null,
                      ),
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Text(_errorMessage!,
                          style: GoogleFonts.openSans(fontSize: 14, color: Colors.red),
                          textAlign: TextAlign.center),
                    ],
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _sendOtp,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _accent,
                          disabledBackgroundColor: _accent.withOpacity(0.6),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                        child: _isLoading
                            ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                            : Text('Envoyer le code', style: GoogleFonts.openSans(fontSize: 16, fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text('@collegelacite.ca ou @lacitec.on.ca uniquement',
                        style: GoogleFonts.openSans(fontSize: 12, color: const Color(0xFF9CA3AF)),
                        textAlign: TextAlign.center),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
