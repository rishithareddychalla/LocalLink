import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/socket_service.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/network_service.dart';
import '../models/device.dart';
import '../core/design_system.dart';
import '../widgets/global_app_header.dart';
import '../widgets/global_bottom_nav_bar.dart';
import 'landing_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Device> _nearbyNodes = [
    Device(id: 'ray', nickname: 'ray (You)', ipAddress: '10.30.201.85', deviceType: 'Laptop', status: 'online'),
    Device(id: 'rish', nickname: 'rish', ipAddress: '10.30.201.93', deviceType: 'Laptop', status: 'online'),
  ];
  bool _isLoadingNodes = true;
  String _userName = 'RAY'; // To be fetched from AuthService
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoadingNodes = true);
    try {
      final devices = await NetworkService.getNearbyDevices();
      if (devices.isNotEmpty) {
        setState(() => _nearbyNodes = devices);
      }
    } catch (e) {
      print('Error fetching nodes: $e');
    }
    setState(() => _isLoadingNodes = false);
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Section
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                      children: [
                        const TextSpan(text: 'WELCOME, '),
                        TextSpan(
                          text: _userName,
                          style: const TextStyle(color: DesignSystem.accentColor),
                        ),
                      ],
                    ),
                  ),
                  // Top Right Action
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      side: const BorderSide(color: Color(0xFF1E2A32)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'SCAN',
                      style: TextStyle(
                        color: DesignSystem.accentColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.1,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Sub-header details - using Wrap for responsiveness
              Wrap(
                spacing: 12,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  const Text(
                    'SUB-NET RADAR VIEW',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Container(width: 4, height: 4, decoration: const BoxDecoration(color: Colors.white38, shape: BoxShape.circle)),
                  Text(
                    '${_nearbyNodes.length} ACTIVE NODES',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 12,
                runSpacing: 4,
                children: [
                  const Text(
                    'IP: 10.30.201.85',
                    style: TextStyle(
                      color: DesignSystem.accentColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const Text(
                    'STATUS: CONNECTED',
                    style: TextStyle(
                      color: DesignSystem.success,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Search and Invite Row
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 54,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF131B21),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const TextField(
                    style: TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      icon: Icon(Icons.search, color: Colors.white70, size: 20),
                      hintText: 'SEARCH..',
                      hintStyle: TextStyle(
                        color: Colors.white24,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.1,
                      ),
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                height: 54,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F3238),
                    foregroundColor: DesignSystem.accentColor,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Icon(Icons.share_outlined, size: 20),
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Devices Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.78, // Adjusted for better height
            ),
            itemCount: _nearbyNodes.length,
            itemBuilder: (context, index) {
              return _RadarDeviceCard(device: _nearbyNodes[index]);
            },
          ),
          
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _RadarDeviceCard extends StatelessWidget {
  final Device device;

  const _RadarDeviceCard({required this.device});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF131B21),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Radar-like background for icon
          Stack(
            alignment: Alignment.center,
            children: [
              ...List.generate(3, (index) {
                final double size = 50.0 + (index * 15.0);
                return Container(
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: DesignSystem.accentColor.withOpacity(0.05),
                      width: 1,
                    ),
                  ),
                );
              }),
              const Icon(
                Icons.laptop,
                color: Colors.white,
                size: 28,
              ),
              // Status dot
              Positioned(
                bottom: 2,
                right: 2,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF00FF85),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0xFF00FF85),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              device.nickname,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            device.ipAddress,
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
