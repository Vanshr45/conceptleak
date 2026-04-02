import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ConceptLeakLogo } from '../components/ConceptLeakLogo';
import { useDataset } from '../context/DatasetContext';
import { useNavigation } from '@react-navigation/native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { direction: 'up' | 'down'; value: number };
}

/**
 * Stat Card Component
 */
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend }) => (
  <View style={styles.statCard}>
    <View style={styles.statCardHeader}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color={Colors.accent} />
      </View>
      {trend && (
        <View
          style={[
            styles.trendBadge,
            trend.direction === 'up' ? styles.trendUp : styles.trendDown,
          ]}
        >
          <Ionicons
            name={trend.direction === 'up' ? 'trending-up' : 'trending-down'}
            size={12}
            color={Colors.background}
          />
          <Text style={styles.trendText}>{trend.value}%</Text>
        </View>
      )}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * Setting Card Component
 */
interface SettingCardProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}

const SettingCard: React.FC<SettingCardProps> = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.settingCard} onPress={onPress}>
    <View style={styles.settingIcon}>
      <Ionicons name={icon as any} size={20} color={Colors.accent} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
  </TouchableOpacity>
);

/**
 * Premium ProfileScreen
 * Modern Dashboard-style UI with dark theme
 */
export default function ProfileScreen() {
  const { datasets, user, setUser } = useDataset();
  const navigation = useNavigation();

  // Use user data from context, fallback to defaults
  const displayName = user.name || 'User';
  const displayEmail = user.email || 'user@example.com';

  const userData = {
    name: displayName,
    badge: 'Pro Researcher',
    avatar: '👨‍🔬',
    stats: {
      datasetsScanned: datasets.length || 0,
      risksDetected: Math.floor(Math.random() * 50) + 20,
      modelsSecured: Math.floor(Math.random() * 15) + 5,
      accuracyBoost: Math.floor(Math.random() * 25) + 10,
    },
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      'Security Settings',
      'Manage your API keys and authentication methods',
      [
        {
          text: 'View Settings',
          onPress: () =>
            Alert.alert('Info', 'API keys and authentication settings would open here'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAPIConfig = () => {
    Alert.alert(
      'API Configuration',
      'Configure your AI model endpoints and settings',
      [
        {
          text: 'Configure',
          onPress: () =>
            Alert.alert(
              'Configuration',
              'API endpoint configuration panel would open here'
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleExportHistory = () => {
    Alert.alert(
      'Export History',
      'Download your analysis reports and datasets',
      [
        {
          text: 'Export as CSV',
          onPress: () =>
            Alert.alert(
              'Success',
              `Exporting ${datasets.length} dataset(s) as CSV report...`
            ),
        },
        {
          text: 'Export as PDF',
          onPress: () =>
            Alert.alert('Success', 'Exporting comprehensive PDF report...'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Documentation',
      'Learn more about concept leakage detection',
      [
        {
          text: 'View Docs',
          onPress: () =>
            Alert.alert('Documentation', 'Opening documentation...\n\nTopics:\n• What is Concept Leakage?\n• How to detect it\n• Best practices'),
        },
        {
          text: 'Video Tutorial',
          onPress: () => Alert.alert('Tutorial', 'Playing video tutorial...'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Get help from our support team',
      [
        {
          text: 'Email Support',
          onPress: () =>
            Alert.alert(
              'Support',
              `Sending email to: support@conceptleak.ai for ${displayEmail}`
            ),
        },
        {
          text: 'Chat Support',
          onPress: () => Alert.alert('Support', 'Opening live chat...'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAccountSettings = () => {
    Alert.alert(
      'Account Settings',
      `Current: ${displayName}\nEmail: ${displayEmail}`,
      [
        {
          text: 'Change Profile',
          onPress: () =>
            Alert.alert('Profile Update', 'Profile editing would open here'),
        },
        {
          text: 'Change Password',
          onPress: () =>
            Alert.alert('Password', 'Password change dialog would open here'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to logout?',
      [
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            setUser({
              name: '',
              email: '',
              isLoggedIn: false,
            });
            navigation.navigate('Login' as never);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Header with Gradient Background */}
        <ImageBackground
          source={{ uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23FFB84D;stop-opacity:0.1" /><stop offset="100%" style="stop-color:%231E293B;stop-opacity:0.3" /></linearGradient></defs><rect width="400" height="200" fill="url(%23grad)"/></svg>' }}
          style={styles.headerBackground}
        >
          <View style={styles.headerContent}>
            {/* Logo */}
            <ConceptLeakLogo width={48} height={48} variant="icon" />

            {/* User Info */}
            <View style={styles.userHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{userData.avatar}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.name}</Text>
                <View style={styles.badgeContainer}>
                  <Ionicons name="star" size={14} color={Colors.accent} />
                  <Text style={styles.badge}>{userData.badge}</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Stats Grid (2x2) */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Datasets Scanned"
              value={userData.stats.datasetsScanned}
              icon="folder-open"
              trend={{ direction: 'up', value: 12 }}
            />
            <StatCard
              label="Risks Detected"
              value={userData.stats.risksDetected}
              icon="alert-circle"
              trend={{ direction: 'up', value: 8 }}
            />
            <StatCard
              label="Models Secured"
              value={userData.stats.modelsSecured}
              icon="shield-checkmark"
              trend={{ direction: 'up', value: 15 }}
            />
            <StatCard
              label="Accuracy Boost"
              value={`${userData.stats.accuracyBoost}%`}
              icon="trending-up"
              trend={{ direction: 'up', value: 23 }}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>⚙️ Settings & Actions</Text>

          <SettingCard
            icon="shield"
            title="Security Settings"
            description="Manage API keys and authentication"
            onPress={handleSecuritySettings}
          />

          <SettingCard
            icon="code-slash"
            title="API Configuration"
            description="Configure AI model and endpoints"
            onPress={handleAPIConfig}
          />

          <SettingCard
            icon="download"
            title="Export History"
            description="Download your analysis reports"
            onPress={handleExportHistory}
          />

          <SettingCard
            icon="help-circle"
            title="Help & Documentation"
            description="Learn more about concept leakage detection"
            onPress={handleHelp}
          />

          <SettingCard
            icon="mail"
            title="Support"
            description="Contact our team for assistance"
            onPress={handleSupport}
          />
        </View>

        {/* Account Section */}
        <View style={styles.accountSection}>
          <SettingCard
            icon="person"
            title="Account Settings"
            description="Edit profile and preferences"
            onPress={handleAccountSettings}
          />

          <SettingCard
            icon="log-out"
            title="Sign Out"
            description="Logout from your account"
            onPress={handleSignOut}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ConceptLeak v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Protecting AI Models Through Data Intelligence
          </Text>
          <Text style={styles.footerCopyright}>© 2026 ConceptLeak. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBackground: {
    padding: 20,
    paddingTop: 16,
  },
  headerContent: {
    gap: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.card,
    borderWidth: 3,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 184, 77, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.1)',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 184, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendUp: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  trendDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Settings Section
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 184, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Account Section
  accountSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 184, 77, 0.1)',
    marginTop: 8,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 184, 77, 0.1)',
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  footerCopyright: {
    fontSize: 10,
    color: Colors.textSecondary,
    opacity: 0.6,
  },
});
