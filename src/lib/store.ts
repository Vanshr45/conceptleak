/**
 * Per-user persistent store.
 * Datasets are saved to data/datasets-{userId}.json and loaded on demand.
 * Chat history and insights are kept in-memory (derived/ephemeral).
 */
import fs from "fs";
import path from "path";
import type { Dataset, ChatMessage, Insight } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

// In-memory caches (chat history + insights don't need persistence)
const chatCache = new Map<string, ChatMessage[]>(); // key: `${userId}:${datasetId}`
const insightCache = new Map<string, Insight[]>();   // key: datasetId

// ── File helpers ─────────────────────────────────────────────────────────────

const memoryDatasets = new Map<string, Dataset[]>();

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Ignore read-only filesystem error
  }
}

function datasetsFile(userId: string) {
  return path.join(DATA_DIR, `datasets-${userId}.json`);
}

function readUserDatasets(userId: string): Dataset[] {
  if (memoryDatasets.has(userId)) return memoryDatasets.get(userId)!;
  ensureDataDir();
  const file = datasetsFile(userId);
  if (!fs.existsSync(file)) {
      const demo = getDemoDatasets();
      memoryDatasets.set(userId, demo);
      return demo;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as Dataset[];
    const result = raw.length > 0 ? raw : getDemoDatasets();
    memoryDatasets.set(userId, result);
    return result;
  } catch {
    const demo = getDemoDatasets();
    memoryDatasets.set(userId, demo);
    return demo;
  }
}

function writeUserDatasets(userId: string, datasets: Dataset[]) {
  memoryDatasets.set(userId, datasets);
  ensureDataDir();
  try {
    fs.writeFileSync(datasetsFile(userId), JSON.stringify(datasets, null, 2));
  } catch (e) {
    console.warn("Failed to write datasets to file system, using in-memory layer.");
  }
}

// ── Demo seed data ────────────────────────────────────────────────────────────

