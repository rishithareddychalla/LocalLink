import 'package:flutter/material.dart';
import '../services/socket_service.dart';
import '../services/webrtc_service.dart';
import '../models/stroke.dart';
import '../core/design_system.dart';
import 'dart:async';
import 'package:uuid/uuid.dart';

class DrawCanvas extends StatefulWidget {
  final String roomId;
  final SocketService socketService;
  final WebRtcService? webrtcService;

  const DrawCanvas({
    super.key, 
    required this.roomId, 
    required this.socketService,
    this.webrtcService,
  });

  @override
  State<DrawCanvas> createState() => _DrawCanvasState();
}

class _DrawCanvasState extends State<DrawCanvas> {
  final Map<String, Stroke> _strokes = {}; // strokeId -> Stroke
  Stroke? _currentStroke;
  String _activeTool = 'pencil';
  Color _brushColor = DesignSystem.accentColor;
  double _brushSize = 2.0;
  Timer? _syncTimer;
  final _uuid = Uuid();

  @override
  void initState() {
    super.initState();
    _setupListeners();
  }

  void _setupListeners() {
    widget.socketService.strokeStream.listen((data) {
      if (data['roomId'] == widget.roomId) {
        final strokeData = data['stroke'];
        _handleIncomingStroke(strokeData);
      }
    });

    widget.webrtcService?.onMessage.listen((msg) {
      final data = msg['data'];
      if (data['type'] == 'stroke_update') {
        _handleIncomingStroke(data['stroke']);
      }
    });
  }

  void _handleIncomingStroke(Map<String, dynamic> strokeData) {
    setState(() {
      final stroke = Stroke.fromJson(strokeData);
      _strokes[stroke.id] = stroke;
    });
  }

  void _startDrawing(Offset localPosition) {
    if (_activeTool == 'select') return;

    setState(() {
      final id = 'stroke-${_uuid.v4()}';
      _currentStroke = Stroke(
        id: id,
        userId: 'me',
        type: _activeTool,
        points: [StrokePoint(localPosition.dx, localPosition.dy)],
        color: _activeTool == 'eraser' ? '#000000' : '#${_brushColor.value.toRadixString(16).substring(2)}',
        size: _activeTool == 'eraser' ? 30.0 : _brushSize,
      );
      _strokes[id] = _currentStroke!;
    });

    _startSyncTimer();
  }

  void _updateDrawing(Offset localPosition) {
    if (_currentStroke == null) return;

    setState(() {
      if (_currentStroke!.type == 'square' || _currentStroke!.type == 'circle') {
        if (_currentStroke!.points.length > 1) {
          _currentStroke!.points[1] = StrokePoint(localPosition.dx, localPosition.dy);
        } else {
          _currentStroke!.points.add(StrokePoint(localPosition.dx, localPosition.dy));
        }
      } else {
        _currentStroke!.points.add(StrokePoint(localPosition.dx, localPosition.dy));
      }
      _strokes[_currentStroke!.id] = _currentStroke!;
    });
  }

  void _stopDrawing() {
    if (_currentStroke == null) return;

    _syncStroke();
    _syncTimer?.cancel();
    _currentStroke = null;
  }

  void _startSyncTimer() {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      _syncStroke();
    });
  }

  void _syncStroke() {
    if (_currentStroke == null) return;

    final data = {
      'type': 'stroke_update',
      'roomId': widget.roomId,
      'stroke': _currentStroke!.toJson(),
    };

    // Send via WebRTC for low latency if connected
    widget.webrtcService?.sendToAll(data);
    
    // Fallback to Socket.IO
    widget.socketService.sendStroke(widget.roomId, _currentStroke!.toJson());
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GestureDetector(
          onPanStart: (details) {
            RenderBox renderBox = context.findRenderObject() as RenderBox;
            _startDrawing(renderBox.globalToLocal(details.globalPosition));
          },
          onPanUpdate: (details) {
            RenderBox renderBox = context.findRenderObject() as RenderBox;
            _updateDrawing(renderBox.globalToLocal(details.globalPosition));
          },
          onPanEnd: (_) => _stopDrawing(),
          child: CustomPaint(
            painter: MultiUserPainter(strokes: _strokes.values.toList()),
            size: Size.infinite,
          ),
        ),
        _buildToolbar(),
      ],
    );
  }

  Widget _buildToolbar() {
    return Positioned(
      top: 20,
      left: 20,
      right: 20,
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: DesignSystem.surface.withOpacity(0.9),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: DesignSystem.borderColor),
            boxShadow: DesignSystem.neonGlow(DesignSystem.accentColor.withOpacity(0.1)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildToolButton('pencil', Icons.edit_outlined),
              _buildToolButton('square', Icons.crop_square),
              _buildToolButton('circle', Icons.radio_button_unchecked),
              _buildToolButton('eraser', Icons.auto_fix_normal_outlined),
              const VerticalDivider(color: Colors.white10, width: 20),
              _buildColorButton(DesignSystem.accentColor),
              _buildColorButton(Colors.purpleAccent),
              _buildColorButton(Colors.orangeAccent),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildToolButton(String tool, IconData icon) {
    final isSelected = _activeTool == tool;
    return IconButton(
      icon: Icon(icon, color: isSelected ? DesignSystem.accentColor : Colors.white24, size: 20),
      onPressed: () => setState(() => _activeTool = tool),
    );
  }

  Widget _buildColorButton(Color color) {
    final isSelected = _brushColor == color;
    return GestureDetector(
      onTap: () => setState(() => _brushColor = color),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        width: 20,
        height: 20,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: isSelected ? Border.all(color: Colors.white, width: 2) : null,
        ),
      ),
    );
  }
}

class MultiUserPainter extends CustomPainter {
  final List<Stroke> strokes;

  MultiUserPainter({required this.strokes});

  @override
  void paint(Canvas canvas, Size size) {
    for (final stroke in strokes) {
      final colorHex = stroke.color.replaceFirst('#', '');
      final paint = Paint()
        ..color = Color(int.parse(colorHex, radix: 16) | 0xFF000000)
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..strokeWidth = stroke.size
        ..style = PaintingStyle.stroke;

      if (stroke.type == 'eraser') {
        paint.blendMode = BlendMode.clear;
      }

      if (stroke.points.isEmpty) continue;

      final path = Path();
      if (stroke.type == 'square' && stroke.points.length > 1) {
        path.addRect(Rect.fromPoints(
          Offset(stroke.points[0].x, stroke.points[0].y),
          Offset(stroke.points[1].x, stroke.points[1].y),
        ));
      } else if (stroke.type == 'circle' && stroke.points.length > 1) {
        final center = Offset(stroke.points[0].x, stroke.points[0].y);
        final end = Offset(stroke.points[1].x, stroke.points[1].y);
        final radius = (end - center).distance;
        path.addOval(Rect.fromCircle(center: center, radius: radius));
      } else {
        path.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (int i = 1; i < stroke.points.length; i++) {
          path.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
      }

      // If eraser, we need to save layer for clear blend mode to work on current canvas correctly
      if (stroke.type == 'eraser') {
        canvas.saveLayer(Rect.fromLTWH(0, 0, size.width, size.height), Paint());
        canvas.drawPath(path, paint);
        canvas.restore();
      } else {
        canvas.drawPath(path, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant MultiUserPainter oldDelegate) => true;
}
