const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to get list of property JSON files
app.get('/Links-scraped-json', (req, res) => {
  try {
    const propertyListPath = path.join(__dirname, 'public', 'data', 'property-list.txt');
    
    if (!fs.existsSync(propertyListPath)) {
      return res.status(404).json({ error: 'Property list file not found' });
    }

    const propertyList = fs.readFileSync(propertyListPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim() + '.json');

    res.json(propertyList);
  } catch (error) {
    console.error('Error reading property list:', error);
    res.status(500).json({ error: 'Failed to read property list' });
  }
});

// API endpoint to get specific property JSON file
app.get('/Links-scraped-json/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', 'data', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Property file not found' });
    }

    const propertyData = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(propertyData);
    
    res.json(parsedData);
  } catch (error) {
    console.error('Error reading property file:', error);
    res.status(500).json({ error: 'Failed to read property file' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Property Management Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Property Management Server running on port ${PORT}`);
});