import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:uuid/uuid.dart';
import 'socket_service.dart';
import 'dart:async';
import 'dart:convert';

class WebRtcService {
  final SocketService socketService;
  final Map<String, RTCPeerConnection> _peerConnections = {};
  final Map<String, RTCDataChannel> _dataChannels = {};
  
  final _onMessageController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get onMessage => _onMessageController.stream;

  final Map<String, dynamic> _configuration = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'},
    ]
  };

  WebRtcService(this.socketService) {
    socketService.signalStream.listen((signal) {
      _handleSignal(signal);
    });
  }

  Future<void> _handleSignal(Map<String, dynamic> signal) async {
    final type = signal['type'];
    final data = signal['data'];
    final from = data['from'] as String;

    if (type == 'offer') {
      await _handleOffer(from, data['offer']);
    } else if (type == 'answer') {
      await _handleAnswer(from, data['answer']);
    } else if (type == 'candidate') {
      await _handleCandidate(from, data['candidate']);
    }
  }

  Future<RTCPeerConnection> _createPeerConnection(String remoteSocketId) async {
    final pc = await createPeerConnection(_configuration);
    
    pc.onIceCandidate = (candidate) {
      socketService.sendSignal('ice_candidate', remoteSocketId, candidate.toMap());
    };

    pc.onDataChannel = (channel) {
      _dataChannels[remoteSocketId] = channel;
      _setupDataChannel(remoteSocketId, channel);
    };

    pc.onConnectionState = (state) {
      print('WebRTC Connection State with $remoteSocketId: $state');
      if (state == RTCPeerConnectionState.RTCPeerConnectionStateDisconnected ||
          state == RTCPeerConnectionState.RTCPeerConnectionStateFailed ||
          state == RTCPeerConnectionState.RTCPeerConnectionStateClosed) {
        _removePeer(remoteSocketId);
      }
    };

    _peerConnections[remoteSocketId] = pc;
    return pc;
  }

  void _removePeer(String socketId) {
    _dataChannels[socketId]?.close();
    _dataChannels.remove(socketId);
    _peerConnections[socketId]?.dispose();
    _peerConnections.remove(socketId);
  }

  Future<void> createOffer(String targetId) async {
    if (_peerConnections.containsKey(targetId)) return;

    final pc = await _createPeerConnection(targetId);
    
    final dcInit = RTCDataChannelInit()..binaryType = 'text';
    final dc = await pc.createDataChannel('data', dcInit);
    _dataChannels[targetId] = dc;
    _setupDataChannel(targetId, dc);

    RTCSessionDescription offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socketService.sendSignal('offer', targetId, offer.toMap());
  }

  Future<void> _handleOffer(String from, Map<String, dynamic> offerData) async {
    final pc = await _createPeerConnection(from);
    
    await pc.setRemoteDescription(
      RTCSessionDescription(offerData['sdp'], offerData['type']));
    
    RTCSessionDescription answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketService.sendSignal('answer', from, answer.toMap());
  }

  Future<void> _handleAnswer(String from, Map<String, dynamic> answerData) async {
    final pc = _peerConnections[from];
    if (pc != null) {
      await pc.setRemoteDescription(
        RTCSessionDescription(answerData['sdp'], answerData['type']));
    }
  }

  Future<void> _handleCandidate(String from, Map<String, dynamic> candidateData) async {
    final pc = _peerConnections[from];
    if (pc != null) {
      await pc.addCandidate(
        RTCIceCandidate(candidateData['candidate'], candidateData['sdpMid'], candidateData['sdpMLineIndex']));
    }
  }

  final Map<String, _FileBuffer> _fileBuffers = {};

  void _setupDataChannel(String socketId, RTCDataChannel channel) {
    channel.onMessage = (RTCDataChannelMessage message) {
      try {
        final data = jsonDecode(message.text);
        final type = data['type'];
        final payload = data['payload'];

        if (type == 'file_start') {
          _handleFileStart(socketId, payload);
        } else if (type == 'file_chunk') {
          _handleFileChunk(socketId, payload);
        } else if (type == 'file_end') {
          _handleFileEnd(socketId, payload);
        } else {
          _onMessageController.add({
            'from': socketId,
            'data': data,
          });
        }
      } catch (e) {
        print('Error decoding WebRTC message: $e');
      }
    };
  }

  void _handleFileStart(String from, Map<String, dynamic> payload) {
    final fileId = payload['fileId'];
    final metadata = payload['metadata'];
    _fileBuffers[fileId] = _FileBuffer(metadata: metadata);
    print('Receiving file: ${metadata['name']} from $from');
  }

  void _handleFileChunk(String from, Map<String, dynamic> payload) {
    final fileId = payload['fileId'];
    final chunkBase64 = payload['chunk'];
    final buffer = _fileBuffers[fileId];
    if (buffer != null) {
      buffer.chunks.add(base64Decode(chunkBase64));
    }
  }

  void _handleFileEnd(String from, Map<String, dynamic> payload) {
    final fileId = payload['fileId'];
    final buffer = _fileBuffers.remove(fileId);
    if (buffer != null) {
      _onMessageController.add({
        'from': from,
        'type': 'file_complete',
        'fileId': fileId,
        'metadata': buffer.metadata,
        'bytes': buffer.getAllBytes(),
      });
      print('File complete: ${buffer.metadata['name']}');
    }
  }

  Future<void> sendFile(String fileName, List<int> bytes) async {
    final fileId = Uuid().v4();
    const chunkSize = 16384; // 16KB
    
    final metadata = {
      'id': fileId,
      'name': fileName,
      'size': bytes.length,
      'type': 'application/octet-stream', // Generic
    };

    sendToAll({
      'type': 'file_start',
      'payload': {'fileId': fileId, 'metadata': metadata}
    });

    for (var i = 0; i < bytes.length; i += chunkSize) {
      final end = (i + chunkSize < bytes.length) ? i + chunkSize : bytes.length;
      final chunk = bytes.sublist(i, end);
      sendToAll({
        'type': 'file_chunk',
        'payload': {
          'fileId': fileId,
          'chunk': base64Encode(chunk),
        }
      });
      // Small delay to prevent carrier congestion on some devices
      await Future.delayed(const Duration(milliseconds: 5));
    }

    sendToAll({
      'type': 'file_end',
      'payload': {'fileId': fileId}
    });
  }

  void sendToAll(Map<String, dynamic> data) {
    final message = jsonEncode(data);
    _dataChannels.forEach((socketId, channel) {
      if (channel.state == RTCDataChannelState.RTCDataChannelOpen) {
        channel.send(RTCDataChannelMessage(message));
      }
    });
  }

  void sendToPeer(String socketId, Map<String, dynamic> data) {
    final channel = _dataChannels[socketId];
    if (channel != null && channel.state == RTCDataChannelState.RTCDataChannelOpen) {
      channel.send(RTCDataChannelMessage(jsonEncode(data)));
    }
  }

  bool isPeerConnected(String? socketId) {
    if (socketId == null) return false;
    final pc = _peerConnections[socketId];
    return pc != null && pc.connectionState == RTCPeerConnectionState.RTCPeerConnectionStateConnected;
  }

  void dispose() {
    _dataChannels.forEach((_, dc) => dc.close());
    _peerConnections.forEach((_, pc) => pc.dispose());
    _dataChannels.clear();
    _peerConnections.clear();
    _onMessageController.close();
  }
}

class _FileBuffer {
  final Map<String, dynamic> metadata;
  final List<List<int>> chunks = [];

  _FileBuffer({required this.metadata});

  List<int> getAllBytes() {
    final bytes = <int>[];
    for (final chunk in chunks) {
      bytes.addAll(chunk);
    }
    return bytes;
  }
}
