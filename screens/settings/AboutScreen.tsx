import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export default function AboutScreen() {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>About ConceptLeak</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo & Title Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Ionicons name="flask" size={40} color={Colors.accent} />
          </View>
          <Text style={styles.appName}>ConceptLeak</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.tagline}>
            Detecting Hidden Shortcuts in Your Data
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            ConceptLeak is an advanced AI-powered platform designed to detect and prevent concept leakage in machine learning datasets. We help you build robust, production-ready models by identifying hidden information shortcuts that artificially inflate model performance.
          </Text>
        </View>

        {/* Key Features */}
        <ExpandableSection
          title="✨ Key Features"
          icon="spark-outline"
          expanded={expandedSection === 'features'}
          onPress={() => toggleSection('features')}
        >
          <FeatureItem
            icon="scan"
            title="Intelligent Detection"
            description="Automatically identifies suspicious columns, temporal leakage, and data snooping issues"
          />
          <FeatureItem
            icon="bulb"
            title="Smart Recommendations"
            description="Get actionable insights and specific steps to fix detected leakage"
          />
          <FeatureItem
            icon="chatbubbles"
            title="AI-Powered Chat"
            description="Ask questions about your data and get expert explanations"
          />
          <FeatureItem
            icon="bar-chart"
            title="Detailed Analytics"
            description="Comprehensive visualizations and statistical insights"
          />
          <FeatureItem
            icon="shield-checkmark"
            title="Privacy First"
            description="All data stays on your device - nothing is uploaded externally"
          />
        </ExpandableSection>

        {/* How It Works */}
        <ExpandableSection
          title="🔬 How It Works"
          icon="beaker-outline"
          expanded={expandedSection === 'how-it-works'}
          onPress={() => toggleSection('how-it-works')}
        >
          <StepItem
            number="1"
            title="Upload Your Data"
            description="Select your CSV file containing your dataset"
          />
          <StepItem
            number="2"
            title="Automatic Analysis"
            description="ConceptLeak scans for potential leakage patterns and issues"
          />
          <StepItem
            number="3"
            title="Get Insights"
            description="Review detailed findings with risk levels and explanations"
          />
          <StepItem
            number="4"
            title="Fix & Validate"
            description="Apply recommendations and validate your cleaned dataset"
          />
        </ExpandableSection>

        {/* Technology Stack */}
        <ExpandableSection
          title="💻 Technology"
          icon="code-outline"
          expanded={expandedSection === 'tech'}
          onPress={() => toggleSection('tech')}
        >
          <TechStack
            category="Frontend"
            items={['React Native', 'Expo', 'TypeScript']}
          />
          <TechStack
            category="Backend"
            items={['Python', 'FastAPI', 'Pandas', 'Scikit-Learn']}
          />
          <TechStack
            category="AI/ML"
            items={['GPT-4', 'Data Analytics', 'Statistical Analysis']}
          />
        </ExpandableSection>

        {/* Team & Credits */}
        <ExpandableSection
          title="👥 Team & Credits"
          icon="people-outline"
          expanded={expandedSection === 'team'}
          onPress={() => toggleSection('team')}
        >
          <Text style={styles.creditText}>
            ConceptLeak is developed by a team of data scientists, ML engineers, and software developers dedicated to making machine learning safer and more reliable.
          </Text>

          <TeamMember
            name="Lead Developers"
            role="Full-stack & ML Engineering"
          />
          <TeamMember
            name="Data Scientists"
            role="Research & Algorithm Design"
          />
          <TeamMember
            name="Contributors"
            role="Community & Feedback"
          />
        </ExpandableSection>

        {/* Contact & Support */}
        <ExpandableSection
          title="📞 Contact & Support"
          icon="mail-outline"
          expanded={expandedSection === 'contact'}
          onPress={() => toggleSection('contact')}
        >
          <ContactItem
            icon="mail"
            title="Email Support"
            subtitle="support@conceptleak.com"
            onPress={() => openLink('mailto:support@conceptleak.com')}
          />
          <ContactItem
            icon="logo-twitter"
            title="Follow Us"
            subtitle="@ConceptLeak"
            onPress={() => openLink('https://twitter.com/ConceptLeak')}
          />
          <ContactItem
            icon="globe"
            title="Website"
            subtitle="www.conceptleak.com"
            onPress={() => openLink('https://www.conceptleak.com')}
          />
          <ContactItem
            icon="logo-github"
            title="GitHub"
            subtitle="github.com/conceptleak"
            onPress={() => openLink('https://github.com/conceptleak')}
          />
        </ExpandableSection>

        {/* Legal */}
        <ExpandableSection
          title="⚖️ Legal"
          icon="document-outline"
          expanded={expandedSection === 'legal'}
          onPress={() => toggleSection('legal')}
        >
          <LegalLink
            title="Privacy Policy"
            onPress={() =>
              openLink('https://www.conceptleak.com/privacy-policy')
            }
          />
          <LegalLink
            title="Terms of Service"
            onPress={() => openLink('https://www.conceptleak.com/terms')}
          />
          <LegalLink
            title="Open Source Licenses"
            onPress={() =>
              openLink('https://www.conceptleak.com/licenses')
            }
          />
        </ExpandableSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with ❤️ for the ML Community
          </Text>
          <Text style={styles.copyrightText}>
            © 2025 ConceptLeak. All rights reserved.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components

