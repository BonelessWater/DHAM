// lib/screens/api_test_screen.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ApiTestScreen extends StatefulWidget {
  const ApiTestScreen({Key? key}) : super(key: key);

  @override
  State<ApiTestScreen> createState() => _ApiTestScreenState();
}

class _ApiTestScreenState extends State<ApiTestScreen> {
  String _connectionStatus = 'Ready to test';
  String _responseData = '';
  bool _isLoading = false;
  List<User> _users = [];
  
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Auto-test connection when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _testConnection();
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _updateStatus(String status, {bool isError = false}) {
    setState(() {
      _connectionStatus = status;
      _isLoading = false;
    });
  }

  void _updateResponse(String response) {
    setState(() {
      _responseData = response;
    });
  }

  Future<void> _testConnection() async {
    setState(() {
      _isLoading = true;
      _connectionStatus = 'Testing connection...';
    });

    try {
      final response = await ApiService.testConnection();
      _updateStatus('✅ Connection successful!');
      _updateResponse('Connection Test Response:\n${_formatJson(response)}');
    } catch (e) {
      _updateStatus('❌ Connection failed: $e', isError: true);
      _updateResponse('Error: $e\n\nMake sure Docker backend is running on port 8000');
    }
  }

  Future<void> _healthCheck() async {
    setState(() {
      _isLoading = true;
      _connectionStatus = 'Checking server health...';
    });

    try {
      final response = await ApiService.healthCheck();
      _updateStatus('✅ Server is healthy!');
      _updateResponse('Health Check Response:\n${_formatJson(response)}');
    } catch (e) {
      _updateStatus('❌ Health check failed: $e', isError: true);
      _updateResponse('Error: $e');
    }
  }

  Future<void> _getUsers() async {
    setState(() {
      _isLoading = true;
      _connectionStatus = 'Fetching users...';
    });

    try {
      final users = await ApiService.getUsers();
      setState(() {
        _users = users;
      });
      _updateStatus('✅ Users fetched successfully!');
      _updateResponse('Users Response:\n${users.map((u) => _formatJson(u.toJson())).join('\n\n')}');
    } catch (e) {
      _updateStatus('❌ Failed to fetch users: $e', isError: true);
      _updateResponse('Error: $e');
    }
  }

  Future<void> _createUser() async {
    if (_nameController.text.trim().isEmpty || _emailController.text.trim().isEmpty) {
      _updateStatus('❌ Please fill in both name and email', isError: true);
      return;
    }

    setState(() {
      _isLoading = true;
      _connectionStatus = 'Creating user...';
    });

    try {
      final user = await ApiService.createUser(
        _nameController.text.trim(),
        _emailController.text.trim(),
      );
      
      _updateStatus('✅ User created successfully!');
      _updateResponse('Created User:\n${_formatJson(user.toJson())}');
      
      // Clear form
      _nameController.clear();
      _emailController.clear();
      
      // Refresh users list
      _getUsers();
    } catch (e) {
      _updateStatus('❌ Failed to create user: $e', isError: true);
      _updateResponse('Error: $e');
    }
  }

  String _formatJson(Map<String, dynamic> json) {
    return json.entries
        .map((e) => '  ${e.key}: ${e.value}')
        .join('\n');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🚀 Backend Connection Test'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Server info card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Backend Server Info',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'URL: ${ApiService.baseUrl}',
                      style: const TextStyle(fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Connection status
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: _connectionStatus.contains('❌') 
                    ? Colors.red.shade100 
                    : _connectionStatus.contains('✅')
                        ? Colors.green.shade100
                        : Colors.blue.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _connectionStatus.contains('❌') 
                      ? Colors.red 
                      : _connectionStatus.contains('✅')
                          ? Colors.green
                          : Colors.blue,
                ),
              ),
              child: Row(
                children: [
                  if (_isLoading) 
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  else 
                    Icon(
                      _connectionStatus.contains('❌') 
                          ? Icons.error 
                          : _connectionStatus.contains('✅')
                              ? Icons.check_circle
                              : Icons.info,
                      color: _connectionStatus.contains('❌') 
                          ? Colors.red 
                          : _connectionStatus.contains('✅')
                              ? Colors.green
                              : Colors.blue,
                    ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _connectionStatus,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Action buttons
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _testConnection,
                  icon: const Icon(Icons.wifi_protected_setup),
                  label: const Text('Test Connection'),
                ),
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _healthCheck,
                  icon: const Icon(Icons.health_and_safety),
                  label: const Text('Health Check'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                ),
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _getUsers,
                  icon: const Icon(Icons.people),
                  label: const Text('Get Users'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Create user form
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Create New User (POST Test)',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isLoading ? null : _createUser,
                        icon: const Icon(Icons.person_add),
                        label: const Text('Create User'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Response area
            if (_responseData.isNotEmpty) ...[
              const Text(
                'Response Data:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Text(
                  _responseData,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}