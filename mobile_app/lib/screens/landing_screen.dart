import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/socket_service.dart';
import '../core/design_system.dart';
import '../core/config.dart';
import '../widgets/radar_visualization.dart';
import 'dashboard_screen.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  final _nicknameController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    // For now, if nickname is empty, show a dialog or just use a default/placeholder
    // In the new UI, we might want a cleaner way to handle this.
    // Let's show a simple nickname dialog when "Enter Local Network" is pressed if not set.
    String? nickname = await _showNicknameDialog();
    if (nickname == null || nickname.isEmpty) return;

    setState(() => _isLoading = true);
    
    try {
      final user = await AuthService.login(nickname);
      
      if (user != null) {
        if (mounted) {
          context.read<SocketService>().connect(user);
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const DashboardScreen()),
          );
        }
      } else {
        if (mounted) {
          final currentUrl = AppConfig.baseUrl;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to reach $currentUrl. Check IP/Firewall.'),
              backgroundColor: DesignSystem.error,
              duration: const Duration(seconds: 8),
              action: SnackBarAction(
                label: 'DIAGNOSE',
                textColor: Colors.white,
                onPressed: () => _showIpDialog(),
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: DesignSystem.error,
          ),
        );
      }
    }
    
    setState(() => _isLoading = false);
  }

  Future<String?> _showNicknameDialog() async {
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: DesignSystem.surface,
        title: const Text('IDENTIFICATION', style: DesignSystem.label),
        content: TextField(
          controller: _nicknameController,
          autofocus: true,
          style: DesignSystem.body,
          decoration: InputDecoration(
            hintText: 'Enter Nickname...',
            hintStyle: DesignSystem.caption.copyWith(color: Colors.white24),
            filled: true,
            fillColor: DesignSystem.background.withOpacity(0.5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL', style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, _nicknameController.text.trim()),
            style: ElevatedButton.styleFrom(backgroundColor: DesignSystem.accentColor),
            child: const Text('START', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                   Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: DesignSystem.accentColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.radar, color: DesignSystem.accentColor, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'LocalLink',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  // Notification Bell
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: DesignSystem.surface,
                      shape: BoxShape.circle,
                      border: Border.all(color: DesignSystem.borderColor),
                    ),
                    child: const Icon(Icons.notifications, color: Colors.white70, size: 20),
                  ),
                  const SizedBox(width: 12),
                  // Avatar
                  const CircleAvatar(
                    radius: 20,
                    backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=a042581f4e29026704d'),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    const SizedBox(height: 24),
                    // Hero Text
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 40),
                      child: Column(
                        children: [
                          RichText(
                            textAlign: TextAlign.center,
                            text: const TextSpan(
                              style: DesignSystem.heroHeadline,
                              children: [
                                TextSpan(text: 'Connect Locally,\n'),
                                TextSpan(
                                  text: 'Instantly',
                                  style: TextStyle(color: DesignSystem.accentColor),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Discover nearby devices for seamless P2P sharing and collaboration.',
                            textAlign: TextAlign.center,
                            style: DesignSystem.heroSubheadline,
                          ),
                        ],
                      ),
                    ),

                    const RadarVisualization(),

                    const SizedBox(height: 32),

                    // Actions
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        children: [
                          _ActionButton(
                            label: 'Enter Local Network',
                            icon: Icons.cell_tower,
                            isPrimary: true,
                            onPressed: _isLoading ? null : _handleLogin,
                          ),
                          const SizedBox(height: 16),
                          _ActionButton(
                            label: 'Create Room',
                            icon: Icons.person_add_alt_1,
                            isPrimary: false,
                            onPressed: () {
                              // Navigate to Room Creation logic
                            },
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 48),
                    
                    // Server Config Link (Keep this for debugging)
                    TextButton(
                      onPressed: _showIpDialog,
                      child: Text(
                        'SERVER IP: ${AppConfig.currentIp}',
                        style: DesignSystem.caption.copyWith(color: Colors.white24, fontSize: 10),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _BottomNavBar(),
    );
  }

  void _showIpDialog() {
    final controller = TextEditingController(text: AppConfig.currentIp);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: DesignSystem.surface,
        title: const Text('SERVER CONFIGURATION', style: DesignSystem.heading2),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ENTER BACKEND HOST IP', style: DesignSystem.label),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              style: DesignSystem.body,
              decoration: InputDecoration(
                filled: true,
                fillColor: DesignSystem.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL', style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            onPressed: () async {
              await AppConfig.setServerIp(controller.text.trim());
              if (mounted) Navigator.pop(context);
              setState(() {});
            },
            style: ElevatedButton.styleFrom(backgroundColor: DesignSystem.accentColor),
            child: const Text('SAVE', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isPrimary;
  final VoidCallback? onPressed;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.isPrimary,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: isPrimary ? DesignSystem.accentColor : DesignSystem.surface,
        foregroundColor: isPrimary ? Colors.black : Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30),
          side: isPrimary ? BorderSide.none : BorderSide(color: DesignSystem.borderColor),
        ),
        elevation: 0,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 24),
          const SizedBox(width: 12),
          Text(
            label,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomNavBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: DesignSystem.background,
        border: Border(top: BorderSide(color: DesignSystem.borderColor)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavBarItem(icon: Icons.explore, label: 'Radar', isSelected: true),
          _NavBarItem(icon: Icons.people, label: 'Rooms', isSelected: false),
          _NavBarItem(icon: Icons.cloud_upload, label: 'Files', isSelected: false),
          _NavBarItem(icon: Icons.settings, label: 'Settings', isSelected: false),
        ],
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;

  const _NavBarItem({
    required this.icon,
    required this.label,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
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
          ),
        ),
      ],
    );
  }
}
