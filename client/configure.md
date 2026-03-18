# Vector Client Configuration

To build or run the Flutter client with multiple environment variables, you have two main options:

## 1. Using multiple --dart-define flags
Pass each variable individually in the command line:

```bash
flutter run \
  --dart-define=API_URL=https://vector-server.com \
  --dart-define=APP_NAME="Vector Pro" \
  --dart-define=APP_VERSION=1.2.0 \
  --dart-define=APP_ENV=production
```

## 2. Using a configuration file (Recommended)
Create a JSON file (e.g., `config.json`) with your variables:

```json
{
  "API_URL": "https://vector-server.com",
  "APP_NAME": "Vector Pro",
  "APP_VERSION": "1.2.0",
  "APP_ENV": "production"
}
```

Then run using:
```bash
flutter run --dart-define-from-file=config.json
```

## Available Variables
- `API_URL`: The base URL for the backend API.
- `APP_NAME`: Name displayed in the app (Default: "Vector Driver").
- `APP_VERSION`: Version string (Default: "1.0.0").
- `APP_ENV`: Environment tag (e.g., development, staging, production).
