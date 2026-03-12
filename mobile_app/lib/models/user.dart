class User {
  final String id;
  final String nickname;
  final String? avatar;
  final String? avatarStyle;
  final String? avatarSeed;
  final String? socketId;

  User({
    required this.id,
    required this.nickname,
    this.avatar,
    this.avatarStyle,
    this.avatarSeed,
    this.socketId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      nickname: json['nickname'] as String,
      avatar: json['avatar'] as String?,
      avatarStyle: json['avatarStyle'] as String?,
      avatarSeed: json['avatarSeed'] as String?,
      socketId: json['socketId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nickname': nickname,
      'avatar': avatar,
      'avatarStyle': avatarStyle,
      'avatarSeed': avatarSeed,
      'socketId': socketId,
    };
  }
}
