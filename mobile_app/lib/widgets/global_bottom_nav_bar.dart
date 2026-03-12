import 'package:flutter/material.dart';
import '../core/design_system.dart';

class GlobalBottomNavBar extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onItemTapped;

  const GlobalBottomNavBar({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  Widget build(BuildContext context) {
    return BottomAppBar(
      color: DesignSystem.background,
      elevation: 0,
      notchMargin: 8,
      child: Container(
        height: 60,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _NavBarItem(
              icon: Icons.track_changes,
              label: 'RADAR',
              isSelected: selectedIndex == 0,
              onTap: () => onItemTapped(0),
            ),
            _NavBarItem(
              icon: Icons.chat_bubble_rounded,
              label: 'ROOMS',
              isSelected: selectedIndex == 1,
              onTap: () => onItemTapped(1),
            ),
            const SizedBox(width: 48), // Space for FAB
            _NavBarItem(
              icon: Icons.folder_rounded,
              label: 'FILES',
              isSelected: selectedIndex == 2,
              onTap: () => onItemTapped(2),
            ),
            _NavBarItem(
              icon: Icons.settings_rounded,
              label: 'SETTINGS',
              isSelected: selectedIndex == 3,
              onTap: () => onItemTapped(3),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isSelected ? DesignSystem.accentColor : Colors.white38,
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? DesignSystem.accentColor : Colors.white38,
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
