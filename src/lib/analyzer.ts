import type { Insight } from "@/types";

interface AnalysisResult {
  riskScore: number;
  insights: Insight[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toNumbers(values: string[]): number[] {
  return values
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stddev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const variance = nums.reduce((a, b) => a + Math.pow(b - m, 2), 0) / nums.length;
  return Math.sqrt(variance);
}

// Pearson correlation coefficient between two numeric arrays
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 10) return 0;
  const xs = x.slice(0, n);
  const ys = y.slice(0, n);
  const mx = mean(xs);
  const my = mean(ys);
  const num = xs.reduce((sum, xi, i) => sum + (xi - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(
    xs.reduce((s, xi) => s + Math.pow(xi - mx, 2), 0) *
    ys.reduce((s, yi) => s + Math.pow(yi - my, 2), 0)
  );
  return den === 0 ? 0 : num / den;
}

// Uniqueness ratio — high uniqueness in a numeric col = possible ID
function uniquenessRatio(values: string[]): number {
  const nonEmpty = values.filter((v) => v !== "");
  if (nonEmpty.length === 0) return 0;
  return new Set(nonEmpty).size / nonEmpty.length;
}

// Null/missing ratio
function missingRatio(values: string[]): number {
  const missing = values.filter(
    (v) => v === "" || v === "null" || v === "NULL" || v === "NA" || v === "N/A"
  ).length;
  return values.length === 0 ? 0 : missing / values.length;
}

// Detect if a column looks like a datetime
function isTemporalColumn(colName: string, values: string[]): boolean {
  // Only match on column name — do NOT use Date.parse() on values
  // because short integers like "52" or "1" parse as valid dates
  const nameMatch = /(date|time|timestamp|created_at|updated_at|datetime)/i.test(colName);
  if (!nameMatch) return false;

  // Extra confirmation: check if values look like actual date strings
  // not just plain integers
  const sample = values.slice(0, 20).filter((v) => v !== "");
  const looksLikeDates = sample.filter((v) => {
    // Must contain a dash, slash, colon, or "T" to be a real date string
    return /[-\/T:]/.test(v) && !isNaN(Date.parse(v));
  }).length;

  return looksLikeDates > sample.length * 0.5;
}

// Detect if a column is likely a target/label column
function isLikelyTarget(colName: string, values: string[]): boolean {
  const nameMatch = /^(target|label|y|outcome|class|output|result|churn|fraud|default|survived|diagnosis)$/i.test(colName);
  const nums = toNumbers(values);
  const unique = new Set(nums);
  // Binary column (0/1 or two unique values) is likely a target
  const isBinary = unique.size === 2;
  return nameMatch || (isBinary && nums.length > 50);
}

// ── Main analysis function ────────────────────────────────────────────────────

export function analyzeDataset(
  columns: string[],
  rows: Record<string, string>[]
): AnalysisResult {
  const insights: Insight[] = [];
  const rowCount = rows.length;

  // Build column value arrays
  const colValues: Record<string, string[]> = {};
  columns.forEach((col) => {
    colValues[col] = rows.map((r) => r[col] ?? "");
  });

  // Find the likely target column
  const targetCol = columns.find((col) => isLikelyTarget(col, colValues[col]));
  const targetNums = targetCol ? toNumbers(colValues[targetCol]) : [];

  // ── Column name patterns (still useful as a signal) ───────────────────────
  const idPattern = /^(id|uuid|guid|index|row_id|record_id|pk|primary_key)$/i;
  const piiPattern = /(email|phone|address|ssn|passport|credit|card|dob|birth|name|gender)/i;

  columns.forEach((col, i) => {
    if (col === targetCol) return;

    const values = colValues[col];
    const nums = toNumbers(values);
    const missing = missingRatio(values);
    const uniqueness = uniquenessRatio(values);
    void stddev(nums);

    // ── 1. Direct ID Leakage ───────────────────────────────────────────────
    if (idPattern.test(col) || (uniqueness > 0.95 && nums.length > rowCount * 0.8)) {
      const score = Math.round(85 + uniqueness * 10);
      insights.push({
        id: `insight-${i}-id`,
        feature: col,
        riskLevel: "CRITICAL",
        score: Math.min(score, 98),
        description: `"${col}" has ${Math.round(uniqueness * 100)}% unique values — a direct identifier. Models trained with this feature memorize row identities instead of learning patterns, causing 0% generalization to new data.`,
        affectedRecords: Math.floor(rowCount * uniqueness),
        leakageType: "Direct ID Leakage",
      });
      return;
    }

    // ── 2. PII / Proxy Leakage ────────────────────────────────────────────
    if (piiPattern.test(col)) {
      const score = 70 + Math.round(uniqueness * 15);
      insights.push({
        id: `insight-${i}-pii`,
        feature: col,
        riskLevel: "HIGH",
        score: Math.min(score, 88),
        description: `"${col}" contains PII. With ${Math.round(uniqueness * 100)}% unique values across ${rowCount.toLocaleString()} rows, this column acts as a proxy for protected attributes and introduces discriminatory signal into the model.`,
        affectedRecords: Math.floor(rowCount * 0.9),
        leakageType: "PII / Proxy Leakage",
      });
      return;
    }

    // ── 3. Target Leakage (high correlation with target) ──────────────────
    if (targetNums.length > 0 && nums.length > 0) {
      const correlation = Math.abs(pearsonCorrelation(nums, targetNums));
      if (correlation > 0.85) {
        const score = Math.round(correlation * 95);
        insights.push({
          id: `insight-${i}-target`,
          feature: col,
          riskLevel: correlation > 0.92 ? "CRITICAL" : "HIGH",
          score,
          description: `"${col}" has ${(correlation * 100).toFixed(1)}% Pearson correlation with "${targetCol}". This is almost certainly target leakage — the feature directly encodes the label, giving the model information it wouldn't have at inference time.`,
          affectedRecords: rowCount,
          leakageType: "Target / Feature Leakage",
        });
        return;
      }
      if (correlation > 0.65) {
        insights.push({
          id: `insight-${i}-corr`,
          feature: col,
          riskLevel: "MEDIUM",
          score: Math.round(correlation * 75),
          description: `"${col}" has ${(correlation * 100).toFixed(1)}% correlation with "${targetCol}". Investigate whether this feature could be computed from the target or derived post-event.`,
          affectedRecords: Math.floor(rowCount * 0.6),
          leakageType: "Target / Feature Leakage",
        });
        return;
      }
    }

    // ── 4. Temporal Leakage ───────────────────────────────────────────────
    if (isTemporalColumn(col, values)) {
      const score = 52 + Math.round(missing * 20);
      insights.push({
        id: `insight-${i}-temporal`,
        feature: col,
        riskLevel: "MEDIUM",
        score,
        description: `"${col}" is a temporal column. Without time-aware train/test splitting, future timestamps leak into past predictions — producing inflated accuracy that collapses in production.`,
        affectedRecords: Math.floor(rowCount * 0.5),
        leakageType: "Temporal Leakage",
      });
      return;
    }

    // ── 5. High missing data warning ─────────────────────────────────────
    if (missing > 0.4) {
      insights.push({
        id: `insight-${i}-missing`,
        feature: col,
        riskLevel: "MEDIUM",
        score: Math.round(missing * 70),
        description: `"${col}" has ${Math.round(missing * 100)}% missing values. Imputation strategies can introduce data leakage if fit on the full dataset before splitting into train/test sets.`,
        affectedRecords: Math.floor(rowCount * missing),
        leakageType: "Preprocessing Leakage",
      });
    }
  });

  // ── Compute overall risk score from insights ──────────────────────────────
  let riskScore = 15;
  insights.forEach((ins) => {
    if (ins.riskLevel === "CRITICAL") riskScore += 20;
    else if (ins.riskLevel === "HIGH") riskScore += 12;
    else if (ins.riskLevel === "MEDIUM") riskScore += 6;
  });
  riskScore = Math.min(riskScore, 100);

  // No issues found
  if (insights.length === 0) {
    insights.push({
      id: "insight-clean",
      feature: "General Assessment",
      riskLevel: "LOW",
      score: 15,
      description: `No leakage patterns detected across ${columns.length} columns and ${rowCount.toLocaleString()} rows. Run correlation analysis on engineered features before training.`,
      affectedRecords: 0,
      leakageType: "None Detected",
    });
  }

  return { riskScore, insights };
}
