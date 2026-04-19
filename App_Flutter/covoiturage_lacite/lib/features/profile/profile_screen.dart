import 'package:flutter/material.dart';

import '../../core/models/user.dart';
import '../../core/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _api = ApiService.instance;
  final TextEditingController _firstNameCtrl = TextEditingController();
  final TextEditingController _lastNameCtrl = TextEditingController();
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _avatarUrlCtrl = TextEditingController();

  bool _isLoading = true;
  bool _isSaving = false;
  bool _isEditMode = false;
  String? _error;
  User? _user;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _avatarUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dynamic payload = await _api.get('/api/users/me');
      final Map<String, dynamic>? raw = _extractMap(payload);
      if (raw == null) {
        throw Exception('Profil invalide');
      }
      final User user = User.fromJson(raw);
      if (!mounted) return;
      setState(() {
        _user = user;
        _firstNameCtrl.text = user.firstName;
        _lastNameCtrl.text = user.lastName;
        _emailCtrl.text = user.email;
        _avatarUrlCtrl.text = user.avatarUrl;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _saveProfile() async {
    if (_isSaving || _user == null) return;
    setState(() {
      _isSaving = true;
    });
    try {
      await _api.patch('/api/users/me', <String, dynamic>{
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'avatarUrl': _avatarUrlCtrl.text.trim(),
      });
      if (!mounted) return;
      await _loadProfile();
      if (!mounted) return;
      setState(() {
        _isEditMode = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profil mis a jour.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Mise a jour impossible: $e')),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _isSaving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: <Widget>[
          IconButton(
            onPressed: _isLoading ? null : _loadProfile,
            icon: const Icon(Icons.refresh),
          ),
          if (_user != null)
            TextButton(
              onPressed: _isSaving
                  ? null
                  : () {
                      setState(() {
                        _isEditMode = !_isEditMode;
                      });
                    },
              child: Text(_isEditMode ? 'Annuler' : 'Modifier'),
            ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: _isEditMode
          ? FloatingActionButton.extended(
              onPressed: _isSaving ? null : _saveProfile,
              icon: _isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.save),
              label: const Text('Enregistrer'),
            )
          : null,
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text('Erreur: $_error'),
            const SizedBox(height: 8),
            FilledButton(onPressed: _loadProfile, child: const Text('Reessayer')),
          ],
        ),
      );
    }
    if (_user == null) {
      return const Center(child: Text('Profil introuvable.'));
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        CircleAvatar(
          radius: 38,
          backgroundImage:
              _avatarUrlCtrl.text.trim().isNotEmpty ? NetworkImage(_avatarUrlCtrl.text.trim()) : null,
          child: _avatarUrlCtrl.text.trim().isEmpty ? const Icon(Icons.person, size: 38) : null,
        ),
        const SizedBox(height: 16),
        Text(
          '${_user!.firstName} ${_user!.lastName}',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 4),
        Text('Role: ${_user!.role}'),
        const SizedBox(height: 4),
        Text('Note moyenne: ${_user!.averageRating.toStringAsFixed(1)}'),
        const SizedBox(height: 20),
        _field('Prenom', _firstNameCtrl),
        _field('Nom', _lastNameCtrl),
        _field('Email', _emailCtrl, keyboardType: TextInputType.emailAddress),
        _field('Avatar URL', _avatarUrlCtrl),
      ],
    );
  }

  Widget _field(
    String label,
    TextEditingController controller, {
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        enabled: _isEditMode,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          isDense: true,
        ),
      ),
    );
  }
}

Map<String, dynamic>? _extractMap(dynamic payload) {
  if (payload is Map<String, dynamic>) {
    final dynamic data = payload['data'];
    if (data is Map<String, dynamic>) return data;
    return payload;
  }
  return null;
}
