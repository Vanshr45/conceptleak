import { DatasetPreview } from '../context/DatasetContext';

/**
 * PromptBuilder: Sophisticated frontend-level prompt engineering for concept leakage detection
 * Generates dynamic, instruction-heavy system prompts that inject dataset context
 */

interface DatasetContext {
  preview: DatasetPreview | null;
  userQuery: string;
}

/**
 * Extract schema information and identify suspicious columns
 */
function analyzeDatasetSchema(preview: DatasetPreview | null): {
  columns: string[];
  columnTypes: Record<string, string>;
  suspiciousColumns: string[];
  summary: string;
} {
  if (!preview) {
    return {
      columns: [],
      columnTypes: {},
      suspiciousColumns: [],
      summary: 'No dataset context available.',
    };
  }

  const columnTypes: Record<string, string> = {};
  const suspiciousColumns: string[] = [];

  // Analyze columns
  if (preview.previewRows.length > 0) {
    const firstRow = preview.previewRows[0];
    for (const col of preview.columns) {
      const value = firstRow[col];
      const type = typeof value;

      if (type === 'number') {
        columnTypes[col] = 'numeric';
      } else if (type === 'boolean') {
        columnTypes[col] = 'boolean';
      } else if (type === 'string') {
        columnTypes[col] = 'text';
      } else {
        columnTypes[col] = 'string';
      }

      // Identify suspicious columns (IDs, metadata, timestamps)
      const lowerCol = col.toLowerCase();
      if (
        lowerCol.includes('id') ||
        lowerCol.includes('index') ||
        lowerCol.includes('uuid') ||
        lowerCol.includes('timestamp') ||
        lowerCol.includes('date') ||
        lowerCol.includes('time') ||
        lowerCol.includes('hash') ||
        lowerCol.includes('key')
      ) {
        suspiciousColumns.push(col);
      }
    }
  }

  const summary = `Total columns: ${preview.columnCount} | Total rows: ${preview.rowCount} | Risk Level: ${preview.riskLevel}`;

  return {
    columns: preview.columns,
    columnTypes,
    suspiciousColumns,
    summary,
  };
}

/**
 * Generate sample data JSON for context injection
 */
function generateSampleDataJSON(preview: DatasetPreview | null, maxRows: number = 3): string {
  if (!preview || preview.previewRows.length === 0) {
    return '[]';
  }

  const samples = preview.previewRows.slice(0, maxRows);
  return JSON.stringify(samples, null, 2);
}

/**
 * Main: Generate the comprehensive system prompt for concept leakage detection
 */
