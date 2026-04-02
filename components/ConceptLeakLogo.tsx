import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface ConceptLeakLogoProps {
  width?: number;
  height?: number;
  variant?: 'full' | 'icon' | 'wordmark';
}

/**
 * ConceptLeak Logo Component
 * 
 * Design Concept: A stylized Shield containing:
 * - Magnifying Glass (representing inspection)
 * - Data Grid (in the lens, representing data)
 * - Gold accents highlighting concept detection
 *
 * This represents the core mission: Protecting models by inspecting data
 * 
 * Note: Uses emoji-based icon design for cross-platform compatibility
 */
export const ConceptLeakLogo: React.FC<ConceptLeakLogoProps> = ({
  width = 64,
  height = 64,
  variant = 'icon',
}) => {
  if (variant === 'icon') {
    return (
      <View
        style={[
          styles.container,
          { width, height },
        ]}
      >
        {/* Shield + Magnifying Glass Icon */}
        <Text style={styles.logoEmoji}>🛡️</Text>
        <Text style={styles.glassEmoji}>🔍</Text>
      </View>
    );
  }

  if (variant === 'wordmark') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <ConceptLeakLogo width={height} height={height} variant="icon" />
        <Text style={styles.wordmark}>ConceptLeak</Text>
      </View>
    );
  }

  // Full variant with text
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <ConceptLeakLogo width={width} height={height} variant="icon" />
      <Text style={styles.fullText}>ConceptLeak</Text>
    </View>
  );
};

/**
 * Minimal header icon version (for navigation bars)
 */
export const ConceptLeakLogoSmall: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <ConceptLeakLogo width={size} height={size} variant="icon" />
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoEmoji: {
    fontSize: 48,
    color: Colors.accent,
  },
  glassEmoji: {
    fontSize: 20,
    position: 'absolute',
    color: Colors.accent,
  },
  wordmark: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  fullText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default ConceptLeakLogo;
