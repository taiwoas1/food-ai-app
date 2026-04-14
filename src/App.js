import React, { useState, useRef } from 'react';
import { identifyFood, isEdible } from './services/foodRecognition';
import { getCalories } from './services/nutritionData';
import './App.css';

function App() {
  const [imageURL, setImageURL] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dailyLog, setDailyLog] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageURL(url);
    setResults(null);
    setError(null);
    setFeedback(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      setImageBase64(base64);
    };
    img.src = url;
  };

  const handleIdentify = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const foodResults = await identifyFood(imageBase64);

      if (!isEdible(foodResults[0].name)) {
        setError('⚠️ This does not appear to be food. Please upload a food image.');
        setLoading(false);
        return;
      }

      const nutrition = getCalories(foodResults[0].name);

      // Log usage to backend
      await fetch('http://localhost:5000/log-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: foodResults[0].name,
          calories: nutrition.calories,
          timestamp: new Date().toISOString(),
        }),
      });

      setResults({
        food: foodResults,
        nutrition: nutrition,
      });

    } catch (err) {
      setError('Could not identify food. Please try another image.');
      console.error(err);
    }

    setLoading(false);
  };

  const addToLog = () => {
    if (!results) return;

    const entry = {
      name: results.food[0].name,
      calories: results.nutrition.calories,
      protein: results.nutrition.protein,
      carbs: results.nutrition.carbs,
      fat: results.nutrition.fat,
      time: new Date().toLocaleTimeString(),
    };

    setDailyLog([...dailyLog, entry]);
    setTotalCalories(totalCalories + (Number(results.nutrition.calories) || 0));
  };

  const clearLog = () => {
    setDailyLog([]);
    setTotalCalories(0);
  };

  return (
    <div className="App">
      <h1>🍎 Food.AI</h1>
      <p>Upload a food photo to identify it and track your nutrition</p>

      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
      </div>

      {imageURL && (
        <div className="image-preview">
          <img
            src={imageURL}
            alt="Food"
            style={{ maxWidth: '300px', marginTop: '20px' }}
            crossOrigin="anonymous"
          />
          <br />
          <button onClick={handleIdentify} disabled={loading}>
            {loading ? 'Identifying...' : 'Identify Food'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results && (
        <div className="results">
          <h2>🔍 Food Detected:</h2>
          {results.food.map((item, i) => (
            <p key={i}>
              <strong>{item.name}</strong> — {item.confidence}% confidence
            </p>
          ))}

          <h2>🔥 Nutrition Info (per serving):</h2>
          <p>Calories: <strong>{results.nutrition.calories} kcal</strong></p>
          <p>Protein: <strong>{results.nutrition.protein}</strong></p>
          <p>Carbs: <strong>{results.nutrition.carbs}</strong></p>
          <p>Fat: <strong>{results.nutrition.fat}</strong></p>

          <button onClick={addToLog}>➕ Add to Daily Log</button>

          <div className="feedback">
            <p>Was this identification accurate?</p>
            <button onClick={() => setFeedback('yes')}>✅ Yes</button>
            <button onClick={() => setFeedback('no')}>❌ No</button>
            {feedback && (
              <p>Thanks for your feedback!
                {feedback === 'no' && ' We will use this to improve accuracy.'}
              </p>
            )}
          </div>
        </div>
      )}

      {dailyLog.length > 0 && (
        <div className="daily-log">
          <h2>📋 Daily Food Log</h2>
          <h3>Total Calories Today: <strong>{totalCalories} kcal</strong></h3>
          {dailyLog.map((entry, i) => (
            <div key={i} className="log-entry"
              style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
              <p><strong>{entry.name}</strong> — {entry.calories} kcal — {entry.time}</p>
              <p>Protein: {entry.protein} | Carbs: {entry.carbs} | Fat: {entry.fat}</p>
            </div>
          ))}
          <button onClick={clearLog} style={{ marginTop: '10px', color: 'red' }}>
            🗑️ Clear Log
          </button>
        </div>
      )}
    </div>
  );
}

export default App;