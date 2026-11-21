// Weather widget editor
import React, { useState, useEffect } from 'react';

const WeatherEditor = ({ item, onUpdate }) => {
  const [location, setLocation] = useState(item.content.location || '');

  useEffect(() => {
    setLocation(item.content.location || '');
  }, [item.id]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Location (Get Live Weather)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => {
              onUpdate(item.id, {
                content: { ...item.content, location }
              });
            }}
            placeholder="Enter city name (e.g., London, Tokyo)"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={async () => {
              const locationToFetch = location;
              if (!locationToFetch) {
                alert('Please enter a location first');
                return;
              }
              
              try {
                // Using Open-Meteo API (free, no API key required)
                // First, geocode the location
                const geoResponse = await fetch(
                  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationToFetch)}&count=1&language=en&format=json`
                );
                const geoData = await geoResponse.json();
                
                if (!geoData.results || geoData.results.length === 0) {
                  alert('Location not found. Please try a different city name.');
                  return;
                }
                
                const { latitude, longitude, name } = geoData.results[0];
                
                // Fetch weather data using coordinates
                const weatherResponse = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
                );
                const weatherData = await weatherResponse.json();
                
                // Map weather codes to conditions
                const weatherCode = weatherData.current.weather_code;
                let condition = 'sunny';
                if (weatherCode === 0) condition = 'sunny';
                else if ([1, 2, 3].includes(weatherCode)) condition = 'cloudy';
                else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) condition = 'rainy';
                else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) condition = 'snowy';
                else if ([95, 96, 99].includes(weatherCode)) condition = 'stormy';
                
                const temp = Math.round(weatherData.current.temperature_2m);
                const tempFeel = temp > 25 ? 'hot' : temp > 15 ? 'warm' : temp > 5 ? 'chilly' : 'cold';
                
                setLocation(name);
                onUpdate(item.id, {
                  content: {
                    ...item.content,
                    location: name,
                    condition,
                    temperature: tempFeel,
                    temperatureValue: temp,
                    lastUpdated: new Date().toISOString()
                  }
                });
              } catch (error) {
                console.error('Weather fetch error:', error);
                alert('Unable to fetch weather data. Please check your internet connection or try again later.');
              }
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap"
          >
            Get Weather
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Click "Get Weather" to fetch live data, or use manual controls below
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Manual Condition</label>
        <select
          value={item.content.condition || ''}
          onChange={(e) => onUpdate(item.id, {
            content: { ...item.content, condition: e.target.value }
          })}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="sunny">Sunny</option>
          <option value="rainy">Rainy</option>
          <option value="cloudy">Cloudy</option>
          <option value="snowy">Snowy</option>
          <option value="windy">Windy</option>
          <option value="stormy">Stormy</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
        <input
          type="number"
          value={item.content.temperatureValue || ''}
          onChange={(e) => onUpdate(item.id, {
            content: { ...item.content, temperatureValue: parseInt(e.target.value) }
          })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default WeatherEditor;
