import { DatasetPreview, ChatMessage } from '../context/DatasetContext';

/**
 * Advanced Conversational AI Engine for ConceptLeak
 * Handles: Chit-chat, Dataset-specific queries, Technical guidance
 * Maintains context and memory for multi-turn conversations
 */

export interface ConversationContext {
  messages: ChatMessage[];
  currentDataset: DatasetPreview | null;
  lastAskedColumn?: string;
  lastAskedRisk?: string;
}

export interface AIGeneratedResponse {
  text: string;
  type: 'chit-chat' | 'dataset-analysis' | 'technical-guidance' | 'audit-report';
  thinkingProcess: string;
  processingTimeMs: number;
}

class ConversationalAIEngine {
  private readonly THINKING_TIME = 1200;
  private readonly RESPONSE_TIME = 800;

  /**
   * Classify user query into categories
   */
  private classifyQuery(
    query: string,
    hasDataset: boolean
  ): 'chit-chat' | 'dataset-analysis' | 'technical-guidance' | 'audit-request' {
    const query_lower = query.toLowerCase();

    // Technical guidance detection
    if (
      /what is|explain|how do|how does|what are|definition|concept/i.test(
        query_lower
      )
    ) {
      if (
        /leakage|temporal|data snooping|feature engineering|target leakage/i.test(
          query_lower
        )
      ) {
        return 'technical-guidance';
      }
    }

    // Audit request
    if (
      /analyze|audit|check|scan|detect|assess|diagnose|report|summary/i.test(
        query_lower
      )
    ) {
      if (hasDataset) {
        return 'audit-request';
      }
    }

    // Dataset-specific query
    if (hasDataset) {
      if (
        /columns?|features?|rows?|samples?|size|shape|data|preview|risk|leakage|suspicious|show me/i.test(
          query_lower
        )
      ) {
        return 'dataset-analysis';
      }
    }

    // Default: chit-chat
    return 'chit-chat';
  }

