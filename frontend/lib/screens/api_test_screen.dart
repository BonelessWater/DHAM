import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class ApiTestScreen extends StatefulWidget {
  const ApiTestScreen({Key? key}) : super(key: key);

  @override
  State<ApiTestScreen> createState() => _ApiTestScreenState();
}

class _ApiTestScreenState extends State<ApiTestScreen> {
  String _connectionStatus = 'Ready to test';
  String _responseData = '';
  bool _isLoading = false;

  // simple list to hold restaurant data from the API
  List<Restaurant> _restaurants = [];

  @override
  void initState() {
    super.initState();
    // Auto-test connection when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _testConnection();
    });
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
      _updateResponse(
        'Error: $e\n\nMake sure Docker backend is running on port 8000',
      );
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

  Future<void> _getRestaurants() async {
    setState(() {
      _isLoading = true;
      _connectionStatus = 'Fetching restaurants...';
    });

    try {
      // assumes you added ApiService.getRestaurants({int limit = 10})
      final restaurants = await ApiService.getRestaurants(limit: 10);

      setState(() {
        _restaurants = restaurants;
      });

      _updateStatus('✅ Restaurants fetched successfully!');
      _updateResponse(
        'Restaurants Response:\n\n' +
            restaurants.map((r) {
              return _formatJson({
                'id': r.id,
                'name': r.name,
                'address': r.location,
                'stars': r.stars,
              });
            }).join('\n\n'),
      );
    } catch (e) {
      _updateStatus('❌ Failed to fetch restaurants: $e', isError: true);
      _updateResponse('Error: $e');
    }
  }

  String _formatJson(Map<String, dynamic> json) {
    return json.entries.map((e) => '  ${e.key}: ${e.value}').join('\n');
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
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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

            // Home Button (bypass login)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const HomeScreen()),
                  );
                },
                icon: const Icon(Icons.home),
                label: const Text('Go to Home (bypass login)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.yellow,
                  padding: const EdgeInsets.symmetric(vertical: 12),
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
                  style:
                      ElevatedButton.styleFrom(backgroundColor: Colors.green),
                ),
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _getRestaurants,
                  icon: const Icon(Icons.restaurant),
                  label: const Text('Get Restaurants'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                ),
              ],
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
