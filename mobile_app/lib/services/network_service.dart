import '../services/api_service.dart';
import '../models/device.dart';

class NetworkService {
  static Future<List<Device>> getNearbyDevices() async {
    try {
      final response = await ApiService.get('/network/devices');
      if (response['success'] == true) {
        final List<dynamic> devicesData = response['devices'];
        return devicesData.map((d) => Device(
          id: d['id'] ?? d['ip'] ?? 'unknown',
          nickname: d['name'] ?? d['nickname'] ?? 'Anonymous',
          ipAddress: d['ip'] ?? '0.0.0.0',
          status: d['status'] ?? 'online',
        )).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching network devices: $e');
      return [];
    }
  }
}
