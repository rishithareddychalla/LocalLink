import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/room.dart';
import 'room_interface_screen.dart';

class QrJoinScreen extends StatelessWidget {
  const QrJoinScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan QR to Join')),
      body: MobileScanner(
        onDetect: (capture) async {
          final List<Barcode> barcodes = capture.barcodes;
          if (barcodes.isNotEmpty) {
            final String? code = barcodes.first.rawValue;
            if (code != null) {
              // Assuming QR contains roomId
              try {
                final response = await ApiService.get('/rooms/$code');
                final room = Room.fromJson(response['data']);
                if (context.mounted) {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => RoomInterfaceScreen(room: room),
                    ),
                  );
                }
              } catch (e) {
                print('QR Join error: $e');
              }
            }
          }
        },
      ),
    );
  }
}
