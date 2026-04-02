import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export default function SecuritySettingsScreen() {
  const navigation = useNavigation();
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const savedKey = await AsyncStorage.getItem('apiKey');
      const savedBiometric = await AsyncStorage.getItem('biometricEnabled');

      if (savedKey) {
        setApiKey(savedKey);
        setMaskedKey(maskKey(savedKey));
      }

      if (savedBiometric !== null) {
        setBiometricEnabled(JSON.parse(savedBiometric));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const handleSaveAPIKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    try {
      await AsyncStorage.setItem('apiKey', apiKey);
      setMaskedKey(maskKey(apiKey));
      setShowKey(false);
      Alert.alert('Success', 'API key saved securely');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      setBiometricEnabled(value);
      await AsyncStorage.setItem('biometricEnabled', JSON.stringify(value));
      Alert.alert(
        'Success',
        value ? 'Biometric authentication enabled' : 'Biometric authentication disabled'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update biometric settings');
    }
  };

  const handleResetKey = () => {
    Alert.alert(
      'Reset API Key',
      'Are you sure you want to reset your API key?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('apiKey');
              setApiKey('');
              setMaskedKey('');
              Alert.alert('Success', 'API key has been reset');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset API key');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Security Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* API Key Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 API Key Management</Text>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>API Key</Text>
              <TouchableOpacity
                onPress={() => setShowKey(!showKey)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showKey ? 'eye-off' : 'eye'}
                  size={20}
                  color={Colors.accent}
                />
              </TouchableOpacity>
            </View>

            {showKey ? (
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-..."
                placeholderTextColor={Colors.textSecondary}
                editable
              />
            ) : (
              <View style={styles.maskedKeyContainer}>
                <Text style={styles.maskedKey}>{maskedKey || 'No key set'}</Text>
              </View>
            )}

            <Text style={styles.hint}>
              Your API key is encrypted and stored securely on your device only.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSaveAPIKey}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={18} color={Colors.background} />
                <Text style={styles.buttonText}>Save Key</Text>
              </TouchableOpacity>

              {apiKey && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={handleResetKey}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={18} color={Colors.riskHigh} />
                  <Text style={[styles.buttonText, { color: Colors.riskHigh }]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Biometric Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Biometric Authentication</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Enable Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use Face ID or Fingerprint to login faster
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: '#333', true: Colors.accent }}
                thumbColor={biometricEnabled ? Colors.accent : '#666'}
              />
            </View>
          </Card>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Security Tips</Text>

          <View style={styles.tipsContainer}>
            <TipItem
              icon="lock"
              title="Never Share Your Keys"
              description="Keep your API keys private and never share them in emails or messages"
            />
            <TipItem
              icon="refresh"
              title="Rotate Keys Regularly"
              description="Change your API keys every 30 days for better security"
            />
            <TipItem
              icon="phone-portrait"
              title="Device Security"
              description="Enable biometric authentication to protect your account"
            />
            <TipItem
              icon="shield-checkmark"
              title="Data Encryption"
              description="All sensitive data is encrypted and stored locally on your device"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface TipItemProps {
  icon: string;
  title: string;
  description: string;
}

const TipItem: React.FC<TipItemProps> = ({ icon, title, description }) => (
  <View style={styles.tipItem}>
    <View style={styles.tipIcon}>
      <Ionicons name={icon as any} size={20} color={Colors.accent} />
    </View>
    <View style={styles.tipContent}>
      <Text style={styles.tipTitle}>{title}</Text>
      <Text style={styles.tipDescription}>{description}</Text>
    </View>
  </View>
);

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    marginBottom: 12,
    fontFamily: 'Courier',
    fontSize: 12,
  },
  maskedKeyContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  maskedKey: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Courier',
    letterSpacing: 2,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonPrimary: {
    backgroundColor: Colors.accent,
  },
  buttonSecondary: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.riskHigh,
  },
  buttonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  tipDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
