import 'package:flutter/material.dart';
import 'restaurant_detail_screen.dart';
import '../services/api_service.dart';

import 'home_screen.dart'; // For the Restaurant model

class ProfileScreen extends StatelessWidget {
  final List<Restaurant> likedRestaurants;

  const ProfileScreen({Key? key, required this.likedRestaurants}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Settings Section
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Settings'),
              onTap: () {
                // Placeholder action
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Settings placeholder')),
                );
              },
            ),
            const Divider(),

            // Liked Restaurants Label
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text(
                'Liked Restaurants',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            // Liked Restaurants List
            if (likedRestaurants.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                child: Text('No liked restaurants yet'),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: likedRestaurants.length,
                itemBuilder: (context, index) {
                  final restaurant = likedRestaurants[index];
                  return ListTile(
                    title: Text(restaurant.name),
                    trailing: Icon(
                      restaurant.isLiked ? Icons.favorite : Icons.favorite_border,
                      color: Colors.red,
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => RestaurantDetailScreen(restaurant: restaurant),
                        ),
                      );
                    },
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
