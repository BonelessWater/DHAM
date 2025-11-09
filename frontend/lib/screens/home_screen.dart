import 'package:flutter/material.dart';
import 'api_test_screen.dart';
import 'search_screen.dart';

// Mock restaurant model
class Restaurant {
  final String name;
  final double stars;
  final String location;
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
  final List<Restaurant> _restaurants = [
    Restaurant(name: 'Pizza Palace', stars: 4.5, location: '123 Main St'),
    Restaurant(name: 'Sushi Spot', stars: 5.0, location: '456 Elm St'),
    Restaurant(name: 'Burger Barn', stars: 3.5, location: '789 Oak St'),
    Restaurant(name: 'Taco Tower', stars: 4.0, location: '222 Pine St'),
  ];

  void _logout() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const ApiTestScreen()),
    );
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

  void _openSearchScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SearchScreen(allRestaurants: _restaurants),
      ),
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
                // Already home, could refresh or scroll to top
              },
            ),
            // Instead of a TextField, this is a tappable "fake" search bar
            Expanded(
              child: GestureDetector(
                onTap: _openSearchScreen,
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    children: const [
                      Icon(Icons.search, color: Colors.grey),
                      SizedBox(width: 8),
                      Text(
                        'Search restaurants...',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.logout),
              tooltip: 'Logout',
              onPressed: _logout,
            ),
          ],
        ),
      ),
      body: ListView.builder(
        itemCount: _restaurants.length,
        itemBuilder: (context, index) {
          final restaurant = _restaurants[index];
          return Card(
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
}