export function generateSystemPrompt(context: DatasetContext): string {
  const { preview, userQuery } = context;
  const schema = analyzeDatasetSchema(preview);
  const sampleData = generateSampleDataJSON(preview);

  const systemPrompt = `
YOU ARE CONCEPTLEAK: SENIOR DATA SCIENTIST & ML CONCEPT LEAKAGE DETECTION EXPERT

═══════════════════════════════════════════════════════════════════════════════
ROLE & EXPERTISE
═══════════════════════════════════════════════════════════════════════════════
You are an elite machine learning engineer with 15+ years of experience detecting
concept leakage in production datasets. Your primary expertise is identifying
information leakage that causes models to achieve artificially high metrics.

ABSOLUTELY FORBIDDEN:
❌ Generic filler responses like "The dataset contains X rows with Y columns"
❌ Vague, repetitive statements ("dataset analysis shows...")
❌ Phrases like "I'm an AI assistant..." or "As a language model..."
❌ Non-specific recommendations without actionable steps
❌ Avoiding quantitative or schema-specific analysis

YOUR MISSION:
🎯 Proactively identify concept leakage risks in this dataset
🎯 Analyze every column relationship to the target variable
🎯 Detect shortcut learning patterns, ID leakage, temporal information leakage
🎯 Provide SPECIFIC, ACTIONABLE recommendations grounded in the schema


═══════════════════════════════════════════════════════════════════════════════
DATASET CONTEXT (INJECTED)
═══════════════════════════════════════════════════════════════════════════════

DATASET SCHEMA:
${JSON.stringify(schema.columns, null, 2)}

COLUMN TYPES:
${JSON.stringify(schema.columnTypes, null, 2)}

SUSPICIOUS COLUMNS (flagged for leakage potential):
${schema.suspiciousColumns.length > 0 ? JSON.stringify(schema.suspiciousColumns) : 'None identified'}

DATASET SUMMARY:
${schema.summary}

SAMPLE DATA (first 3 rows):
${sampleData}


═══════════════════════════════════════════════════════════════════════════════
CONCEPT LEAKAGE: DEFINITION & DETECTION FRAMEWORK
═══════════════════════════════════════════════════════════════════════════════

WHAT IS CONCEPT LEAKAGE?
Concept leakage occurs when information about the target variable is unintentionally
present in the feature set, allowing models to achieve unrealistically high performance
that fails to generalize in production.

TYPES OF CONCEPT LEAKAGE TO DETECT:
1. 🆔 DIRECT ID/METADATA LEAKAGE
   - ID columns, hashes, UUID fields that correlate with target
   - Timestamp/date fields that encode the target
   - User IDs or session IDs that leak target information

2. 🎯 FEATURE-TARGET LEAKAGE
   - Features computed after target generation
   - Derived features that perfectly predict target
   - Statistical transformations that depend on target distribution

3. 📊 TEMPORAL LEAKAGE
   - Time-series data where future information appears in features
   - Lookahead bias in sequential datasets
   - Information that wouldn't be available at prediction time

4. 🔗 PROXY LEAKAGE
   - Features that are proxies for the target (e.g., final_status vs target)
   - Redundant features with very high correlation to target
   - Domain knowledge violations (e.g., cost features when predicting cost)

5. 🔄 PREPROCESSING LEAKAGE
   - Scaling/normalization that uses target statistics
   - Null value imputation based on target
   - Feature selection applied to entire dataset before train/test split


═══════════════════════════════════════════════════════════════════════════════
CHAIN OF THOUGHT: ANALYSIS PROCESS
═══════════════════════════════════════════════════════════════════════════════

BEFORE ANSWERING, YOU MUST:
1. Examine EACH column in the schema systematically
2. For each column, ask: "How could this column leak target information?"
3. Check for suspicious naming patterns (IDs, timestamps, hashes)
4. Identify columns with suspiciously high correlation to target
5. Look for domain logic violations (e.g., price predicting price)
6. Consider preprocessing leakage: when was each feature created relative to target?
7. Summarize specific, column-level risks before providing general recommendations


═══════════════════════════════════════════════════════════════════════════════
RESPONSE FORMAT (MUST FOLLOW EXACTLY)
═══════════════════════════════════════════════════════════════════════════════

Your response MUST follow this exact Markdown structure with all three sections:

### 📊 Dataset Analysis
[Specific, column-level insights from the schema]
- Start with concrete observations about columns and relationships
- Reference specific column names and their types
- Quantify observations (e.g., "3 ID-like columns", "timestamp field with...")
- DO NOT be vague; reference the actual schema provided

### 🚨 Concept Leakage Risks
[Precise, actionable bullet points on leakage risks]
- Identify specific columns at risk for leakage
- Explain the MECHANISM of leakage (not just "high correlation")
- Rate each risk as CRITICAL, HIGH, MEDIUM, LOW
- Reference the suspicious columns: ${schema.suspiciousColumns.join(', ') || 'None identified'}

### 💡 Recommendations
[Specific, implementable ML steps]
- Feature engineering steps to remove leakage
- Columns to remove, transform, or feature-select
- Preprocessing strategy to eliminate leakage during train/test split
- Validation approach to verify leakage is removed
- Each recommendation should be actionable by a data scientist


═══════════════════════════════════════════════════════════════════════════════
USER QUESTION
═══════════════════════════════════════════════════════════════════════════════
${userQuery}


═══════════════════════════════════════════════════════════════════════════════
NOW RESPOND:
═══════════════════════════════════════════════════════════════════════════════

Apply your chain-of-thought analysis above. Then provide your response following
the three mandatory sections. Be specific, reference the schema, and focus on
concept leakage detection. Remember: generic responses are failures.
`.trim();

  return systemPrompt;
}

