import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../search/search_screen.dart';
import '../planner/planner_screen.dart';
import '../notifications/notifications_screen.dart';
import '../profile/profile_screen.dart';
import '../../core/services/api_service.dart';
import '../../core/services/trip_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _idx = 0;
  late final List<Widget> _screens;

  static const _tabs = [
    BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Accueil'),
    BottomNavigationBarItem(icon: Icon(Icons.search_rounded), label: 'Recherche'),
    BottomNavigationBarItem(icon: Icon(Icons.calendar_today_rounded), label: 'Planifier'),
    BottomNavigationBarItem(icon: Icon(Icons.notifications_rounded), label: 'Notifs'),
    BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profil'),
  ];

  @override
  void initState() {
    super.initState();
    _screens = [
      const _AccueilTab(),
      SearchScreen(tripService: TripService(ApiService.instance)),
      const PlannerScreen(),
      const NotificationsScreen(),
      const ProfileScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: IndexedStack(index: _idx, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _idx,
        onTap: (i) => setState(() => _idx = i),
        selectedItemColor: const Color(0xFF08316e),
        unselectedItemColor: const Color(0xFF7A879A),
        type: BottomNavigationBarType.fixed,
        items: _tabs,
      ),
    );
  }
}

class _AccueilTab extends StatelessWidget {
  const _AccueilTab();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(child: SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Bienvenue !', style: GoogleFonts.openSans(fontSize:22, fontWeight:FontWeight.w700, color:const Color(0xFF0D1624))),
              Text('Ou allons-nous aujourd\'hui ?', style: GoogleFonts.openSans(fontSize:14, color:const Color(0xFF7A879A))),
            ]),
            const CircleAvatar(radius:22, backgroundColor:Color(0xFF08316e),
              child: Icon(Icons.person, color:Colors.white)),
          ]),
          const SizedBox(height:24),
          Container(
            height:50, decoration:BoxDecoration(
              color:Colors.white, borderRadius:BorderRadius.circular(999),
              border: Border.all(color:const Color(0xFFD8DBE5), width:1.5)),
            child: Row(children:[
              const SizedBox(width:12),
              const Icon(Icons.search_rounded, color:Color(0xFF8A95A8), size:18),
              const SizedBox(width:8),
              Text('Rechercher une destination...',
                style: GoogleFonts.openSans(fontSize:15, color:const Color(0xFF8A95A8))),
            ])),
          const SizedBox(height:24),
          Text('MES STATISTIQUES', style: GoogleFonts.openSans(fontSize:13, fontWeight:FontWeight.w700, color:Colors.grey)),
          const SizedBox(height:12),
          GridView.count(crossAxisCount:2, shrinkWrap:true, physics:const NeverScrollableScrollPhysics(),
            crossAxisSpacing:10, mainAxisSpacing:10, childAspectRatio:1.5,
            children:[
              _KpiCard(icon:Icons.directions_car_outlined, bg:const Color(0xFFFDECEA), fg:const Color(0xFFE24B4A), value:'21', label:'Trajets'),
              _KpiCard(icon:Icons.eco_outlined, bg:const Color(0xFFE1F5EE), fg:const Color(0xFF0F6E56), value:'49.7 kg', label:'CO2 economise'),
              _KpiCard(icon:Icons.attach_money_rounded, bg:const Color(0xFFE8F0FE), fg:const Color(0xFF1A56CC), value:'\$40.8', label:'Revenus'),
              _KpiCard(icon:Icons.star_rounded, bg:const Color(0xFFFAEEDA), fg:const Color(0xFFF59E0B), value:'4.5*', label:'Note'),
            ]),
        ],
      ))),
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({required this.icon, required this.bg, required this.fg, required this.value, required this.label});
  final IconData icon; final Color bg, fg; final String value, label;
  @override
  Widget build(BuildContext context) {
    return Container(padding:const EdgeInsets.all(14),
      decoration:BoxDecoration(color:Colors.white, borderRadius:BorderRadius.circular(16),
        boxShadow:[BoxShadow(color:Colors.black.withOpacity(0.05), blurRadius:8, offset:const Offset(0,2))]),
      child:Column(crossAxisAlignment:CrossAxisAlignment.start, children:[
        Container(width:36, height:36,
          decoration:BoxDecoration(color:bg, borderRadius:BorderRadius.circular(10)),
          child:Icon(icon, color:fg, size:18)),
        const SizedBox(height:8),
        Text(value, style: GoogleFonts.openSans(fontSize:18, fontWeight:FontWeight.w700)),
        Text(label, style: GoogleFonts.openSans(fontSize:11, color:const Color(0xFF7A879A))),
      ]));
  }
}
