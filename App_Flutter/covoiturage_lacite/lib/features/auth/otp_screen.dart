import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

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
  final AuthService _auth = AuthService(ApiService.instance);

  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _registerPasswordController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;
  int _remainingSeconds = 300;
  Timer? _timer;
  String _lastPassword = '';

  late _AuthStage _stage;

  bool get _isRegisterFlow => widget.mode == 'register_otp';
  bool get _canResend => _remainingSeconds <= 0;

  @override
  void initState() {
    super.initState();
    _stage = _isRegisterFlow ? _AuthStage.otp : _AuthStage.password;
    if (_stage == _AuthStage.otp) {
      _startTimer();
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
    setState(() => _remainingSeconds = 300);
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      if (_remainingSeconds <= 0) {
        t.cancel();
      } else {
        setState(() => _remainingSeconds--);
      }
    });
  }

  String get _timerText {
    final int m = _remainingSeconds ~/ 60;
    final int s = _remainingSeconds % 60;
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
      _lastPassword = password;
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
              ? 'Compte temporairement bloqué ($seconds s)'
              : (result.message ?? 'Compte temporairement bloqué');
        });
        return;
      }

      if (result.requiresCode) {
        setState(() {
          _stage = _AuthStage.otp;
          _errorMessage = null;
        });
        _startTimer();
      } else {
        setState(() => _errorMessage = result.message ?? 'Mot de passe invalide');
      }
    } catch (_) {
      if (mounted) setState(() => _errorMessage = 'Erreur lors de la connexion');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitOtp() async {
    final String code = _otpController.text.trim();
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
        context.go('/onboarding');
      } else {
        setState(() => _errorMessage = result.message ?? 'Erreur lors de l\'inscription');
      }
    } catch (_) {
      if (mounted) setState(() => _errorMessage = 'Erreur lors de l\'inscription');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendCode() async {
    if (!_canResend) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (_isRegisterFlow) {
        await _auth.verifyEmail(widget.email);
      } else if (_lastPassword.isNotEmpty) {
        await _auth.passwordLogin(_lastPassword);
      }
      _startTimer();
    } catch (_) {
      setState(() => _errorMessage = 'Impossible de renvoyer le code');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextButton.icon(
                    onPressed: () => context.pop(),
                    style: TextButton.styleFrom(alignment: Alignment.centerLeft),
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 16),
                    label: const Text('Retour'),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _stage == _AuthStage.password
                        ? 'Mot de passe'
                        : _stage == _AuthStage.otp
                            ? 'Code OTP'
                            : 'Inscription',
                    style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    widget.email,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF6B7280)),
                  ),
                  const SizedBox(height: 24),
                  if (_stage == _AuthStage.password) ...[
                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: _fieldDecoration('Mot de passe'),
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _submitPassword(),
                    ),
                    const SizedBox(height: 14),
                    _actionButton('Continuer', _submitPassword),
                  ],
                  if (_stage == _AuthStage.otp) ...[
                    TextField(
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      decoration: _fieldDecoration('Code OTP'),
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _submitOtp(),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _canResend ? 'Vous pouvez renvoyer un code.' : 'Renvoi possible dans $_timerText',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12),
                    ),
                    const SizedBox(height: 12),
                    _actionButton('Vérifier', _submitOtp),
                    const SizedBox(height: 10),
                    OutlinedButton(
                      onPressed: (_isLoading || !_canResend) ? null : _resendCode,
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Renvoyer le code'),
                    ),
                  ],
                  if (_stage == _AuthStage.register) ...[
                    TextField(
                      controller: _firstNameController,
                      decoration: _fieldDecoration('Prénom'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _lastNameController,
                      decoration: _fieldDecoration('Nom'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _registerPasswordController,
                      obscureText: true,
                      decoration: _fieldDecoration('Mot de passe'),
                    ),
                    const SizedBox(height: 14),
                    _actionButton('Créer mon compte', _submitRegister),
                  ],
                  if (_errorMessage != null) ...[
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
    );
  }

  InputDecoration _fieldDecoration(String label) {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: Colors.white,
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: _isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
