// lib/services/auth_service.dart
import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import 'api_service.dart'; // for ApiService.baseUrl

class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  /// Sign up a user in Firebase Auth, then sync to your backend
  Future<void> signUpWithEmail({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      // 1) Create user in Firebase Auth
      final cred = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = cred.user;
      if (user == null) {
        throw FirebaseAuthException(
          code: 'user-null',
          message: 'Failed to create Firebase user.',
        );
      }

      // Optional: set displayName
      await user.updateDisplayName(name);

      // 2) Get Firebase ID token
      final idToken = await user.getIdToken();

      // 3) Call backend /api/users/sync to create profile in RTDB
      final uri = Uri.parse('${ApiService.baseUrl}/api/users/sync');

      final resp = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $idToken',
        },
        body: jsonEncode({
          'name': name,
          // you can send more default fields later if you want
        }),
      );

      if (resp.statusCode != 200 && resp.statusCode != 201) {
        // Log for debugging
        debugPrint(
            'Backend sync failed: ${resp.statusCode} ${resp.body}');
        throw Exception(
            'Backend sync failed with status ${resp.statusCode}');
      }

      debugPrint('✅ Signup + backend sync completed successfully');

    } on FirebaseAuthException catch (e) {
      // Let the UI catch handle this explicitly
      debugPrint('FirebaseAuthException in signUpWithEmail: ${e.code} ${e.message}');
      rethrow;
    } catch (e) {
      // Other errors (network, backend, JSON, etc.)
      debugPrint('Unexpected error in signUpWithEmail: $e');
      rethrow;
    }
  }
}
