export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Dataset {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: "processing" | "completed" | "error";
  riskScore?: number;
  riskLevel?: RiskLevel;
  rowCount?: number;
  columnCount?: number;
  columns?: string[];
  previewRows?: Record<string, unknown>[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  datasetId?: string;
}

export interface Insight {
  id: string;
  feature: string;
  riskLevel: RiskLevel;
  score: number;
  description: string;
  affectedRecords?: number;
  leakageType?: string;
}

export interface UserData {
  name: string;
  email: string;
}
