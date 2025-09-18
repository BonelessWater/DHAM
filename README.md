# DHAM Project - Flutter + Docker Backend

Full-stack app with Flutter frontend and Node.js backend in Docker.

## 🚀 Quick Setup

### Prerequisites
- Docker & Docker Compose
- Flutter SDK
- Git

### 1. Project Structure
```
dham-project/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   └── lib/
│       ├── main.dart
│       ├── services/api_service.dart
│       └── screens/api_test_screen.dart
└── docker-compose.yml
```

### 2. Backend Setup
```bash
# Create backend files (copy provided code)
# Place in backend/ directory:
# - server.js (Express server)
# - Dockerfile (Docker config)
# - .dockerignore
```

### 3. Frontend Setup
```bash
cd frontend
flutter pub get

# Create Flutter files (copy provided code):
# - lib/main.dart
# - lib/services/api_service.dart  
# - lib/screens/api_test_screen.dart
```

### 4. Run Everything
```bash
# Start Docker backend
docker-compose up --build

# Run Flutter (new terminal)
cd frontend
flutter run
```

## 🎯 Essential Commands

### Docker
```bash
docker-compose up --build    # Start backend
docker-compose down          # Stop backend
docker-compose logs backend  # View logs
```

### Flutter
```bash
flutter pub get     # Install dependencies
flutter run         # Run app
flutter clean       # Clean build
```

### Test API
```bash
curl http://localhost:8000/health      # Health check
curl http://localhost:8000/api/test    # Connection test
curl http://localhost:8000/api/users   # Get users
```

## 📡 Connection URLs

- **Android Emulator:** `http://10.0.2.2:8000`
- **iOS Simulator:** `http://localhost:8000`
- **Flutter Web:** `http://localhost:8000`

## ✅ Success Check

After setup you should see:
- ✅ Flutter app shows "Connection successful!"
- ✅ Docker logs: "🚀 DHAM API server running on port 8000"
- ✅ Test buttons work in Flutter app

## 🐛 Quick Fixes

**Port in use:** `lsof -i :8000` then `kill -9 <PID>`

**CORS errors:** Backend includes CORS for all platforms

**Flutter issues:** `flutter doctor` and follow fixes

**Docker issues:** `docker system prune -a` then rebuild
