# Flutter Client Configuration Guide

This guide explains how to configure and build the Vector Driver app using a configuration file. This is the recommended approach for managing environment variables across different platforms.

## 1. Setup Configuration File

Instead of passing multiple flags in the terminal, we use a single JSON file.

1.  Navigate to the `client/` directory.
2.  Copy `config.example.json` to `config.json` (this file is already in `.gitignore` to keep your keys safe):
    ```bash
    cp config.example.json config.json
    ```
3.  Open `config.json` and fill in your actual values (API URLs, keys, etc.).

## 2. Running for Development

To run the app on an emulator or physical device with your configuration:

```bash
flutter run --dart-define-from-file=config.json
```

## 3. Building for Production

When building the final binary for distribution, you must include the same configuration flag.

### Android
To build a production APK or App Bundle:

```bash
# For APK
flutter build apk --release --dart-define-from-file=config.json

# For App Bundle (Google Play)
flutter build appbundle --release --dart-define-from-file=config.json
```

### iOS
To build a production IPA or Archive:

```bash
# Build the iOS archive
flutter build ios --release --dart-define-from-file=config.json

# Note: After building, you typically open the project in Xcode 
# (ios/Runner.xcworkspace) to perform the final distribution/upload to App Store Connect.
```

## 4. Variables Reference

| Variable | Description | Example |
| :--- | :--- | :--- |
| `API_URL` | The base URL of your NestJS server. | `https://api.yourdomain.com` |
| `APP_NAME` | The display name of the application. | `Vector Driver` |
| `APP_VERSION` | Version string shown in settings. | `1.0.0` |
| `APP_ENV` | Environment tag (`development`, `production`). | `production` |
| `GEOAPIFY_API_KEY` | API Key for Geocoding and Routing. | `your_key_here` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name. | `vector-logistics` |
| `CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset for photo evidence. | `vector_preset` |

> [!IMPORTANT]
> For Android emulators, use `http://10.0.2.2:8080` to refer to your computer's localhost. For physical devices, use your computer's local IP address or a public URL.
