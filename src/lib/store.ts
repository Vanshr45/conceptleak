/**
 * Prisma-backed dataset store.
 * Chat history and insights are kept in-memory (derived/ephemeral).
 */
import type { Dataset, ChatMessage, Insight } from "@/types";
import { Prisma } from "@prisma/client";
import type { Dataset as PrismaDataset } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// In-memory caches (chat history + insights don't need persistence)
const chatCache = new Map<string, ChatMessage[]>(); // key: `${userId}:${datasetId}`
const insightCache = new Map<string, Insight[]>();   // key: datasetId

function toDataset(dataset: PrismaDataset): Dataset {
  return {
    id: dataset.id,
    name: dataset.name,
    size: dataset.size,
    uploadedAt: dataset.uploadedAt.toISOString(),
    status: dataset.status as Dataset["status"],
    riskScore: dataset.riskScore,
    riskLevel: dataset.riskLevel as Dataset["riskLevel"],
    rowCount: dataset.rowCount,
    columnCount: dataset.columnCount,
    columns: Array.isArray(dataset.columns) ? (dataset.columns as string[]) : [],
    previewRows: Array.isArray(dataset.previewRows)
      ? (dataset.previewRows as Record<string, unknown>[])
      : [],
  };
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

// ── Public API (all functions require userId) ─────────────────────────────────

export async function getAllDatasets(userId: string): Promise<Dataset[]> {
  try {
    const datasets = await prisma.dataset.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });
    return datasets.map(toDataset);
  } catch (error) {
    console.error("Failed to load datasets:", error);
    return [];
  }
}

export async function getDataset(userId: string, datasetId: string): Promise<Dataset | undefined> {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset || dataset.userId !== userId) {
      return undefined;
    }

    return toDataset(dataset);
  } catch (error) {
    console.error("Failed to load dataset:", error);
    return undefined;
  }
}

export async function addDataset(userId: string, dataset: Dataset): Promise<Dataset | null> {
  try {
    const created = await prisma.dataset.create({
      data: {
        id: dataset.id,
        userId,
        name: dataset.name,
        size: dataset.size,
        uploadedAt: new Date(dataset.uploadedAt),
        status: dataset.status,
        riskScore: dataset.riskScore ?? 0,
        riskLevel: dataset.riskLevel ?? "LOW",
        rowCount: dataset.rowCount ?? 0,
        columnCount: dataset.columnCount ?? 0,
        columns: toJsonValue(dataset.columns ?? []),
        previewRows: toJsonValue(dataset.previewRows ?? []),
      },
    });
    return toDataset(created);
  } catch (error) {
    console.error("Failed to create dataset:", error);
    return null;
  }
}

export async function updateDataset(
  userId: string,
  datasetId: string,
  dataset: Partial<Dataset>
): Promise<Dataset | null> {
  try {
    const existing = await prisma.dataset.findUnique({ where: { id: datasetId } });
    if (!existing || existing.userId !== userId) {
      return null;
    }

    const updated = await prisma.dataset.update({
      where: { id: datasetId },
      data: {
        ...(dataset.name !== undefined ? { name: dataset.name } : {}),
        ...(dataset.size !== undefined ? { size: dataset.size } : {}),
        ...(dataset.uploadedAt !== undefined ? { uploadedAt: new Date(dataset.uploadedAt) } : {}),
        ...(dataset.status !== undefined ? { status: dataset.status } : {}),
        ...(dataset.riskScore !== undefined ? { riskScore: dataset.riskScore } : {}),
        ...(dataset.riskLevel !== undefined ? { riskLevel: dataset.riskLevel } : {}),
        ...(dataset.rowCount !== undefined ? { rowCount: dataset.rowCount } : {}),
        ...(dataset.columnCount !== undefined ? { columnCount: dataset.columnCount } : {}),
        ...(dataset.columns !== undefined ? { columns: toJsonValue(dataset.columns) } : {}),
        ...(dataset.previewRows !== undefined ? { previewRows: toJsonValue(dataset.previewRows) } : {}),
      },
    });
    return toDataset(updated);
  } catch (error) {
    console.error("Failed to update dataset:", error);
    return null;
  }
}

export async function deleteDataset(userId: string, datasetId: string): Promise<boolean> {
  try {
    const existing = await prisma.dataset.findUnique({ where: { id: datasetId } });
    if (!existing || existing.userId !== userId) {
      return false;
    }

    await prisma.dataset.delete({ where: { id: datasetId } });
    insightCache.delete(datasetId);
    chatCache.delete(`${userId}:${datasetId}`);
    return true;
  } catch (error) {
    console.error("Failed to delete dataset:", error);
    return false;
  }
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

export async function getInsights(userId: string, datasetId: string): Promise<Insight[]> {
  if (insightCache.has(datasetId)) return insightCache.get(datasetId)!;

  const dataset = await getDataset(userId, datasetId);
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
