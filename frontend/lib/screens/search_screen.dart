import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'restaurant_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  final List<Restaurant> allRestaurants;

  const SearchScreen({Key? key, required this.allRestaurants}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Restaurant> _filteredRestaurants = [];

  @override
  void initState() {
    super.initState();
    _filteredRestaurants = [];
    _searchController.addListener(_filterRestaurants);
  }

  void _filterRestaurants() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredRestaurants = [];
      } else {
        _filteredRestaurants = widget.allRestaurants
            .where((r) => r.name.toLowerCase().startsWith(query))
            .toList();
      }
    });
  }

  void _exitSearch() {
    Navigator.pop(context);
  }

  void _openRestaurantDetail(Restaurant restaurant) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => RestaurantDetailScreen(restaurant: restaurant),
      ),
    ).then((_) => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        toolbarHeight: 80,
        title: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.home),
              tooltip: 'Back to Home',
              onPressed: _exitSearch,
            ),
            Expanded(
              child: TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Search restaurants...',
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.close),
                    tooltip: 'Cancel search',
                    onPressed: _exitSearch,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      body: _filteredRestaurants.isEmpty
          ? const Center(child: Text('No matching restaurants'))
          : ListView.builder(
              itemCount: _filteredRestaurants.length,
              itemBuilder: (context, index) {
                final restaurant = _filteredRestaurants[index];
                return InkWell(
                  onTap: () => _openRestaurantDetail(restaurant),
                  child: Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  restaurant.name,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Row(
                                  children: List.generate(
                                    5,
                                    (i) => Icon(
                                      i < restaurant.stars ? Icons.star : Icons.star_border,
                                      color: Colors.amber,
                                      size: 18,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              restaurant.isLiked ? Icons.favorite : Icons.favorite_border,
                              color: Colors.red,
                            ),
                            onPressed: () {
                              setState(() {
                                restaurant.isLiked = !restaurant.isLiked;
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
