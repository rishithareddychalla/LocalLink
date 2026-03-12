import 'package:flutter/material.dart';
import '../core/design_system.dart';
import '../widgets/global_app_header.dart';
import '../widgets/global_bottom_nav_bar.dart';
import 'dashboard_screen.dart';

class MainNavigationScaffold extends StatefulWidget {
  const MainNavigationScaffold({super.key});

  @override
  State<MainNavigationScaffold> createState() => _MainNavigationScaffoldState();
}

class _MainNavigationScaffoldState extends State<MainNavigationScaffold> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(), // Radar
    const _PlaceholderScreen(title: 'ROOMS'),
    const _PlaceholderScreen(title: 'FILES'),
    const _PlaceholderScreen(title: 'SETTINGS'),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      body: SafeArea(
        child: Column(
          children: [
            const GlobalAppHeader(),
            Expanded(
              child: IndexedStack(
                index: _currentIndex,
                children: _screens,
              ),
            ),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: Container(
        height: 64,
        width: 64,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: DesignSystem.fabGlow(DesignSystem.accentColor),
        ),
        child: FloatingActionButton(
          onPressed: () {
            // Global Action: Create Room or Discovery
          },
          backgroundColor: DesignSystem.accentColor,
          elevation: 0,
          shape: const CircleBorder(),
          child: const Icon(Icons.add, color: Colors.black, size: 32),
        ),
      ),
      bottomNavigationBar: GlobalBottomNavBar(
        selectedIndex: _currentIndex,
        onItemTapped: _onItemTapped,
      ),
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  final String title;
  const _PlaceholderScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        title,
        style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
      ),
    );
  }
}
