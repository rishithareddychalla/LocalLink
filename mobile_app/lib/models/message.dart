class Message {
  final String id;
  final String roomId;
  final String? userId; // Null for system messages
  final String? nickname;
  final String? avatar;
  final String message;
  final String type; // 'user' or 'system'
  final int timestamp;

  Message({
    required this.id,
    required this.roomId,
    this.userId,
    this.nickname,
    this.avatar,
    required this.message,
    required this.type,
    required this.timestamp,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      roomId: json['roomId'] as String,
      userId: json['userId'] as String?,
      nickname: json['nickname'] as String?,
      avatar: json['avatar'] as String?,
      message: json['message'] as String,
      type: json['type'] as String? ?? 'user',
      timestamp: json['timestamp'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'roomId': roomId,
      'userId': userId,
      'nickname': nickname,
      'avatar': avatar,
      'message': message,
      'type': type,
      'timestamp': timestamp,
    };
  }
}
