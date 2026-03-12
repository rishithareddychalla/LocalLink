import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../core/design_system.dart';

class RadarVisualization extends StatefulWidget {
  const RadarVisualization({super.key});

  @override
  State<RadarVisualization> createState() => _RadarVisualizationState();
}

class _RadarVisualizationState extends State<RadarVisualization>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 350,
      width: double.infinity,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Static Circles
          ...List.generate(3, (index) {
            final radius = (index + 1) * 60.0 + 40.0;
            return Container(
              width: radius * 2,
              height: radius * 2,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: DesignSystem.radarCircle,
                  width: 1,
                ),
              ),
            );
          }),

          // Pulse Animation
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Stack(
                alignment: Alignment.center,
                children: List.generate(2, (index) {
                  final delay = index * 0.5;
                  double progress = (_controller.value + delay) % 1.0;
                  return Opacity(
                    opacity: 1.0 - progress,
                    child: Container(
                      width: progress * 300,
                      height: progress * 300,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: DesignSystem.radarPulse.withOpacity(0.5),
                          width: 2,
                        ),
                      ),
                    ),
                  );
                }),
              );
            },
          ),

          // Central Profile Icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: DesignSystem.accentColor.withOpacity(0.1),
              boxShadow: [
                BoxShadow(
                  color: DesignSystem.accentColor.withOpacity(0.2),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.person,
                color: DesignSystem.accentColor,
                size: 40,
              ),
            ),
          ),

          // Device: MacBook Pro
          Positioned(
            top: 40,
            right: 40,
            child: _DeviceNode(
              icon: Icons.laptop,
              name: 'MacBook Pro',
              distance: '2.4m away',
              color: Colors.deepPurpleAccent,
            ),
          ),

          // Device: iPhone 15
          Positioned(
            bottom: 60,
            right: 20,
            child: _DeviceNode(
              icon: Icons.phone_android,
              name: 'iPhone 15',
              distance: '1.1m away',
              color: Colors.blueGrey,
            ),
          ),
        ],
      ),
    );
  }
}

class _DeviceNode extends StatelessWidget {
  final IconData icon;
  final String name;
  final String distance;
  final Color color;

  const _DeviceNode({
    required this.icon,
    required this.name,
    required this.distance,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: DesignSystem.surface.withOpacity(0.8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DesignSystem.borderColor),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                distance,
                style: TextStyle(
                  color: DesignSystem.accentColor.withOpacity(0.7),
                  fontSize: 8,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
