import React, { createContext, useContext, useState, ReactNode } from 'react';

// Dataset Types
export interface Dataset {
  id: string;
  name: string;
  uploadedAt: string;
  size: string;
  status: 'processing' | 'completed' | 'error';
}

export interface DatasetPreview extends Dataset {
  rowCount: number;
  columnCount: number;
  columns: string[];
  previewRows: Record<string, any>[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Chat Types
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  datasetId: string;
}

// Insights Types
export interface Insight {
  id: string;
  feature: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  description: string;
  affectedRecords?: number;
}

// User Types
export interface UserData {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

// Per-Dataset Data Store
interface DatasetData {
  id: string;
  preview: DatasetPreview | null;
  insights: Insight[];
  chatHistory: ChatMessage[];
}

interface DatasetContextType {
  // User
  user: UserData;
  setUser: (userData: UserData) => void;
  
  // Datasets
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  addDataset: (dataset: Dataset) => void;
  setSelectedDataset: (dataset: Dataset) => void;
  
  // Per-dataset data
  getDatasetData: (datasetId: string) => DatasetData;
  setDatasetPreview: (datasetId: string, preview: DatasetPreview) => void;
  setDatasetInsights: (datasetId: string, insights: Insight[]) => void;
  addMessageToDataset: (datasetId: string, message: ChatMessage) => void;
  getDatasetChatHistory: (datasetId: string) => ChatMessage[];
  getDatasetInsights: (datasetId: string) => Insight[];
  
  // Helpers
  getDatasetById: (id: string) => Dataset | undefined;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserData>({
    name: '',
    email: '',
    isLoggedIn: false,
  });
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDatasetState] = useState<Dataset | null>(null);
  const [datasetStore, setDatasetStore] = useState<Map<string, DatasetData>>(new Map());

  const setUser = (userData: UserData) => {
    setUserState(userData);
  };

  const addDataset = (dataset: Dataset) => {
    setDatasets((prev) => [dataset, ...prev]);
    // Initialize dataset store
    setDatasetStore((prev) => {
      const newMap = new Map(prev);
      newMap.set(dataset.id, {
        id: dataset.id,
        preview: null,
        insights: [],
        chatHistory: [],
      });
      return newMap;
    });
  };

  const setSelectedDataset = (dataset: Dataset) => {
    setSelectedDatasetState(dataset);
  };

  const getDatasetData = (datasetId: string): DatasetData => {
    return (
      datasetStore.get(datasetId) || {
        id: datasetId,
        preview: null,
        insights: [],
        chatHistory: [],
      }
    );
  };

  const setDatasetPreview = (datasetId: string, preview: DatasetPreview) => {
    setDatasetStore((prev) => {
      const newMap = new Map(prev);
      const data = newMap.get(datasetId) || {
        id: datasetId,
        preview: null,
        insights: [],
        chatHistory: [],
      };
      data.preview = preview;
      newMap.set(datasetId, data);
      return newMap;
    });
  };

  const setDatasetInsights = (datasetId: string, insights: Insight[]) => {
    setDatasetStore((prev) => {
      const newMap = new Map(prev);
      const data = newMap.get(datasetId) || {
        id: datasetId,
        preview: null,
        insights: [],
        chatHistory: [],
      };
      data.insights = insights;
      newMap.set(datasetId, data);
      return newMap;
    });
  };

  const addMessageToDataset = (datasetId: string, message: ChatMessage) => {
    setDatasetStore((prev) => {
      const newMap = new Map(prev);
      const data = newMap.get(datasetId) || {
        id: datasetId,
        preview: null,
        insights: [],
        chatHistory: [],
      };
      data.chatHistory.push(message);
      newMap.set(datasetId, data);
      return newMap;
    });
  };

  const getDatasetChatHistory = (datasetId: string): ChatMessage[] => {
    const data = datasetStore.get(datasetId);
    return data?.chatHistory || [];
  };

  const getDatasetInsights = (datasetId: string): Insight[] => {
    const data = datasetStore.get(datasetId);
    return data?.insights || [];
  };

  const getDatasetById = (id: string) => {
    return datasets.find((d) => d.id === id);
  };

  return (
    <DatasetContext.Provider
      value={{
        user,
        setUser,
        datasets,
        selectedDataset,
        addDataset,
        setSelectedDataset,
        getDatasetData,
        setDatasetPreview,
        setDatasetInsights,
        addMessageToDataset,
        getDatasetChatHistory,
        getDatasetInsights,
        getDatasetById,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within DatasetProvider');
  }
  return context;
};
