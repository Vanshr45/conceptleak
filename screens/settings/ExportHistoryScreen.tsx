import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface AnalysisReport {
  id: string;
  datasetName: string;
  date: string;
  riskLevel: string;
  fileName: string;
}

export default function ExportHistoryScreen() {
  const navigation = useNavigation();
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Mock data - in real app, this would come from your analysis results
      const mockReports: AnalysisReport[] = [
        {
          id: '1',
          datasetName: 'diamonds.csv',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          riskLevel: 'HIGH',
          fileName: 'analysis_diamonds_2026-03-27.pdf',
        },
        {
          id: '2',
          datasetName: 'customers.csv',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          riskLevel: 'MEDIUM',
          fileName: 'analysis_customers_2026-03-24.pdf',
        },
        {
          id: '3',
          datasetName: 'sales_2025.csv',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          riskLevel: 'LOW',
          fileName: 'analysis_sales_2026-03-19.pdf',
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (report: AnalysisReport) => {
    Alert.alert(
      'Download Report',
      `Downloading ${report.fileName}...`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Simulate download
            setTimeout(() => {
              Alert.alert('Success', `✅ Report downloaded: ${report.fileName}`);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleShareReport = async (report: AnalysisReport) => {
    try {
      // Create a mock PDF file URI
      const fileURL = `${FileSystem.documentDirectory}${report.fileName}`;

      await Sharing.shareAsync(fileURL);
    } catch (error) {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return Colors.riskHigh;
      case 'MEDIUM':
        return Colors.riskMedium;
      case 'LOW':
        return Colors.riskLow;
      default:
        return Colors.textSecondary;
    }
  };

  const renderReportItem = ({ item }: { item: AnalysisReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportName}>{item.datasetName}</Text>
          <Text style={styles.reportDate}>{item.date}</Text>
        </View>
        <View
          style={[
            styles.riskBadge,
            { backgroundColor: `${getRiskColor(item.riskLevel)}20` },
          ]}
        >
          <Text
            style={[
              styles.riskText,
              { color: getRiskColor(item.riskLevel) },
            ]}
          >
            {item.riskLevel}
          </Text>
        </View>
      </View>

      <View style={styles.reportActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={() => handleDownloadPDF(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="download"
            size={16}
            color={Colors.background}
          />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => handleShareReport(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="share-social"
            size={16}
            color={Colors.accent}
          />
          <Text style={[styles.actionButtonText, { color: Colors.accent }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.title}>Export History</Text>
        <View style={{ width: 40 }} />
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptySubtext}>
            Run an analysis on a dataset to generate a report
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📊 Your Analysis Reports ({reports.length})
            </Text>

            <FlatList
              data={reports}
              renderItem={renderReportItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.reportsList}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 About Export</Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>PDF Format</Text>
              <Text style={styles.infoText}>
                Reports are exported in PDF format for easy sharing and archiving
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Share Securely</Text>
              <Text style={styles.infoText}>
                Use the Share button to send reports via email or messaging apps
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Local Storage</Text>
              <Text style={styles.infoText}>
                Your reports are stored locally on your device for privacy
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
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
  reportsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#444',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  downloadButton: {
    backgroundColor: Colors.accent,
  },
  shareButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  actionButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
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
