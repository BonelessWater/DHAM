import 'package:firebase_auth/firebase_auth.dart';
import 'api_service.dart';

class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  BackendUser? _currentBackendUser;
  BackendUser? get currentBackendUser => _currentBackendUser;

  Future<UserCredential> signUpWithEmail({
    required String name,
    required String email,
    required String password,
  }) async {
    final credential = await _firebaseAuth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    if (credential.user != null) {
      await credential.user!.updateDisplayName(name);
      await credential.user!.reload();
    }

    // Force refresh -> always non-null
    final idToken = await credential.user!.getIdToken(true);

    _currentBackendUser = await ApiService.syncUserProfile(
      idToken: idToken!,
      firebaseUid: credential.user!.uid,
      email: credential.user!.email ?? email,
      displayName: credential.user!.displayName ?? name,
    );

    return credential;
  }

  Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final credential = await _firebaseAuth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    final idToken = await credential.user!.getIdToken(true) ?? '';
    
    _currentBackendUser = await ApiService.syncUserProfile(
      idToken: idToken,
      firebaseUid: credential.user!.uid,
      email: credential.user!.email ?? email,
      displayName: credential.user!.displayName ?? '',
    );

    return credential;
  }

  Future<void> signOut() async {
    _currentBackendUser = null;
    await _firebaseAuth.signOut();
  }

  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();
}
