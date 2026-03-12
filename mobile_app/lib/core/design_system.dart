import 'package:flutter/material.dart';

class DesignSystem {
  // Colors matching index.css
  static const Color background = Color(0xFF0A0D11);
  static const Color surface = Color(0xFF12161C);
  static const Color accentColor = Color(0xFF00F0FF);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0x99FFFFFF);
  static const Color borderColor = Color(0x0DFFFFFF);
  
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

  // Text Styles
  static const TextStyle heading1 = TextStyle(
    color: textPrimary,
    fontSize: 24,
    fontWeight: FontWeight.w900,
    letterSpacing: -0.5,
  );

  static const TextStyle heading2 = TextStyle(
    color: textPrimary,
    fontSize: 20,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
  );

  static const TextStyle body = TextStyle(
    color: textPrimary,
    fontSize: 14,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle caption = TextStyle(
    color: textSecondary,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
  );
  
  static const TextStyle label = TextStyle(
    color: textSecondary,
    fontSize: 10,
    fontWeight: FontWeight.w900,
    letterSpacing: 2.0,
  );
}
