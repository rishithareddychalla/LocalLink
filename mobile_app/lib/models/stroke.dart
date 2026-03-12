class Stroke {
  final String id;
  final String userId;
  final String type; // 'pencil', 'eraser', 'circle', 'square'
  final List<StrokePoint> points;
  final String color;
  final double size;

  Stroke({
    required this.id,
    required this.userId,
    required this.type,
    required this.points,
    required this.color,
    required this.size,
  });

  factory Stroke.fromJson(Map<String, dynamic> json) {
    return Stroke(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: json['type'] as String,
      points: (json['points'] as List)
          .map((p) => StrokePoint.fromJson(p))
          .toList(),
      color: json['color'] as String,
      size: (json['size'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type,
      'points': points.map((p) => p.toJson()).toList(),
      'color': color,
      'size': size,
    };
  }
}

class StrokePoint {
  final double x;
  final double y;

  StrokePoint(this.x, this.y);

  factory StrokePoint.fromJson(Map<String, dynamic> json) {
    return StrokePoint(
      (json['x'] as num).toDouble(),
      (json['y'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'x': x,
      'y': y,
    };
  }
}
