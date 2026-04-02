import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useDataset } from '../context/DatasetContext';

/**
 * Risk Algorithm Utility Functions
 * Implements a weighted scoring system for concept leakage assessment
 */

interface RiskAssessment {
  overallScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  riskColor: string;
  icon: string;
  description: string;
}

interface LeakageScores {
  targetLeakageScore: number;
  temporalLeakageScore: number;
  idLeakageScore: number;
}

/**
 * Calculate overall risk using weighted algorithm
 * Weights: Target Leakage (50%), Temporal Leakage (30%), ID Leakage (20%)
 */
const calculateOverallRisk = (scores: LeakageScores): RiskAssessment => {
  const { targetLeakageScore, temporalLeakageScore, idLeakageScore } = scores;

  // Apply weights: Target (50%) + Temporal (30%) + ID (20%)
  const weightedScore =
    targetLeakageScore * 0.5 + temporalLeakageScore * 0.3 + idLeakageScore * 0.2;

  // Determine risk level based on thresholds
  let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  let riskColor: string;
  let icon: string;
  let description: string;

  if (weightedScore > 80) {
    riskLevel = 'CRITICAL';
    riskColor = '#EF4444'; // Red
    icon = 'alert-octagon';
    description = 'Severe concept leakage detected. Immediate action required.';
  } else if (weightedScore >= 60) {
    riskLevel = 'HIGH';
    riskColor = '#F97316'; // Orange
    icon = 'alert-circle';
    description = 'Significant concept leakage risks identified.';
  } else if (weightedScore >= 40) {
    riskLevel = 'MEDIUM';
    riskColor = '#F59E0B'; // Amber
    icon = 'alert-triangle';
    description = 'Moderate concept leakage concerns detected.';
  } else {
    riskLevel = 'LOW';
    riskColor = '#10B981'; // Green
    icon = 'check-circle';
    description = 'Low risk detected. Dataset appears relatively clean.';
  }

  return {
    overallScore: Math.round(weightedScore),
    riskLevel,
    riskColor,
    icon,
    description,
  };
};

/**
 * Extract leakage scores from insights array
 * Maps feature names to score types
 */
const extractLeakageScores = (insights: any[]): LeakageScores => {
  let targetLeakageScore = 0;
  let temporalLeakageScore = 0;
  let idLeakageScore = 0;

  insights.forEach((insight) => {
    const feature = insight.feature?.toLowerCase() || '';
    const score = insight.score || 0;

    if (feature.includes('target')) {
      targetLeakageScore = score;
    } else if (feature.includes('temporal')) {
      temporalLeakageScore = score;
    } else if (feature.includes('id')) {
      idLeakageScore = score;
    }
  });

  return {
    targetLeakageScore,
    temporalLeakageScore,
    idLeakageScore,
  };
};

