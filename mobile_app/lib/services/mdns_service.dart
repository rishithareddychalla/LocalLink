import 'dart:convert';
import 'dart:io';
import 'package:multicast_dns/multicast_dns.dart';
import '../core/config.dart';
import '../models/device.dart';
import 'dart:async';

class MdnsService {
  final _devicesController = StreamController<List<Device>>.broadcast();
  Stream<List<Device>> get devicesStream => _devicesController.stream;
  
  final List<Device> _discoveredDevices = [];

  Future<void> startDiscovery() async {
    const String name = AppConfig.mdnsServiceType;
    final MDnsClient client = MDnsClient();
    await client.start();

    await for (final PtrResourceRecord ptr in client.lookup<PtrResourceRecord>(
        ResourceRecordQuery.serverPointer(name))) {
      await for (final SrvResourceRecord srv in client.lookup<SrvResourceRecord>(
          ResourceRecordQuery.service(ptr.domainName))) {
        await for (final IPAddressResourceRecord ip in client.lookup<IPAddressResourceRecord>(
            ResourceRecordQuery.addressIPv4(srv.target))) {
          
          final device = Device(
            id: srv.target,
            nickname: ptr.domainName.split('.').first,
            ipAddress: ip.address.address,
            status: 'online',
          );

          if (!_discoveredDevices.any((d) => d.ipAddress == device.ipAddress)) {
            _discoveredDevices.add(device);
            _devicesController.add(List.from(_discoveredDevices));
          }
        }
      }
    }
    client.stop();
  }
}
