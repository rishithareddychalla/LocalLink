import 'user.dart';

class Room {
  final String id;
  final String name;
  final String creatorId;
  final String? password;
  final bool isPrivate;
  final int participantCount;
  final List<User>? participants;
  final DateTime? expiresAt;

  Room({
    required this.id,
    required this.name,
    required this.creatorId,
    this.password,
    this.isPrivate = false,
    this.participantCount = 0,
    this.participants,
    this.expiresAt,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] as String,
      name: json['name'] as String,
      creatorId: json['creatorId'] as String,
      password: json['password'] as String?,
      isPrivate: json['isPrivate'] ?? false,
      participantCount: json['participantCount'] ?? json['connectedCount'] ?? json['members'] ?? 0,
      participants: json['participants'] != null
          ? (json['participants'] as List)
              .map((p) => User.fromJson(p))
              .toList()
          : null,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'creatorId': creatorId,
      'password': password,
      'isPrivate': isPrivate,
      'participantCount': participantCount,
      'participants': participants?.map((p) => p.toJson()).toList(),
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }
}
