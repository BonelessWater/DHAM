import 'package:flutter/material.dart';

// Mock restaurant model
class Restaurant {
  final String name;
  final double stars;
  final String location; // just a placeholder
  final List<String> reviews;

  Restaurant({
    required this.name,
    required this.stars,
    required this.location,
    this.reviews = const [],
  });
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Mock restaurant list
  List<Restaurant> _restaurants = [
    Restaurant(name: 'Pizza Palace', stars: 4.5, location: '123 Main St'),
    Restaurant(name: 'Sushi Spot', stars: 5.0, location: '456 Elm St'),
    Restaurant(name: 'Burger Barn', stars: 3.5, location: '789 Oak St'),
  ];

  List<Restaurant> _filteredRestaurants = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _filteredRestaurants = _restaurants;
    _searchController.addListener(_filterRestaurants);
  }

  void _filterRestaurants() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredRestaurants = _restaurants
          .where((r) => r.name.toLowerCase().contains(query))
          .toList();
    });
  }

  void _logout() {
    // Placeholder logout logic; later replace with FirebaseAuth signOut
    Navigator.pop(context);
  }

  void _openMap(Restaurant restaurant) {
    // Placeholder; later open Google Maps / MapView
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Show map for ${restaurant.name}')),
    );
  }

  void _openReviews(Restaurant restaurant) {
    // Placeholder; later open review page or modal
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Open reviews for ${restaurant.name}')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 80,
        title: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.home),
              onPressed: () {
                // Optional: scroll to top
              },
            ),
            Expanded(
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search restaurants',
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(
                      vertical: 8, horizontal: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                  prefixIcon: const Icon(Icons.search),
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: _logout,
            ),
          ],
        ),
      ),
      body: _filteredRestaurants.isEmpty
          ? const Center(child: Text('No restaurants found'))
          : ListView.builder(
              itemCount: _filteredRestaurants.length,
              itemBuilder: (context, index) {
                final restaurant = _filteredRestaurants[index];
                return Card(
                  margin:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
