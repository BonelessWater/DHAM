import 'package:flutter/material.dart';
import 'home_screen.dart'; // for Restaurant model
import '../services/api_service.dart';


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

  List<String> get _filteredReviews {
    if (_filterStars == 0) return widget.restaurant.reviews;
    return widget.restaurant.reviews
        .where((r) {
          final match = RegExp(r'^(\d)').firstMatch(r);
          if (match != null) {
            final stars = int.tryParse(match.group(1) ?? '0') ?? 0;
            return stars == _filterStars;
          }
          return false;
        })
        .toList();
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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

  void _leaveReview() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Leave review for ${widget.restaurant.name}')),
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
                                      final review = _filteredReviews[index];
                                      return Card(
                                        margin: const EdgeInsets.symmetric(vertical: 4),
                                        child: Padding(
                                          padding: const EdgeInsets.all(8.0),
                                          child: Text(review),
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
