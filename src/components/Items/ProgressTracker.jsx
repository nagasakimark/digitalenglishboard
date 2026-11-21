import React from 'react';
import { TrendingUp } from 'lucide-react';

const ProgressTracker = ({ item }) => {
  const { content } = item;
  const { 
    title = 'Progress', 
    current = 0, 
    total = 100, 
    unit = 'items',
    description = ''
  } = content;

  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  const getProgressColor = (percent) => {
    if (percent < 33) return '#CD5C5C';
    if (percent < 66) return '#DAA520';
    return '#6B8E23';
  };

  return (
    <div
      className="progress-tracker"
      style={{
        width: '240px',
        backgroundColor: '#FFF3E0',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #FFB74D',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid #FB8C00'
      }}>
        <TrendingUp size={20} color={getProgressColor(percentage)} />
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: getProgressColor(percentage),
          lineHeight: 1,
          fontFamily: 'Georgia, serif'
        }}>
          {Math.round(percentage)}%
        </div>
        <div style={{
          fontSize: '13px',
          color: '#666',
          marginTop: '4px'
        }}>
          {current} of {total} {unit}
        </div>
      </div>

      <div style={{
        width: '100%',
        height: '12px',
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '12px',
        border: '1px solid #E8D7B0'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: getProgressColor(percentage),
          transition: 'width 0.3s ease, background-color 0.3s ease',
          borderRadius: '6px'
        }} />
      </div>

      {description && (
        <div style={{
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          {description}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
