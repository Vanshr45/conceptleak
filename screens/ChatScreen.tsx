import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../theme/colors';
import { useDataset, ChatMessage, DatasetPreview } from '../context/DatasetContext';
import { uploadCSV } from '../services/api';
import ConversationalAIEngine, {
  ConversationContext,
  AIGeneratedResponse,
} from '../services/ConversationalAIEngine';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

/**
 * Quick Action Chip Component
 */
interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const QuickActionChip: React.FC<QuickActionProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickActionChip} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.quickActionIcon}>{icon}</Text>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

/**
 * Typing Indicator Component (3 bouncing dots)
 */
const TypingIndicator = () => (
  <View style={styles.typingIndicator}>
    <View
      style={[
        styles.typingDot,
        { animationDelay: '0s' },
      ]}
    />
    <View
      style={[
        styles.typingDot,
        { animationDelay: '0.2s' },
      ]}
    />
    <View
      style={[
        styles.typingDot,
        { animationDelay: '0.4s' },
      ]}
    />
  </View>
);

/**
 * Markdown-enhanced Message Bubble
 */
interface MessageBubbleProps {
  message: ChatMessage & { aiResponse?: AIGeneratedResponse };
  isUser: boolean;
  isThinking?: boolean;
  thinkingMessage?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  isThinking = false,
  thinkingMessage = '',
}) => {
  const renderMarkdownText = (text: string) => {
    // Simple markdown parsing for bold, italics, bullets, etc.
    return text;
  };

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isUser ? styles.userBubbleContainer : styles.aiBubbleContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {isThinking ? (
          <View style={styles.thinkingContent}>
            <TypingIndicator />
            <Text style={styles.thinkingText}>{thinkingMessage}</Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.messageText,
                isUser && styles.userMessageText,
              ]}
            >
              {renderMarkdownText(message.text)}
            </Text>
            <Text style={styles.messageTime}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

/**
 * Unique ID generator to prevent key collisions
 */
let idCounter = 0;
const generateUniqueId = (prefix: string = ''): string => {
  idCounter++;
  return `${prefix}${Date.now()}-${idCounter}`;
};

/**
 * Production-Grade ChatScreen for ConceptLeak
 * - Multi-modal conversational engine
 * - Dataset-aware context
 * - ChatGPT-style UI with markdown support
 */
export default function ChatScreen() {
  const {
    selectedDataset,
    datasets,
    addDataset,
    setSelectedDataset,
    addMessageToDataset,
    getDatasetChatHistory,
    setDatasetPreview,
  } = useDataset();

  const route = useRoute();
  const routeParams = route.params as any;

  // Message management
  const [messages, setMessages] = useState<(ChatMessage & { aiResponse?: AIGeneratedResponse })[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thinking, setThinking] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const auditTriggeredRef = useRef(false);

  // Sync messages from context when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      const chatHistory = getDatasetChatHistory(selectedDataset.id);
      setMessages(chatHistory as any);
      
      // Reset audit flag when switching datasets
      auditTriggeredRef.current = false;
    }
  }, [selectedDataset?.id]);

  // Trigger initial audit on dataset select or from Datasets screen
  useEffect(() => {
    // Only trigger audit once per dataset and only if requested
    if (!auditTriggeredRef.current && routeParams?.triggerInitialReport && selectedDataset && messages.length === 0) {
      auditTriggeredRef.current = true;
      triggerInitialAudit();
    }
  }, [selectedDataset?.id, routeParams?.triggerInitialReport]);

  /**
   * Trigger automatic initial audit when dataset is selected
   */
  const triggerInitialAudit = async () => {
    if (!selectedDataset) return;

    setLoading(true);
    setThinking('🔍 Scanning dataset for concept leakage...');

    try {
      // Add system message
      const systemMsg: ChatMessage = {
        id: generateUniqueId('sys-'),
        text: `I've received your dataset "${selectedDataset.name}". Let me scan it for hidden shortcuts... 🔍`,
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };

      setMessages([systemMsg]);
      addMessageToDataset(selectedDataset.id, systemMsg);

      // Delay slightly for dramatic effect
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate audit
      const context: ConversationContext = {
        messages: [],
        currentDataset: selectedDataset as DatasetPreview,
      };

      const response = await ConversationalAIEngine.generateResponse(
        'Analyze this',
        context
      );

      const aiMsg: ChatMessage & { aiResponse?: AIGeneratedResponse } = {
        id: generateUniqueId('ai-'),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
        aiResponse: response,
      };

      setMessages((prev) => [...prev, aiMsg]);
      addMessageToDataset(selectedDataset.id, {
        id: aiMsg.id,
        text: aiMsg.text,
        sender: 'bot',
        timestamp: aiMsg.timestamp,
        datasetId: aiMsg.datasetId,
      });

      setThinking('');
      setShowQuickActions(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Audit error:', error);
      const errorMsg: ChatMessage = {
        id: generateUniqueId('error-'),
        text: '❌ Failed to perform audit. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset.id,
      };
      setMessages((prev) => [...prev, errorMsg]);
      addMessageToDataset(selectedDataset.id, errorMsg);
      setThinking('');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user message
   */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: generateUniqueId('user-'),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      datasetId: selectedDataset?.id || '',
    };

    const query = inputText;
    setInputText('');
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    setShowQuickActions(false);

    try {
      // Create context
      const context: ConversationContext = {
        messages,
        currentDataset: selectedDataset as DatasetPreview | null,
      };

      // Show thinking state
      const thinkingResponse = await ConversationalAIEngine.generateResponse(query, context);
      setThinking(thinkingResponse.thinkingProcess);

      // Delay for dramatic effect
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate AI response
      const aiResponse = await ConversationalAIEngine.generateResponse(query, context);

      const aiMsg: ChatMessage & { aiResponse?: AIGeneratedResponse } = {
        id: generateUniqueId('ai-'),
        text: aiResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset?.id || '',
        aiResponse,
      };

      setMessages((prev) => [...prev, aiMsg]);
      addMessageToDataset(selectedDataset?.id || '', {
        id: aiMsg.id,
        text: aiMsg.text,
        sender: 'bot',
        timestamp: aiMsg.timestamp,
        datasetId: aiMsg.datasetId,
      });

      setThinking('');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: generateUniqueId('error-'),
        text: '❌ Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        datasetId: selectedDataset?.id || '',
      };
      setMessages((prev) => [...prev, errorMsg]);
      addMessageToDataset(selectedDataset?.id || '', errorMsg);
      setThinking('');
    } finally {
      setLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  /**
   * Quick action handlers
   */
  const handleQuickAction = (action: string) => {
    const actions: Record<string, string> = {
      'summarize': 'Summarize this dataset for me',
      'leakage': 'Check for concept leakage',
      'advice': 'Give me best practices for this dataset',
      'help': 'What can you help me with?',
    };

    if (actions[action]) {
      setInputText(actions[action]);
    }
  };

  /**
   * Handle file upload
   */
  const handleUploadDataset = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setUploading(true);
        const file = result.assets[0];

        const response = await uploadCSV({
          uri: file.uri,
          name: file.name,
          type: 'text/csv',
        });

        const fileSizeMB = file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown';

        const preview: DatasetPreview = {
          id: `dataset-${Date.now()}`,
          name: file.name || 'Uploaded Dataset',
          uploadedAt: new Date().toISOString(),
          size: fileSizeMB,
          status: 'completed',
          rowCount: response.data?.length || 0,
          columnCount:
            response.data && response.data.length > 0
              ? Object.keys(response.data[0]).length
              : 0,
          columns:
            response.data && response.data.length > 0 ? Object.keys(response.data[0]) : [],
          previewRows: response.data?.slice(0, 5) || [],
          riskLevel: 'MEDIUM',
        };

        addDataset({
          id: preview.id,
          name: preview.name,
          uploadedAt: preview.uploadedAt,
          size: preview.size,
          status: 'completed',
        });

        setDatasetPreview(preview.id, preview);
        setSelectedDataset({
          id: preview.id,
          name: preview.name,
          uploadedAt: preview.uploadedAt,
          size: preview.size,
          status: 'completed',
        });

        setUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
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
            Select a dataset from the Datasets tab to start chatting about your data
          </Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDataset}>
            <Ionicons name="cloud-upload" size={20} color={Colors.background} />
            <Text style={styles.uploadButtonText}>Upload Dataset Here</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isUser={item.sender === 'user'} />
        )}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        keyboardShouldPersistTaps="handled"
        style={styles.messagesList}
        contentContainerStyle={styles.messagesListContent}
        ListHeaderComponent={
          <View style={styles.chatHeader}>
            <Text style={styles.datasetNameInChat}>{selectedDataset.name}</Text>
            <Text style={styles.datasetSubtitle}>
              Risk Level: {selectedDataset.size} • {selectedDataset.status}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeIcon}>🤖</Text>
            <Text style={styles.welcomeTitle}>Welcome to ConceptLeak AI</Text>
            <Text style={styles.welcomeSubtext}>
              I'm your intelligent assistant for detecting concept leakage and analyzing datasets.
              Ask me anything!
            </Text>
          </View>
        }
        ListFooterComponent={
          thinking ? (
            <View style={styles.messageBubbleContainer}>
              <MessageBubble
                message={{
                  id: generateUniqueId('thinking-'),
                  text: '',
                  sender: 'bot',
                  timestamp: new Date(),
                  datasetId: selectedDataset?.id || '',
                }}
                isUser={false}
                isThinking={true}
                thinkingMessage={thinking}
              />
            </View>
          ) : null
        }
      />

      {/* Quick Actions */}
      {showQuickActions && !loading && messages.length >= 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
          contentContainerStyle={styles.quickActionsContent}
        >
          <QuickActionChip
            icon="📊"
            label="Summarize Data"
            onPress={() => {
              setInputText('Give me a summary of this dataset');
              setShowQuickActions(false);
            }}
          />
          <QuickActionChip
            icon="🔍"
            label="Check Leakage"
            onPress={() => {
              setInputText('Check for concept leakage');
              setShowQuickActions(false);
            }}
          />
          <QuickActionChip
            icon="💡"
            label="Get Advice"
            onPress={() => {
              setInputText('How can I improve this dataset?');
              setShowQuickActions(false);
            }}
          />
          <QuickActionChip
            icon="❓"
            label="What can you do?"
            onPress={() => {
              setInputText('What can you help me with?');
              setShowQuickActions(false);
            }}
          />
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity
          onPress={handleUploadDataset}
          disabled={uploading || loading}
          style={[styles.actionButton, (uploading || loading) && styles.actionButtonDisabled]}
        >
          {uploading ? (
            <ActivityIndicator size={20} color={Colors.accent} />
          ) : (
            <Ionicons name="attach" size={20} color={Colors.accent} />
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ask me about your data... (e.g., 'What columns do you see?')"
          placeholderTextColor={Colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading && !uploading}
        />

        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading || !selectedDataset}
          style={[
            styles.sendButton,
            (!inputText.trim() || loading) && styles.sendButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size={18} color={Colors.background} />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={
                !inputText.trim() ? Colors.textSecondary : Colors.background
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 8,
  },
  chatHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  datasetNameInChat: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  datasetSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  welcomeContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  welcomeTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  messageBubbleContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userBubbleContainer: {
    justifyContent: 'flex-end',
  },
  aiBubbleContainer: {
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
  aiBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 77, 0.2)',
  },
  messageText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.background,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  thinkingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
  },
  thinkingText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: Colors.card,
    paddingVertical: 6,
  },
  quickActionsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  quickActionIcon: {
    fontSize: 14,
  },
  quickActionLabel: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
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
    borderWidth: 1,
    borderColor: '#444',
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
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: Colors.background,
    fontWeight: '600',
  },
});
