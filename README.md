# 🤖 AI Business Intelligence Dashboard

A conversational AI-powered business intelligence dashboard that transforms natural language queries into interactive data visualizations. Built for hackathon demonstrations with modern React frontend and Node.js backend.

## ✨ Features

- 🗣️ **Natural Language Queries**: Ask questions about your data in plain English
- 📊 **Intelligent Chart Selection**: Automatically chooses the best visualization type
- 🔄 **Real-time Processing**: Get instant insights with Google Gemini AI
- 📁 **CSV Upload Support**: Bring your own data files
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- ⚡ **Interactive Charts**: Hover, zoom, and explore your data
- 📱 **Mobile Friendly**: Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- Google Gemini API Key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-bi-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
ai-bi-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── types.ts        # TypeScript definitions
├── server/                 # Node.js backend
│   └── index.js           # Express server
├── uploads/               # CSV upload directory
├── package.json           # Root dependencies
└── README.md
```

## 🎯 Usage Examples

### Sample Queries to Try

1. **Sales Analysis**
   - "Show me monthly sales revenue by region"
   - "What are the top performing products?"
   - "Compare revenue trends over time"

2. **Employee Data**
   - "Show average salary by department"
   - "Which department has the most employees?"
   - "Plot experience vs salary"

3. **Custom Data**
   - Upload your own CSV file
   - Ask questions in natural language
   - Get instant visualizations

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Chat Interface**: Conversational UI for natural language queries
- **Chart Visualization**: Dynamic charts using Recharts library
- **Dataset Management**: CSV upload and dataset selection
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend (Node.js + Express)
- **API Endpoints**: RESTful API for frontend communication
- **Google Gemini Integration**: AI-powered query processing
- **Data Processing**: Intelligent chart type selection
- **File Upload**: CSV parsing and data management

### Key Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, Google Gemini API
- **Data Processing**: CSV parsing, Chart type detection
- **File Handling**: Multer for uploads

## 📊 Chart Types

The system automatically selects the appropriate chart type based on your query:

- **Line Charts**: Time-series data and trends
- **Bar Charts**: Categorical comparisons
- **Pie Charts**: Part-to-whole relationships
- **Scatter Plots**: Correlation analysis

## 🔧 Configuration

### Environment Variables

```env
# Google Gemini API Key (required)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
```

### Adding Custom Datasets

1. Use the CSV upload feature in the UI
2. Or add sample data directly in `server/index.js`

## 🧪 Testing

### Sample Data

The app comes with pre-loaded sample datasets:
- **Sales Data**: Monthly revenue by region and product
- **Employee Data**: Department information with salaries

### Test Queries

Try these example queries:

```bash
# Sales queries
"Show me monthly sales revenue for Q3 broken down by region"
"What's our best performing product category?"
"Compare sales performance across all regions"

# Employee queries  
"Which department has the highest average salary?"
"Show me employee experience distribution"
"Plot salary vs experience levels"
```

## 🎨 UI Features

- **Modern Design**: Clean, professional interface
- **Loading States**: Smooth animations and progress indicators
- **Error Handling**: User-friendly error messages
- **Responsive Layout**: Works on desktop and mobile
- **Interactive Charts**: Hover tooltips and legends
- **Chat History**: Persistent conversation context


## 📝 License

MIT License - see LICENSE file for details


