import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ item }) => {
  const { content } = item;
  const { title = 'Countdown', targetDate } = content;
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isExpired = totalSeconds === 0 && targetDate;

  return (
    <div
      className="countdown-timer"
      style={{
        width: '260px',
        backgroundColor: '#FCE4EC',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #F48FB1',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        justifyContent: 'center',
        paddingBottom: '12px',
        borderBottom: '2px solid #EC407A'
      }}>
        <Clock size={20} color="#C2185B" />
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
      </div>

      {isExpired ? (
        <div style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#D32F2F',
          padding: '20px 0',
          fontFamily: 'Georgia, serif'
        }}>
          TIME'S UP!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}>
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Mins' },
            { value: timeLeft.seconds, label: 'Secs' }
          ].map((unit, index) => (
            <div key={index} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              padding: '12px 8px',
              textAlign: 'center',
              border: '1px solid #F8BBD0',
              boxShadow: '1px 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#C2185B',
                marginBottom: '4px',
                fontFamily: 'Georgia, serif'
              }}>
                {String(unit.value).padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
