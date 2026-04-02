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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

interface APIConfig {
  endpoint: string;
  modelName: string;
  apiProvider: string;
}

export default function APIConfigurationScreen() {
  const navigation = useNavigation();
  const [config, setConfig] = useState<APIConfig>({
    endpoint: '',
    modelName: '',
    apiProvider: 'openai',
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadAPIConfig();
  }, []);

  const loadAPIConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem('apiConfig');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading API config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof APIConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveConfig = async () => {
    if (!config.endpoint.trim() || !config.modelName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!config.endpoint.startsWith('http')) {
      Alert.alert('Error', 'Endpoint must start with http:// or https://');
      return;
    }

    try {
      await AsyncStorage.setItem('apiConfig', JSON.stringify(config));
      Alert.alert('Success', 'API configuration saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const handleTestConnection = async () => {
    if (!config.endpoint.trim()) {
      Alert.alert('Error', 'Please enter an endpoint URL');
      return;
    }

    setTesting(true);

    try {
      // Simulate API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(config.endpoint, {
        method: 'HEAD',
        signal: controller.signal as any,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 401) {
        // 401 means endpoint exists but requires auth
        Alert.alert(
          'Success',
          '✅ Connection successful! Your API endpoint is reachable.'
        );
      } else {
        Alert.alert(
          'Connection Error',
          `Server returned status ${response.status}. Please verify your endpoint.`
        );
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        Alert.alert(
          'Timeout',
          'Connection timed out. Please check your endpoint URL.'
        );
      } else {
        Alert.alert(
          'Connection Error',
          'Could not connect to endpoint. Please verify the URL and your internet connection.'
        );
      }
    } finally {
      setTesting(false);
    }
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
        <Text style={styles.title}>API Configuration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Configuration Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configure Your AI Model</Text>

          {/* API Provider Selection */}
          <View style={styles.card}>
            <Text style={styles.label}>API Provider</Text>
            <View style={styles.providerButtons}>
              {[
                { id: 'openai', name: 'OpenAI', icon: 'logo-openai' },
                { id: 'gemini', name: 'Gemini', icon: 'sparkles' },
                { id: 'claude', name: 'Claude', icon: 'code-slash' },
              ].map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerButton,
                    config.apiProvider === provider.id &&
                      styles.providerButtonActive,
                  ]}
                  onPress={() =>
                    handleInputChange('apiProvider', provider.id)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={provider.icon as any}
                    size={20}
                    color={
                      config.apiProvider === provider.id
                        ? Colors.background
                        : Colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.providerButtonText,
                      config.apiProvider === provider.id &&
                        styles.providerButtonTextActive,
                    ]}
                  >
                    {provider.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Endpoint Input */}
          <View style={styles.card}>
            <Text style={styles.label}>API Endpoint URL</Text>
            <TextInput
              style={styles.input}
              value={config.endpoint}
              onChangeText={(value) => handleInputChange('endpoint', value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              placeholderTextColor={Colors.textSecondary}
            />
            <Text style={styles.hint}>
              Enter your complete API endpoint URL for the model
            </Text>
          </View>

          {/* Model Name Input */}
          <View style={styles.card}>
            <Text style={styles.label}>Model Name</Text>
            <TextInput
              style={styles.input}
              value={config.modelName}
              onChangeText={(value) => handleInputChange('modelName', value)}
              placeholder="gpt-4, gemini-pro, claude-3"
              placeholderTextColor={Colors.textSecondary}
            />
            <Text style={styles.hint}>
              Specify the exact model name to use (e.g., gpt-4, gemini-pro)
            </Text>
          </View>

          {/* Test Connection Button */}
          <TouchableOpacity
            style={[styles.testButton, testing && styles.buttonLoading]}
            onPress={handleTestConnection}
            disabled={testing}
            activeOpacity={0.7}
          >
            {testing ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Ionicons
                name="open-outline"
                size={18}
                color={Colors.background}
              />
            )}
            <Text style={styles.testButtonText}>
              {testing ? 'Testing Connection...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveConfig}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={20} color={Colors.background} />
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>

        {/* Example Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Example Configurations</Text>

          <ConfigExample
            provider="OpenAI"
            endpoint="https://api.openai.com/v1/chat/completions"
            modelName="gpt-4"
          />
          <ConfigExample
            provider="Google Gemini"
            endpoint="https://generativelanguage.googleapis.com/v1/models"
            modelName="gemini-pro"
          />
          <ConfigExample
            provider="Anthropic Claude"
            endpoint="https://api.anthropic.com/v1/messages"
            modelName="claude-3-sonnet-20240229"
          />
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ How It Works</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>1️⃣ Choose Your Provider</Text>
            <Text style={styles.infoText}>
              Select from OpenAI, Google Gemini, or Anthropic Claude
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>2️⃣ Enter Your Endpoint</Text>
            <Text style={styles.infoText}>
              Provide the API endpoint URL for your chosen provider
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>3️⃣ Test Connection</Text>
            <Text style={styles.infoText}>
              Click "Test Connection" to verify your endpoint works
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>4️⃣ Save & Use</Text>
            <Text style={styles.infoText}>
              Save your configuration and start using ConceptLeak with your AI model
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ConfigExampleProps {
  provider: string;
  endpoint: string;
  modelName: string;
}

const ConfigExample: React.FC<ConfigExampleProps> = ({
  provider,
  endpoint,
  modelName,
}) => (
  <View style={styles.exampleCard}>
    <Text style={styles.exampleTitle}>{provider}</Text>
    <Text style={styles.exampleLabel}>Endpoint:</Text>
    <Text style={styles.exampleValue}>{endpoint}</Text>
    <Text style={styles.exampleLabel}>Model:</Text>
    <Text style={styles.exampleValue}>{modelName}</Text>
  </View>
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
    marginBottom: 12,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  providerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  providerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#555',
    gap: 6,
  },
  providerButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  providerButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  providerButtonTextActive: {
    color: Colors.background,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    marginBottom: 8,
    fontSize: 13,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    marginBottom: 10,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  testButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.accent,
  },
  saveButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  exampleCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  exampleTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  exampleValue: {
    color: Colors.text,
    fontSize: 11,
    fontFamily: 'Courier',
    marginBottom: 6,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
