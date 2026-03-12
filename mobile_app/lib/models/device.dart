class Device {
  final String id;
  final String nickname;
  final String ipAddress;
  final String status;
  final String? avatar;
  final String? deviceType;
  final DateTime? lastSeen;

  Device({
    required this.id,
    required this.nickname,
    required this.ipAddress,
    required this.status,
    this.avatar,
    this.deviceType,
    this.lastSeen,
  });

  factory Device.fromJson(Map<String, dynamic> json) {
    return Device(
      id: json['id'] as String,
      nickname: json['nickname'] as String,
      ipAddress: json['ipAddress'] as String,
      status: json['status'] as String,
      avatar: json['avatar'] as String?,
      deviceType: json['deviceType'] as String?,
      lastSeen: json['lastSeen'] != null ? DateTime.parse(json['lastSeen'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nickname': nickname,
      'ipAddress': ipAddress,
      'status': status,
      'avatar': avatar,
      'deviceType': deviceType,
      'lastSeen': lastSeen?.toIso8601String(),
    };
  }
}
