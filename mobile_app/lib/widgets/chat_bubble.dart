import 'package:flutter/material.dart';
import '../models/message.dart';
import '../core/design_system.dart';

class ChatBubble extends StatelessWidget {
  final Message message;
  final bool isMe;

  const ChatBubble({super.key, required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    if (message.type == 'system') {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(100),
              border: Border.all(color: DesignSystem.borderColor),
            ),
            child: Text(
              message.message.toUpperCase(),
              style: DesignSystem.label.copyWith(fontSize: 8, color: Colors.white24),
            ),
          ),
        ),
      );
    }

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        child: Column(
          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 4, left: 4, right: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    message.nickname?.toUpperCase() ?? 'PEER',
                    style: DesignSystem.label.copyWith(fontSize: 9, color: isMe ? DesignSystem.accentColor : Colors.white70),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '14:20', // Static for now, will use timestamp later
                    style: DesignSystem.caption.copyWith(fontSize: 8, color: Colors.white10),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
              decoration: BoxDecoration(
                color: isMe 
                  ? DesignSystem.accentColor 
                  : DesignSystem.surface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isMe ? 20 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 20),
                ),
                boxShadow: isMe ? DesignSystem.neonGlow(DesignSystem.accentColor) : [],
                border: isMe ? null : Border.all(color: DesignSystem.borderColor),
              ),
              child: Text(
                message.message,
                style: DesignSystem.body.copyWith(
                  color: isMe ? Colors.black : DesignSystem.textPrimary,
                  fontWeight: isMe ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
