import 'package:flutter/material.dart';
import '../models/device.dart';
import '../core/design_system.dart';

class DeviceCard extends StatelessWidget {
  final Device device;

  const DeviceCard({super.key, required this.device});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 130,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DesignSystem.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: DesignSystem.borderColor),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: DesignSystem.accentColor.withOpacity(0.3), width: 1),
            ),
            child: CircleAvatar(
              radius: 20,
              backgroundColor: DesignSystem.accentColor.withOpacity(0.1),
              child: Text(
                device.nickname[0].toUpperCase(),
                style: const TextStyle(color: DesignSystem.accentColor, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            device.nickname.toUpperCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: DesignSystem.label.copyWith(color: DesignSystem.textPrimary, fontSize: 10),
          ),
          const SizedBox(height: 4),
          Text(
            device.ipAddress,
            style: DesignSystem.caption.copyWith(fontSize: 8, color: Colors.white24),
          ),
        ],
      ),
    );
  }
}
