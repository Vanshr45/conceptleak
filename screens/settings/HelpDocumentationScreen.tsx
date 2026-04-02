import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export default function HelpDocumentationScreen() {
  const navigation = useNavigation();

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
        <Text style={styles.title}>Help & Documentation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Getting Started */}
        <Section title="🚀 Getting Started" icon="rocket-outline">
          <SectionContent>
            <Heading>1. What is ConceptLeak?</Heading>
            <Paragraph>
              ConceptLeak is an AI-powered data intelligence platform that detects hidden shortcuts (concept leakage) in machine learning datasets. It helps you build more robust and reliable ML models.
            </Paragraph>

            <Heading>2. Why Does Concept Leakage Matter?</Heading>
            <Paragraph>
              Concept leakage occurs when information about the target variable inadvertently leaks into your training features. This inflates model performance during training but leads to poor real-world predictions.
            </Paragraph>

            <Heading>3. Getting Started in 3 Steps</Heading>
            <BulletList
              items={[
                'Upload your dataset (CSV or JSON)',
                'Run ConceptLeak analysis',
                'Review recommendations and fix issues',
              ]}
            />
          </SectionContent>
        </Section>

        {/* Understanding Concept Leakage */}
        <Section title="🎓 Understanding Concept Leakage" icon="school-outline">
          <SectionContent>
            <Heading>Types of Concept Leakage</Heading>

            <SubSection title="1. Direct Target Leakage (🔴 CRITICAL)">
              <Paragraph>
                Your feature IS the target or derived directly from it.
              </Paragraph>
              <Example>
                ❌ Using final_price to predict final_price
                ✅ Use only historical features
              </Example>
            </SubSection>

            <SubSection title="2. Temporal Leakage (🟠 HIGH)">
              <Paragraph>
                Using future information to predict the past.
              </Paragraph>
              <Example>
                ❌ Using tomorrow's stock price to predict today
                ✅ Use only past data for predictions
              </Example>
            </SubSection>

            <SubSection title="3. Data Snooping (🟠 HIGH)">
              <Paragraph>
                Using test data statistics to inform model design.
              </Paragraph>
              <Example>
                ❌ Computing features on full dataset then splitting
                ✅ Split first, then compute features
              </Example>
            </SubSection>

            <SubSection title="4. ID Leakage (🔴 CRITICAL)">
              <Paragraph>
                ID columns that encode target information.
              </Paragraph>
              <Example>
                ❌ Using user_id that directly correlates with purchase
                ✅ Remove ID columns before training
              </Example>
            </SubSection>
          </SectionContent>
        </Section>

        {/* How to Use ConceptLeak */}
        <Section title="📖 How to Use ConceptLeak" icon="book-outline">
          <SectionContent>
            <Heading>Upload & Analyze</Heading>
            <BulletList
              items={[
                'Go to Datasets tab',
                'Click upload icon and select your CSV file',
                'Click "Analyze" to start detection',
              ]}
            />

            <Heading>Review Results</Heading>
            <BulletList
              items={[
                'ConceptLeak scans your dataset automatically',
                'Red flags indicate immediate risks',
                'Yellow flags suggest further investigation',
              ]}
            />

            <Heading>Chat with AI</Heading>
            <BulletList
              items={[
                'Ask questions about your data',
                'Get recommendations for fixes',
                'Learn about specific data science concepts',
              ]}
            />

            <Heading>Export Results</Heading>
            <BulletList
              items={[
                'Download analysis as PDF',
                'Share reports with your team',
                'Track historical analyses',
              ]}
            />
          </SectionContent>
        </Section>

        {/* Best Practices */}
        <Section title="💡 Best Practices" icon="lightbulb-outline">
          <SectionContent>
            <Heading>Data Preparation</Heading>
            <BulletList
              items={[
                'Split data BEFORE feature engineering',
                'Use time-based splits for temporal data',
                'Document all preprocessing steps',
                'Remove or flag ID columns early',
              ]}
            />

            <Heading>Feature Engineering</Heading>
            <BulletList
              items={[
                'Create features from past data only',
                'Avoid leaking target variable',
                'Test feature stability over time',
                'Remove highly correlated features',
              ]}
            />

            <Heading>Model Training</Heading>
            <BulletList
              items={[
                'Use proper cross-validation',
                'Keep test data completely hidden',
                'Validate on held-out data',
                'Monitor for data drift',
              ]}
            />
          </SectionContent>
        </Section>

        {/* FAQ */}
        <Section title="❓ Frequently Asked Questions" icon="help-circle-outline">
          <SectionContent>
            <FAQ
              question="How does ConceptLeak detect leakage?"
              answer="ConceptLeak analyzes your dataset structure, identifies suspicious columns (IDs, timestamps), detects high correlations, and flags potential temporal issues."
            />

            <FAQ
              question="Can I use ConceptLeak for real-world projects?"
              answer="Yes! ConceptLeak is designed for production use. However, it's a tool to assist you - always validate findings with domain expertise."
            />

            <FAQ
              question="What file formats are supported?"
              answer="Currently, ConceptLeak supports CSV files. JSON and Parquet support is coming soon."
            />

            <FAQ
              question="Is my data secure?"
              answer="Yes, all data stays on your device. ConceptLeak doesn't upload files to external servers. Your data is yours alone."
            />

            <FAQ
              question="How do I fix detected leakage?"
              answer="Remove suspicious columns, re-split data properly, and retrain your model. ConceptLeak provides specific recommendations for each issue."
            />
          </SectionContent>
        </Section>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={20} color={Colors.accent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

interface SectionContentProps {
  children: React.ReactNode;
}

const SectionContent: React.FC<SectionContentProps> = ({ children }) => (
  <View style={styles.sectionContent}>{children}</View>
);

interface HeadingProps {
  children: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ children }) => (
  <Text style={styles.heading}>{children}</Text>
);

interface ParagraphProps {
  children: React.ReactNode;
}

const Paragraph: React.FC<ParagraphProps> = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

const SubSection: React.FC<SubSectionProps> = ({ title, children }) => (
  <View style={styles.subsection}>
    <Text style={styles.subheading}>{title}</Text>
    {children}
  </View>
);

interface BulletListProps {
  items: string[];
}

const BulletList: React.FC<BulletListProps> = ({ items }) => (
  <View style={styles.bulletList}>
    {items.map((item, index) => (
      <View key={index} style={styles.bulletItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

interface ExampleProps {
  children: React.ReactNode;
}

const Example: React.FC<ExampleProps> = ({ children }) => (
  <View style={styles.exampleBox}>
    <Text style={styles.exampleText}>{children}</Text>
  </View>
);

interface FAQProps {
  question: string;
  answer: string;
}

const FAQ: React.FC<FAQProps> = ({ question, answer }) => (
  <View style={styles.faqItem}>
    <Text style={styles.faqQuestion}>Q: {question}</Text>
    <Text style={styles.faqAnswer}>A: {answer}</Text>
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
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  section: {
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#444',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionContent: {
    gap: 10,
  },
  heading: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  paragraph: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  subsection: {
    marginBottom: 10,
  },
  bulletList: {
    marginBottom: 8,
    gap: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bulletText: {
    color: Colors.text,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  exampleBox: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  exampleText: {
    color: Colors.text,
    fontSize: 11,
    fontFamily: 'Courier',
    lineHeight: 16,
  },
  faqItem: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  faqQuestion: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  spacer: {
    height: 20,
  },
});
