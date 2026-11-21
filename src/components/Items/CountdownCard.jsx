import React, { useState, useEffect } from 'react';

const CountdownCard = ({ item }) => {
  const { content, color = '#fff3e0' } = item;
  const [timeLeft, setTimeLeft] = useState({});
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!content.targetDate) return {};
      
      const difference = +new Date(content.targetDate) - +new Date();
      
      if (difference > 0) {
        setIsExpired(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        setIsExpired(true);
        return {};
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [content.targetDate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="countdown-card"
      style={{
        width: '280px',
        minHeight: '200px',
        background: isExpired 
          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
          : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '0',
        fontFamily: 'Monaco, "Lucida Console", monospace',
        color: '#fff',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        borderRadius: '16px'
      }}
    >
      {/* Digital display overlay */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '16px'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '15px',
          color: '#fff',
          opacity: 0.9,
          textAlign: 'center',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {content.title || 'Countdown Timer'}
        </div>

        {/* Digital Display */}
        {isExpired ? (
          <div style={{
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 0 20px rgba(255,255,255,0.5)',
              marginBottom: '10px'
            }}>
              EXPIRED
            </div>
            <div style={{
              fontSize: '18px',
              opacity: 0.8
            }}>
              🎉 Time's Up! 🎉
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {Object.keys(timeLeft).length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                width: '100%'
              }}>
                {[
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HRS', value: timeLeft.hours },
                  { label: 'MIN', value: timeLeft.minutes },
                  { label: 'SEC', value: timeLeft.seconds }
                ].map((unit) => (
                  <div key={unit.label} style={{
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '10px 5px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#fff',
                      fontFamily: 'Monaco, "Lucida Console", monospace',
                      textShadow: '0 0 10px rgba(255,255,255,0.3)'
                    }}>
                      {String(unit.value || 0).padStart(2, '0')}
                    </div>
                    <div style={{
                      fontSize: '8px',
                      color: '#fff',
                      opacity: 0.7,
                      marginTop: '2px',
                      letterSpacing: '0.5px'
                    }}>
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                color: '#fff',
                opacity: 0.7,
                fontSize: '14px'
              }}>
                No target date set
              </div>
            )}
          </div>
        )}

        {/* Bottom Info */}
        <div style={{
          textAlign: 'center',
          paddingTop: '15px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          {content.targetDate && (
            <div style={{
              fontSize: '11px',
              color: '#fff',
              opacity: 0.8,
              marginBottom: '4px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Target: {formatDate(content.targetDate)}
            </div>
          )}
          {content.description && (
            <div style={{
              fontSize: '10px',
              color: '#fff',
              opacity: 0.7,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {content.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountdownCard;