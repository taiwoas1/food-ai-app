const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const { getCalories } = require('./nutritionData');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const scanSchema = new mongoose.Schema({
  foodName: String,
  confidence: String,
  calories: mongoose.Schema.Types.Mixed,
  protein: String,
  carbs: String,
  fat: String,
  timestamp: { type: Date, default: Date.now },
});

const Scan = mongoose.model('Scan', scanSchema);

const NON_FOOD = [
  'chair', 'table', 'phone', 'car', 'computer', 'book',
  'bottle', 'bag', 'shoe', 'clothing', 'furniture',
  'vehicle', 'electronic', 'instrument', 'paper',
  'dog', 'cat', 'bird', 'fish', 'animal', 'pet',
  'flower', 'tree', 'grass', 'plant', 'soil', 'rock',
  'person', 'face', 'hand', 'human', 'people',
  'building', 'house', 'room', 'wall', 'floor',
  'sky', 'cloud', 'water', 'road', 'sign',
]

function isEdible(name) {
  return !NON_FOOD.some(keyword => name.toLowerCase().includes(keyword))
}

async function checkIfFood(body, apiKey) {
  const [generalRes, foodRes] = await Promise.all([
    axios.post(
      'https://api.clarifai.com/v2/users/clarifai/apps/main/models/general-image-recognition/outputs',
      body,
      { headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' } }
    ),
    axios.post(
      'https://api.clarifai.com/v2/users/clarifai/apps/main/models/food-item-recognition/outputs',
      body,
      { headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' } }
    )
  ])

  const generalConcepts = generalRes.data?.outputs?.[0]?.data?.concepts || []
  const foodConcepts = foodRes.data?.outputs?.[0]?.data?.concepts || []

  const topFoodConfidence = foodConcepts[0]?.value || 0
  const topGeneralConfidence = generalConcepts[0]?.value || 0

  console.log('Top food result:', foodConcepts[0]?.name, (topFoodConfidence * 100).toFixed(1) + '%')
  console.log('Top general result:', generalConcepts[0]?.name, (topGeneralConfidence * 100).toFixed(1) + '%')

  const foodRatio = topFoodConfidence / (topGeneralConfidence || 1)
  const passesAI = topFoodConfidence > 0.1 && foodRatio > 0.3
  const passesKeyword = isEdible(foodConcepts[0]?.name || '')
  const isFood = passesAI && passesKeyword

  console.log('Food ratio:', foodRatio.toFixed(2), '| Is food:', isFood)

  return { isFood, foodConcepts }
}

app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!' })
})

app.post('/image-recognition', async (req, res) => {
  try {
    console.log('Request received')
    const apiKey = process.env.REACT_APP_CLARIFAI_KEY
    console.log('Clarifai Key:', apiKey ? 'Found' : 'NOT FOUND')
    console.log('MongoDB:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected')

    const { isFood, foodConcepts } = await checkIfFood(req.body, apiKey)

    if (!isFood) {
      return res.json({
        enriched: [],
        isFood: false,
        message: 'Non-food item detected. Please take a photo of food.',
      })
    }

    // ← CHANGED: uses getCalories instead of getNutrition (USDA removed)
    const enriched = foodConcepts
      .filter(item => item.value > 0.1)
      .filter(item => isEdible(item.name))
      .slice(0, 3)
      .map(item => ({
        name: item.name,
        confidence: (item.value * 100).toFixed(1),
        nutrition: getCalories(item.name), // ← uses nutritionData.js directly
      }))

    if (enriched.length === 0) {
      return res.json({
        enriched: [],
        isFood: true,
        message: 'Could not identify food. Please try again.',
      })
    }

    const topResult = enriched[0]
    await Scan.create({
      foodName: topResult.name,
      confidence: topResult.confidence,
      calories: topResult.nutrition.calories,
      protein: topResult.nutrition.protein,
      carbs: topResult.nutrition.carbs,
      fat: topResult.nutrition.fat,
    })
    console.log('Scan saved to MongoDB:', topResult.name)

    res.json({ enriched, isFood: true })

  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
    res.status(500).json({ error: error.response?.data || error.message })
  }
})

app.post('/log-usage', (req, res) => {
  const { foodName, calories, timestamp } = req.body
  usageData.push({ foodName, calories, timestamp })
  console.log('Usage logged:', foodName, '- Calories:', calories)
  res.json({ success: true })
})

app.get('/scans', async (req, res) => {
  try {
    const scans = await Scan.find().sort({ timestamp: -1 })
    res.json(scans)
  } catch (error) {
    console.error('Error fetching scans:', error.message)
    res.status(500).json({ error: error.message })
  }
})

app.get('/usage-stats', async (req, res) => {
  try {
    const scans = await Scan.find()
    const foodFrequency = {}
    scans.forEach(scan => {
      foodFrequency[scan.foodName] = (foodFrequency[scan.foodName] || 0) + 1
    })
    res.json({
      totalScans: scans.length,
      foodFrequency,
      allEntries: scans,
    })
  } catch (error) {
    console.error('Error fetching stats:', error.message)
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`)
})