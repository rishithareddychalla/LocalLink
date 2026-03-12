import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../core/config.dart';
import '../models/user.dart';
import '../models/message.dart';
import 'dart:async';

class SocketService {
  late IO.Socket socket;
  final _messageController = StreamController<Message>.broadcast();
  final _strokeController = StreamController<Map<String, dynamic>>.broadcast();
  final _roomUpdateController = StreamController<Map<String, dynamic>>.broadcast();
  final _signalController = StreamController<Map<String, dynamic>>.broadcast();
  final _userJoinedController = StreamController<Map<String, dynamic>>.broadcast();
  final _userLeftController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Message> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get strokeStream => _strokeController.stream;
  Stream<Map<String, dynamic>> get roomUpdateStream => _roomUpdateController.stream;
  Stream<Map<String, dynamic>> get signalStream => _signalController.stream;
  Stream<Map<String, dynamic>> get userJoinedStream => _userJoinedController.stream;
  Stream<Map<String, dynamic>> get userLeftStream => _userLeftController.stream;

  void connect(User user) {
    socket = IO.io(AppConfig.backendUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .build());

    socket.connect();

    socket.onConnect((_) {
      print('Connected to Socket.IO');
      socket.emit('identify', user.toJson());
    });

    socket.on('receive_message', (data) {
      _messageController.add(Message.fromJson(data));
    });

    socket.on('receive_stroke', (data) {
      _strokeController.add(data);
    });

    socket.on('user_joined', (data) {
      _userJoinedController.add(data);
    });

    socket.on('user_left', (data) {
      _userLeftController.add(data);
    });

    socket.on('typing_update', (data) {
      _roomUpdateController.add({'type': 'typing', 'data': data});
    });

    socket.on('room_expired', (data) {
      _roomUpdateController.add({'type': 'expired', 'data': data});
    });

    socket.on('room_closed', (data) {
      _roomUpdateController.add({'type': 'closed', 'data': data});
    });

    socket.on('file_uploaded', (data) {
      _roomUpdateController.add({'type': 'file', 'data': data});
    });

    socket.on('room_updated', (data) {
      _roomUpdateController.add({'type': 'update', 'data': data});
    });

    // WebRTC Signaling
    socket.on('webrtc_offer', (data) => _signalController.add({'type': 'offer', 'data': data}));
    socket.on('webrtc_answer', (data) => _signalController.add({'type': 'answer', 'data': data}));
    socket.on('webrtc_ice_candidate', (data) => _signalController.add({'type': 'candidate', 'data': data}));

    socket.onDisconnect((_) => print('Disconnected from Socket.IO'));
  }

  void joinRoom(String roomId, User user) {
    socket.emit('join_room', {
      'roomId': roomId,
      'user': user.toJson(),
    });
  }

  void leaveRoom(String roomId, String userId) {
    socket.emit('leave_room', {
      'roomId': roomId,
      'userId': userId,
    });
  }

  void sendMessage(String roomId, User user, String text) {
    socket.emit('send_message', {
      'roomId': roomId,
      'userId': user.id,
      'nickname': user.nickname,
      'avatar': user.avatar,
      'message': text,
    });
  }

  void sendStroke(String roomId, Map<String, dynamic> stroke) {
    socket.emit('send_stroke', {
      'roomId': roomId,
      'stroke': stroke,
    });
  }

  void sendSignal(String type, String target, dynamic data) {
    socket.emit('webrtc_$type', {
      'target': target,
      type: data,
    });
  }

  void setTyping(String roomId, User user, bool isTyping) {
    socket.emit('typing', {
      'roomId': roomId,
      'userId': user.id,
      'nickname': user.nickname,
      'isTyping': isTyping,
    });
  }

  void dispose() {
    socket.dispose();
    _messageController.close();
    _strokeController.close();
    _roomUpdateController.close();
    _signalController.close();
  }
}
