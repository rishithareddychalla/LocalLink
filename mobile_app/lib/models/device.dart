class Device {
  final String id;
  final String nickname;
  final String ipAddress;
  final String status;
  final String? avatar;

  Device({
    required this.id,
    required this.nickname,
    required this.ipAddress,
    required this.status,
    this.avatar,
  });

  factory Device.fromJson(Map<String, dynamic> json) {
    return Device(
      id: json['id'] as String,
      nickname: json['nickname'] as String,
      ipAddress: json['ipAddress'] as String,
      status: json['status'] as String,
      avatar: json['avatar'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nickname': nickname,
      'ipAddress': ipAddress,
      'status': status,
      'avatar': avatar,
    };
  }
}
