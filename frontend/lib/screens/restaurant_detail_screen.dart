import 'package:flutter/material.dart';
import 'home_screen.dart'; // for Restaurant model
import '../services/api_service.dart';
import '../models/review.dart';
import 'package:firebase_auth/firebase_auth.dart';


class RestaurantDetailScreen extends StatefulWidget {
  final Restaurant restaurant;

  const RestaurantDetailScreen({Key? key, required this.restaurant}) : super(key: key);

  @override
  State<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends State<RestaurantDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _filterStars = 0; // 0 = show all, 1-5 = filter by stars

bool _loading = true;
  String? _error;
  List<Review> _reviews = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await ApiService.getReviewsForRestaurant(widget.restaurant.id);
      setState(() => _reviews = list);
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<Review> get _filteredReviews {
    if (_filterStars == 0) return _reviews;
    return _reviews.where((r) => r.rating == _filterStars).toList();
  }

  void _toggleLike() {
    setState(() {
      widget.restaurant.isLiked = !widget.restaurant.isLiked;
    });
  }

  void _openMap() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Open map for ${widget.restaurant.name}')),
    );
  }

  Future<void> _leaveReview() async {
    final result = await showModalBottomSheet<_ReviewInput>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _LeaveReviewSheet(restaurantName: widget.restaurant.name),
    );

    if (result == null) return;

    try {
        final user = FirebaseAuth.instance.currentUser;

        if (user == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please sign in to leave a review.')),
        );
        return;
      }

      final userId = user.uid;

      await ApiService.postReview(
        userId: userId,
        restaurantId: widget.restaurant.id,
        rating: result.rating,
        content: result.content,
        title: (result.title?.trim().isEmpty ?? true) ? null : result.title!.trim(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review posted!')),
      );

      await _loadReviews();
    }

    catch (e) {
      final msg = '$e';
      final already = msg.contains('already reviewed');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(already
              ? 'You have already reviewed this restaurant.'
              : 'Failed to post review: $msg'),
        ),
      );
    }
  }

  Widget _starRow(int count, {double size = 18}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(
        5,
        (i) => Icon(i < count ? Icons.star : Icons.star_border, size: size),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.restaurant.name),
          actions: [
            IconButton(
              icon: Icon(widget.restaurant.isLiked ? Icons.favorite : Icons.favorite_border, color: Colors.red),
              tooltip: 'Like',
              onPressed: _toggleLike,
            ),
            IconButton(icon: const Icon(Icons.map), tooltip: 'Map', onPressed: _openMap),
            IconButton(icon: const Icon(Icons.rate_review), tooltip: 'Leave Review', onPressed: _leaveReview),
          ],
        ),
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Restaurant info
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.restaurant.name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(widget.restaurant.location, style: const TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 8),
                    Text(widget.restaurant.description, style: const TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 16),
                  ],
                ),
              ),

              // TabBar
              TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(text: 'Reviews'),
                  Tab(text: 'Discussion'),
                ],
                labelColor: Theme.of(context).primaryColor,
                unselectedLabelColor: Colors.grey,
              ),

              // TabBar content
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.6, // adjusts for screen size
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Reviews tab
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Star filter buttons
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: List.generate(5, (i) {
                                final star = i + 1;
                                return Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                  child: ChoiceChip(
                                    label: Text('$star ⭐'),
                                    selected: _filterStars == star,
                                    onSelected: (_) {
                                      setState(() {
                                        _filterStars = _filterStars == star ? 0 : star;
                                      });
                                    },
                                  ),
                                );
                              }),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Reviews list
                          Expanded(
                            child: _filteredReviews.isEmpty
                                ? const Center(child: Text('No reviews to show'))
                                : ListView.builder(
                                    itemCount: _filteredReviews.length,
                                    itemBuilder: (context, index) {
                                      final r = _filteredReviews[index];
                                      return Card(
                                        margin: const EdgeInsets.symmetric(vertical: 4),
                                                child: ListTile(
                                                  title: Row(
                                                    children: [
                                                      _starRow(r.rating),
                                                      const SizedBox(width: 8),
                                                      if ((r.user?.displayName ?? '').isNotEmpty)
                                                        Text(
                                                          '• ${r.user!.displayName!}',
                                                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                                                        ),
                                                    ],
                                                  ),
                                                  subtitle: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      if ((r.title ?? '').isNotEmpty)
                                                        Padding(
                                                          padding: const EdgeInsets.only(top: 4.0),
                                                          child: Text(
                                                            r.title!,
                                                            style: const TextStyle(fontWeight: FontWeight.w600),
                                                          ),
                                                        ),
                                                      Padding(
                                                        padding: const EdgeInsets.only(top: 4.0),
                                                        child: Text(r.content),
                                                      ),
                                                      if (r.createdAt != null)
                                                        Padding(
                                                          padding: const EdgeInsets.only(top: 4.0),
                                                          child: Text(
                                                            'Posted ${r.createdAt}',
                                                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                                                          ),
                                                        ),
                                                    ],
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                          ),
                        ],
                      ),
                    ),
                    // Discussion tab
                    const Center(child: Text('Feature coming soon')),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReviewInput {
    final int rating;
    final String content;
    final String? title;
    _ReviewInput(this.rating, this.content, this.title);
}

class _LeaveReviewSheet extends StatefulWidget {
  final String restaurantName;
  const _LeaveReviewSheet({required this.restaurantName, Key? key}) : super(key: key);

  @override
  State<_LeaveReviewSheet> createState() => _LeaveReviewSheetState();
}

class _LeaveReviewSheetState extends State<_LeaveReviewSheet> {
  int _rating = 5;
  final _titleCtrl = TextEditingController();
  final _contentCtrl = TextEditingController();

  @override
  void dispose() {
    _titleCtrl.dispose();
    _contentCtrl.dispose();
    super.dispose();
}

Widget _starPicker() {
    return Row(
        children: List.generate(5, (i) {
        final idx = i + 1;
        return IconButton(
            icon: Icon(idx <= _rating ? Icons.star : Icons.star_border),
            onPressed: () => setState(() => _rating = idx),
            );
        }),
    );
}

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          children: [
            Text('Leave a review for ${widget.restaurantName}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _starPicker(),
            TextField(
              controller: _titleCtrl,
              decoration: const InputDecoration(labelText: 'Title (optional)'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _contentCtrl,
              decoration: const InputDecoration(labelText: 'Your thoughts'),
              maxLines: 4,
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              icon: const Icon(Icons.send),
              label: const Text('Submit'),
              onPressed: () {
                final content = _contentCtrl.text.trim();
                if (content.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please add some text')),
                  );
                  return;
                }
                Navigator.of(context).pop(
                  _ReviewInput(_rating, content, _titleCtrl.text),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
