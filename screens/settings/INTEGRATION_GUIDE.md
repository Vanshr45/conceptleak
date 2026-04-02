# Settings Module Integration Guide

## Overview

This guide explains how to integrate the Settings Module navigation into your main application navigation structure.

## Quick Start

### 1. Import the SettingsNavigator

In your main navigation file (typically `navigation/RootNavigator.tsx` or `navigation/MainNavigator.tsx`):

```typescript
import SettingsNavigator from '../screens/settings/SettingsNavigator';
```

### 2. Add to Your Navigation Stack

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import DatasetsScreen from '../screens/DatasetsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsNavigator from '../screens/settings/SettingsNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Datasets" component={DatasetsScreen} />
        <Stack.Screen name="Insights" component={InsightsScreen} />
        
        {/* Settings Module */}
        <Stack.Screen
          name="Settings"
          component={SettingsNavigator}
          options={{
            animationEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 3. Add Settings Button to Tab Navigation

If your app uses tab navigation, add a Settings tab:

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsNavigator from '../screens/settings/SettingsNavigator';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: '#444',
          borderTopWidth: 1,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
```

### 4. Navigate to Settings from any Screen

```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SomeScreen() {
  const navigation = useNavigation();

  return (
    <View>
      {/* Settings button in header or elsewhere */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
```

### 5. Navigate Between Settings Screens

From outside the Settings module:

```typescript
const navigation = useNavigation();

// Go to Help Documentation
navigation.navigate('Settings', { 
  screen: 'HelpDocumentation' 
});

// Go to About
navigation.navigate('Settings', { 
  screen: 'About' 
});

// Go to API Configuration
navigation.navigate('Settings', { 
  screen: 'APIConfiguration' 
});
```

## File Organization

### Recommended Structure

```
App Structure:
├── app.tsx
├── App.tsx
├── navigation/
│   ├── RootNavigator.tsx
│   ├── MainNavigator.tsx
│   └── BottomTabNavigator.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── ChatScreen.tsx
│   ├── DatasetsScreen.tsx
│   ├── InsightsScreen.tsx
│   └── settings/
│       ├── index.ts
│       ├── README.md
│       ├── SettingsScreen.tsx
│       ├── SettingsNavigator.tsx
│       ├── HelpDocumentationScreen.tsx
│       ├── AboutScreen.tsx
│       ├── APIConfigurationScreen.tsx
│       ├── SecuritySettingsScreen.tsx
│       └── ExportHistoryScreen.tsx
├── theme/
│   └── colors.ts
└── ...
```

## TypeScript Setup

### Create a Navigation Type Definition File

Create `navigation/types.ts`:

```typescript
import { NavigatorScreenParams } from '@react-navigation/native';
import { SettingsStackParamList } from '../screens/settings/SettingsNavigator';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  Datasets: undefined;
  Insights: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};
```

### Use in Navigation

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      {/* Your screens */}
    </Stack.Navigator>
  );
}
```

## Features Integration

### Settings Access Points

1. **App Header/Navigation**
   - Add settings icon in header
   - Trigger with `navigation.navigate('Settings')`

2. **Profile Screen**
   - Add "Settings" button in profile details
   - Navigate to Settings when tapped

3. **Menu Drawer**
   - Include Settings option in drawer menu
   - Navigate to Settings when selected

4. **Tab Navigation**
   - Add Settings as bottom tab
   - Direct access from anywhere

### Example: Settings Button in Header

```typescript
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export function SettingsHeaderButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={{ marginRight: 16 }}
      onPress={() => navigation.navigate('Settings')}
    >
      <Ionicons name="settings" size={24} color={Colors.text} />
    </TouchableOpacity>
  );
}
```

Use in header options:

```typescript
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    headerRight: () => <SettingsHeaderButton />,
  }}
/>
```

## Data Persistence

The Settings Module uses `AsyncStorage` for persisting user preferences:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Saving preferences
await AsyncStorage.setItem('apiConfig', JSON.stringify(config));

// Loading preferences
const saved = await AsyncStorage.getItem('apiConfig');
if (saved) {
  const config = JSON.parse(saved);
}
```

### Key Storage Items

- `apiConfig`: API configuration (endpoint, model name, provider)
- `apiKey`: Secure API key storage
- `biometricEnabled`: Biometric authentication preference
- `analysisReports`: History of analysis exports

## Styling Consistency

The Settings Module uses the centralized color theme. Ensure your main app also uses `colors.ts`:

```typescript
import { Colors } from '../theme/colors';

// Use throughout your app
backgroundColor: Colors.background,
color: Colors.text,
borderColor: Colors.card,
```

## Error Handling

Settings screens include error handling for:

- API connection tests
- AsyncStorage read/write operations
- File system operations
- Network timeouts

Example error handling pattern:

```typescript
try {
  await AsyncStorage.setItem('key', 'value');
  Alert.alert('Success', 'Settings saved');
} catch (error) {
  Alert.alert('Error', 'Failed to save settings');
  console.error('Error:', error);
}
```

## Testing Integration

### Test Checklist

- [ ] Settings button navigates to SettingsScreen
- [ ] All menu items navigate correctly
- [ ] Back button works from all screens
- [ ] Preferences are saved to AsyncStorage
- [ ] API configuration validation works
- [ ] Help documentation renders correctly
- [ ] About screen displays all information
- [ ] Links (social, website) open correctly
- [ ] Export history loads previous analyses
- [ ] Security settings persist correctly

### Manual Testing

1. Navigate to Settings
2. Verify all menu items are clickable
3. Go to Help & Documentation
4. Scroll through all sections
5. Go to About
6. Test external links (if in dev mode)
7. Go to API Configuration
8. Test connection (without valid endpoint is OK)
9. Save configuration and verify it persists
10. Go back to main screen and return to Settings
11. Verify configuration was saved

## Performance Considerations

1. **Lazy Loading**: Settings screens are only loaded when accessed
2. **Memoization**: Use `React.memo()` for components that don't need frequent updates
3. **AsyncStorage**: Cache frequently accessed preferences in state
4. **Navigation**: Use stack navigator for smooth transitions

Example optimization:

```typescript
const SettingsButton = React.memo(({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Ionicons name="settings" size={24} />
  </TouchableOpacity>
));
```

## Troubleshooting

### Issue: Settings screens not appearing

**Solution**: Ensure SettingsNavigator is imported and referenced correctly in your main navigation

### Issue: Navigation params not working

**Solution**: Use proper TypeScript types for navigation props

### Issue: Settings not persisting

**Solution**: Check AsyncStorage permissions in app.json and ensure data is being saved

```json
{
  "plugins": [
    [
      "@react-native-async-storage/async-storage",
      {
        "NSAllowsArbitraryLoads": true
      }
    ]
  ]
}
```

## Next Steps

1. Copy the Settings Module to your project
2. Update your main navigation to include SettingsNavigator
3. Test all navigation flows
4. Customize colors and text to match your branding
5. Add additional settings as needed
6. Implement backend integration for settings sync

## Support

For issues or questions about the Settings Module integration:

1. Check this integration guide
2. Review the Settings Module README.md
3. Examine individual screen implementations
4. Check React Navigation documentation
5. Test on both iOS and Android platforms

