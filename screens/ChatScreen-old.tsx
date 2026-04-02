import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../theme/colors';
import { sendChatMessage, uploadCSV } from '../services/api';
import { useDataset, ChatMessage, DatasetPreview } from '../context/DatasetContext';
import {
  generateAIResponse,
  formatAIResponseAsMarkdown,
} from '../services/MockAIEngine';
import { generateSystemPrompt } from '../services/PromptBuilder';

export default function ChatScreen() {
  const {
    selectedDataset,
    datasets,
    addDataset,
    setSelectedDataset,
    addMessageToDataset,
    getDatasetChatHistory,
    getDatasetData,
  } = useDataset();
  
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thinking, setThinking] = useState('');
  const [showDatasetSelector, setShowDatasetSelector] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Get chat history for selected dataset
  const chatHistory = selectedDataset ? getDatasetChatHistory(selectedDataset.id) : [];

  // Trigger initial assessment when dataset changes
  useEffect(() => {
    const checkInitialAssessment = async () => {
      if (selectedDataset && chatHistory.length === 0) {
        // Auto-trigger initial assessment for new dataset
        await performInitialAssessment();
      }
    };
    checkInitialAssessment();
  }, [selectedDataset?.id]);

  /**
   * Handle dataset switch
   */
  const handleSelectDataset = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    if (dataset) {
      setSelectedDataset(dataset);
      setShowDatasetSelector(false);
    }
  };

  /**
   * Perform initial leakage assessment
   */
  const performInitialAssessment = async () => {
    if (!selectedDataset) return;

    setLoading(true);
    setThinking('🔍 Scanning dataset for concept leakage...');

    try {
      const datasetData = getDatasetData(selectedDataset.id);
      const preview = datasetData?.preview as DatasetPreview | null;

      // Generate AI response
      const aiResponse = await generateAIResponse(
        'Perform a comprehensive concept leakage analysis of this dataset',
        preview,
        true // isInitialAssessment
      );

      // Add system message about analysis
      const systemMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        text: '🤖 System initialized. Running initial leakage assessment...',
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      addMessageToDataset(selectedDataset.id, systemMsg);

      // Add thinking process
      const thinkingMsg: ChatMessage = {
        id: `thinking-${Date.now()}`,
        text: `💭 **Thinking Process:**\n${aiResponse.thinking}`,
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      addMessageToDataset(selectedDataset.id, thinkingMsg);

      // Add formatted analysis
      const analysisMsg: ChatMessage = {
        id: `analysis-${Date.now()}`,
        text: formatAIResponseAsMarkdown(aiResponse),
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      addMessageToDataset(selectedDataset.id, analysisMsg);

      setThinking('');
    } catch (error) {
      console.error('Initial assessment error:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        text: '❌ Failed to perform initial assessment. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      addMessageToDataset(selectedDataset.id, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user message and generate AI response
   */
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedDataset) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      datasetId: selectedDataset.id,
    };

    addMessageToDataset(selectedDataset.id, userMessage);
    const query = inputText;
    setInputText('');
    setLoading(true);
    setThinking('💭 Analyzing your question...');

    try {
      const datasetData = getDatasetData(selectedDataset.id);
      const preview = datasetData?.preview as DatasetPreview | null;

      // Generate AI response
      const aiResponse = await generateAIResponse(query, preview, false);

      // Add thinking process message
      const thinkingMsg: ChatMessage = {
        id: `thinking-${Date.now()}`,
        text: `💭 **AI Thinking:**\n${aiResponse.thinking}`,
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      addMessageToDataset(selectedDataset.id, thinkingMsg);

      // Add analysis message
      const analysisMsg: ChatMessage = {
        id: `analysis-${Date.now()}`,
        text: formatAIResponseAsMarkdown(aiResponse),
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      addMessageToDataset(selectedDataset.id, analysisMsg);

      setThinking('');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '❌ Error analyzing dataset. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      addMessageToDataset(selectedDataset.id, errorMessage);
      setThinking('');
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  /**
   * Handle file upload
   */
  const handleUploadDataset = async () => {
    if (uploading) return;

    try {
      setUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const response = await uploadCSV(file);

        if (response.success && response.data) {
          // Create preview
          const preview: DatasetPreview = {
            id: `dataset-${Date.now()}`,
            name: file.name || 'Uploaded Dataset',
            uploadedAt: new Date().toISOString(),
            size: `${(file.size || 0) / 1024}KB`,
            status: 'completed',
            rowCount: response.data.length || 0,
            columnCount: response.data.length > 0 ? Object.keys(response.data[0]).length : 0,
            columns: response.data.length > 0 ? Object.keys(response.data[0]) : [],
            previewRows: response.data.slice(0, 5),
            riskLevel: 'MEDIUM',
          };

          // Add dataset
          addDataset({
            id: preview.id,
            name: preview.name,
            uploadedAt: preview.uploadedAt,
            size: preview.size,
            status: 'completed',
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Empty state
  if (!selectedDataset) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No Dataset Selected</Text>
          <Text style={styles.emptySubtext}>
            Select a dataset from the Datasets tab to start analyzing for concept leakage
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      enabled={true}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Inner container for messages and header */}
      <View style={styles.innerContainer}>
        {/* Dataset Header with Selector */}
        <TouchableOpacity
          style={styles.datasetHeader}
          onPress={() => setShowDatasetSelector(true)}
          activeOpacity={0.7}
        >
          <View style={styles.headerContent}>
            <Text style={styles.datasetHeaderLabel}>Analyzing:</Text>
            <Text style={styles.datasetHeaderName} numberOfLines={1}>
              {selectedDataset.name}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.headerBadge}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
            </View>
            {datasets.length > 1 && (
              <Ionicons
                name="chevron-down"
                size={20}
                color={Colors.textSecondary}
                style={styles.dropdownIcon}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Messages - scrollable flex content */}
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: message }) => (
            <View
              style={[
                styles.messageContainer,
                message.sender === 'user'
                  ? styles.userMessageContainer
                  : styles.botMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user'
                    ? styles.userBubble
                    : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' && styles.userText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          )}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContentContainer}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeEmoji}>🔍</Text>
                <Text style={styles.welcomeTitle}>Ready to Detect Concept Leakage</Text>
                <Text style={styles.welcomeSubtext}>
                  Ask me about potential leakages, feature correlations, or data quality issues
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading || thinking ? (
              <View style={styles.loadingContainer}>
                <View style={styles.thinkingBox}>
                  <ActivityIndicator size="small" color={Colors.accent} />
                  <Text style={styles.thinkingText}>{thinking}</Text>
                </View>
              </View>
            ) : null
          }
        />
      </View>

      {/* Input Area - fixed at bottom with padding */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={handleUploadDataset}
          disabled={uploading || loading}
          style={[
            styles.uploadIconButton,
            (uploading || loading) && styles.uploadIconButtonDisabled,
          ]}
        >
          {uploading ? (
            <ActivityIndicator size={20} color={Colors.accent} />
          ) : (
            <Ionicons name="cloud-upload" size={20} color={Colors.accent} />
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ask about concept leakage..."
          placeholderTextColor={Colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!loading && !uploading}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (loading || !inputText.trim() || !selectedDataset) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={loading || !inputText.trim() || !selectedDataset}
        >
          <Ionicons
            name="send"
            size={18}
            color={
              loading || !inputText.trim() ? Colors.textSecondary : Colors.background
            }
          />
        </TouchableOpacity>
      </View>

      {/* Dataset Selector Modal */}
      <Modal
        visible={showDatasetSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatasetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dataset</Text>
              <TouchableOpacity onPress={() => setShowDatasetSelector(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Dataset List */}
            {datasets.length > 0 ? (
              <ScrollView style={styles.datasetList}>
                {datasets.map((dataset) => (
                  <TouchableOpacity
                    key={dataset.id}
                    style={[
                      styles.datasetItem,
                      selectedDataset?.id === dataset.id &&
                        styles.datasetItemSelected,
                    ]}
                    onPress={() => handleSelectDataset(dataset.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.datasetItemContent}>
                      <View style={styles.datasetItemInfo}>
                        <Text
                          style={[
                            styles.datasetItemName,
                            selectedDataset?.id === dataset.id &&
                              styles.datasetItemNameSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {dataset.name}
                        </Text>
                        <Text style={styles.datasetItemMeta}>
                          {dataset.uploadedAt
                            ? new Date(dataset.uploadedAt).toLocaleDateString()
                            : 'Just now'}
                        </Text>
                      </View>
                      {selectedDataset?.id === dataset.id && (
                        <View style={styles.selectedCheckmark}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={Colors.accent}
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyDatasetList}>
                <Text style={styles.emptyDatasetText}>No datasets available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  datasetHeader: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datasetHeaderLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  datasetHeaderName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerBadge: {
    marginLeft: 12,
  },
  dropdownIcon: {
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.accent,
  },
  botBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.2)',
  },
  messageText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: Colors.background,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  welcomeTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  thinkingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  thinkingText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  uploadIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconButtonDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.card,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  datasetList: {
    maxHeight: 400,
  },
  datasetItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: Colors.background,
  },
  datasetItemSelected: {
    backgroundColor: 'rgba(255, 184, 77, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  datasetItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datasetItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  datasetItemName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  datasetItemNameSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  datasetItemMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  selectedCheckmark: {
    marginLeft: 12,
  },
  emptyDatasetList: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDatasetText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
