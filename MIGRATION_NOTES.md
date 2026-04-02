# Migration Notes: From Expo Router to Manual Navigation

## Overview
The ConceptLeak app has been set up using manual React Navigation instead of Expo Router's file-based routing. This provides more explicit control over the navigation structure.

## Why Manual Navigation?

✅ **Explicit Control**: Full control over navigation structure in one place
✅ **Type Safety**: Easier to maintain type-safe navigation parameters
✅ **Performance**: No file-based routing overhead
✅ **Flexibility**: Easy to switch navigation patterns (e.g., conditional auth flows)
✅ **Bottom Tab Architecture**: Native bottom tabs are easier to implement manually

## Key Changes from Default Expo App

### Entry Point
- **Default**: `expo-router/entry` → file-based routing in `/app` directory
- **ConceptLeak**: `App.tsx` → manual React Navigation setup

### Navigation Structure
```
Default (Expo Router):
/app/_layout.tsx → (tabs) → [screens]

ConceptLeak (Manual):
App.tsx → RootNavigator.tsx → BottomTabNavigator → Stack Navigators → Screens
```

### File Location Changes
| Purpose | Default | ConceptLeak |
|---------|---------|------------|
| Entry | app.json points to expo-router | App.tsx manually set |
| Screens | /app directory | /screens directory |
| Navigation Config | Implicit in /app structure | /navigation/RootNavigator.tsx |
| Theming | app/_layout.tsx | /theme/colors.ts |

## Directory Structure Explanation

### `/screens` Directory
Contains all screen components. Each screen is stateless and receives navigation props:

```typescript
interface ScreenProps {
  navigation: any;  // React Navigation props
  route: any;       // Route information
}
```

### `/navigation` Directory
Contains navigation configuration:
- `RootNavigator.tsx` - Sets up the complete navigation tree
  - BottomTabNavigator (5 tabs)
  - Stack Navigators (one per tab)
  - All screen registrations

### `/theme` Directory
Centralized design system:
- `colors.ts` - All color constants
- Exported as `Colors` object for consistent theming

## How to Extend Navigation

### Add a New Stack to a Tab
In `navigation/RootNavigator.tsx`:

```typescript
const NewScreen = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="NewMain" component={NewScreenComponent} />
    <Stack.Screen name="NewDetails" component={DetailsScreen} />
  </Stack.Navigator>
);
```

### Add a New Screen with Stack
Add to `Tab.Navigator`:

```typescript
<Tab.Screen
  name="NewTab"
  component={NewScreen}
  options={{
    title: 'New Tab',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="icon-name" size={size} color={color} />
    ),
  }}
/>
```

## Differences from Expo Router

| Feature | Expo Router | Manual Navigation |
|---------|------------|------------------|
| File-based routing | Yes | No |
| Deep linking | Built-in | Manual |
| Dynamic routes | `[id].tsx` | Params in navigation |
| Layout sharing | `_layout.tsx` | Navigator wrapper |
| Auth flow | Simple conditional | Needs Stack switching |
| Bottom tabs | Via dynamic routes | Native Tab Navigator |
| Performance | Optimized | Similar with config |

## Converting from Expo Router (Reference)

If you need to understand the conversion:

**Expo Router approach:**
```
/app
  ├── _layout.tsx (root)
  ├── (tabs)/
  │   ├── _layout.tsx (tab layout)
  │   ├── index.tsx (home)
  │   └── [other tabs]
```

**Manual Navigation approach:**
```
navigation/
  └── RootNavigator.tsx (defines everything)
screens/
  ├── HomeScreen.tsx
  ├── ChatScreen.tsx
  └── [other screens]
App.tsx (entry with providers)
```

## Benefits of This Approach

1. **Single Source of Truth**: All navigation logic in one file
2. **Easier Type Safety**: Complete TypeScript support
3. **Better IDE Support**: Full autocomplete for navigation
4. **Explicit Dependencies**: Easier to understand what screens depend on what
5. **Reusable Patterns**: Easy to clone navigation patterns

## Deployment Considerations

### iOS
- All screens need to be registered in `RootNavigator.tsx`
- No special Expo Router config needed
- Works with standard iOS build

### Android
- Same as iOS
- All screens registered
- No file-based routing to evaluate

### Web
- May need special configuration
- EAS Build handles web builds
- Refer to React Navigation web docs

## Common Tasks

### Navigate Between Screens
```typescript
// In any screen component
const handleNavigate = () => {
  navigation.navigate('Chat');
};
```

### Pass Parameters
```typescript
// Navigate with params
navigation.navigate('Details', { itemId: 123 });

// Access in destination screen
const { itemId } = route.params;
```

### Reset Navigation
```typescript
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

### Conditional Rendering
```typescript
// In App.tsx for auth flows
{isLoggedIn ? <AuthenticatedNav /> : <PublicNav />}
```

## Troubleshooting

### Screen Not Showing
- Ensure screen is registered in `RootNavigator.tsx`
- Check that screen name matches in `Tab.Screen` and stack

### Navigation Not Working
- Verify `useNavigation()` hook is imported
- Ensure screen is wrapped in `NavigationContainer`

### Type Errors
- Use `RootStackParamList` for type safety
- Define all screen params in `types/index.ts`

## Resources

- [React Navigation Docs](https://reactnavigation.org/)
- [React Navigation Bottom Tabs](https://reactnavigation.org/docs/bottom-tab-navigator/)
- [React Navigation Stack](https://reactnavigation.org/docs/native-stack-navigator/)
- [Expo Navigation Guide](https://docs.expo.dev/routing/introduction/)

---

**Note**: This setup is fully compatible with Expo and can be deployed exactly like a standard Expo Router app. The main difference is in how navigation is configured, not in how the app runs.
