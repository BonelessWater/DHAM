import 'package:flutter/material.dart';
import 'home_screen.dart';

class SearchScreen extends StatefulWidget {
  final List<Restaurant> allRestaurants;

  const SearchScreen({
    Key? key,
    required this.allRestaurants,
  }) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Restaurant> _filteredRestaurants = [];

  @override
  void initState() {
    super.initState();
    _filteredRestaurants = []; // start with no results
    _searchController.addListener(_filterRestaurants);
  }

  void _filterRestaurants() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredRestaurants = []; // clear results when search is empty
      } else {
        _filteredRestaurants = widget.allRestaurants
            .where((r) => r.name.toLowerCase().contains(query))
            .toList();
      }
    });
  }

  void _openMap(Restaurant restaurant) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Show map for ${restaurant.name}')),
    );
  }

  void _openReviews(Restaurant restaurant) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Open reviews for ${restaurant.name}')),
    );
  }

  void _exitSearch() {
    Navigator.pop(context); // go back to HomeScreen
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        toolbarHeight: 80,
        title: LayoutBuilder(
          builder: (context, constraints) {
            final availableWidth = constraints.maxWidth;

            return Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.home),
                  tooltip: 'Back to Home',
                  onPressed: _exitSearch,
                ),
                SizedBox(
                  width: availableWidth - 60, // subtract IconButton width + padding
                  child: TextField(
                    controller: _searchController,
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: 'Search restaurants...',
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
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
            );
          },
        ),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          // Use slightly smaller width to match search bar exactly
          final cardWidth = constraints.maxWidth * 0.95;

          return Align(
            alignment: Alignment.topCenter,
            child: SizedBox(
              width: cardWidth,
              child: _filteredRestaurants.isEmpty
                  ? Center(
                      child: _searchController.text.isEmpty
                          ? const Text('Start typing to search for restaurants')
                          : const Text('No matching restaurants'),
                    )
                  : ListView.builder(
                      itemCount: _filteredRestaurants.length,
                      itemBuilder: (context, index) {
                        final restaurant = _filteredRestaurants[index];
                        return Container(
                          width: double.infinity, // fills the parent width
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          child: Card(
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
                                              i < restaurant.stars
                                                  ? Icons.star
                                                  : Icons.star_border,
                                              color: Colors.amber,
                                              size: 18,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.map),
                                    onPressed: () => _openMap(restaurant),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.rate_review),
                                    onPressed: () => _openReviews(restaurant),
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
            ),
          );
        },
      ),
    );
  }
}
