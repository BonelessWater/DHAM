// lib/services/api_service.dart
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  // Different base URLs for different platforms
  static const String _baseUrlAndroid = 'http://10.0.2.2:8000'; // Android emulator
  static const String _baseUrlIOS = 'http://localhost:8000'; // iOS simulator
  static const String _baseUrlWeb = 'http://localhost:8000'; // Web
  
  static String get baseUrl {
    if (Platform.isAndroid) {
      return _baseUrlAndroid;
    } else if (Platform.isIOS) {
      return _baseUrlIOS;
    } else {
      return _baseUrlWeb; // Fallback for web and other platforms
    }
  }

  // HTTP headers
  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Health check
  static Future<Map<String, dynamic>> healthCheck() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw ApiException('Health check failed', response.statusCode);
      }
    } catch (e) {
      throw ApiException('Connection failed: $e', 0);
    }
  }

  // Test connection
  static Future<Map<String, dynamic>> testConnection() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/test'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw ApiException('Connection test failed', response.statusCode);
      }
    } catch (e) {
      throw ApiException('Connection failed: $e', 0);
    }
  }

  // Get users
  static Future<List<User>> getUsers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/users'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final users = (data['users'] as List)
            .map((userJson) => User.fromJson(userJson))
            .toList();
        return users;
      } else {
        throw ApiException('Failed to fetch users', response.statusCode);
      }
    } catch (e) {
      throw ApiException('Failed to fetch users: $e', 0);
    }
  }

  // Create user
  static Future<User> createUser(String name, String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/users'),
        headers: _headers,
        body: json.encode({
          'name': name,
          'email': email,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return User.fromJson(data['user']);
      } else {
        throw ApiException('Failed to create user', response.statusCode);
      }
    } catch (e) {
      throw ApiException('Failed to create user: $e', 0);
    }
  }
}

// User model
class User {
  final int id;
  final String name;
  final String email;
  final String? createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'createdAt': createdAt,
    };
  }
}

// Custom exception class
class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException(this.message, this.statusCode);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}