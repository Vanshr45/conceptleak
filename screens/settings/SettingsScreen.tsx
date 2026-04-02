import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { SettingsStackParamList } from './SettingsNavigator';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  'SettingsHome'
>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: () => {
            // Handle logout logic
          },
          style: 'destructive',
        },
      ]
    );
  };

  const settingsMenuItems = [
    {
      id: 'help',
      icon: 'help-circle-outline',
      title: 'Help & Documentation',
      subtitle: 'Learn how to use ConceptLeak',
      screen: 'HelpDocumentation',
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      title: 'About ConceptLeak',
      subtitle: 'App version and information',
      screen: 'About',
    },
    {
      id: 'api',
      icon: 'servers-outline',
      title: 'API Configuration',
      subtitle: 'Configure API endpoints',
      screen: 'APIConfiguration',
    },
    {
      id: 'security',
      icon: 'shield-checkmark-outline',
      title: 'Security Settings',
      subtitle: 'Manage authentication and security',
      screen: 'SecuritySettings',
    },
    {
      id: 'export',
      icon: 'download-outline',
      title: 'Export History',
      subtitle: 'Download previous analyses',
      screen: 'ExportHistory',
    },
  ];

  const handleMenuItemPress = (item: (typeof settingsMenuItems)[0]) => {
    if (item.screen) {
      navigation.navigate(item.screen as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <Section title="⚙️ Preferences">
          <SettingToggle
            icon="bell-outline"
            title="Notifications"
            subtitle="Receive analysis alerts"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingToggle
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Always enabled"
            value={darkMode}
            onValueChange={() => {}}
            disabled
          />
          <SettingToggle
            icon="stats-chart-outline"
            title="Analytics"
            subtitle="Help improve ConceptLeak"
            value={analytics}
            onValueChange={setAnalytics}
          />
          <SettingToggle
            icon="cloud-upload-outline"
            title="Auto-upload Results"
            subtitle="Cloud backup of analyses"
            value={autoUpload}
            onValueChange={setAutoUpload}
          />
        </Section>

        {/* Menu Items */}
        <Section title="📋 Resources">
          {settingsMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => handleMenuItemPress(item)}
              screen={item.screen}
            />
          ))}
        </Section>

        {/* App Info */}
        <Section title="ℹ️ App Information">
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Build" value="100" />
          <InfoRow label="Environment" value="Production" />
          <InfoRow label="Last Updated" value="2025-01-15" />
        </Section>

        {/* Danger Zone */}
        <Section title="⚠️ Danger Zone">
          <DangerButton
            icon="trash-outline"
            title="Clear Cache"
            subtitle="Remove temporary files"
            onPress={() => {
              Alert.alert(
                'Clear Cache',
                'This will remove temporary analysis files. Continue?',
                [
                  { text: 'Cancel' },
                  {
                    text: 'Clear',
                    onPress: () => {},
                    style: 'destructive',
                  },
                ]
              );
            }}
          />
          <DangerButton
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
        </Section>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface SettingToggleProps {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}) => (
  <View style={[styles.settingRow, disabled && styles.disabledRow]}>
    <View style={styles.settingLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={18} color={Colors.accent} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#333', true: Colors.accent + '50' }}
      thumbColor={value ? Colors.accent : '#666'}
    />
  </View>
);

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  screen: string | null;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  screen,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!screen}
  >
    <View style={styles.menuLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={18} color={Colors.accent} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
    </View>
    {screen && (
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    )}
  </TouchableOpacity>
);

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

interface DangerButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const DangerButton: React.FC<DangerButtonProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.menuItem, styles.dangerItem]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.iconContainer, styles.dangerIcon]}>
        <Ionicons name={icon as any} size={18} color="#FF6B6B" />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#FF6B6B" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  disabledRow: {
    opacity: 0.6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  dangerItem: {
    borderBottomColor: '#333',
  },
  dangerIcon: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B' + '15',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  spacer: {
    height: 20,
  },
});
