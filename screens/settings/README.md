# Settings Module Documentation

## Overview

The Settings Module provides comprehensive settings, help, documentation, and configuration options for ConceptLeak. It is organized as a navigation stack with multiple linked screens.

## Screens

### 1. **SettingsScreen** (Main Settings Hub)
The primary entry point for the settings module. Displays:
- **Preferences Section**: Notifications, Dark Mode, Analytics, Auto-upload toggles
- **Resources Section**: Links to Help, About, API Configuration, Security, and Export History
- **App Information**: Version, build number, environment, last update
- **Danger Zone**: Cache clearing and logout functionality

**File**: `SettingsScreen.tsx`

### 2. **HelpDocumentationScreen**
Comprehensive help documentation with detailed sections:
- **Getting Started**: Introduction to ConceptLeak and its purpose
- **Understanding Concept Leakage**: Four types of leakage explained
  - Direct Target Leakage (CRITICAL)
  - Temporal Leakage (HIGH)
  - Data Snooping (HIGH)
  - ID Leakage (CRITICAL)
- **How to Use ConceptLeak**: Step-by-step usage guide
- **Best Practices**: Data preparation, feature engineering, model training tips
- **FAQ**: Frequently asked questions with detailed answers

**Features**:
- Expandable sections for better readability
- Color-coded risk levels
- Emoji-enhanced visual organization
- Practical examples for each concept

**File**: `HelpDocumentationScreen.tsx`

### 3. **AboutScreen**
Detailed information about the ConceptLeak application:
- **Hero Section**: App logo, version, and tagline
- **Description**: Brief overview of ConceptLeak's purpose
- **Key Features**: Five main features with descriptions
- **How It Works**: Four-step process visualization
- **Technology Stack**: Frontend, Backend, and AI/ML technologies
- **Team & Credits**: Team information
- **Contact & Support**: Email, social media, website, GitHub
- **Legal**: Privacy policy, terms of service, open source licenses

**Features**:
- Expandable sections for organized information
- Support for external links
- Professional styling and layout

**File**: `AboutScreen.tsx`

### 4. **APIConfigurationScreen**
Configure AI model integration and endpoints:
- **Provider Selection**: OpenAI, Google Gemini, Anthropic Claude
- **Endpoint Configuration**: Enter API endpoint URL
- **Model Configuration**: Specify model name to use
- **Connection Testing**: Test API endpoint connectivity
- **Example Configurations**: Pre-filled examples for each provider

**Features**:
- Form validation for URLs and required fields
- API connection testing with timeout handling
- AsyncStorage for persisting configurations
- Visual feedback for success/error states

**File**: `APIConfigurationScreen.tsx`

### 5. **SecuritySettingsScreen**
Manage security and authentication settings:
- **API Key Management**: Securely store and manage API keys
- **Biometric Authentication**: Enable/disable biometric login
- **Password Management**: Change password functionality
- **Session Management**: View and manage active sessions
- **Security Logs**: View security activity logs

**Features**:
- Masked API key display for security
- Toggle for showing/hiding sensitive information
- Biometric authentication support
- AsyncStorage for secure settings persistence

**File**: `SecuritySettingsScreen.tsx`

### 6. **ExportHistoryScreen**
View and manage previous analysis results:
- **Analysis Reports List**: View all previous analyses
- **Report Details**: Dataset name, analysis date, risk level
- **PDF Export**: Download analysis results as PDF
- **Share**: Share reports with team members
- **Delete**: Remove old reports

**Features**:
- FlatList with report history
- File system integration (Expo FileSystem)
- Sharing functionality (Expo Sharing)
- Formatted date display

**File**: `ExportHistoryScreen.tsx`

## Navigation Structure

```
SettingsNavigator
├── SettingsScreen (SettingsHome)
├── HelpDocumentationScreen (HelpDocumentation)
├── AboutScreen (About)
├── APIConfigurationScreen (APIConfiguration)
├── SecuritySettingsScreen (SecuritySettings)
└── ExportHistoryScreen (ExportHistory)
```

## Type Definitions

```typescript
export type SettingsStackParamList = {
  SettingsHome: undefined;
  HelpDocumentation: undefined;
  About: undefined;
  APIConfiguration: undefined;
  SecuritySettings: undefined;
  ExportHistory: undefined;
};
```

## Navigation Usage

### From other screens:
```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from './SettingsNavigator';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  'SettingsHome'
>;

const navigation = useNavigation<SettingsScreenNavigationProp>();

// Navigate to specific screen
navigation.navigate('HelpDocumentation');
navigation.navigate('About');
navigation.navigate('APIConfiguration');
```

## Color Scheme

Uses the centralized `Colors` theme from `../theme/colors.ts`:
- `Colors.background`: Main background color
- `Colors.card`: Card background color
- `Colors.text`: Primary text color
- `Colors.textSecondary`: Secondary text color
- `Colors.accent`: Accent/highlight color

## Dependencies

- React Native
- @react-navigation/native-stack
- @expo/vector-icons (Ionicons)
- expo-file-system (for ExportHistoryScreen)
- expo-sharing (for ExportHistoryScreen)
- @react-native-async-storage/async-storage (for data persistence)

## Styling

All screens use consistent styling with:
- Dark mode support
- Responsive layouts
- Accessible touch targets (minimum 40x40 points)
- Consistent spacing and typography
- Icon integration with Ionicons

## Best Practices

1. **Navigation**: Always use TypeScript navigation props for type safety
2. **State Management**: Use AsyncStorage for persisting user preferences
3. **Validation**: Validate user input before saving configurations
4. **Error Handling**: Display user-friendly error messages in alerts
5. **Loading States**: Show activity indicators for async operations
6. **Accessibility**: Use proper semantic colors and text sizes

## Future Enhancements

- [ ] Dark mode toggle (currently always on)
- [ ] Language/localization preferences
- [ ] Advanced dataset filtering in ExportHistory
- [ ] Bulk export functionality
- [ ] Two-factor authentication setup
- [ ] Profile photo upload
- [ ] Dataset analysis history with statistics
- [ ] Integration with cloud storage providers

## Integration

To integrate the Settings module into your main navigation:

```typescript
import SettingsNavigator from './screens/settings/SettingsNavigator';

// In your main navigation:
<Stack.Screen
  name="Settings"
  component={SettingsNavigator}
  options={{
    headerShown: false,
  }}
/>
```

## File Structure

```
screens/settings/
├── SettingsScreen.tsx
├── HelpDocumentationScreen.tsx
├── AboutScreen.tsx
├── APIConfigurationScreen.tsx
├── SecuritySettingsScreen.tsx
├── ExportHistoryScreen.tsx
├── SettingsNavigator.tsx
└── README.md (this file)
```

## Support & Maintenance

For bug reports or feature requests related to the Settings Module:
1. Check existing documentation
2. Review the specific screen implementation
3. Check AsyncStorage data persistence
4. Verify navigation type definitions
5. Test on both iOS and Android platforms

