# ConceptLeak - Developer Quick Reference

## 🚀 Quick Start (60 seconds)

```bash
cd conceptleak
npm install
npm start
# Scan QR code with Expo Go app
```

## 📱 App Screens

| Screen | Path | Purpose |
|--------|------|---------|
| **Home** | screens/HomeScreen.tsx | Dashboard with summary cards |
| **Chat** | screens/ChatScreen.tsx | AI chatbot interface |
| **Insights** | screens/InsightsScreen.tsx | Risk analysis display |
| **Datasets** | screens/DatasetsScreen.tsx | File management |
| **Profile** | screens/ProfileScreen.tsx | App information |

## 🎨 Colors (Use these!)

```typescript
import { Colors } from './theme/colors';

Colors.background    // #1E1E1E - Main background
Colors.card          // #2A2A2A - Card/container
Colors.accent        // #FFA94D - Primary accent
Colors.text          // #FFFFFF - Main text
Colors.textSecondary // #B0B0B0 - Secondary text
Colors.border        // #3A3A3A - Borders
Colors.riskLow       // #4CAF50 - Low risk
Colors.riskMedium    // #FFC107 - Medium risk
Colors.riskHigh      // #F44336 - High risk
```

## 🧩 Components

### CustomButton
```tsx
<CustomButton
  title="Upload"
  onPress={handleUpload}
  variant="primary"      // 'primary' | 'secondary' | 'outline'
  disabled={false}
/>
```

### CustomCard
```tsx
<CustomCard elevated onPress={handlePress}>
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
  message="Error occurred"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

## 🔌 API Calls

### In any component:
```typescript
import { sendChatMessage, uploadCSV, getInsights } from '../services/api';

const handleChat = async () => {
  try {
    const response = await sendChatMessage("Hello");
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};
```

## 📝 Common Imports

```typescript
// Navigation
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

// React Native
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Theme
import { Colors } from '../theme/colors';

// Components
import { CustomButton, CustomCard, ErrorMessage } from '../components';

// API
import { sendChatMessage } from '../services/api';
```

## 🧭 Navigation

### Navigate to another tab
```typescript
const navigation = useNavigation();
navigation.navigate('Chat');
```

### Navigate with params
```typescript
navigation.navigate('Details', { itemId: 123 });
```

### Access route params
```typescript
const route = useRoute();
const { itemId } = route.params;
```

## 📱 Screen Template

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';

export default function MyScreen() {
  const [data, setData] = useState([]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Screen Title</Text>
      </View>
      {/* Content here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accent,
  },
});
```

## 🛠 TypeScript Types

```typescript
import {
  ChatMessage,
  Insight,
  Dataset,
  ApiResponse,
} from '../types';

const message: ChatMessage = {
  id: '1',
  text: 'Hello',
  sender: 'user',
  timestamp: new Date(),
};
```

## 📦 File Structure for New Features

1. Create screen in `screens/MyScreen.tsx`
2. Import in `navigation/RootNavigator.tsx`
3. Add to Tab/Stack navigator
4. Add types in `types/index.ts` if needed
5. Create API calls in `services/api.ts` if needed

## ⚡ Performance Tips

✅ Use `ScrollView` for small lists  
✅ Use `FlatList` for large lists  
✅ Memoize expensive components  
✅ Use `useCallback` for callbacks  
✅ Avoid inline styles  

```typescript
// Bad
<View style={{ padding: 16 }}>

// Good
<View style={styles.container}>
```

## 🚫 Don't Do This

❌ Don't use relative imports: `../../screens/HomeScreen`  
✅ Do use: `../../ screens/HomeScreen` or configure path aliases  

❌ Don't import entire modules  
✅ Do: `import { uploadCSV } from '../services/api'`  

❌ Don't create inline components  
✅ Do: Create reusable components in `components/`  

## 🐛 Debugging

```bash
# Clear cache
npm start -c

# Check for errors
npx tsc --noEmit

# View logs
npm start
# Logs appear on terminal

# React Native Debugger
# Install: https://github.com/jhen0409/react-native-debugger
```

## 📋 Before Commit

- [ ] No `console.log` left
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Tests pass (if any)
- [ ] No unused imports
- [ ] Code formatted consistently

## 🔐 API Configuration

Edit in `services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
// Change to your actual backend URL
```

## 📚 Key Files to Know

| File | What to do |
|------|-----------|
| `App.tsx` | App wrapper and providers |
| `RootNavigator.tsx` | Navigation setup |
| `theme/colors.ts` | All styling colors |
| `services/api.ts` | Backend calls |
| `types/index.ts` | Type definitions |

## 🎯 Common Tasks

### Add a new screen
1. Create `screens/NewScreen.tsx`
2. Add to `navigation/RootNavigator.tsx`
3. Import and register in Tab/Stack

### Change colors
1. Edit `theme/colors.ts`
2. Import and use `Colors.background`, etc.

### Add API call
1. Add function to `services/api.ts`
2. Import in component
3. Call with `await`

### Create new component
1. Create in `components/MyComponent.tsx`
2. Export in `components/index.ts`
3. Import in screen

## 📞 Need Help?

- React Native: https://reactnative.dev/docs
- React Navigation: https://reactnavigation.org/docs
- Expo: https://docs.expo.dev/
- TypeScript: https://www.typescriptlang.org/docs

---

**Made with ❤️ by ConceptLeak Team**