interface ExpandableSectionProps {
  title: string;
  icon: string;
  expanded: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon,
  expanded,
  onPress,
  children,
}) => (
  <View style={styles.expandableSection}>
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.headerLeft}>
        <Ionicons name={icon as any} size={18} color={Colors.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={Colors.accent}
      />
    </TouchableOpacity>
    {expanded && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon as any} size={16} color={Colors.accent} />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

interface StepItemProps {
  number: string;
  title: string;
  description: string;
}

const StepItem: React.FC<StepItemProps> = ({ number, title, description }) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

interface TechStackProps {
  category: string;
  items: string[];
}

const TechStack: React.FC<TechStackProps> = ({ category, items }) => (
  <View style={styles.techStackItem}>
    <Text style={styles.techCategory}>{category}</Text>
    <View style={styles.techItems}>
      {items.map((item, index) => (
        <View key={index} style={styles.techBadge}>
          <Text style={styles.techBadgeText}>{item}</Text>
        </View>
      ))}
    </View>
  </View>
);

interface TeamMemberProps {
  name: string;
  role: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role }) => (
  <View style={styles.teamMember}>
    <Text style={styles.teamMemberName}>{name}</Text>
    <Text style={styles.teamMemberRole}>{role}</Text>
  </View>
);

interface ContactItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.contactItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name={icon as any} size={20} color={Colors.accent} />
    <View style={styles.contactContent}>
      <Text style={styles.contactTitle}>{title}</Text>
      <Text style={styles.contactSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
  </TouchableOpacity>
);

interface LegalLinkProps {
  title: string;
  onPress: () => void;
}

const LegalLink: React.FC<LegalLinkProps> = ({ title, onPress }) => (
  <TouchableOpacity
    style={styles.legalLink}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.legalLinkText}>{title}</Text>
    <Ionicons name="open-outline" size={14} color={Colors.accent} />
  </TouchableOpacity>
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
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.card,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  appName: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  versionText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  tagline: {
    color: Colors.accent,
    fontSize: 13,
    fontStyle: 'italic',
  },
  descriptionBox: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  description: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  expandableSection: {
    marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContent: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  featureIcon: {
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  techStackItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  techCategory: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  techItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techBadge: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  techBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '500',
  },
  creditText: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  teamMember: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  teamMemberName: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  teamMemberRole: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  legalLinkText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#444',
    marginTop: 10,
  },
  footerText: {
    color: Colors.accent,
    fontSize: 12,
    marginBottom: 4,
  },
  copyrightText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  spacer: {
    height: 20,
  },
});
