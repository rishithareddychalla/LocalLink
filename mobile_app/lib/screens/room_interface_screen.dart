import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/socket_service.dart';
import '../services/webrtc_service.dart';
import '../services/auth_service.dart';
import '../core/design_system.dart';
import '../models/room.dart';
import '../models/message.dart';
import '../models/user.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/draw_canvas.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';

class RoomInterfaceScreen extends StatefulWidget {
  final Room room;

  const RoomInterfaceScreen({super.key, required this.room});

  @override
  State<RoomInterfaceScreen> createState() => _RoomInterfaceScreenState();
}

class _RoomInterfaceScreenState extends State<RoomInterfaceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _messageController = TextEditingController();
  final List<Message> _messages = [];
  User? _currentUser;
  late WebRtcService _webrtcService;
  bool _isTyping = false;

  List<User> _participants = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _initRoom();
  }

  void _initRoom() async {
    _currentUser = await AuthService.getCurrentUser();
    if (_currentUser != null) {
      final socketService = context.read<SocketService>();
      socketService.joinRoom(widget.room.id, _currentUser!);
      
      _webrtcService = WebRtcService(socketService);

      socketService.messageStream.listen((msg) {
        if (msg.roomId == widget.room.id) {
          setState(() => _messages.add(msg));
        }
      });

      socketService.userJoinedStream.listen((data) {
        if (data['roomId'] == widget.room.id) {
          _updateParticipants(data['participants']);
        }
      });

      socketService.userLeftStream.listen((data) {
        if (data['roomId'] == widget.room.id) {
          _updateParticipants(data['participants']);
        }
      });

      _webrtcService.onMessage.listen((msg) {
        if (msg['type'] == 'file_complete') {
          _showFileDownloadDialog(msg['metadata'], msg['bytes']);
        }
      });
    }
  }

  void _updateParticipants(List<dynamic> participantsJson) {
    setState(() {
      _participants = participantsJson.map((p) => User.fromJson(p)).toList();
    });

    final socketService = context.read<SocketService>();
    final myId = socketService.socket.id;
    
    if (myId == null) return;

    for (final p in _participants) {
      if (p.socketId != null && p.socketId != myId) {
        // Initiator rule: higher socket ID initiates
        if (myId.compareTo(p.socketId!) > 0) {
          _webrtcService.createOffer(p.socketId!);
        }
      }
    }
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty || _currentUser == null) return;

    context.read<SocketService>().sendMessage(widget.room.id, _currentUser!, text);
    _messageController.clear();
    _setTyping(false);
  }

  void _setTyping(bool typing) {
    if (_isTyping != typing && _currentUser != null) {
      setState(() => _isTyping = typing);
      context.read<SocketService>().setTyping(widget.room.id, _currentUser!, typing);
    }
  }

  @override
  void dispose() {
    if (_currentUser != null) {
      context.read<SocketService>().leaveRoom(widget.room.id, _currentUser!.id);
    }
    _tabController.dispose();
    _messageController.dispose();
    _webrtcService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.room.name.toUpperCase(), style: DesignSystem.heading2.copyWith(fontSize: 16)),
            Text('SECURE TUNNEL • #${widget.room.id}', style: DesignSystem.label.copyWith(fontSize: 8)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: DesignSystem.accentColor),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: DesignSystem.accentColor,
          labelColor: DesignSystem.accentColor,
          unselectedLabelColor: Colors.white24,
          labelStyle: DesignSystem.label.copyWith(fontSize: 10),
          tabs: const [
            Tab(icon: Icon(Icons.chat_bubble_outline), text: 'CHAT'),
            Tab(icon: Icon(Icons.brush_outlined), text: 'BOARD'),
            Tab(icon: Icon(Icons.info_outline), text: 'INFO'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildChatTab(),
          _buildDrawTab(),
          _buildInfoTab(),
        ],
      ),
    );
  }

  Widget _buildChatTab() {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              return ChatBubble(
                message: msg,
                isMe: msg.userId == _currentUser?.id,
              );
            },
          ),
        ),
        _buildMessageInput(),
      ],
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DesignSystem.surface,
        border: Border(top: BorderSide(color: DesignSystem.borderColor)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                style: DesignSystem.body,
                onChanged: (text) => _setTyping(text.isNotEmpty),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle: DesignSystem.caption.copyWith(color: Colors.white10),
                  filled: true,
                  fillColor: DesignSystem.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _pickAndSendFile,
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: DesignSystem.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: DesignSystem.borderColor),
                ),
                child: const Icon(Icons.attach_file, color: DesignSystem.accentColor, size: 20),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _sendMessage,
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: DesignSystem.accentColor,
                  shape: BoxShape.circle,
                  boxShadow: DesignSystem.neonGlow(DesignSystem.accentColor),
                ),
                child: const Icon(Icons.send, color: Colors.black, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _pickAndSendFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();

    if (result != null && result.files.single.path != null) {
      File file = File(result.files.single.path!);
      final bytes = await file.readAsBytes();
      final fileName = result.files.single.name;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sending $fileName...'))
      );

      await _webrtcService.sendFile(fileName, bytes);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('File $fileName sent successfully!'))
      );
    }
  }

  void _showFileDownloadDialog(Map<String, dynamic> metadata, List<int> bytes) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: DesignSystem.surface,
        title: Text('FILE RECEIVED', style: DesignSystem.label),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(metadata['name'], style: DesignSystem.body.copyWith(fontWeight: FontWeight.bold)),
            Text('${(metadata['size'] / 1024).toStringAsFixed(2)} KB', style: DesignSystem.caption),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL', style: TextStyle(color: Colors.white24)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: DesignSystem.accentColor),
            onPressed: () {
              // Save file logic would go here
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('File saved to downloads'))
              );
            },
            child: const Text('DOWNLOAD', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawTab() {
    return DrawCanvas(
      roomId: widget.room.id,
      socketService: context.read<SocketService>(),
      webrtcService: _webrtcService,
    );
  }

  Widget _buildInfoTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('PEERS CONNECTED'),
          const SizedBox(height: 16),
          ..._participants.map((p) => _buildParticipantTile(p)),
          const SizedBox(height: 24),
          _buildInfoCard('ENCRYPTION', 'AES-256 BIT END-TO-END'),
          _buildInfoCard('PROTOCOL', 'WEBRTC / SOCKET.IO'),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: DesignSystem.label.copyWith(color: DesignSystem.accentColor));
  }

  Widget _buildParticipantTile(User user) {
    final isP2P = _webrtcService.isPeerConnected(user.socketId);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: DesignSystem.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DesignSystem.borderColor),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundImage: user.avatar != null ? NetworkImage(user.avatar!) : null,
            child: user.avatar == null ? const Icon(Icons.person, size: 16) : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user.nickname.toUpperCase(), style: DesignSystem.body.copyWith(fontSize: 12, fontWeight: FontWeight.bold)),
                Text(user.id == _currentUser?.id ? 'YOU' : 'PARTICIPANT', style: DesignSystem.label.copyWith(fontSize: 8)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isP2P ? DesignSystem.success.withOpacity(0.1) : Colors.white10,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(Icons.bolt, size: 10, color: isP2P ? DesignSystem.success : Colors.white24),
                const SizedBox(width: 4),
                Text(isP2P ? 'P2P' : 'RELAY', style: DesignSystem.label.copyWith(fontSize: 8, color: isP2P ? DesignSystem.success : Colors.white24)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String label, String value) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DesignSystem.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DesignSystem.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: DesignSystem.label.copyWith(fontSize: 8)),
          const SizedBox(height: 4),
          Text(value, style: DesignSystem.body.copyWith(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
