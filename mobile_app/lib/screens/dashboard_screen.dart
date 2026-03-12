import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/socket_service.dart';
import '../services/mdns_service.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/network_service.dart';
import '../models/device.dart';
import '../models/room.dart';
import '../core/design_system.dart';
import '../widgets/device_card.dart';
import 'room_interface_screen.dart';
import 'qr_join_screen.dart';
import 'landing_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Room> _rooms = [];
  bool _isLoadingRooms = true;
  List<Device> _nearbyNodes = [];
  bool _isLoadingNodes = true;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _fetchData();
    // context.read<MdnsService>().startDiscovery(); // Keep mDNS as backup? Or just use API
  }

  Future<void> _fetchData() async {
    await Future.wait([
      _fetchRooms(),
      _fetchNearbyNodes(),
    ]);
  }

  Future<void> _fetchNearbyNodes() async {
    setState(() => _isLoadingNodes = true);
    final devices = await NetworkService.getNearbyDevices();
    setState(() {
      _nearbyNodes = devices;
      _isLoadingNodes = false;
    });
  }

  Future<void> _fetchRooms() async {
    try {
      final response = await ApiService.get('/rooms');
      final List<dynamic> data = response['rooms'];
      setState(() {
        _rooms = data.map((r) => Room.fromJson(r)).toList();
        _isLoadingRooms = false;
      });
    } catch (e) {
      print('Error fetching rooms: $e');
      setState(() => _isLoadingRooms = false);
    }
  }

  void _createRoom() async {
    try {
      final response = await ApiService.post('/rooms/create', {
        'name': 'Room ${DateTime.now().millisecondsSinceEpoch % 1000}',
      });
      final room = Room.fromJson(response['data']);
      _fetchRooms();
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => RoomInterfaceScreen(room: room),
          ),
        );
      }
    } catch (e) {
      print('Error creating room: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: DesignSystem.background,
      appBar: AppBar(
        title: const Text('RADAR DASHBOARD', style: DesignSystem.heading2),
        leading: IconButton(
          icon: const Icon(Icons.menu, color: DesignSystem.accentColor),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: DesignSystem.accentColor),
            onPressed: _fetchData,
          ),
          IconButton(
            icon: const Icon(Icons.qr_code_scanner, color: DesignSystem.accentColor),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QrJoinScreen()),
              );
            },
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: RefreshIndicator(
        onRefresh: _fetchRooms,
        color: DesignSystem.accentColor,
        backgroundColor: DesignSystem.surface,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader('NEARBY NODES', Icons.radar),
              const SizedBox(height: 16),
              _isLoadingNodes
                  ? const Center(child: Padding(
                      padding: EdgeInsets.all(20.0),
                      child: CircularProgressIndicator(color: DesignSystem.accentColor),
                    ))
                  : _nearbyNodes.isEmpty
                      ? _buildEmptyState('No nodes discovered yet...', Icons.wifi_find)
                      : SizedBox(
                          height: 140,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: _nearbyNodes.length,
                            itemBuilder: (context, index) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: DeviceCard(device: _nearbyNodes[index]),
                              );
                            },
                          ),
                        ),
              const SizedBox(height: 32),
              _buildSectionHeader('OPEN CHANNELS', Icons.meeting_room),
              const SizedBox(height: 16),
              _isLoadingRooms
                  ? const Center(child: CircularProgressIndicator(color: DesignSystem.accentColor))
                  : _rooms.isEmpty
                      ? _buildEmptyState('No active channels found', Icons.layers_clear)
                      : Column(
                          children: _rooms.map((room) => _buildRoomItem(room)).toList(),
                        ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createRoom,
        backgroundColor: DesignSystem.accentColor,
        foregroundColor: Colors.black,
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: DesignSystem.accentColor),
        const SizedBox(width: 10),
        Text(title, style: DesignSystem.label),
        const Spacer(),
        const Icon(Icons.arrow_forward_ios, size: 10, color: Colors.white24),
      ],
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: DesignSystem.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: DesignSystem.borderColor),
      ),
      child: Column(
        children: [
          Icon(icon, size: 32, color: Colors.white10),
          const SizedBox(height: 12),
          Text(
            message,
            style: DesignSystem.caption.copyWith(color: Colors.white24),
          ),
        ],
      ),
    );
  }

  Widget _buildRoomItem(Room room) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: DesignSystem.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DesignSystem.borderColor),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: DesignSystem.accentColor.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.group, color: DesignSystem.accentColor),
        ),
        title: Text(room.name, style: DesignSystem.heading2.copyWith(fontSize: 16)),
        subtitle: Text(
          '${room.participantCount} PEERS ACTIVE • SECURE',
          style: DesignSystem.label.copyWith(fontSize: 9),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.white24),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => RoomInterfaceScreen(room: room),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, bool active, {Color? color, Widget? screen}) {
    return ListTile(
      leading: Icon(icon, color: active ? DesignSystem.accentColor : (color ?? Colors.white70), size: 20),
      title: Text(
        title,
        style: TextStyle(
          color: active ? DesignSystem.accentColor : (color ?? Colors.white70),
          fontWeight: active ? FontWeight.bold : FontWeight.normal,
          fontSize: 14,
        ),
      ),
      onTap: () {
        Navigator.pop(context);
        if (screen != null) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
        } else if (title == 'Logout') {
          _handleLogout();
        }
      },
    );
  }

  void _handleLogout() async {
    await AuthService.logout();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LandingScreen()),
        (route) => false,
      );
    }
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: DesignSystem.background,
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: DesignSystem.borderColor)),
            ),
            child: Row(
              children: [
                const Icon(Icons.radar, color: DesignSystem.accentColor, size: 32),
                const SizedBox(width: 16),
                const Text('LOCALLINK', style: DesignSystem.heading2),
              ],
            ),
          ),
          _buildDrawerItem(Icons.dashboard, 'Dashboard', true),
          _buildDrawerItem(Icons.layers, 'Rooms', false), // To be implemented
          _buildDrawerItem(Icons.folder, 'Files', false),  // To be implemented
          _buildDrawerItem(Icons.person, 'Profile', false), // To be implemented
          const Spacer(),
          _buildDrawerItem(Icons.settings, 'Settings', false), // To be implemented
          _buildDrawerItem(Icons.logout, 'Logout', false, color: Colors.redAccent),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
