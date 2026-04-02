// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatResponse {
  reply: string;
  confidence: number;
}

// Insight Types
export interface Insight {
  id: string;
  feature: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  description: string;
}

export interface InsightsResponse {
  insights: Insight[];
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Dataset Types
export interface Dataset {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  recordCount?: number;
}

export interface DatasetsResponse {
  datasets: Dataset[];
  totalSize: string;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  size: number;
  status: 'processing' | 'completed' | 'error';
}

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  Insights: undefined;
  Datasets: undefined;
  DatasetDetail: undefined;
  Profile: undefined;
};
