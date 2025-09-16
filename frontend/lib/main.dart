import 'package:flutter/material.dart';

void main() {
  runApp(const DHAMApp());
}

class DHAMApp extends StatelessWidget {
  const DHAMApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DHAM',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DHAM'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Welcome to DHAM!',
              style: TextStyle(fontSize: 24),
            ),
            SizedBox(height: 20),
            Text('Campus Social Connection App'),
          ],
        ),
      ),
    );
  }
}