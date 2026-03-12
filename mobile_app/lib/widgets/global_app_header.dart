import 'package:flutter/material.dart';
import '../core/design_system.dart';

class GlobalAppHeader extends StatelessWidget {
  final bool isLive;

  const GlobalAppHeader({
    super.key,
    this.isLive = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          // Logo Section
          const Icon(
            Icons.radar,
            color: DesignSystem.accentColor,
            size: 28,
          ),
          const SizedBox(width: 8),
          const Text(
            'LocalLink',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
          const Spacer(),
          
          // LIVE Badge
          if (isLive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF0F1B21), // Dark cyan-ish background
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: DesignSystem.accentColor.withOpacity(0.2),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: DesignSystem.accentColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: DesignSystem.accentColor,
                          blurRadius: 4,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'LIVE',
                    style: TextStyle(
                      color: DesignSystem.accentColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                    ),
                  ),
                ],
              ),
            ),
            
          const SizedBox(width: 16),
          
          // Notification Bell
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1D2E), // Match DesignSystem.surface
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withOpacity(0.05),
              ),
            ),
            child: const Icon(
              Icons.notifications,
              color: Colors.white70,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }
}
