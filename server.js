/**
 * ConceptLeak Mock Backend Server
 * Runs on http://localhost:5000
 * Provides API endpoints for the mobile app
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload middleware
const upload = multer({ dest: 'uploads/' });

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ConceptLeak Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// ==================== Chat Endpoints ====================
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Mock response based on keywords
  let reply = 'I\'m the ConceptLeak AI assistant. How can I help you analyze your data?';
  
  const lower = message.toLowerCase();
  if (lower.includes('risk')) {
    reply = 'Based on your dataset, I found 3 critical risks related to data exposure and privacy violations.';
  } else if (lower.includes('data')) {
    reply = 'The dataset contains 1,250 records with PII (Personally Identifiable Information) in 47% of rows.';
  } else if (lower.includes('sample')) {
    reply = 'The sample dataset shows moderate risk with potential exposure in financial records.';
  }

  res.json({ reply });
});

// ==================== Upload Endpoints ====================
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  res.json({
    fileId: 'file-' + Date.now(),
    fileName: req.file.originalname,
    size: req.file.size,
    status: 'completed',
    uploadedAt: new Date().toISOString(),
  });
});

// ==================== Insights Endpoints ====================
app.get('/api/insights', (req, res) => {
  res.json({
    insights: [
      {
        id: '1',
        feature: 'Data Exposure',
        riskLevel: 'MEDIUM',
        score: 65,
        description: 'Sensitive data fields detected in dataset',
        affectedRecords: 312,
      },
      {
        id: '2',
        feature: 'PII Leakage',
        riskLevel: 'HIGH',
        score: 82,
        description: 'Personally identifiable information found',
        affectedRecords: 587,
      },
      {
        id: '3',
        feature: 'Format Inconsistency',
        riskLevel: 'LOW',
        score: 28,
        description: 'Some field formats are inconsistent',
        affectedRecords: 45,
      },
      {
        id: '4',
        feature: 'Duplicate Records',
        riskLevel: 'LOW',
        score: 15,
        description: 'Duplicate entries found',
        affectedRecords: 23,
      },
    ],
    totalScore: 47.5,
    overallRisk: 'MEDIUM',
  });
});

// ==================== Datasets Endpoints ====================
app.get('/api/datasets', (req, res) => {
  res.json({
    datasets: [
      {
        id: '1',
        name: 'customer_data.csv',
        size: '2.4 MB',
        uploadedAt: '2024-03-25',
        status: 'completed',
        riskScore: 65,
      },
      {
        id: '2',
        name: 'transactions.csv',
        size: '5.1 MB',
        uploadedAt: '2024-03-24',
        status: 'completed',
        riskScore: 82,
      },
      {
        id: '3',
        name: 'employees.xlsx',
        size: '1.2 MB',
        uploadedAt: '2024-03-23',
        status: 'completed',
        riskScore: 45,
      },
    ],
  });
});

app.get('/api/datasets/:id', (req, res) => {
  const { id } = req.params;
  const datasets = [
    {
      id: '1',
      name: 'customer_data.csv',
      size: '2.4 MB',
      uploadedAt: '2024-03-25',
      status: 'completed',
      riskScore: 65,
      columns: ['id', 'name', 'email', 'phone', 'address'],
      recordCount: 1250,
    },
    {
      id: '2',
      name: 'transactions.csv',
      size: '5.1 MB',
      uploadedAt: '2024-03-24',
      status: 'completed',
      riskScore: 82,
      columns: ['transaction_id', 'customer_id', 'amount', 'date', 'status'],
      recordCount: 8432,
    },
  ];

  const dataset = datasets.find(d => d.id === id);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  res.json(dataset);
});

// ==================== Health Check ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:5000');
});
