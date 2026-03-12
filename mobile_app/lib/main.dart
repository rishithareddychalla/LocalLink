import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/design_system.dart';
import 'core/config.dart';
import 'services/auth_service.dart';
import 'services/socket_service.dart';
import 'services/mdns_service.dart';
import 'services/api_service.dart';
import 'screens/landing_screen.dart';
import 'screens/dashboard_screen.dart';
import 'models/user.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppConfig.init();
  
  final socketService = SocketService();
  final mdnsService = MdnsService();
  
  runApp(
    MultiProvider(
      providers: [
        Provider.value(value: socketService),
        Provider.value(value: mdnsService),
        // Add more providers as needed
      ],
      child: const LocalLinkApp(),
    ),
  );
}

class LocalLinkApp extends StatelessWidget {
  const LocalLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LocalLink',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: DesignSystem.background,
        colorScheme: const ColorScheme.dark(
          primary: DesignSystem.accentColor,
          surface: DesignSystem.surface,
          onSurface: DesignSystem.textPrimary,
        ),
        fontFamily: 'Inter',
        appBarTheme: const AppBarTheme(
          backgroundColor: DesignSystem.background,
          elevation: 0,
          titleTextStyle: DesignSystem.heading2,
        ),
        textTheme: const TextTheme(
          displayLarge: DesignSystem.heading1,
          headlineMedium: DesignSystem.heading2,
          bodyLarge: DesignSystem.body,
          bodySmall: DesignSystem.caption,
          labelLarge: DesignSystem.label,
        ),
      ),
      home: const AuthCheck(),
    );
  }
}

class AuthCheck extends StatefulWidget {
  const AuthCheck({super.key});

  @override
  State<AuthCheck> createState() => _AuthCheckState();
}

class _AuthCheckState extends State<AuthCheck> {
  bool _isLoading = true;
  User? _user;
  bool _isHealthy = false;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    await _checkHealth();
    await _checkAuth();
  }

  Future<void> _checkHealth() async {
    try {
      final response = await ApiService.get('/health');
      if (response['status'] == 'ok') {
        setState(() => _isHealthy = true);
      }
    } catch (e) {
      print('Health check failed: $e');
      setState(() => _isHealthy = false);
    }
  }

  Future<void> _checkAuth() async {
    final user = await AuthService.getCurrentUser();
    if (user != null && _isHealthy) {
      if (mounted) context.read<SocketService>().connect(user);
    }
    setState(() {
      _user = user;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    return _user != null ? const DashboardScreen() : const LandingScreen();
  }
}
