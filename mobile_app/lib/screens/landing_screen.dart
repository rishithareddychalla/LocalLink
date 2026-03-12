import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/socket_service.dart';
import '../core/design_system.dart';
import '../core/config.dart';
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
    final nickname = _nicknameController.text.trim();
    if (nickname.isEmpty) return;

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: DesignSystem.accentColor.withOpacity(0.05),
              ),
            ),
          ),
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo with glow
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: DesignSystem.accentColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                      boxShadow: DesignSystem.heroGlow(DesignSystem.accentColor),
                    ),
                    child: const Icon(
                      Icons.radar,
                      size: 60,
                      color: DesignSystem.accentColor,
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'LOCALLINK RADAR',
                    style: DesignSystem.heading1,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'SECURE P2P COLLABORATION',
                    style: DesignSystem.label,
                  ),
                  const SizedBox(height: 60),
                  // Input Group
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: DesignSystem.surface,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: DesignSystem.borderColor),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'IDENTIFICATION',
                          style: DesignSystem.label,
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _nicknameController,
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
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: DesignSystem.accentColor,
                            foregroundColor: Colors.black,
                            minimumSize: const Size(double.infinity, 56),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 0,
                          ),
                          child: _isLoading 
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : const Text(
                                'START CONNECTING',
                                style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5),
                              ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 48),
                  // Server Config Link
                  TextButton.icon(
                    onPressed: _showIpDialog,
                    icon: const Icon(Icons.settings_ethernet, size: 16, color: Colors.white24),
                    label: Text(
                      'SERVER IP: ${AppConfig.currentIp}',
                      style: DesignSystem.caption.copyWith(color: Colors.white24, letterSpacing: 1),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'v1.0.0 • ENCRYPTED TUNNEL ACTIVE',
                    style: DesignSystem.caption.copyWith(fontSize: 10),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
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
