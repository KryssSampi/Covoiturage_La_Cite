class Message {
  final String id;
  final String tripId;
  final String senderId;
  final String content;
  final DateTime sentAt;

  const Message({
    required this.id,
    required this.tripId,
    required this.senderId,
    required this.content,
    required this.sentAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id']?.toString() ?? '',
      tripId: json['tripId']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      sentAt: DateTime.parse(json['sentAt']?.toString() ?? ''),
    );
  }
}