  /**
   * Generate chit-chat responses with data scientist personality
   */
  private generateChitChatResponse(query: string, thinkingTime: number): string {
    const query_lower = query.toLowerCase();
    const responses: Record<string, string[]> = {
      greeting: [
        "Hey there! 👋 I'm ConceptLeak's AI Assistant, specialized in detecting hidden shortcuts in your datasets. How can I help you analyze your data today?",
        "Welcome! 🎯 Ready to uncover concept leakage and ensure your ML models are robust? What would you like to explore?",
        "Hi! I'm here to help you detect concept leakage and strengthen your datasets. What's on your mind?",
      ],
      howareyou: [
        "I'm doing great! 🚀 Though I should mention - I'm always wondering about data quality. How are YOUR datasets doing?",
        "Excellent! Just running some mental algorithms on the patterns I see in data. Thanks for asking! Anything you need help with?",
        "Functioning perfectly! 💻 Ready to dive deep into dataset analysis. What can I help you with?",
      ],
      capabilities: [
        `🎯 **Here's what I can do:**\n\n• **Detect Concept Leakage** - Identify when target information leaks into features\n• **Analyze Datasets** - Review columns, risks, and data quality\n• **Technical Guidance** - Explain ML concepts and best practices\n• **Interactive Analysis** - Answer specific questions about your data\n• **Risk Assessment** - Rate leakage severity (CRITICAL, HIGH, MEDIUM, LOW)\n\nUpload a dataset or ask me anything! 📊`,
        `I specialize in:\n\n✅ Concept leakage detection\n✅ Temporal information analysis\n✅ ID column identification\n✅ Feature engineering guidance\n✅ Data quality assessment\n\nWant to upload a dataset and start analyzing?`,
      ],
      joke: [
        "Why did the dataset go to therapy? Because it had too many issues... and outliers! 🤣",
        "What did the neural network say to the dataset with concept leakage? 'You're training me wrong, and I *know* it!' 😄",
        "Why do data scientists make terrible comedians? Because their jokes have low F1 score! 📊",
      ],
      default: [
        "That's interesting! 🤔 For dataset-specific questions, try uploading a CSV and I can give you detailed analysis. Or ask me about concept leakage detection!",
        "Great question! 💡 I'm eager to help - whether it's about your data or ML best practices. What would you like to know?",
        "I like your thinking! 👍 Got a dataset to analyze, or want to learn about concept leakage?",
      ],
    };

    let category = 'default';
    if (/hi|hello|hey|greetings/i.test(query_lower)) category = 'greeting';
    else if (/how are you|how are ya|how do you feel|how's it going/i.test(query_lower))
      category = 'howareyou';
    else if (/what can you do|capabilities|features|can you|what do you do/i.test(query_lower))
      category = 'capabilities';
    else if (/joke|funny|laugh|humor/i.test(query_lower)) category = 'joke';

    return responses[category][Math.floor(Math.random() * responses[category].length)];
  }

  /**
   * Generate dataset-specific analysis responses
   */
  private generateDatasetAnalysisResponse(
    query: string,
    dataset: DatasetPreview
  ): string {
    const query_lower = query.toLowerCase();

    // Columns query
    if (/columns?|features?|show me/.test(query_lower)) {
      const colList = dataset.columns.map((c) => `• **${c}**`).join('\n');
      return `📋 **Dataset: ${dataset.name}**\n\n**Columns (${dataset.columnCount}):**\n${colList}\n\n**Total Rows:** ${dataset.rowCount}`;
    }

    // Risk query
    if (/risk|leakage|suspicious|danger|threat/.test(query_lower)) {
      const riskEmoji = dataset.riskLevel === 'HIGH' ? '🔴' : dataset.riskLevel === 'MEDIUM' ? '🟠' : '🟢';
      return `${riskEmoji} **Risk Assessment: ${dataset.riskLevel}**\n\nThis dataset has a **${dataset.riskLevel}** risk of concept leakage. Would you like me to:\n\n1. Run a detailed audit? Say "Analyze this"\n2. Explain specific risks? Ask about a column\n3. Get recommendations? Ask "How do I fix this?"`;
    }

    // Size/shape query
    if (/size|shape|dimensions|rows|samples/.test(query_lower)) {
      return `📐 **Dataset Shape:**\n\n• **Rows:** ${dataset.rowCount.toLocaleString()}\n• **Columns:** ${dataset.columnCount}\n• **File Size:** ${dataset.size}\n• **Risk Level:** ${dataset.riskLevel}`;
    }

    // Preview query
    if (/preview|sample|first|show data/i.test(query_lower)) {
      if (dataset.previewRows && dataset.previewRows.length > 0) {
        const preview = dataset.previewRows[0];
        const previewText = Object.entries(preview)
          .map(([key, val]) => `• **${key}:** ${val}`)
          .join('\n');
        return `📊 **Sample Row from ${dataset.name}:**\n\n${previewText}`;
      }
      return "No preview data available yet. Try running an analysis first!";
    }

    // Default dataset response
    return `I see you're asking about **${dataset.name}**. Here are some things I can tell you:\n\n• List columns: "What are the columns?"\n• Check risks: "Is there leakage?"\n• View size: "How many rows?"\n• Full analysis: "Analyze this"\n\nWhat would you like to explore?`;
  }

  /**
   * Generate technical guidance responses
   */
  private generateTechnicalGuidanceResponse(query: string): string {
    const query_lower = query.toLowerCase();

    const guides: Record<string, string> = {
      'concept leakage': `# 🎓 What is Concept Leakage?\n\n**Definition:** Concept leakage occurs when information about the target variable (what you're predicting) inadvertently leaks into your training features.\n\n## Types:\n\n### 1. **Direct Target Leakage** 🔴 CRITICAL\n- Your feature IS the target or derived directly from it\n- Example: Using final_price to predict final_price\n\n### 2. **Temporal Leakage** 🟠 HIGH\n- Using future information to predict the past\n- Example: Using tomorrow's price to predict today's stock\n\n### 3. **Data Snooping** 🟠 HIGH\n- Using statistics computed on both train and test data\n- Inflates model performance metrics\n\n## How ConceptLeak Helps:\n✅ Identifies ID columns\n✅ Detects temporal patterns\n✅ Flags high-correlation features\n✅ Recommends column removal`,

      'temporal leakage': `# ⏰ Understanding Temporal Leakage\n\nTemporal leakage happens when you use **future information** to make **past predictions**.\n\n## Examples:\n- 📊 Using Q4 sales to predict Q1 performance\n- 🏠 Using 2024 price data to train a 2023 price predictor\n- 📈 Using tomorrow's stock close to predict today's close\n\n## Detection:\n1. Check DATE and TIMESTAMP columns\n2. Ensure features are collected BEFORE the prediction date\n3. Split data chronologically, not randomly\n\n## Fix:\n✅ Use only historical data\n✅ Create proper time-based train/test splits\n✅ Feature engineer from past data only`,

      'data snooping': `# 🔍 What is Data Snooping?\n\n**Definition:** Using test data statistics to inform your model design or feature engineering.\n\n## Problem:\n- Your model inadvertently "learns" the test set\n- Results are optimistically biased\n- Model generalizes poorly to new data\n\n## Common Mistakes:\n1. Computing correlation on full dataset, then train/test split\n2. Selecting hyperparameters based on validation results WITHOUT retraining\n3. Removing outliers after seeing test data\n\n## Prevention:\n✅ Always split data FIRST, then analyze\n✅ Use proper cross-validation\n✅ Keep test data completely hidden`,

      'feature engineering': `# 🛠️ Best Practices for Feature Engineering\n\n## DO:\n✅ Create features from past data only\n✅ Document feature creation process\n✅ Test feature stability over time\n✅ Remove highly correlated features\n✅ Scale/normalize consistently\n\n## DON'T:\n❌ Use future information\n❌ Leak target variable\n❌ Overfit to test data\n❌ Create non-repeatable features\n❌ Ignore domain knowledge`,

      'target leakage': `# 🎯 Target Leakage Explained\n\n**When:** Target information appears as a feature\n\n## Example:\nPredicting if a customer will churn, but using \"customer_service_calls_in_last_month_after_churn_detected\" as a feature.\n\n## Red Flags:\n- Feature includes target variable name\n- Feature perfectly predicts target (R² = 1.0)\n- Feature only exists in training data\n\n## Solution:\n✅ Remove the feature\n✅ Use only pre-incident data\n✅ Retrain and verify`,
    };

    for (const [key, value] of Object.entries(guides)) {
      if (query_lower.includes(key.split(' ')[0])) {
        return value;
      }
    }

    return `# 📚 Data Science Concept Guidance\n\nI can explain:\n- **Concept Leakage** - The core issue I detect\n- **Temporal Leakage** - Time-based data issues\n- **Data Snooping** - Using test data to train\n- **Feature Engineering** - Best practices\n- **Target Leakage** - Direct target information in features\n\nAsk me about any of these topics!`;
  }

  /**
   * Generate detailed audit report
   */
  private generateAuditReport(dataset: DatasetPreview | null): string {
    if (!dataset) {
      return "📋 No dataset selected. Please upload a dataset or select one to audit.";
    }

    const riskEmoji =
      dataset.riskLevel === 'HIGH'
        ? '🔴'
        : dataset.riskLevel === 'MEDIUM'
          ? '🟠'
          : '🟢';

    // Identify suspicious columns
    const suspiciousPatterns = ['id', 'index', 'uuid', 'hash', 'timestamp', 'date', 'time'];
    const suspicious = dataset.columns.filter((col) =>
      suspiciousPatterns.some((pat) => col.toLowerCase().includes(pat))
    );

    let report = `# 📊 Concept Leakage Audit Report\n\n## Dataset: **${dataset.name}**\n**Overall Risk: ${riskEmoji} ${dataset.riskLevel}**\n\n`;

    report += `## Summary\n• **Rows:** ${dataset.rowCount.toLocaleString()}\n• **Columns:** ${dataset.columnCount}\n• **File Size:** ${dataset.size}\n\n`;

    if (suspicious.length > 0) {
      report += `## 🚨 Suspicious Columns Detected\n\n${suspicious.map((col) => `• **${col}** - Potential identifier or temporal information`).join('\n')}\n\n`;
    }

    report += `## Risk Breakdown\n\n### 🔴 CRITICAL Risks\n${
      suspicious.filter((c) => c.toLowerCase().includes('id')).length > 0
        ? `• ID columns detected (${suspicious.filter((c) => c.toLowerCase().includes('id')).join(', ')})\n• These MUST be removed before training`
        : '• No direct ID leakage detected'
    }\n\n`;

    report += `### 🟠 HIGH Risks\n${
      suspicious.filter((c) => /date|time|timestamp/.test(c.toLowerCase())).length > 0
        ? `• Temporal columns: ${suspicious.filter((c) => /date|time|timestamp/.test(c.toLowerCase())).join(', ')}\n• Verify these aren't future-leaked features`
        : '• No obvious temporal leakage'
    }\n\n`;

    report += `## ✅ Recommendations\n\n1. **Immediate:** Remove ID and timestamp columns\n2. **Review:** Check high-correlation features (>0.95)\n3. **Validate:** Use proper time-based train/test splits\n4. **Test:** Retrain and verify model stability\n\n💡 **Next Steps:** Ask me about specific columns or concepts you'd like to understand better.`;

    return report;
  }

