import { DatasetPreview } from '../context/DatasetContext';

/**
 * Mock AI Engine for ConceptLeak
 * Simulates an intelligent dataset-aware AI that detects concept leakage
 */

export interface AIResponse {
  thinking: string;
  analysis: string;
  risks: RiskItem[];
  recommendations: string[];
  metadata: {
    processingTime: number;
    datasetName: string;
    timestamp: string;
  };
}

export interface RiskItem {
  id: string;
  title: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  affectedColumns?: string[];
}

/**
 * Simulate AI thinking with realistic delay
 */
function simulateThinking(duration: number = 1500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

/**
 * Extract suspicious columns pattern from dataset
 */
function identifySuspiciousColumns(preview: DatasetPreview | null): string[] {
  if (!preview) return [];

  const suspicious: string[] = [];
  const suspiciousPatterns = [
    'id',
    'index',
    'uuid',
    'hash',
    'timestamp',
    'date',
    'time',
    'key',
    'pk',
    'user_id',
    'target_id',
  ];

  for (const col of preview.columns) {
    const lowerCol = col.toLowerCase();
    if (suspiciousPatterns.some((pattern) => lowerCol.includes(pattern))) {
      suspicious.push(col);
    }
  }

  return suspicious;
}

/**
 * Generate risk assessment based on dataset schema
 */
function generateRisks(preview: DatasetPreview | null, userQuery: string): RiskItem[] {
  const risks: RiskItem[] = [];
  const suspiciousColumns = identifySuspiciousColumns(preview);

  // Risk 1: ID Leakage
  const idColumns = suspiciousColumns.filter((col) =>
    col.toLowerCase().includes('id')
  );
  if (idColumns.length > 0) {
    risks.push({
      id: 'risk-id-leakage',
      title: 'ID Column Leakage',
      level: 'CRITICAL',
      description: `The columns ${idColumns.join(', ')} are ID-like fields that can directly encode target information. These should be removed before model training.`,
      affectedColumns: idColumns,
    });
  }

  // Risk 2: Temporal Information
  const temporalColumns = suspiciousColumns.filter((col) =>
    /time|date|timestamp/.test(col.toLowerCase())
  );
  if (temporalColumns.length > 0) {
    risks.push({
      id: 'risk-temporal',
      title: 'Temporal Information Leakage',
      level: 'HIGH',
      description: `Temporal columns (${temporalColumns.join(', ')}) may leak information about when predictions should be made. Verify these aren't future-leaked features.`,
      affectedColumns: temporalColumns,
    });
  }

  // Risk 3: Data Volume
  if (preview && preview.rowCount > 10000) {
    risks.push({
      id: 'risk-scale',
      title: 'Large Dataset Size',
      level: 'MEDIUM',
      description: `Your dataset has ${preview.rowCount} rows. Consider stratified sampling to prevent data leakage in train/test splits.`,
    });
  }

  // Risk 4: Feature Count
  if (preview && preview.columnCount > 50) {
    risks.push({
      id: 'risk-dimensionality',
      title: 'High Dimensionality',
      level: 'MEDIUM',
      description: `With ${preview.columnCount} features, the curse of dimensionality increases leakage risk. Consider feature selection before splitting.`,
    });
  }

  return risks;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(preview: DatasetPreview | null): string[] {
  const recommendations: string[] = [];
  const suspicious = identifySuspiciousColumns(preview);

  recommendations.push(
    `🛡️ Remove ${suspicious.length > 0 ? `ID columns: ${suspicious.join(', ')}` : 'any ID-like columns'} immediately.`
  );
  recommendations.push(
    '📊 Perform train/test split BEFORE feature engineering to prevent leakage.'
  );
  recommendations.push(
    '🔍 Use correlation analysis to identify features with suspiciously high correlation to target (>0.99).'
  );
  recommendations.push(
    '⚙️ Document feature creation dates and ensure all features are available at prediction time.'
  );
  recommendations.push(
    '✅ Run cross-validation with stratified k-fold to catch leakage early.'
  );

  return recommendations;
}

/**
 * MAIN: Generate contextualized AI response with thinking process
 * This simulates a "thinking" phase where the AI analyzes the dataset
 */
export async function generateAIResponse(
  userQuery: string,
  datasetPreview: DatasetPreview | null,
  isInitialAssessment: boolean = false
): Promise<AIResponse> {
  const startTime = Date.now();

  // Simulate thinking process
  await simulateThinking(1500);

  // Build thinking narrative
  const thinking =
    `Analyzing dataset: "${datasetPreview?.name || 'Unknown'}"...` +
    `\n✓ Scanned ${datasetPreview?.columnCount || 0} columns` +
    `\n✓ Identified ${identifySuspiciousColumns(datasetPreview).length} suspicious patterns` +
    `\n✓ Assessing concept leakage risks...` +
    `\n✓ Generating recommendations...` +
    `\nAnalysis complete.`;

  // Generate risks and recommendations
  const risks = generateRisks(datasetPreview, userQuery);
  const recommendations = generateRecommendations(datasetPreview);

  // Build analysis narrative
  let analysis = '';
  if (isInitialAssessment) {
    analysis =
      `### 📋 Initial Leakage Assessment Report\n\n` +
      `Dataset: **${datasetPreview?.name}**\n\n` +
      `**Overview:**\n` +
      `This dataset contains ${datasetPreview?.columnCount} features and ${datasetPreview?.rowCount} samples. ` +
      `I've identified **${risks.length} potential concept leakage risks** that could mislead your ML model.\n\n` +
      `**Critical Findings:**\n` +
      risks
        .filter((r) => r.level === 'CRITICAL')
        .map((r) => `- 🔴 **${r.title}**: ${r.description}`)
        .join('\n');
  } else {
    analysis =
      `### 🔍 Concept Leakage Analysis\n\n` +
      `Analyzing your question: "${userQuery}"\n\n` +
      `I've detected the following risks in your dataset:\n` +
      risks.map((r) => `- **${r.title}** (${r.level}): ${r.description}`).join('\n');
  }

  const processingTime = Date.now() - startTime;

  return {
    thinking,
    analysis,
    risks,
    recommendations,
    metadata: {
      processingTime,
      datasetName: datasetPreview?.name || 'Unknown Dataset',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Format AI response as Markdown for display
 */
export function formatAIResponseAsMarkdown(response: AIResponse): string {
  let markdown = response.analysis + '\n\n';

  // Add risks section
  if (response.risks.length > 0) {
    markdown += '### 🚨 Risks Identified\n\n';
    const criticalRisks = response.risks.filter((r) => r.level === 'CRITICAL');
    const highRisks = response.risks.filter((r) => r.level === 'HIGH');
    const mediumRisks = response.risks.filter((r) => r.level === 'MEDIUM');

    if (criticalRisks.length > 0) {
      markdown += '**🔴 Critical:**\n';
      criticalRisks.forEach((r) => {
        markdown += `- ${r.title}: ${r.description}\n`;
      });
      markdown += '\n';
    }

    if (highRisks.length > 0) {
      markdown += '**🟠 High:**\n';
      highRisks.forEach((r) => {
        markdown += `- ${r.title}: ${r.description}\n`;
      });
      markdown += '\n';
    }

    if (mediumRisks.length > 0) {
      markdown += '**🟡 Medium:**\n';
      mediumRisks.forEach((r) => {
        markdown += `- ${r.title}: ${r.description}\n`;
      });
      markdown += '\n';
    }
  }

  // Add recommendations section
  if (response.recommendations.length > 0) {
    markdown += '### 💡 Recommendations\n\n';
    response.recommendations.forEach((rec) => {
      markdown += `${rec}\n`;
    });
    markdown += '\n';
  }

  // Add metadata
  markdown += `---\n_Analysis completed in ${response.metadata.processingTime}ms_`;

  return markdown;
}

/**
 * Simulate three-dot typing indicator
 */
export function useTypingIndicator(duration: number = 2000): [boolean, () => void] {
  const [isTyping, setIsTyping] = React.useState(false);

  const startTyping = React.useCallback(() => {
    setIsTyping(true);
    const timeout = setTimeout(() => setIsTyping(false), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  return [isTyping, startTyping];
}

// Import React at the top if not already imported
import React from 'react';
