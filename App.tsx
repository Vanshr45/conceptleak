import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/RootNavigator';
import { DatasetProvider } from './context/DatasetContext';
import { Colors } from './theme/colors';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <DatasetProvider>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor={Colors.background}
          />
          <View style={styles.container}>
            <RootNavigator />
          </View>
        </DatasetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
