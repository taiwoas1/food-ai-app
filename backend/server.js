const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

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
  calories: String,
  protein: String,
  carbs: String,
  fat: String,
  count: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now },
});

const Scan = mongoose.model('Scan', scanSchema);

app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!' })
})


app.post('/log-usage', async (req, res) => {
  try {
    const { foodName, calories, protein, carbs, fat, confidence, count, timestamp } = req.body

    await Scan.create({
      foodName,
      confidence,
      calories,
      protein,
      carbs,
      fat,
      count: count || 1,
      timestamp: timestamp || new Date(),
    })

    console.log('Scan saved to MongoDB:', foodName, '- Calories:', calories)
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving scan:', error.message)
    res.status(500).json({ error: error.message })
  }
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