ConceptLeak - Data Intelligence Mobile App
==========================================

A modern React Native mobile application built with Expo that provides data intelligence, risk analysis, and AI-powered insights for datasets.

## 🚀 Features

- **Bottom Tab Navigation**: Five main sections (Home, Chat, Insights, Datasets, Profile)
- **AI Chat Interface**: Interactive chatbot for data queries
- **Risk Analysis**: Comprehensive risk scoring and feature analysis
- **Dataset Management**: Upload and manage CSV files
- **Real-time Insights**: AI-powered data analysis
- **Modern UI**: Dark theme with accent colors

## 📦 Tech Stack

- **React Native** 0.81.5
- **Expo** SDK 54
- **React Navigation** (@react-navigation/native, @react-navigation/native-stack, @react-navigation/bottom-tabs)
- **TypeScript**
- **Axios** for API calls
- **React Native Reanimated** for animations
- **React Native Gesture Handler** for touch handling

## 📁 Project Structure

```
conceptleak/
├── app/                    # Expo app structure (can be used for expo-router)
├── components/             # Reusable UI components
│   ├── CustomButton.tsx
│   ├── CustomCard.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── index.ts
├── navigation/             # Navigation configuration
│   └── RootNavigator.tsx
├── screens/                # Screen components
│   ├── HomeScreen.tsx
│   ├── ChatScreen.tsx
│   ├── InsightsScreen.tsx
│   ├── DatasetsScreen.tsx
│   └── ProfileScreen.tsx
├── services/               # API and services
│   └── api.ts
├── theme/                  # Design system
│   └── colors.ts
├── App.tsx                 # Main app entry point
├── app.json                # Expo config
└── package.json            # Dependencies

```

## 🎨 Theme

- **Background**: #1E1E1E
- **Card**: #2A2A2A
- **Accent**: #FFA94D
- **Text**: #FFFFFF
- **Risk Low**: #4CAF50
- **Risk Medium**: #FFC107
- **Risk High**: #F44336

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation Steps

1. **Navigate to the project**
   ```bash
   cd conceptleak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional Expo packages** (if needed)
   ```bash
   npx expo install react-native-screens
   npx expo install react-native-safe-area-context
   npx expo install react-native-gesture-handler
   npx expo install react-native-reanimated
   ```

## 🚀 Running the App

### Development Mode
```bash
npm start
# or
exposition start
```

### Android
```bash
npm run android
# or
expo start --android
```

### iOS
```bash
npm run ios
# or
expo start --ios
```

### Web
```bash
npm run web
# or
expo start --web
```

## 🌐 API Integration

The app uses Axios for API calls. Configure the API base URL in `services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000/api'; // Change to your backend
```

### Available Endpoints

- `POST /upload` - Upload CSV files
- `POST /chat` - Send messages to the chatbot
- `GET /insights` - Fetch data insights
- `GET /datasets` - List uploaded datasets

## 📱 Screens

### Home Screen
- Summary cards showing key metrics
- Quick upload button
- Getting started guide

### Chat Screen
- Interactive chatbot interface
- Real-time message display
- Input for data queries

### Insights Screen
- Risk level indicators
- Feature-by-feature risk analysis
- Risk scoring (0-100)

### Datasets Screen
- List of uploaded files
- File size and upload date
- Processing status indicator
- Upload new files

### Profile Screen
- App information
- Feature list
- Support contact
- Privacy and terms information

## 🛠 Component Usage

### CustomButton
```tsx
<CustomButton
  title="Upload"
  onPress={() => handleUpload()}
  variant="primary"
/>
```

### CustomCard
```tsx
<CustomCard elevated>
  <Text>Card content</Text>
</CustomCard>
```

### LoadingSpinner
```tsx
<LoadingSpinner visible={loading} message="Loading..." />
```

### ErrorMessage
```tsx
<ErrorMessage
  message="Something went wrong"
  onRetry={() => retry()}
  onDismiss={() => dismiss()}
/>
```

## 📚 Navigation Structure

The app uses a bottom tab navigator with the following structure:

```
RootNavigator
├── Home (Stack)
│   └── HomeScreen
├── Chat (Stack)
│   └── ChatScreen
├── Insights (Stack)
│   └── InsightsScreen
├── Datasets (Stack)
│   └── DatasetsScreen
└── Profile (Stack)
    └── ProfileScreen
```

Each tab can have its own stack navigator for nested navigation.

## 🔐 Security

- All data transmission uses HTTPS
- Sensitive data is encrypted
- No credentials stored in the app

## 🐛 Troubleshooting

### Port 8081 already in use
```bash
expo start -c
```

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build issues
```bash
expo prebuild --clean
```

## 📝 Code Standards

- **Functional Components Only**: All components are functional components with hooks
- **TypeScript**: Full type safety throughout the codebase
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Styling**: StyleSheet API for performance

## 🚀 Deployment

### For Expo Go (Testing)
```bash
expo start
# Scan QR code with Expo Go app
```

### For Production Build
```bash
eas build --platform all
eas submit --platform all
```

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For support, email hello@conceptleak.dev

## 🔗 Links

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript for React](https://www.typescriptlang.org/docs/handbook/react.html)
