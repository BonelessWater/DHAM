import 'package:flutter/material.dart';
import 'api_test_screen.dart';
import 'search_screen.dart';
import 'profile_screen.dart';
import 'restaurant_detail_screen.dart';

// Mock restaurant model
class Restaurant {
  final String name;
  final double stars;
  final String location;
  final String description;
  final List<String> reviews;
  bool isLiked;

  Restaurant({
    required this.name,
    required this.stars,
    required this.location,
    required this.description,
    this.reviews = const [],
    this.isLiked = false,
  });
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Restaurant> _restaurants = [
    Restaurant(
      name: 'Pizza Palace',
      stars: 4.5,
      location: '123 Main St',
      description: 'Classic Italian pizza with fresh ingredients.',
      reviews: ['5⭐ Amazing pizza!', '4⭐ Loved the crust!', '5⭐ Best pizza in town!'],
    ),
    Restaurant(
      name: 'Sushi Spot',
      stars: 5.0,
      location: '456 Elm St',
      description: 'Fresh sushi and sashimi, authentic Japanese flavors.',
      reviews: ['5⭐ Sushi heaven!', '5⭐ Very fresh fish', '4⭐ Great presentation!'],
    ),
    Restaurant(
      name: 'Burger Barn',
      stars: 3.5,
      location: '789 Oak St',
      description: 'Juicy burgers with a variety of toppings.',
      reviews: ['3⭐ Average burger', '4⭐ Good value', '3⭐ Fries were soggy'],
    ),
    Restaurant(
      name: 'Taco Town',
      stars: 4.0,
      location: '321 Pine St',
      description: 'Authentic Mexican tacos with homemade salsa.',
      reviews: ['4⭐ Delicious tacos', '5⭐ Best tacos I\'ve had!', '4⭐ Friendly staff'],
    ),
    Restaurant(
      name: 'Curry Corner',
      stars: 4.2,
      location: '654 Maple Ave',
      description: 'Spicy Indian curries and naan breads.',
      reviews: ['5⭐ Amazing curry', '4⭐ Nice spice level', '4⭐ Great ambiance'],
    ),
    Restaurant(
      name: 'Vegan Delight',
      stars: 4.7,
      location: '987 Birch Blvd',
      description: 'Healthy and creative vegan dishes.',
      reviews: ['5⭐ Loved it!', '5⭐ So fresh', '4⭐ Great vegan options'],
    ),
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
          .where((r) => r.name.toLowerCase().startsWith(query))
          .toList();
    });
  }

  void _logout() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const ApiTestScreen()),
    );
  }

  void _openProfile() {
    final likedRestaurants = _restaurants.where((r) => r.isLiked).toList();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProfileScreen(likedRestaurants: likedRestaurants),
      ),
    );
  }

  void _openSearch() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SearchScreen(allRestaurants: _restaurants),
      ),
    );
  }

  void _openRestaurantDetail(Restaurant restaurant) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => RestaurantDetailScreen(restaurant: restaurant),
      ),
    ).then((_) => setState(() {})); // refresh state to reflect likes
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
              onPressed: () {},
            ),
            Expanded(
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search restaurants',
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                  prefixIcon: const Icon(Icons.search),
                ),
                readOnly: true,
                onTap: _openSearch, // open search page
              ),
            ),
            IconButton(
              icon: const Icon(Icons.person),
              tooltip: 'Profile',
              onPressed: _openProfile,
            ),
            IconButton(
              icon: const Icon(Icons.logout),
              tooltip: 'Logout',
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
