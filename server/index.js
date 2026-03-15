const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// In-memory storage for datasets
let datasets = {};
let currentDataset = null;

// Sample datasets
const sampleData = {
  sales: [
    { month: 'January', region: 'North', product: 'Laptops', revenue: 45000, units: 150 },
    { month: 'January', region: 'South', product: 'Laptops', revenue: 38000, units: 120 },
    { month: 'January', region: 'East', product: 'Monitors', revenue: 22000, units: 110 },
    { month: 'January', region: 'West', product: 'Monitors', revenue: 25000, units: 125 },
    { month: 'February', region: 'North', product: 'Laptops', revenue: 52000, units: 170 },
    { month: 'February', region: 'South', product: 'Laptops', revenue: 41000, units: 135 },
    { month: 'February', region: 'East', product: 'Monitors', revenue: 28000, units: 140 },
    { month: 'February', region: 'West', product: 'Monitors', revenue: 31000, units: 155 },
    { month: 'March', region: 'North', product: 'Laptops', revenue: 58000, units: 190 },
    { month: 'March', region: 'South', product: 'Laptops', revenue: 47000, units: 155 },
    { month: 'March', region: 'East', product: 'Tablets', revenue: 35000, units: 140 },
    { month: 'March', region: 'West', product: 'Tablets', revenue: 40000, units: 160 }
  ],
  employees: [
    { department: 'Engineering', name: 'Alice Johnson', salary: 95000, experience: 5, location: 'New York' },
    { department: 'Engineering', name: 'Bob Smith', salary: 87000, experience: 3, location: 'San Francisco' },
    { department: 'Sales', name: 'Carol Williams', salary: 72000, experience: 4, location: 'Chicago' },
    { department: 'Sales', name: 'David Brown', salary: 68000, experience: 2, location: 'Boston' },
    { department: 'Marketing', name: 'Eve Davis', salary: 65000, experience: 3, location: 'Los Angeles' },
    { department: 'Marketing', name: 'Frank Miller', salary: 70000, experience: 5, location: 'Seattle' },
    { department: 'HR', name: 'Grace Wilson', salary: 62000, experience: 4, location: 'Austin' },
    { department: 'HR', name: 'Henry Moore', salary: 58000, experience: 2, location: 'Denver' }
  ]
};

// Initialize with sample data
datasets['sales'] = sampleData.sales;
datasets['employees'] = sampleData.employees;
currentDataset = 'sales';

// Helper function to analyze data and suggest chart types
function analyzeDataForChart(data, query) {
  const columns = Object.keys(data[0] || {});
  const numericColumns = columns.filter(col => 
    data.every(row => !isNaN(parseFloat(row[col])))
  );
  const categoricalColumns = columns.filter(col => 
    !numericColumns.includes(col)
  );

  // Simple chart type selection logic
  let chartType = 'bar';
  let reasoning = '';

  if (query.toLowerCase().includes('over time') || query.toLowerCase().includes('trend') || 
      categoricalColumns.some(col => col.toLowerCase().includes('month') || col.toLowerCase().includes('date'))) {
    chartType = 'line';
    reasoning = 'Time-based data is best visualized as a line chart to show trends';
  } else if (query.toLowerCase().includes('breakdown') || query.toLowerCase().includes('composition') || 
             query.toLowerCase().includes('percentage')) {
    chartType = 'pie';
    reasoning = 'Part-to-whole relationships are best shown with pie charts';
  } else if (numericColumns.length >= 2 && categoricalColumns.length >= 1) {
    chartType = 'scatter';
    reasoning = 'Multiple numeric variables with categories work well as scatter plots';
  } else if (categoricalColumns.length >= 2 && numericColumns.length >= 1) {
    chartType = 'bar';
    reasoning = 'Categorical data with numeric values is ideal for bar charts';
  }

  return {
    chartType,
    reasoning,
    columns: {
      numeric: numericColumns,
      categorical: categoricalColumns,
      all: columns
    }
  };
}