export default function InsightsScreen() {
  const { selectedDataset, getDatasetInsights } = useDataset();
  const [progressAnimation] = useState(new Animated.Value(0));

  // Get insights for selected dataset
  const insights = useMemo(() => {
    if (!selectedDataset) return [];
    return getDatasetInsights(selectedDataset.id);
  }, [selectedDataset, getDatasetInsights]);

  // Calculate overall risk assessment
  const riskAssessment = useMemo(() => {
    if (insights.length === 0) {
      return {
        overallScore: 0,
        riskLevel: 'UNKNOWN' as const,
        riskColor: Colors.textSecondary,
        icon: 'help-circle',
        description: 'No data available',
      };
    }

    const leakageScores = extractLeakageScores(insights);
    return calculateOverallRisk(leakageScores);
  }, [insights]);

  // Animate progress bar when risk assessment changes
  useEffect(() => {
    if (riskAssessment.riskLevel !== 'UNKNOWN') {
      Animated.timing(progressAnimation, {
        toValue: riskAssessment.overallScore,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnimation.setValue(0);
    }
  }, [riskAssessment.overallScore, riskAssessment.riskLevel, progressAnimation]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return Colors.riskLow;
      case 'MEDIUM':
        return Colors.riskMedium;
      case 'HIGH':
        return Colors.riskHigh;
      case 'CRITICAL':
        return '#EF4444';
      default:
        return Colors.textSecondary;
    }
  };

  const mockInsights = [
    {
      id: '1',
      feature: 'Target Leakage',
      riskLevel: 'HIGH',
      score: 85,
      description: 'Features may directly encode the target variable, causing inflated performance estimates.',
      affectedRecords: 312,
    },
    {
      id: '2',
      feature: 'Temporal Leakage',
      riskLevel: 'MEDIUM',
      score: 62,
      description: 'Time-based information might leak future knowledge into training features.',
      affectedRecords: 187,
    },
    {
      id: '3',
      feature: 'ID Leakage',
      riskLevel: 'LOW',
      score: 28,
      description: 'Unique identifiers appear to be independent of the target.',
      affectedRecords: 42,
    },
    {
      id: '4',
      feature: 'Feature Engineering',
      riskLevel: 'MEDIUM',
      score: 55,
      description: 'Some derived features may only be available during training, not deployment.',
      affectedRecords: 156,
    },
  ];

  // Use mock insights if none available
  const displayInsights = insights.length > 0 ? insights : mockInsights;

  // Animated progress width
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Concept Leakage Analysis</Text>
          {selectedDataset && (
            <Text style={styles.datasetName} numberOfLines={1}>
              📊 {selectedDataset.name}
            </Text>
          )}
        </View>

        {/* Empty State */}
        {!selectedDataset ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No Dataset Selected</Text>
            <Text style={styles.emptySubtext}>
              Select a dataset from the Datasets tab to view concept leakage analysis
            </Text>
          </View>
        ) : (
          <>
            {/* Overall Risk Assessment - Enhanced */}
            <View style={styles.overallRiskContainer}>
              {/* Header with Icon and Label */}
              <View style={styles.riskHeaderRow}>
                <View style={styles.riskLabelSection}>
                  <Text style={styles.overallRiskLabel}>Overall Risk Assessment</Text>
                  {riskAssessment.riskLevel !== 'UNKNOWN' && (
                    <Text style={styles.riskDescription}>{riskAssessment.description}</Text>
                  )}
                </View>
                <Ionicons
                  name={riskAssessment.icon as any}
                  size={32}
                  color={riskAssessment.riskColor}
                />
              </View>

              {/* Risk Level Display */}
              {riskAssessment.riskLevel === 'UNKNOWN' ? (
                <View style={styles.unknownRiskContainer}>
                  <Text style={styles.overallRiskValueUnknown}>NO DATA</Text>
                  <Text style={styles.unknownRiskText}>
                    Analyze a dataset to generate risk assessment
                  </Text>
                </View>
              ) : (
                <>
                  {/* Risk Score and Level */}
                  <View style={styles.riskScoreRow}>
                    <View style={styles.riskScoreBox}>
                      <Text
                        style={[styles.overallRiskValue, { color: riskAssessment.riskColor }]}
                      >
                        {riskAssessment.riskLevel}
                      </Text>
                      <Text style={styles.riskScoreText}>
                        {riskAssessment.overallScore}/100
                      </Text>
                    </View>
                    {/* Risk Breakdown Badges */}
                    <View style={styles.riskBreakdownSection}>
                      <RiskBadgeSmall
                        label="Target"
                        score={extractLeakageScores(displayInsights).targetLeakageScore}
                        weight="50%"
                        color={Colors.riskHigh}
                      />
                      <RiskBadgeSmall
                        label="Temporal"
                        score={extractLeakageScores(displayInsights).temporalLeakageScore}
                        weight="30%"
                        color={Colors.riskMedium}
                      />
                      <RiskBadgeSmall
                        label="ID"
                        score={extractLeakageScores(displayInsights).idLeakageScore}
                        weight="20%"
                        color={Colors.riskLow}
                      />
                    </View>
                  </View>

                  {/* Animated Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: progressWidth,
                            backgroundColor: riskAssessment.riskColor,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressLabel}>Low (0)</Text>
                      <Text style={styles.progressLabel}>High (100)</Text>
                    </View>
                  </View>

                  {/* Risk Status Indicator */}
                  <View
                    style={[
                      styles.riskStatusBar,
                      { borderLeftColor: riskAssessment.riskColor },
                    ]}
                  >
                    <Text style={styles.riskStatusText}>
                      {riskAssessment.riskLevel === 'CRITICAL' &&
                        '⚡ Critical: Immediate action needed to fix leakage'}
                      {riskAssessment.riskLevel === 'HIGH' &&
                        '⚠️ High: Significant leakage risks detected'}
                      {riskAssessment.riskLevel === 'MEDIUM' &&
                        '⚒️ Medium: Moderate concerns to address'}
                      {riskAssessment.riskLevel === 'LOW' &&
                        '✅ Low: Dataset is relatively clean'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Insights List */}
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>Detected Issues</Text>
              {displayInsights.map((insight: any) => (
                <View key={insight.id} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.insightFeature}>{insight.feature}</Text>
                    <View
                      style={[
                        styles.riskBadge,
                        { backgroundColor: getRiskColor(insight.riskLevel) },
                      ]}
                    >
                      <Text style={styles.riskBadgeText}>{insight.riskLevel}</Text>
                    </View>
                  </View>

                  <View style={styles.scoreContainer}>
                    <View style={styles.scoreBar}>
                      <View
                        style={[
                          styles.scoreFill,
                          {
                            width: `${insight.score}%`,
                            backgroundColor: getRiskColor(insight.riskLevel),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.scoreValue}>{insight.score}/100</Text>
                  </View>

                  <Text style={styles.description}>{insight.description}</Text>
                  {insight.affectedRecords && (
                    <Text style={styles.affectedRecords}>
                      ⚠️ {insight.affectedRecords} potentially affected records
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * RiskBadgeSmall Component
 * Displays individual component risk scores with weights
 */
interface RiskBadgeSmallProps {
  label: string;
  score: number;
  weight: string;
  color: string;
}

const RiskBadgeSmall: React.FC<RiskBadgeSmallProps> = ({
  label,
  score,
  weight,
  color,
}) => (
  <View style={styles.riskBadgeSmall}>
    <View style={[styles.riskBadgeIndicator, { backgroundColor: color }]} />
    <View style={styles.riskBadgeContent}>
      <Text style={styles.riskBadgeLabel}>{label}</Text>
      <Text style={styles.riskBadgeScore}>{score}</Text>
      <Text style={styles.riskBadgeWeight}>{weight}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  datasetName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
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
    lineHeight: 18,
  },
  overallRiskContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  riskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  riskLabelSection: {
    flex: 1,
    marginRight: 12,
  },
  overallRiskLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  riskDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  unknownRiskContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  overallRiskValueUnknown: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  unknownRiskText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  riskScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskScoreBox: {
    alignItems: 'center',
  },
  overallRiskValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  riskScoreText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  riskBreakdownSection: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskBadgeSmall: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  riskBadgeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginBottom: 6,
  },
  riskBadgeContent: {
    alignItems: 'center',
  },
  riskBadgeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  riskBadgeScore: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 1,
  },
  riskBadgeWeight: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  riskStatusBar: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  riskStatusText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 16,
  },
  insightsContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightFeature: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.background,
  },
  scoreContainer: {
    marginBottom: 10,
  },
  scoreBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  affectedRecords: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});
