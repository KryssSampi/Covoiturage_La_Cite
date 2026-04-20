import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/api_service.dart';

class CreateTripScreen extends StatefulWidget {
  const CreateTripScreen({super.key, this.prefill});

  final Map<String, dynamic>? prefill;

  @override
  State<CreateTripScreen> createState() => _CreateTripScreenState();
}

class _CreateTripScreenState extends State<CreateTripScreen> {
  final _formKey = GlobalKey<FormState>();
  final _departureController = TextEditingController();
  final _arrivalController = TextEditingController();
  final _priceController = TextEditingController();

  DateTime _departureDate = DateTime.now();
  TimeOfDay _departureTime = TimeOfDay.now();
  int _seats = 1;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _applyPrefill(widget.prefill);
  }

  @override
  void dispose() {
    _departureController.dispose();
    _arrivalController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _applyPrefill(Map<String, dynamic>? prefill) {
    if (prefill == null) return;

    String firstText(List<String> keys) {
      for (final key in keys) {
        final value = prefill[key];
        if (value != null && value.toString().trim().isNotEmpty) {
          return value.toString().trim();
        }
      }
      return '';
    }

    final departure = firstText(['departureAddress', 'departureLabel', 'from', 'fromLabel']);
    final arrival = firstText(['arrivalAddress', 'arrivalLabel', 'to', 'toLabel']);
    if (departure.isNotEmpty) _departureController.text = departure;
    if (arrival.isNotEmpty) _arrivalController.text = arrival;

    final seatsRaw = prefill['availableSeats'] ?? prefill['seats'] ?? prefill['requestedSeats'];
    if (seatsRaw is num) {
      _seats = seatsRaw.toInt().clamp(1, 8);
    } else {
      final parsed = int.tryParse(seatsRaw?.toString() ?? '');
      if (parsed != null) _seats = parsed.clamp(1, 8);
    }

    final priceRaw = prefill['pricePerSeat'] ?? prefill['price'];
    if (priceRaw != null) {
      final parsed = double.tryParse(priceRaw.toString());
      if (parsed != null && parsed > 0) {
        _priceController.text = parsed.toStringAsFixed(2);
      }
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _departureDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date != null) {
      setState(() {
        _departureDate = date;
      });
    }
  }

  Future<void> _pickTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _departureTime,
    );
    if (time != null) {
      setState(() {
        _departureTime = time;
      });
    }
  }

  void _updateSeats(int delta) {
    setState(() {
      _seats = (_seats + delta).clamp(1, 8);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final DateTime departureDatetime = DateTime(
        _departureDate.year,
        _departureDate.month,
        _departureDate.day,
        _departureTime.hour,
        _departureTime.minute,
      );

      final Map<String, dynamic> body = <String, dynamic>{
        'departureLabel': _departureController.text.trim(),
        'arrivalLabel': _arrivalController.text.trim(),
        'departureTime': departureDatetime.toUtc().toIso8601String(),
        'availableSeats': _seats,
        'price': double.tryParse(_priceController.text) ?? 0.0,
        'status': 'Published',
      };

      await ApiService.instance.post('/api/trips', body);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Trajet cree !'),
            backgroundColor: Color(0xFF0F6E56),
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  String _formatTime(TimeOfDay time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Créer un trajet'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _departureController,
                decoration: const InputDecoration(
                  labelText: 'Adresse de départ',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Requis';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _arrivalController,
                decoration: const InputDecoration(
                  labelText: 'Adresse d\'arrivée',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Requis';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('Date de départ'),
                subtitle: Text(_formatDate(_departureDate)),
                trailing: const Icon(Icons.calendar_today),
                onTap: _pickDate,
              ),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('Heure de départ'),
                subtitle: Text(_formatTime(_departureTime)),
                trailing: const Icon(Icons.access_time),
                onTap: _pickTime,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(
                    onPressed: () => _updateSeats(-1),
                    icon: const Icon(Icons.remove),
                  ),
                  Text('$_seats places', style: Theme.of(context).textTheme.headlineSmall),
                  IconButton(
                    onPressed: () => _updateSeats(1),
                    icon: const Icon(Icons.add),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Prix par place (\$)',
                  border: OutlineInputBorder(),
                  prefixText: '\$ ',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Requis';
                  }
                  final price = double.tryParse(value);
                  if (price == null || price <= 0) {
                    return 'Prix doit être > 0';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Créer le trajet'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

