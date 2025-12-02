// lib/models/review.dart
class ReviewUser {
  final String? id;
  final String? displayName;
  final String? avatarUrl;

  ReviewUser({this.id, this.displayName, this.avatarUrl});

  factory ReviewUser.fromJson(Map<String, dynamic>? j) => ReviewUser(
        id: j?['id'] as String?,
        displayName: (j?['displayName'] ?? j?['name']) as String?, // accept both
        avatarUrl: j?['avatarUrl'] as String?,
      );
}

class Review {
  final String id;
  final String userId;
  final String restaurantId;
  final int rating;
  final String? title;
  final String content;
  final int helpfulCount;
  final DateTime? createdAt;
  final ReviewUser? user;

  Review({
    required this.id,
    required this.userId,
    required this.restaurantId,
    required this.rating,
    required this.content,
    this.title,
    this.helpfulCount = 0,
    this.createdAt,
    this.user,
  });

  factory Review.fromJson(Map<String, dynamic> j) => Review(
        id: j['id'] as String,
        userId: j['userId'] as String,
        restaurantId: j['restaurantId'] as String,
        rating: (j['rating'] is int)
            ? j['rating'] as int
            : int.tryParse('${j['rating']}') ?? 0,
        title: j['title'] as String?,
        content: (j['content'] ?? '') as String,
        helpfulCount: (j['helpfulCount'] ?? 0) as int,
        createdAt: j['createdAt'] != null ? DateTime.tryParse(j['createdAt']) : null,
        user: ReviewUser.fromJson(j['user'] as Map<String, dynamic>?),
      );
}
