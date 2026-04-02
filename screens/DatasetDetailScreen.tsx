import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useDataset } from '../context/DatasetContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function DatasetDetailScreen() {
  const { selectedDataset, getDatasetData } = useDataset();
  const navigation = useNavigation();

  // Get the preview data for the selected dataset
  const preview = useMemo(() => {
    if (!selectedDataset) return null;
    const data = getDatasetData(selectedDataset.id);
    return data?.preview || null;
  }, [selectedDataset, getDatasetData]);

  if (!selectedDataset || !preview) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No preview available</Text>
          <Text style={styles.emptySubtext}>Please upload a dataset or select one from the list</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dataset Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        {/* Basic Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.datasetName}>{selectedDataset.name}</Text>
            <Text style={styles.uploadDate}>
              <Ionicons name="calendar" size={14} color={Colors.textSecondary} /> {selectedDataset.uploadedAt}
            </Text>
          </View>
        </View>

        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dataset Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rows</Text>
              <Text style={styles.infoValue}>{preview.rowCount}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Columns</Text>
              <Text style={styles.infoValue}>{preview.columnCount}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Size</Text>
              <Text style={styles.infoValue}>{selectedDataset.size}</Text>
            </View>
          </View>
        </View>

        {/* Data Preview */}
        {preview.columns && preview.previewRows && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Preview</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.tableContainer}
            >
              <View>
                {/* Header Row */}
                <View style={styles.tableRow}>
                  {preview.columns.map((column: string, idx: number) => (
                    <View key={idx} style={styles.headerCell}>
                      <Text style={styles.headerCellText}>{column}</Text>
                    </View>
                  ))}
                </View>

                {/* Data Rows */}
                {preview.previewRows.slice(0, 10).map((row: any, rowIdx: number) => (
                  <View key={rowIdx} style={[styles.tableRow, rowIdx % 2 === 0 && styles.altRow]}>
                    {preview.columns.map((column: string, colIdx: number) => (
                      <View key={colIdx} style={styles.cell}>
                        <Text style={styles.cellText} numberOfLines={2}>
                          {String(row[column] || '-')}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
            <Text style={styles.previewNote}>
              Showing first {Math.min(preview.previewRows.length, 10)} rows of {preview.rowCount}
            </Text>
          </View>
        )}

        {/* Risk Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Risk Assessment</Text>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(preview.riskLevel) + '20' },
            ]}
          >
            <View
              style={[
                styles.riskDot,
                { backgroundColor: getRiskColor(preview.riskLevel) },
              ]}
            />
            <Text
              style={[
                styles.riskText,
                { color: getRiskColor(preview.riskLevel) },
              ]}
            >
              {preview.riskLevel} Risk
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => navigation.navigate('Chat' as never)}
          >
            <Ionicons name="chatbubble" size={18} color={Colors.background} />
            <Text style={styles.buttonTextPrimary}>Analyze in Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Insights' as never)}
          >
            <Ionicons name="analytics" size={18} color={Colors.accent} />
            <Text style={styles.buttonTextSecondary}>View Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Action */}
        <View style={styles.secondaryButtonContainer}>
          <TouchableOpacity
            style={styles.buttonTertiary}
            onPress={() => navigation.navigate('Datasets' as never)}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.textSecondary} />
            <Text style={styles.buttonTextTertiary}>Back to Datasets</Text>
          </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  headerTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  datasetName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  uploadDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
  },
  tableContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
  },
  altRow: {
    backgroundColor: Colors.background,
  },
  headerCell: {
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  headerCellText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 12,
  },
  cell: {
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    justifyContent: 'center',
  },
  cellText: {
    color: Colors.text,
    fontSize: 12,
  },
  previewNote: {
    marginTop: 12,
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  riskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: Colors.accent,
  },
  buttonSecondary: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  buttonTextPrimary: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextSecondary: {
    color: Colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  buttonTertiary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonTextTertiary: {
    color: Colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },
  spacer: {
    height: 20,
  },
});
