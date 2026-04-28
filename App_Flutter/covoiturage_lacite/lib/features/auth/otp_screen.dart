import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/services/api_service.dart';
import '../../core/services/auth_service.dart';

enum _AuthStage { password, otp, register }

class OtpScreen extends StatefulWidget {
  const OtpScreen({
    super.key,
    required this.email,
    this.mode = 'password',
  });

  final String email;
  final String mode;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  static const int _otpValiditySeconds = 300;
  static const int _resendCooldownSeconds = 30;

  final AuthService _auth = AuthService(ApiService.instance);

  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _registerPasswordController =
      TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;
  int _otpValidityRemaining = _otpValiditySeconds;
  int _resendCooldownRemaining = 0;
  int _remainingResends = 3;
  bool _showPassword = false;
  bool _showRegisterPassword = false;
  Timer? _timer;

  late _AuthStage _stage;

  bool get _isRegisterFlow => widget.mode == 'register_otp';
  bool get _canResend => _resendCooldownRemaining <= 0 && _remainingResends > 0;
  bool get _isOtpExpired => _otpValidityRemaining <= 0;

  @override
  void initState() {
    super.initState();
    _stage = _isRegisterFlow ? _AuthStage.otp : _AuthStage.password;
    if (_stage == _AuthStage.otp) {
      _enterOtpStage(resetValidity: true);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _passwordController.dispose();
    _otpController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _registerPasswordController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) {
      if (!mounted) {
        t.cancel();
        return;
      }

      bool changed = false;

      if (_stage == _AuthStage.otp && _otpValidityRemaining > 0) {
        _otpValidityRemaining--;
        changed = true;
      }

      if (_resendCooldownRemaining > 0) {
        _resendCooldownRemaining--;
        changed = true;
      }

      if (!changed) {
        t.cancel();
        return;
      }

      setState(() {});
    });
  }

  void _enterOtpStage({required bool resetValidity}) {
    _timer?.cancel();
    setState(() {
      _stage = _AuthStage.otp;
      _errorMessage = null;
      if (resetValidity) {
        _otpValidityRemaining = _otpValiditySeconds;
      }
      _resendCooldownRemaining = 0;
    });
    _startTimer();
    unawaited(_syncOtpStatus());
  }

  Future<void> _syncOtpStatus() async {
    final OtpStatusSnapshot? snapshot = await _auth.getOtpStatus();
    if (!mounted || snapshot == null) return;

    final DateTime? expiresAt = snapshot.otpExpiresAt;
    final int seconds = expiresAt == null
        ? _otpValiditySeconds
        : expiresAt
            .difference(DateTime.now())
            .inSeconds
            .clamp(0, 24 * 60 * 60)
            .toInt();

    setState(() {
      _remainingResends = snapshot.remainingResends;
      _otpValidityRemaining = seconds;
    });
    _startTimer();
  }

  String get _otpTimerText {
    final int m = _otpValidityRemaining ~/ 60;
    final int s = _otpValidityRemaining % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Future<void> _submitPassword() async {
    final String password = _passwordController.text.trim();
    if (password.isEmpty) {
      setState(() => _errorMessage = 'Mot de passe requis');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final AuthStepResult result = await _auth.passwordLogin(password);
      if (!mounted) return;

      if (result.success) {
        context.go('/home');
        return;
      }

      if (result.locked) {
        final int seconds = result.retryAfterSeconds ?? 0;
        setState(() {
          _errorMessage = seconds > 0
              ? 'Compte temporairement bloque ($seconds s)'
              : (result.message ?? 'Compte temporairement bloque');
        });
        return;
      }

      if (result.requiresCode) {
        _enterOtpStage(resetValidity: true);
      } else {
        setState(
            () => _errorMessage = result.message ?? 'Mot de passe invalide');
      }
    } catch (_) {
      if (mounted) {
        setState(() => _errorMessage = 'Erreur lors de la connexion');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitOtp() async {
    final String code = _otpController.text.trim();

    if (_isOtpExpired) {
      setState(() => _errorMessage = 'Code expire. Renvoyez un nouveau code.');
      return;
    }

    if (code.length < 4) {
      setState(() => _errorMessage = 'Code OTP invalide');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final AuthStepResult result = await _auth.verifyCode(code);
      if (!mounted) return;

      if (result.success) {
        context.go('/home');
        return;
      }

      if (result.requiresRegistration ||
          (_isRegisterFlow &&
              (result.message == null || result.message!.trim().isEmpty))) {
        _timer?.cancel();
        setState(() {
          _stage = _AuthStage.register;
          _errorMessage = null;
        });
      } else {
        setState(() => _errorMessage = result.message ?? 'Code OTP incorrect');
      }
    } catch (_) {
      if (mounted) setState(() => _errorMessage = 'Code OTP incorrect');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitRegister() async {
    final String firstName = _firstNameController.text.trim();
    final String lastName = _lastNameController.text.trim();
    final String password = _registerPasswordController.text.trim();

    if (firstName.isEmpty || lastName.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Tous les champs sont requis');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final AuthStepResult result = await _auth.register(
        firstName: firstName,
        lastName: lastName,
        password: password,
      );
      if (!mounted) return;

      if (result.success) {
        final SharedPreferences prefs = await SharedPreferences.getInstance();
        final bool onboardingDone = prefs.getBool('onboarding_done') ?? false;
        if (!mounted) return;
        context.go(onboardingDone ? '/home' : '/onboarding');
      } else {
        setState(() =>
            _errorMessage = result.message ?? 'Erreur lors de l\'inscription');
      }
    } catch (_) {
      if (mounted) {
        setState(() => _errorMessage = 'Erreur lors de l\'inscription');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendCode() async {
    if (!_canResend || _isLoading) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _resendCooldownRemaining = _resendCooldownSeconds;
    });
    _startTimer();

    try {
      final RenewCodeResult result = await _auth.renewCode();

      if (!mounted) return;
      if (!result.success) {
        setState(() {
          _remainingResends = result.remainingResends;
          _errorMessage = result.message ?? 'Impossible de renvoyer le code';
        });
        return;
      }

      setState(() {
        _remainingResends = result.remainingResends;
        _otpValidityRemaining = _otpValiditySeconds;
      });
      await _syncOtpStatus();
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _goBack() {
    if (_isLoading) return;

    if (_stage == _AuthStage.register) {
      setState(() {
        _stage = _AuthStage.otp;
        _errorMessage = null;
      });
      _startTimer();
      return;
    }

    if (_stage == _AuthStage.otp && !_isRegisterFlow) {
      _timer?.cancel();
      setState(() {
        _stage = _AuthStage.password;
        _errorMessage = null;
      });
      return;
    }

    context.go('/login');
  }

  Future<bool> _handleSystemBack() async {
    _goBack();
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _handleSystemBack,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F9FA),
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    TextButton.icon(
                      onPressed: _goBack,
                      style:
                          TextButton.styleFrom(alignment: Alignment.centerLeft),
                      icon:
                          const Icon(Icons.arrow_back_ios_new_rounded, size: 16),
                      label: const Text('Retour'),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _stage == _AuthStage.password
                          ? 'Mot de passe'
                          : _stage == _AuthStage.otp
                              ? 'Code OTP'
                              : 'Inscription',
                      style: const TextStyle(
                          fontSize: 26, fontWeight: FontWeight.w700),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      widget.email,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFF6B7280)),
                    ),
                    const SizedBox(height: 24),
                    if (_stage == _AuthStage.password) ...<Widget>[
                      TextField(
                        controller: _passwordController,
                        obscureText: !_showPassword,
                        decoration: _fieldDecoration(
                          'Mot de passe',
                          isPasswordField: true,
                          isVisible: _showPassword,
                          onToggleVisibility: () {
                            setState(() => _showPassword = !_showPassword);
                          },
                        ),
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => _submitPassword(),
                      ),
                      const SizedBox(height: 14),
                      _actionButton('Continuer', _submitPassword),
                    ],
                    if (_stage == _AuthStage.otp) ...<Widget>[
                      TextField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        decoration: _fieldDecoration('Code OTP'),
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => _submitOtp(),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _isOtpExpired
                            ? 'Le code a expire. Renvoyez un nouveau code.'
                            : 'Code valide pendant $_otpTimerText',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: _isOtpExpired
                              ? const Color(0xFFE24B4A)
                              : const Color(0xFF6B7280),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _remainingResends <= 0
                            ? 'Aucun renvoi disponible.'
                            : _canResend
                                ? 'Renvoyer le code ($_remainingResends restant${_remainingResends > 1 ? 's' : ''})'
                                : 'Renvoyer dans ${_resendCooldownRemaining}s',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            color: Color(0xFF6B7280), fontSize: 12),
                      ),
                      const SizedBox(height: 12),
                      _actionButton('Verifier', _submitOtp),
                      const SizedBox(height: 10),
                      OutlinedButton(
                        onPressed:
                            (_isLoading || !_canResend) ? null : _resendCode,
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Renvoyer le code'),
                      ),
                    ],
                    if (_stage == _AuthStage.register) ...<Widget>[
                      TextField(
                        controller: _firstNameController,
                        decoration: _fieldDecoration('Prenom'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _lastNameController,
                        decoration: _fieldDecoration('Nom'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _registerPasswordController,
                        obscureText: !_showRegisterPassword,
                        decoration: _fieldDecoration(
                          'Mot de passe',
                          isPasswordField: true,
                          isVisible: _showRegisterPassword,
                          onToggleVisibility: () {
                            setState(
                              () => _showRegisterPassword =
                                  !_showRegisterPassword,
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 14),
                      _actionButton('Creer mon compte', _submitRegister),
                    ],
                    if (_errorMessage != null) ...<Widget>[
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(color: Color(0xFFE24B4A)),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _fieldDecoration(
    String label, {
    bool isPasswordField = false,
    bool isVisible = false,
    VoidCallback? onToggleVisibility,
  }) {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: Colors.white,
      suffixIcon: isPasswordField
          ? IconButton(
              onPressed: onToggleVisibility,
              icon: Icon(
                isVisible ? Icons.visibility_off_rounded : Icons.visibility_rounded,
              ),
            )
          : null,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF1A56CC), width: 1.5),
      ),
    );
  }

  Widget _actionButton(String label, Future<void> Function() onTap) {
    return SizedBox(
      height: 50,
      child: ElevatedButton(
        onPressed: _isLoading ? null : onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1A56CC),
          foregroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: _isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
