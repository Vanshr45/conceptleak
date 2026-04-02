import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useDataset } from '../context/DatasetContext';

export default function HomeScreen() {
  const { datasets, getDatasetInsights, setSelectedDataset } = useDataset();
  const navigation = useNavigation();

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Calculate overall risk
  const overallRisk = useMemo(() => {
    if (datasets.length === 0) return 'LOW';
    const allInsights = datasets.flatMap(d => getDatasetInsights(d.id));
    if (allInsights.length === 0) return 'UNKNOWN';
    const avgScore = allInsights.reduce((sum, i) => sum + i.score, 0) / allInsights.length;
    if (avgScore < 40) return 'LOW';
    if (avgScore < 70) return 'MEDIUM';
    return 'HIGH';
  }, [datasets]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return Colors.riskHigh;
      case 'MEDIUM':
        return Colors.riskMedium;
      case 'LOW':
      default:
        return Colors.riskLow;
    }
  };

  const totalInsights = useMemo(() => {
    return datasets.reduce((sum, d) => sum + getDatasetInsights(d.id).length, 0);
  }, [datasets]);

  const handleDatasetPress = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setSelectedDataset(dataset);
      navigation.navigate('Datasets' as never);
    }
  };

  const summaryCards = [
    {
      id: '1',
      title: 'Total Datasets',
      value: String(datasets.length),
      icon: 'folder',
      color: Colors.accent,
    },
    {
      id: '2',
      title: 'Risk Level',
      value: overallRisk,
      icon: 'alert-circle',
      color: getRiskColor(overallRisk),
    },
    {
      id: '3',
      title: 'Issues Found',
      value: String(totalInsights),
      icon: 'warning',
      color: Colors.riskMedium,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, Vansh 👋</Text>
            <Text style={styles.subheading}>Ready to detect concept leakage?</Text>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.cardsContainer}>
          {summaryCards.map((card) => (
            <View key={card.id} style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: `${card.color}20` }]}>
                <Ionicons name={card.icon as any} size={24} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
            </View>
          ))}
        </View>

        {/* Recent Datasets */}
        {datasets.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Datasets</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Datasets' as never)}>
                <Text style={styles.seeAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {datasets.slice(0, 3).map((dataset) => (
              <TouchableOpacity
                key={dataset.id}
                style={styles.recentItem}
                onPress={() => handleDatasetPress(dataset.id)}
                activeOpacity={0.7}
              >
                <View style={styles.recentItemLeft}>
                  <View style={[styles.datasetIcon, { backgroundColor: Colors.accent + '20' }]}>
                    <Ionicons name="document" size={20} color={Colors.accent} />
                  </View>
                  <View style={styles.recentItemInfo}>
                    <Text style={styles.recentItemName} numberOfLines={1}>
                      {dataset.name}
                    </Text>
                    <Text style={styles.recentItemDate}>{dataset.uploadedAt}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {datasets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No datasets yet</Text>
            <Text style={styles.emptySubtext}>
              Upload your first dataset from the Datasets tab to get started
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Datasets' as never)}
            >
              <Ionicons name="cloud-upload" size={20} color={Colors.background} />
              <Text style={styles.emptyButtonText}>Go to Datasets</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>⚡</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>What's Concept Leakage?</Text>
              <Text style={styles.infoText}>
                Shortcuts that make ML models appear better than they are
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>🎯</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How We Help</Text>
              <Text style={styles.infoText}>
                Analyze datasets for hidden feature-target leakage patterns
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  helpButton: {
    padding: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAllLink: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  recentItem: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datasetIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  recentItemDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  infoBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.accent}10`,
  },
  infoBadgeText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  spacer: {
    height: 20,
  },
});
