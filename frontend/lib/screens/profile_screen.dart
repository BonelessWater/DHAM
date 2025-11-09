import 'package:flutter/material.dart';
import 'home_screen.dart';

class ProfileScreen extends StatelessWidget {
  final List<Restaurant> likedRestaurants;

  const ProfileScreen({Key? key, required this.likedRestaurants}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Settings', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('Profile Picture, Notifications, Change Password (placeholders)'),
            const Divider(height: 32),
            const Text('Liked Restaurants', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            likedRestaurants.isEmpty
                ? const Text('You haven\'t liked any restaurants yet.')
                : Expanded(
                    child: ListView.builder(
                      itemCount: likedRestaurants.length,
                      itemBuilder: (context, index) {
                        final restaurant = likedRestaurants[index];
                        return ListTile(
                          title: Text(restaurant.name),
                          subtitle: Row(
                            children: List.generate(
                              5,
                              (i) => Icon(
                                i < restaurant.stars ? Icons.star : Icons.star_border,
                                color: Colors.amber,
                                size: 16,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
