import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _index = 0;

  Future<void> _finish() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_done', true);
    await prefs.setBool('needs_onboarding', false);
    if (!mounted) return;
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    const List<_SlideData> slides = <_SlideData>[
      _SlideData(
        title: 'Trouvez votre trajet',
        subtitle: 'Recherchez des conducteurs qui font le meme trajet vers le campus.',
        icon: Icons.search_rounded,
        color: Color(0xFF1A56CC),
      ),
      _SlideData(
        title: 'Voyagez ensemble',
        subtitle: 'Reservez une place et voyagez avec des collegues etudiants.',
        icon: Icons.people_alt_rounded,
        color: Color(0xFF0F6E56),
      ),
      _SlideData(
        title: 'Devenez conducteur',
        subtitle: 'Planifiez vos trajets et gagnez des points GoBoard.',
        icon: Icons.directions_car_rounded,
        color: Color(0xFF08316E),
      ),
    ];

    final bool isLast = _index == slides.length - 1;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: isLast ? null : _finish,
                child: const Text('Passer'),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: slides.length,
                onPageChanged: (int i) => setState(() => _index = i),
                itemBuilder: (_, int i) => _Slide(data: slides[i]),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List<Widget>.generate(slides.length, (int i) {
                final bool active = i == _index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: active ? 22 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active ? const Color(0xFF1A56CC) : const Color(0xFFD1D5DB),
                    borderRadius: BorderRadius.circular(99),
                  ),
                );
              }),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    if (isLast) {
                      _finish();
                    } else {
                      _controller.nextPage(
                        duration: const Duration(milliseconds: 360),
                        curve: Curves.easeOut,
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A56CC),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(isLast ? 'Commencer' : 'Suivant'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class _SlideData {
  const _SlideData({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
}

class _Slide extends StatelessWidget {
  const _Slide({required this.data});

  final _SlideData data;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: data.color.withAlpha(24),
              shape: BoxShape.circle,
            ),
            child: Icon(data.icon, size: 54, color: data.color),
          ),
          const SizedBox(height: 32),
          Text(
            data.title,
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            data.subtitle,
            style: const TextStyle(fontSize: 15, color: Color(0xFF6B7280), height: 1.5),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
