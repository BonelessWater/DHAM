// lib/services/api_service.dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

/// Central API client for your DHAM backend
class ApiService {
  // Different base URLs for different platforms
  static const String _baseUrlMobile = 'http://10.0.2.2:8000'; // Android emulator
  static const String _baseUrlWeb = 'http://localhost:8000';   // Web / desktop

  static String get baseUrl => kIsWeb ? _baseUrlWeb : _baseUrlMobile;

  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // ---- Basic checks ----

  static Future<Map<String, dynamic>> healthCheck() async {
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/health'), headers: _headers)
          .timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        return json.decode(res.body);
      }
      throw ApiException('Health check failed', res.statusCode);
    } catch (e) {
      throw ApiException('Connection failed: $e', 0);
    }
  }

  static Future<Map<String, dynamic>> testConnection() async {
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/api/test'), headers: _headers)
          .timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        return json.decode(res.body);
      }
      throw ApiException('Connection test failed', res.statusCode);
    } catch (e) {
      throw ApiException('Connection failed: $e', 0);
    }
  }

  // ---- Restaurants ----

  /// GET /api/restaurants?limit=…
  static Future<List<Restaurant>> getRestaurants({int limit = 20}) async {
    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/api/restaurants?limit=$limit'),
            headers: _headers,
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) {
        throw ApiException('Failed to get restaurants', res.statusCode);
      }

      final body = json.decode(res.body);

      if (body['success'] != true) {
        throw ApiException(
          'API error: ${body['error'] ?? 'Unknown'}',
          res.statusCode,
        );
      }

      final data = body['data'];

      // /api/restaurants returns a list; /api/restaurants/:id would be a single object.
      final List list;
      if (data is List) {
        list = data;
      } else if (data is Map<String, dynamic>) {
        list = [data];
      } else {
        throw ApiException('Unexpected data format from /api/restaurants', res.statusCode);
      }

      return list.map<Restaurant>((json) => Restaurant.fromJson(json)).toList();
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Connection failed: $e', 0);
    }
  }
}

// ---- Error type ----

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException(this.message, this.statusCode);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

// ---- Restaurant model used across the app ----

class Restaurant {
  final String id;
  final String name;
  final double stars; 
  final String location;
  final String description;

  // Optional backend UX-expanded fields
  final String priceRange;
  final List<String> atmosphere;
  final List<String> cuisineType;

  // UI-only fields
  final List<String> reviews;
  bool isLiked;

  Restaurant({
    required this.id,
    required this.name,
    required this.stars,
    required this.location,
    required this.description,
    this.priceRange = '\$',
    this.atmosphere = const [],
    this.cuisineType = const [],
    this.reviews = const [],
    this.isLiked = false,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    final num? avg = json['averageRating'];
    final double avgRating = avg != null ? avg.toDouble() : 0.0;

    final String address = (json['address'] ?? '') as String;
    final String city = (json['city'] ?? '') as String;
    final String state = (json['state'] ?? '') as String;

    final List<String> parts =
        [address, city, state].where((s) => s.isNotEmpty).toList();

    final String loc = parts.join(', ');

    return Restaurant(
      id: (json['id'] ?? '') as String,
      name: (json['name'] ?? '') as String,
      stars: avgRating,
      location: loc,
      description: (json['description'] ?? '') as String,
      priceRange: (json['priceRange'] ?? '\$') as String,
      atmosphere: List<String>.from(json['atmosphere'] ?? []),
      cuisineType: List<String>.from(json['cuisineType'] ?? []),
      reviews: const [], // backend reviews not implemented yet
      isLiked: false,
    );
  }
}
    