function getDemoDatasets(): Dataset[] {
  return [
    {
      id: "demo-1",
      name: "customer_data.csv",
      size: "2.4 MB",
      uploadedAt: new Date("2024-03-25").toISOString(),
      status: "completed",
      riskScore: 82,
      riskLevel: "HIGH",
      rowCount: 1250,
      columnCount: 5,
      columns: ["id", "name", "email", "phone", "address"],
      previewRows: [
        { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", address: "123 Main St" },
        { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102", address: "456 Oak Ave" },
        { id: 3, name: "Carol White", email: "carol@example.com", phone: "555-0103", address: "789 Pine Rd" },
        { id: 4, name: "David Brown", email: "david@example.com", phone: "555-0104", address: "321 Elm St" },
        { id: 5, name: "Eve Davis", email: "eve@example.com", phone: "555-0105", address: "654 Maple Ave" },
      ],
    },
    {
      id: "demo-2",
      name: "transactions.csv",
      size: "5.1 MB",
      uploadedAt: new Date("2024-03-24").toISOString(),
      status: "completed",
      riskScore: 65,
      riskLevel: "HIGH",
      rowCount: 8432,
      columnCount: 5,
      columns: ["transaction_id", "customer_id", "amount", "date", "status"],
      previewRows: [
        { transaction_id: "TXN-001", customer_id: "CUST-042", amount: 299.99, date: "2024-03-20", status: "completed" },
        { transaction_id: "TXN-002", customer_id: "CUST-017", amount: 49.50, date: "2024-03-20", status: "completed" },
        { transaction_id: "TXN-003", customer_id: "CUST-088", amount: 1200.00, date: "2024-03-21", status: "pending" },
        { transaction_id: "TXN-004", customer_id: "CUST-042", amount: 75.25, date: "2024-03-21", status: "completed" },
        { transaction_id: "TXN-005", customer_id: "CUST-033", amount: 899.00, date: "2024-03-22", status: "failed" },
      ],
    },
    {
      id: "demo-3",
      name: "employees.xlsx",
      size: "1.2 MB",
      uploadedAt: new Date("2024-03-23").toISOString(),
      status: "completed",
      riskScore: 45,
      riskLevel: "MEDIUM",
      rowCount: 342,
      columnCount: 6,
      columns: ["emp_id", "name", "department", "salary", "hire_date", "manager_id"],
      previewRows: [
        { emp_id: "E001", name: "John Doe", department: "Engineering", salary: 95000, hire_date: "2022-01-15", manager_id: "E010" },
        { emp_id: "E002", name: "Jane Roe", department: "Marketing", salary: 78000, hire_date: "2021-06-01", manager_id: "E011" },
        { emp_id: "E003", name: "Mike Lee", department: "Engineering", salary: 102000, hire_date: "2020-09-12", manager_id: "E010" },
        { emp_id: "E004", name: "Sara Kim", department: "HR", salary: 65000, hire_date: "2023-03-20", manager_id: "E012" },
        { emp_id: "E005", name: "Tom Hall", department: "Finance", salary: 88000, hire_date: "2019-11-05", manager_id: "E013" },
      ],
    },
  ];
}

// ── Public API (all functions require userId) ─────────────────────────────────

export function getAllDatasets(userId: string): Dataset[] {
  return readUserDatasets(userId).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function getDataset(userId: string, datasetId: string): Dataset | undefined {
  return readUserDatasets(userId).find((d) => d.id === datasetId);
}

export function addDataset(userId: string, dataset: Dataset): void {
  const existing = readUserDatasets(userId).filter((d) => d.id !== dataset.id);
  writeUserDatasets(userId, [dataset, ...existing]);
}

// ── Chat history (in-memory, per user+dataset) ────────────────────────────────

export function getChatHistory(userId: string, datasetId: string): ChatMessage[] {
  return chatCache.get(`${userId}:${datasetId}`) || [];
}

export function addMessage(userId: string, datasetId: string, message: ChatMessage): void {
  const key = `${userId}:${datasetId}`;
  const history = chatCache.get(key) || [];
  history.push(message);
  chatCache.set(key, history);
}

// ── Insights (generated + cached in-memory) ────────────────────────────────────

export function getInsights(userId: string, datasetId: string): Insight[] {
  if (insightCache.has(datasetId)) return insightCache.get(datasetId)!;

  const dataset = getDataset(userId, datasetId);
  if (!dataset) return [];

  const insights = generateInsights(dataset);
  insightCache.set(datasetId, insights);
  return insights;
}

function generateInsights(dataset: Dataset): Insight[] {
  const columns = dataset.columns || [];
  const insights: Insight[] = [];

  const idPatterns = /^(id|uuid|guid|index|row_id|record_id|primary_key|pk)$/i;
  const piiPatterns = /(email|phone|address|ssn|passport|credit|card|dob|birth|name|gender|age)/i;
  const temporalPatterns = /(date|time|timestamp|created_at|updated_at|year|month|day)/i;
  const salaryPatterns = /(salary|wage|income|pay|compensation)/i;

  columns.forEach((col, i) => {
    if (idPatterns.test(col)) {
      insights.push({
        id: `insight-${i}-id`,
        feature: col,
        riskLevel: "CRITICAL",
        score: 92,
        description: `Column "${col}" appears to be a direct identifier — a primary driver of ID leakage. ML models trained with this feature will memorize identities instead of learning generalizable patterns.`,
        affectedRecords: Math.floor((dataset.rowCount || 100) * 0.98),
        leakageType: "Direct ID Leakage",
      });
    } else if (piiPatterns.test(col)) {
      insights.push({
        id: `insight-${i}-pii`,
        feature: col,
        riskLevel: "HIGH",
        score: 74,
        description: `Column "${col}" contains Personally Identifiable Information (PII). This data can act as a proxy for protected attributes, leading to discriminatory model behavior and privacy violations.`,
        affectedRecords: Math.floor((dataset.rowCount || 100) * 0.87),
        leakageType: "PII / Proxy Leakage",
      });
    } else if (temporalPatterns.test(col)) {
      insights.push({
        id: `insight-${i}-temporal`,
        feature: col,
        riskLevel: "MEDIUM",
        score: 58,
        description: `Column "${col}" is a temporal feature. If the train/test split is not time-aware, future information can leak into past predictions — causing inflated performance that won't hold in production.`,
        affectedRecords: Math.floor((dataset.rowCount || 100) * 0.45),
        leakageType: "Temporal Leakage",
      });
    } else if (salaryPatterns.test(col)) {
      insights.push({
        id: `insight-${i}-target`,
        feature: col,
        riskLevel: "HIGH",
        score: 71,
        description: `Column "${col}" may be correlated with the target variable. Including it can cause target leakage, where the model indirectly accesses the label during training.`,
        affectedRecords: Math.floor((dataset.rowCount || 100) * 0.62),
        leakageType: "Target / Feature Leakage",
      });
    }
  });

  if (insights.length === 0) {
    insights.push({
      id: "insight-generic",
      feature: "General Assessment",
      riskLevel: "LOW",
      score: 22,
      description: "No obvious concept leakage patterns detected in column names. Recommend a deeper statistical analysis to rule out indirect or proxy leakage.",
      affectedRecords: 0,
      leakageType: "None Detected",
    });
  }

  return insights;
}