// Helper function to process data based on query
function processDataForVisualization(data, query, chartAnalysis) {
  // Simple data processing - in a real app, this would use LLM to generate proper queries
  let processedData = [...data];
  
  // Extract relevant columns based on query keywords
  const queryLower = query.toLowerCase();
  let xColumn = chartAnalysis.columns.categorical[0];
  let yColumn = chartAnalysis.columns.numeric[0];
  
  // Smart column selection based on query
  if (queryLower.includes('revenue') || queryLower.includes('sales')) {
    yColumn = chartAnalysis.columns.numeric.find(col => col.toLowerCase().includes('revenue')) || 
              chartAnalysis.columns.numeric.find(col => col.toLowerCase().includes('sales')) || yColumn;
  }
  
  if (queryLower.includes('region')) {
    xColumn = chartAnalysis.columns.categorical.find(col => col.toLowerCase().includes('region')) || xColumn;
  }
  
  if (queryLower.includes('month') || queryLower.includes('time')) {
    xColumn = chartAnalysis.columns.categorical.find(col => col.toLowerCase().includes('month')) || xColumn;
  }

  // Aggregate data if needed
  if (chartAnalysis.chartType === 'pie' || chartAnalysis.chartType === 'bar') {
    const aggregated = {};
    processedData.forEach(row => {
      const key = row[xColumn];
      if (!aggregated[key]) {
        aggregated[key] = { [xColumn]: key, [yColumn]: 0 };
      }
      aggregated[key][yColumn] += parseFloat(row[yColumn]) || 0;
    });
    processedData = Object.values(aggregated);
  }

  return {
    data: processedData,
    xColumn,
    yColumn,
    chartType: chartAnalysis.chartType
  };
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.get('/api/datasets', (req, res) => {
  res.json({
    available: Object.keys(datasets),
    current: currentDataset,
    samples: Object.keys(datasets).reduce((acc, key) => {
      acc[key] = {
        columns: datasets[key] ? Object.keys(datasets[key][0] || {}) : [],
        rowCount: datasets[key] ? datasets[key].length : 0
      };
      return acc;
    }, {})
  });
});

app.post('/api/dataset/select', (req, res) => {
  const { datasetName } = req.body;
  if (datasets[datasetName]) {
    currentDataset = datasetName;
    res.json({ success: true, currentDataset });
  } else {
    res.status(404).json({ error: 'Dataset not found' });
  }
});

app.post('/api/upload', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const datasetName = path.basename(req.file.originalname, '.csv');
      datasets[datasetName] = results;
      currentDataset = datasetName;
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        datasetName,
        columns: Object.keys(results[0] || {}),
        rowCount: results.length
      });
    })
    .on('error', (error) => {
      res.status(500).json({ error: 'Error processing CSV file' });
    });
});

app.post('/api/query', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const data = datasets[currentDataset];
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data available' });
    }

    // Analyze data for appropriate chart type
    const chartAnalysis = analyzeDataForChart(data, query);
    
    // Process data for visualization
    const processedData = processDataForVisualization(data, query, chartAnalysis);

    // Generate insights using Gemini (temporarily disabled for testing)
    let insight = "Data visualization generated successfully. This shows the requested information based on your query.";
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
      As a business intelligence expert, analyze this data and query:
      
      Query: "${query}"
      Data Sample: ${JSON.stringify(data.slice(0, 5))}
      Chart Type: ${chartAnalysis.chartType}
      
      Provide:
      1. A brief insight about what this data shows
      2. Key trends or patterns
      3. Any notable observations
      
      Keep it concise and business-focused.
      `;
      
      const result = await model.generateContent(prompt);
      insight = result.response.text();
    } catch (error) {
      console.log('Gemini API error, using fallback insight:', error.message);
      // Continue with fallback insight
    }

    res.json({
      query,
      insight,
      chartConfig: {
        type: processedData.chartType,
        data: processedData.data,
        xColumn: processedData.xColumn,
        yColumn: processedData.yColumn,
        reasoning: chartAnalysis.reasoning
      },
      dataset: currentDataset
    });

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI BI Dashboard Server running on port ${PORT}`);
  console.log(`Available datasets: ${Object.keys(datasets).join(', ')}`);
});
