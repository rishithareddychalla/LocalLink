import 'package:shared_preferences/shared_preferences.dart';

class AppConfig {
  static const String appName = 'LocalLink Radar';
  
  static String _baseIp = '10.30.201.85'; 
  static const String port = '5000';
  
  // As requested: primary backend URL
  static String get backendUrl => 'http://$_baseIp:$port';
  
  // Specific API base
  static String get baseUrl => '$backendUrl/api';
  
  static String get currentIp => _baseIp;

  // mDNS service name
  static const String mdnsServiceType = '_locallink._tcp';

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _baseIp = prefs.getString('llr_server_ip') ?? _baseIp;
  }

  static Future<void> setServerIp(String ip) async {
    _baseIp = ip;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('llr_server_ip', ip);
  }
}