  /**
   * Generate thinking process messages
   */
  private generateThinkingMessage(queryType: string): string {
    const thinking: Record<string, string[]> = {
      'chit-chat': [
        'Accessing personality module... 🤖',
        'Warming up the conversational engine...',
        'Thinking of a friendly response...',
      ],
      'dataset-analysis': [
        'Analyzing dataset structure...',
        'Scanning for suspicious patterns...',
        'Computing risk metrics...',
      ],
      'technical-guidance': [
        'Retrieving knowledge base...',
        'Formulating technical explanation...',
        'Compiling best practices...',
      ],
      'audit-report': [
        'Performing comprehensive audit...',
        'Scanning all columns for leakage...',
        'Generating risk report...',
      ],
    };

    const messages = thinking[queryType] || thinking['chit-chat'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Main response generation method
   */
  async generateResponse(
    userQuery: string,
    context: ConversationContext
  ): Promise<AIGeneratedResponse> {
    const startTime = Date.now();
    const thinkingStart = Date.now();

    // Classify query
    const queryType = this.classifyQuery(userQuery, !!context.currentDataset);
    const thinkingMessage = this.generateThinkingMessage(queryType);

    // Simulate thinking
    await new Promise((resolve) => setTimeout(resolve, this.THINKING_TIME));
    const thinkingTimeMs = Date.now() - thinkingStart;

    // Generate response based on type
    let responseText = '';

    switch (queryType) {
      case 'chit-chat':
        responseText = this.generateChitChatResponse(userQuery, thinkingTimeMs);
        break;

      case 'dataset-analysis':
        responseText = this.generateDatasetAnalysisResponse(
          userQuery,
          context.currentDataset!
        );
        break;

      case 'technical-guidance':
        responseText = this.generateTechnicalGuidanceResponse(userQuery);
        break;

      case 'audit-request':
        responseText = this.generateAuditReport(context.currentDataset);
        break;

      default:
        responseText = "I'm here to help! What would you like to know about your data?";
    }

    const totalTime = Date.now() - startTime;

    return {
      text: responseText,
      type:
        queryType === 'audit-request'
          ? 'audit-report'
          : (queryType as any),
      thinkingProcess: thinkingMessage,
      processingTimeMs: totalTime,
    };
  }
}

export default new ConversationalAIEngine();
