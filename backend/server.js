const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { getCalories } = require('./nutritionData');
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Store usage data
const usageData = [];

app.post('/image-recognition', async (req, res) => {
  try {
    console.log('Request received');
    console.log('API Key:', process.env.REACT_APP_CLARIFAI_KEY ? 'Found' : 'NOT FOUND');

    const response = await axios.post(
      'https://api.clarifai.com/v2/users/clarifai/apps/main/models/food-item-recognition/outputs',
      req.body,
      {
        headers: {
          'Authorization': `Key ${process.env.REACT_APP_CLARIFAI_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Clarifai status:', response.status);
    console.log('Clarifai response:', JSON.stringify(response.data).slice(0, 500));
    res.json(response.data);

  } catch (error) {
    console.error('Clarifai error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Log user behaviour
app.post('/log-usage', (req, res) => {
  const { foodName, calories, timestamp } = req.body;
  usageData.push({ foodName, calories, timestamp });
  console.log('Usage logged:', foodName, '- Calories:', calories);
  res.json({ success: true });
});

// Get usage stats
app.get('/usage-stats', (req, res) => {
  const foodFrequency = {};
  usageData.forEach(entry => {
    foodFrequency[entry.foodName] = (foodFrequency[entry.foodName] || 0) + 1;
  });
  res.json({
    totalScans: usageData.length,
    foodFrequency,
    allEntries: usageData,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Backend server running on port ${PORT}');
});
