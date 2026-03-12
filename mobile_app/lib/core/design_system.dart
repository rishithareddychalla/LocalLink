import 'package:flutter/material.dart';

class DesignSystem {
  // Colors matching index.css
  static const Color background = Color(0xFF0F1021); // Darker blue-black
  static const Color surface = Color(0xFF1A1D2E);
  static const Color accentColor = Color(0xFF00F0FF);
  static const Color primaryButton = Color(0xFF00D1FF);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xB3FFFFFF);
  static const Color borderColor = Color(0x1AFFFFFF);
  
  static const Color radarPulse = Color(0xFF00F0FF);
  static const Color radarCircle = Color(0x1A00F0FF);
  
  static const Color statusLive = Color(0xFF004D4D); // Dark cyan for badge
  static const Color statusLiveText = Color(0xFF00F0FF);
  
  static const Color error = Color(0xFFFF4B4B);
  static const Color success = Color(0xFF4ADE80);

  // Glow Effects
  static List<BoxShadow> neonGlow(Color color) => [
    BoxShadow(
      color: color.withOpacity(0.2),
      blurRadius: 10,
      offset: const Offset(0, 0),
    ),
    BoxShadow(
      color: color.withOpacity(0.4),
      blurRadius: 15,
      offset: const Offset(0, 0),
    ),
  ];

  static List<BoxShadow> heroGlow(Color color) => [
    BoxShadow(
      color: color.withOpacity(0.4),
      blurRadius: 30,
      offset: const Offset(0, 0),
    ),
  ];

  static List<BoxShadow> fabGlow(Color color) => [
    BoxShadow(
      color: color.withOpacity(0.5),
      blurRadius: 15,
      spreadRadius: 2,
    ),
  ];

  // Text Styles
  static const TextStyle heading1 = TextStyle(
    color: textPrimary,
    fontSize: 32,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
  );

  static const TextStyle heading2 = TextStyle(
    color: textPrimary,
    fontSize: 24,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
  );

  static const TextStyle body = TextStyle(
    color: textPrimary,
    fontSize: 16,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle caption = TextStyle(
    color: textSecondary,
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );
  
  static const TextStyle label = TextStyle(
    color: textSecondary,
    fontSize: 12,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.2,
  );

  // Custom styles for Hero
  static const TextStyle heroHeadline = TextStyle(
    color: textPrimary,
    fontSize: 28,
    fontWeight: FontWeight.w900,
    height: 1.2,
  );

  static const TextStyle heroSubheadline = TextStyle(
    color: textSecondary,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );
}
