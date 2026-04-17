/**
 * Prisma-backed dataset store.
 * Chat history and insights are kept in-memory (derived/ephemeral).
 */
import type { Dataset, ChatMessage, Insight } from "@/types";
import { Prisma } from "@prisma/client";
import type { Dataset as PrismaDataset } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// In-memory caches (insights are derived/ephemeral)
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
    await prisma.message.deleteMany({ where: { userId, datasetId } });
    return true;
  } catch (error) {
    console.error("Failed to delete dataset:", error);
    return false;
  }
}

// ── Chat history ───────────────────────────────────────────────────────────────

export async function getChatHistory(
  userId: string,
  datasetId: string,
  limit = 20
): Promise<ChatMessage[]> {
  try {
    const messages = await prisma.message.findMany({
      where: { userId, datasetId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    return messages.map((m) => ({
      id: m.id,
      text: m.text,
      sender: m.sender as "user" | "bot",
      timestamp: m.createdAt.toISOString(),
      datasetId: m.datasetId,
    }));
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

export async function addMessage(
  userId: string,
  datasetId: string,
  message: ChatMessage
): Promise<void> {
  try {
    await prisma.message.create({
      data: {
        id: message.id,
        userId,
        datasetId,
        sender: message.sender,
        text: message.text,
      },
    });
  } catch (error) {
    console.error("Failed to save message:", error);
  }
}

// ── Insights (generated + cached in-memory) ────────────────────────────────────

export function cacheInsights(datasetId: string, insights: Insight[]): void {
  insightCache.set(datasetId, insights);
}

export async function getInsights(userId: string, datasetId: string): Promise<Insight[]> {
  if (insightCache.has(datasetId)) return insightCache.get(datasetId)!;

  const dataset = await getDataset(userId, datasetId);
  if (!dataset) return [];

  // Re-analyze using preview rows as fallback
  // (full analysis happens at upload time and is cached)
  const { analyzeDataset } = await import("@/lib/analyzer");
  const previewAsStrings = (dataset.previewRows || []).map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, String(v)])
    ) as Record<string, string>
  );

  const { insights } = analyzeDataset(dataset.columns || [], previewAsStrings);
  insightCache.set(datasetId, insights);
  return insights;
}
