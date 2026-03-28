# Vector Driver App

The Vector Driver App is a robust Flutter mobile application designed for delivery drivers to manage their daily assignments, navigate optimized routes, and provide proof-of-delivery.

## 🛠 Tech Stack

- **Framework**: [Flutter](https://flutter.dev/) (Dart)
- **Routing**: [GoRouter](https://pub.dev/packages/go_router)
- **Maps & Navigation**: [Flutter Map](https://pub.dev/packages/flutter_map) & [Geolocator](https://pub.dev/packages/geolocator)
- **Real-time Notifications**: [Firebase Cloud Messaging](https://pub.dev/packages/firebase_messaging)
- **Background Tasks**: [Flutter Foreground Task](https://pub.dev/packages/flutter_foreground_task) (for persistent GPS tracking)
- **Local Persistence**: [Hive](https://pub.dev/packages/hive)
- **API Client**: [Dio](https://pub.dev/packages/dio)

## 📂 Project Structure

- `lib/features`: Core application modules.
    - `auth`: Driver registration (via company code), login, and profile management.
    - `routes`: Assignment listing, route preview, and turn-by-turn navigation.
    - `notifications`: In-app notification center and FCM integration.
    - `history`: Completed delivery logs.
- `lib/core`: Shared utilities, API services, and theme configurations.
- `lib/widgets`: Reusable UI components (buttons, cards, loaders).
- `lib/navigation`: Router configuration and route definitions.

## 🚀 Getting Started

### Prerequisites
- Flutter SDK installed.
- Android Studio or Xcode (for emulators/builds).

### Installation
```bash
flutter pub get
```

### Configuration
1. Setup `config.json` in the project root:
    ```json
    {
      "apiBaseUrl": "http://your-server-ip:8080",
      "appName": "Vector Driver"
    }
    ```
2. Ensure you have a valid `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) in the respective platform directories if testing push notifications.

### Running the App
```bash
flutter run
```

## ✨ Key Features

- **Route Navigation**: Interactive map view with optimized stop sequences and turn-by-turn guidance.
- **Proof of Delivery (PoD)**: Support for photo capture and QR code scanning to confirm successful deliveries.
- **Background Tracking**: Continuous GPS updates sent to the fleet manager even when the app is in the background.
- **Real-time Assignments**: Instant push notifications when new routes or stops are assigned.
- **Offline Reliability**: Local data persistence using Hive to ensure data integrity during poor connectivity.

## 📱 Platform Support
- **Android**: Fully supported.
- **iOS**: Fully supported.
