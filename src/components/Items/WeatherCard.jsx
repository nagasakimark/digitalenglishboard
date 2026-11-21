import React from 'react';

const WeatherCard = ({ item }) => {
  const { content } = item;
  
  const getWeatherIcon = (condition) => {
    const conditions = {
      'sunny': '☀️',
      'rainy': '🌧️',
      'cloudy': '☁️',
      'snowy': '❄️',
      'windy': '💨',
      'stormy': '⛈️'
    };
    return conditions[condition?.toLowerCase()] || '🌤️';
  };

  const getTemperatureIcon = (temp) => {
    const temperatures = {
      'hot': '🔥',
      'warm': '🌡️',
      'chilly': '🧊',
      'cold': '❄️'
    };
    return temperatures[temp?.toLowerCase()] || '🌡️';
  };

  const getWeatherColor = (condition) => {
    const colors = {
      'sunny': '#fff8e1',
      'rainy': '#e3f2fd',
      'cloudy': '#f5f5f5',
      'snowy': '#e8f5e8',
      'windy': '#f3e5f5',
      'stormy': '#e1f5fe'
    };
    return colors[condition?.toLowerCase()] || color;
  };

  const cardColor = content.condition ? getWeatherColor(content.condition) : '#e3f2fd';
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="weather-card"
      style={{
        width: '280px',
        height: '200px',
        background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}cc 50%, ${cardColor}aa 100%)`,
        borderRadius: '20px',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#fff',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      {/* Glass morphism overlay */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        height: '100%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              opacity: 0.9,
              marginBottom: '2px'
            }}>
              {content.location || 'Your Location'}
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.7
            }}>
              {currentTime}
            </div>
          </div>
          <div style={{
            fontSize: '10px',
            opacity: 0.7,
            textAlign: 'right'
          }}>
            {content.lastUpdated && 
              new Date(content.lastUpdated).toLocaleDateString()
            }
          </div>
        </div>

        {/* Main Weather Display */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Temperature */}
          <div>
            <div style={{
              fontSize: '48px',
              fontWeight: '300',
              lineHeight: '1',
              marginBottom: '5px'
            }}>
              {content.temperatureValue || '--'}°
            </div>
            <div style={{
              fontSize: '14px',
              opacity: 0.8,
              textTransform: 'capitalize'
            }}>
              {content.condition ? `It's ${content.condition}` : 'No data'}
            </div>
            {content.temperature && (
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                textTransform: 'capitalize'
              }}>
                Feels {content.temperature}
              </div>
            )}
          </div>

          {/* Weather Icon */}
          <div style={{
            fontSize: '64px',
            opacity: 0.9,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {getWeatherIcon(content.condition)}
          </div>
        </div>

        {/* Bottom Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            fontSize: '12px',
            opacity: 0.8
          }}>
            {content.title || 'Weather'}
          </div>
          {content.notes && (
            <div style={{
              fontSize: '10px',
              opacity: 0.7,
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {content.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;