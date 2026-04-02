import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';

interface CustomCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
  elevated?: boolean;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  children,
  style,
  onPress,
  elevated = false,
}) => {
  const cardComponent = (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={{ borderRadius: 12 }}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {cardComponent}
      </TouchableOpacity>
    );
  }

  return cardComponent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  elevated: {
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
