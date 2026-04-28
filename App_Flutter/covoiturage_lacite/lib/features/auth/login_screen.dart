import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/fixtures/app_fixtures.dart';
import '../../core/services/api_service.dart';
import '../../core/services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final AuthService _auth = AuthService(ApiService.instance);

  bool _isLoading = false;
  bool _isPreparingSession = false;
  bool _sessionReady = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _redirectIfAlreadyLoggedIn();
    _prepareSession();
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) {
    final String normalized = email.trim().toLowerCase();
    if (AppFixtures.isFixtureAuthEmail(normalized)) {
      return true;
    }
    return RegExp(
      r'@(?:collegelacite\.ca|lacitec\.on\.ca)$',
      caseSensitive: false,
    ).hasMatch(normalized);
  }

  Future<void> _redirectIfAlreadyLoggedIn() async {
    final bool loggedIn = await _auth.isLoggedIn();
    if (!mounted) return;
    if (loggedIn) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.go('/home');
      });
    }
  }

  Future<void> _continueFlow() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final String email = _emailController.text.trim();

    if (!_isValidEmail(email)) {
      setState(() {
        _errorMessage = 'Veuillez entrer un email La Cite valide.';
      });
      return;
    }

    if (_isPreparingSession) {
      setState(() {
        _errorMessage = 'Initialisation de la session en cours...';
      });
      return;
    }

    if (!_sessionReady) {
      await _prepareSession();
      if (!_sessionReady) {
        setState(() {
          _errorMessage =
              'Session d\'authentification indisponible. Reessayez.';
        });
        return;
      }
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final EmailCheckResult result = await _auth.verifyEmail(email);
      if (!mounted) return;

      if (!result.existingUser && !result.otpSent) {
        setState(() {
          _errorMessage = result.message ??
              'Reponse serveur invalide. Verifiez votre connexion.';
        });
        return;
      }

      final String mode = result.existingUser ? 'password' : 'register_otp';
      context.go('/otp?email=${Uri.encodeComponent(email)}&mode=$mode');
    } catch (_) {
      setState(() {
        _errorMessage =
            'Erreur reseau. Impossible de verifier l\'email pour le moment.';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _prepareSession() async {
    if (_isPreparingSession) return;

    setState(() {
      _isPreparingSession = true;
      _errorMessage = null;
    });

    try {
      final String? sessionToken = await _auth.initSession();
      if (!mounted) return;
      debugPrint('[Login] init-session token present: ${sessionToken?.isNotEmpty == true}');

      if (sessionToken == null || sessionToken.isEmpty) {
        setState(() {
          _sessionReady = false;
          _errorMessage =
              'Impossible d\'initialiser la session. Verifiez votre connexion.';
        });
        return;
      }

      setState(() {
        _sessionReady = true;
        _errorMessage = null;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _sessionReady = false;
        _errorMessage =
            'Erreur reseau pendant l\'initialisation de la session.';
      });
    } finally {
      if (mounted) setState(() => _isPreparingSession = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Stack(
          children: <Widget>[
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 460),
                  child: Form(
                    key: _formKey,
                    child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    const SizedBox(height: 28),
                    Container(
                      width: 108,
                      height: 108,
                      margin: const EdgeInsets.symmetric(horizontal: 120),
                      decoration: BoxDecoration(
                        color: const Color(0xFF08316E),
                        shape: BoxShape.circle,
                        boxShadow: const <BoxShadow>[
                          BoxShadow(
                            color: Color(0x22000000),
                            blurRadius: 20,
                            offset: Offset(0, 8),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Image.asset('assets/images/logo.png',
                          fit: BoxFit.contain),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Connexion',
                      textAlign: TextAlign.center,
                      style:
                          TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Entrez votre email institutionnel ou test',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFF6B7280)),
                    ),
                    const SizedBox(height: 28),
                    const Text(
                      'Email',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _continueFlow(),
                      decoration: InputDecoration(
                        hintText: 'nom@collegelacite.ca',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: Color(0xFFD1D5DB)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: Color(0xFFD1D5DB)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                              color: Color(0xFF1A56CC), width: 1.5),
                        ),
                      ),
                      validator: (String? v) => (v == null || v.trim().isEmpty)
                          ? 'Email requis'
                          : null,
                    ),
                    if (_errorMessage != null) ...<Widget>[
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(color: Color(0xFFE24B4A)),
                        textAlign: TextAlign.center,
                      ),
                    ],
                    const SizedBox(height: 18),
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: (_isLoading || _isPreparingSession)
                            ? null
                            : _continueFlow,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1A56CC),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Continuer',
                                style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
                ),
              ),
            ),
            ),
            if (_isPreparingSession)
              const Positioned(
                top: 10,
                right: 14,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Color(0x22000000),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(8),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2.2),
                    ),
                  ),
                ),
              ),
            if (!_isPreparingSession && !_sessionReady)
              Positioned(
                top: 6,
                right: 8,
                child: DecoratedBox(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Color(0x22000000),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: IconButton(
                  tooltip: 'Recharger la session',
                  onPressed: _prepareSession,
                  icon: const Icon(
                    Icons.refresh_rounded,
                    color: Color(0xFF1A56CC),
                    size: 24,
                  ),
                ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
