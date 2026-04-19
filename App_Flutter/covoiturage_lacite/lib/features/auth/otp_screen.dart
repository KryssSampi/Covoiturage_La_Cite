import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/services/api_service.dart';
import '../../core/services/auth_service.dart';

class OtpScreen extends StatefulWidget {
  final String email;
  const OtpScreen({super.key, required this.email});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  final _auth = AuthService(ApiService.instance);

  bool _isLoading = false;
  bool _canResend = false;
  String? _errorMessage;
  bool _hasError = false;
  int _remainingSeconds = 300;
  Timer? _timer;

  static const Color _primary = Color(0xFF08316e);
  static const Color _green = Color(0xFF10B981);
  static const Color _accent = Color(0xFF4F46E5);
  static const Color _bg = Color(0xFFF8F9FA);

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() { _remainingSeconds = 300; _canResend = false; });
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) { t.cancel(); return; }
      setState(() {
        _remainingSeconds--;
        if (_remainingSeconds <= 0) { _canResend = true; t.cancel(); }
      });
    });
  }

  String get _timerText {
    final m = _remainingSeconds ~/ 60;
    final s = _remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Future<void> _verifyOtp() async {
    final code = _otpController.text.trim();
    if (code.length != 5) {
      setState(() { _errorMessage = 'Le code doit faire 5 chiffres'; _hasError = true; });
      return;
    }
    setState(() { _isLoading = true; _errorMessage = null; _hasError = false; });
    try {
      await _auth.verifyOtp(widget.email, code);
      if (!mounted) return;
      final loggedIn = await _auth.isLoggedIn();
      if (!loggedIn) {
        setState(() { _errorMessage = 'Code invalide. Réessayez.'; _hasError = true; });
        return;
      }
      context.go('/home');
    } on DioException catch (e) {
      setState(() {
        _errorMessage = e.response?.data?['message'] as String? ?? 'Code invalide. Réessayez.';
        _hasError = true;
      });
    } catch (_) {
      setState(() { _errorMessage = 'Code invalide. Réessayez.'; _hasError = true; });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendOtp() async {
    if (!_canResend) return;
    setState(() { _isLoading = true; _errorMessage = null; _hasError = false; });
    try {
      await _auth.requestOtp(widget.email);
      _startTimer();
      _otpController.clear();
    } catch (_) {
      setState(() { _errorMessage = 'Erreur lors du renvoi. Réessayez.'; _hasError = true; });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 16),
                  label: Text('Retour', style: GoogleFonts.openSans(fontWeight: FontWeight.w600)),
                  style: TextButton.styleFrom(foregroundColor: _accent, padding: EdgeInsets.zero),
                ),
              ),
              const SizedBox(height: 24),
              Text('Vérification du code',
                  style: GoogleFonts.openSans(fontSize: 24, fontWeight: FontWeight.w700, color: const Color(0xFF1A1A1A))),
              const SizedBox(height: 8),
              Text(widget.email,
                  style: GoogleFonts.openSans(fontSize: 16, color: const Color(0xFF6B7280)),
                  textAlign: TextAlign.center),
              const SizedBox(height: 40),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _hasError ? Colors.red : const Color(0xFFE5E7EB)),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                ),
                child: TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 5,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  textAlign: TextAlign.center,
                  onSubmitted: (_) => _verifyOtp(),
                  style: GoogleFonts.openSans(fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: 12, color: const Color(0xFF111827)),
                  decoration: InputDecoration(
                    counterText: '',
                    hintText: '12345',
                    hintStyle: GoogleFonts.openSans(color: const Color(0xFF9CA3AF), letterSpacing: 8),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (!_canResend)
                Center(
                  child: Text(_timerText,
                      style: GoogleFonts.openSans(fontSize: 18, fontWeight: FontWeight.w600, color: _green)),
                ),
              if (_hasError && _errorMessage != null) ...[
                const SizedBox(height: 12),
                Text(_errorMessage!,
                    style: GoogleFonts.openSans(fontSize: 14, color: Colors.red),
                    textAlign: TextAlign.center),
              ],
              const SizedBox(height: 24),
              SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _green,
                    disabledBackgroundColor: _green.withOpacity(0.5),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                      : Text('Confirmer', style: GoogleFonts.openSans(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 56,
                child: OutlinedButton(
                  onPressed: _canResend ? _resendOtp : null,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: _accent,
                    side: BorderSide(color: _canResend ? _accent : const Color(0xFFD1D5DB)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text('Renvoyer le code', style: GoogleFonts.openSans(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
