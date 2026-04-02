import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { uploadCSV } from '../services/api';
import { useDataset, DatasetPreview, Dataset } from '../context/DatasetContext';
import { useNavigation } from '@react-navigation/native';

export default function DatasetsScreen() {
  const { datasets, addDataset, setSelectedDataset, addMessageToDataset, setDatasetPreview } = useDataset();
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);

  // Generate unique mock preview data for each dataset
  const generateMockPreview = useCallback((dataset: Dataset): DatasetPreview => {
    // Use dataset ID as seed for consistent but unique data per dataset
    const seed = dataset.id.charCodeAt(0);
    
    const columns = ['ID', 'Feature_A', 'Feature_B', 'Target', 'Leakage_Score'];
    const departments = ['Sales', 'Engineering', 'HR', 'Finance', 'Support'];
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'];
    const lastNames = ['Chen', 'Smith', 'Brown', 'Wilson', 'Garcia'];

    const previewRows = Array.from({ length: 5 }).map((_, idx) => ({
      ID: `REC${1000 + idx + (seed % 100)}`,
      Feature_A: `${Math.floor(Math.random() * 100 + seed)}`,
      Feature_B: `${Math.floor(Math.random() * 50 + seed * 2)}`,
      Target: idx % 2 === 0 ? 'Yes' : 'No',
      Leakage_Score: `${(Math.random() * 0.9 + seed % 10) / 10}`,
    }));

    return {
      ...dataset,
      rowCount: Math.floor(Math.random() * 1000) + 100,
      columnCount: columns.length,
      columns,
      previewRows,
      riskLevel: (['LOW', 'MEDIUM', 'HIGH'] as const)[seed % 3],
    };
  }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      setUploading(true);

      const response = await uploadCSV({
        uri: file.uri,
        name: file.name,
        type: 'text/csv',
      });

      const fileSizeMB = file.size
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : 'Unknown';

      const fileId = response.fileId || `file-${Date.now()}`;

      const newDataset: Dataset = {
        id: fileId,
        name: file.name,
        size: fileSizeMB,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'completed',
      };

      // Add to context
      addDataset(newDataset);

      // Generate and store unique preview for this dataset
      const preview = generateMockPreview(newDataset);
      setDatasetPreview(fileId, preview);

      // Add bot message to this dataset
      addMessageToDataset(fileId, {
        id: `${fileId}-${Date.now()}-init`,
        text: `✅ Dataset "${file.name}" uploaded! Ready to analyze for concept leakage. What would you like to investigate?`,
        sender: 'bot',
        timestamp: new Date(),
        datasetId: fileId,
      });

      Alert.alert(
        'Success!',
        `${file.name} uploaded successfully!`,
        [
          { 
            text: 'Analyze', 
            onPress: () => {
              setSelectedDataset(newDataset);
              (navigation.navigate as any)('Chat', { triggerInitialReport: true });
            }
          },
          { text: 'Later' },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Could not upload the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDatasetPress = (dataset: Dataset) => {
    // Set selected dataset and navigate to detail view
    setSelectedDataset(dataset);
    navigation.navigate('DatasetDetail' as never);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.riskLow;
      case 'processing':
        return Colors.accent;
      case 'error':
        return Colors.riskHigh;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'error':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderDatasetItem = ({ item }: { item: Dataset }) => (
    <TouchableOpacity
      style={styles.datasetCard}
      onPress={() => handleDatasetPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: `${Colors.accent}20` }]}>
          <Ionicons name="document-text" size={20} color={Colors.accent} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.datasetName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.datasetMeta}>
            {item.size} • {item.uploadedAt}
          </Text>
        </View>
        <View style={styles.cardStatus}>
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={20}
            color={getStatusColor(item.status)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Datasets</Text>
          <Text style={styles.subtitle}>{datasets.length} files</Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size={16} color={Colors.background} />
          ) : (
            <Ionicons name="cloud-upload" size={18} color={Colors.background} />
          )}
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {datasets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyText}>No datasets uploaded</Text>
          <Text style={styles.emptySubtext}>Upload CSV files to start detecting concept leakage</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleUpload}>
            <Ionicons name="cloud-upload" size={20} color={Colors.background} />
            <Text style={styles.emptyButtonText}>Upload Dataset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Datasets List */
        <FlatList
          data={datasets}
          renderItem={renderDatasetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}

      {/* Stats Footer */}
      {datasets.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="document" size={20} color={Colors.accent} />
            <View>
              <Text style={styles.statValue}>{datasets.length}</Text>
              <Text style={styles.statLabel}>Datasets</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="disc" size={20} color={Colors.accent} />
            <View>
              <Text style={styles.statValue}>
                {(
                  datasets.reduce((sum, d) => {
                    const sizeNum = parseFloat(d.size);
                    return sum + (isNaN(sizeNum) ? 0 : sizeNum);
                  }, 0)
                ).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>MB</Text>
            </View>
          </View>
        </View>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  uploadButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.accent,
    borderRadius: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
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
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background,
  },
  listContainer: {
    padding: 16,
  },
  datasetCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  datasetName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
  },
  datasetMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  cardStatus: {
    padding: 4,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
