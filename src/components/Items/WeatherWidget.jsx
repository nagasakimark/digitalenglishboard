import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, CloudLightning, MapPin } from 'lucide-react';

const WeatherWidget = ({ item, onUpdate }) => {
  const { content } = item;
  const {
    location = 'Unknown',
    condition = 'sunny',
    temperature = 20,
    temperatureValue = 20,
    description = ''
  } = content;

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editLocation, setEditLocation] = useState(location);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch weather data from Open-Meteo
  const fetchWeather = async (locationName) => {
    if (!locationName || locationName === 'Unknown') return;

    setIsLoading(true);
    try {
      // First, geocode the location using Open-Meteo's geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        console.error('Location not found');
        setIsLoading(false);
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
      let newCondition = 'sunny';
      if (weatherCode === 0) newCondition = 'sunny';
      else if ([1, 2, 3].includes(weatherCode)) newCondition = 'cloudy';
      else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) newCondition = 'rainy';
      else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) newCondition = 'snowy';
      else if ([95, 96, 99].includes(weatherCode)) newCondition = 'stormy';

      const temp = Math.round(weatherData.current.temperature_2m);

      // Update the item
      if (onUpdate) {
        onUpdate(item.id, {
          content: {
            ...content,
            location: name,
            condition: newCondition,
            temperature: temp,
            temperatureValue: temp,
            lastUpdated: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh weather on mount if location is set
  useEffect(() => {
    if (location && location !== 'Unknown') {
      // Check if data is stale (older than 1 hour)
      const lastUpdate = content.lastUpdated ? new Date(content.lastUpdated) : new Date(0);
      const now = new Date();
      const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

      if (hoursSinceUpdate > 1) {
        console.log('Weather data stale, refreshing...');
        fetchWeather(location);
      }
    }
  }, []); // Run once on mount

  const handleLocationSubmit = () => {
    setIsEditingLocation(false);
    if (editLocation && editLocation !== location) {
      fetchWeather(editLocation);
    }
  };

  const getWeatherIcon = (condition) => {
    const iconProps = { size: 48, strokeWidth: 1.5 };
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun {...iconProps} color="#F4A460" />;
      case 'rainy': return <CloudRain {...iconProps} color="#6B8E23" />;
      case 'cloudy': return <Cloud {...iconProps} color="#8B7355" />;
      case 'snowy': return <CloudSnow {...iconProps} color="#B0C4DE" />;
      case 'windy': return <Wind {...iconProps} color="#8B7355" />;
      case 'stormy': return <CloudLightning {...iconProps} color="#696969" />;
      default: return <Sun {...iconProps} color="#F4A460" />;
    }
  };

  const getTemperatureDescription = (temp) => {
    if (temp < 0) return "It's freezing";
    if (temp < 10) return "It's cold";
    if (temp < 18) return "It's chilly";
    if (temp < 25) return "It's warm";
    if (temp < 32) return "It's hot";
    return "It's very hot";
  };

  const getConditionDescription = (condition) => {
    return `It's ${condition.toLowerCase()}`;
  };

  return (
    <div
      className="weather-widget"
      style={{
        width: '220px',
        backgroundColor: '#E8F4F8',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #81D4FA',
        fontFamily: 'Arial, sans-serif',
        position: 'relative'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          zIndex: 10
        }}>
          <div style={{ fontSize: '14px', color: '#0277BD' }}>Loading...</div>
        </div>
      )}

      <div
        className="no-drag"
        style={{
          fontSize: '14px',
          color: '#0277BD',
          marginBottom: '12px',
          textAlign: 'center',
          fontWeight: '600',
          borderBottom: '1px solid #81D4FA',
          paddingBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsEditingLocation(true);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <MapPin size={14} />
        {isEditingLocation ? (
          <input
            type="text"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            onBlur={handleLocationSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLocationSubmit();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: '600',
              color: '#0277BD',
              textAlign: 'center',
              outline: 'none',
              width: '140px'
            }}
          />
        ) : (
          <span>{location}</span>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        {getWeatherIcon(condition)}
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#0277BD',
          marginBottom: '4px',
          fontFamily: 'Georgia, serif'
        }}>
          {temperatureValue || temperature}°C
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666',
          textTransform: 'capitalize'
        }}>
          {condition}
        </div>
      </div>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '4px',
        padding: '12px',
        fontSize: '13px',
        color: '#555',
        textAlign: 'center',
        lineHeight: '1.4',
        border: '1px solid #B3E5FC'
      }}>
        {getConditionDescription(condition)}. {getTemperatureDescription(temperatureValue || temperature)}.
      </div>
    </div>
  );
};

export default WeatherWidget;