/**
 * VALIDATION: Check if response is substantive (not generic filler)
 */
export function isValidConceptLeakageResponse(response: string): boolean {
  // Response must be reasonably long
  if (response.length < 150) {
    return false;
  }

  // Response must contain required sections
  const hasAnalysisSection = /### 📊.*Dataset Analysis/i.test(response);
  const hasRisksSection = /### 🚨.*Concept Leakage Risks/i.test(response);
  const hasRecommendationsSection = /### 💡.*Recommendations/i.test(response);

  if (!hasAnalysisSection || !hasRisksSection || !hasRecommendationsSection) {
    return false;
  }

  // Response must not be generic filler
  const genericPhrases = [
    'i am an ai assistant',
    'as a language model',
    'i cannot provide',
    'i do not have',
    'you should ask',
    'the dataset contains x rows',
    'dataset contains X rows', // Pattern
    'generic analysis',
  ];

  const lowerResponse = response.toLowerCase();
  for (const phrase of genericPhrases) {
    if (lowerResponse.includes(phrase)) {
      return false;
    }
  }

  // Must reference specific leakage concepts
  const leakageConcepts = [
    'id',
    'leakage',
    'temporal',
    'proxy',
    'preprocessing',
    'correlation',
    'encryption',
  ];
  const conceptMatches = leakageConcepts.filter((c) => lowerResponse.includes(c));
  if (conceptMatches.length < 2) {
    return false;
  }

  return true;
}

/**
 * FALLBACK: Generate manual analysis if AI response is inadequate
 */
export function generateFallbackAnalysis(preview: DatasetPreview | null): string {
  const schema = analyzeDatasetSchema(preview);

  let fallback = `### 📊 Dataset Analysis\n`;
  fallback += `This dataset contains ${schema.columns.length} columns and ${schema.summary}.\n\n`;
  fallback += `**Columns:** ${schema.columns.join(', ')}\n\n`;

  if (schema.suspiciousColumns.length > 0) {
    fallback += `**Flagged Columns:** ${schema.suspiciousColumns.join(', ')}\n`;
    fallback += `These columns show naming patterns commonly associated with leakage.\n\n`;
  }

  fallback += `### 🚨 Concept Leakage Risks\n`;
  fallback += `- **🔴 CRITICAL:** Presence of ID and metadata columns (${schema.suspiciousColumns.join(', ')})\n`;
  fallback += `  These columns must be analyzed for potential information leakage.\n`;
  fallback += `- **🟠 HIGH:** Column relationships require manual inspection\n`;
  fallback += `  Examine correlation between suspicious columns and target variable.\n`;
  fallback += `- **🟡 MEDIUM:** Potential temporal leakage patterns\n`;
  fallback += `  Verify that all features are available at prediction time.\n\n`;

  fallback += `### 💡 Recommendations\n`;
  fallback += `1. **Remove ID-like columns** before training: ${schema.suspiciousColumns.join(', ')}\n`;
  fallback += `2. **Analyze column correlations** with your target variable\n`;
  fallback += `3. **Implement train/test split BEFORE feature engineering** to prevent leakage\n`;
  fallback += `4. **Document feature creation timeline** (when was each feature computed relative to target?)\n`;
  fallback += `5. **Use domain expertise** to identify columns that are targets-in-disguise\n`;

  return fallback;
}

/**
 * Build user message with system prompt
 */
export function buildEnhancedUserMessage(userQuery: string, systemPrompt: string): string {
  return `${systemPrompt}\n\n[User Input]:\n${userQuery}`;
}
