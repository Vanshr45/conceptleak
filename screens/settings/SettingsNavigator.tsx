import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from './SettingsScreen';
import HelpDocumentationScreen from './HelpDocumentationScreen';
import AboutScreen from './AboutScreen';
import APIConfigurationScreen from './APIConfigurationScreen';
import SecuritySettingsScreen from './SecuritySettingsScreen';
import ExportHistoryScreen from './ExportHistoryScreen';
import { Colors } from '../theme/colors';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  HelpDocumentation: undefined;
  About: undefined;
  APIConfiguration: undefined;
  SecuritySettings: undefined;
  ExportHistory: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen
        name="HelpDocumentation"
        component={HelpDocumentationScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="APIConfiguration"
        component={APIConfigurationScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="ExportHistory"
        component={ExportHistoryScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
