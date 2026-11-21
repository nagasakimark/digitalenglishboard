import React from 'react';

const ProgressCard = ({ item, onUpdate }) => {
  const { content, color = '#e8f5e8' } = item;
  const currentValue = content.currentValue || 0;
  const maxValue = content.maxValue || 100;
  const progressPercent = maxValue > 0 ? Math.min((currentValue / maxValue) * 100, 100) : 0;

  const handleProgressClick = (e) => {
    if (!onUpdate) return;
    
    const progressBar = e.currentTarget.querySelector('.progress-bar');
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newValue = Math.round((newPercent / 100) * maxValue);
    
    onUpdate(item.id, {
      content: {
        ...content,
        currentValue: newValue
      }
    });
  };

  const getProgressColor = () => {
    if (progressPercent >= 100) return '#4caf50'; // Green for complete
    if (progressPercent >= 75) return '#8bc34a';  // Light green
    if (progressPercent >= 50) return '#ff9800';  // Orange
    if (progressPercent >= 25) return '#ffc107';  // Yellow
    return '#f44336'; // Red for low progress
  };

  return (
    <div
      className="progress-card"
      style={{
        width: '280px',
        minHeight: '180px',
        background: '#f4f1e8',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}
    >
      {/* Paper texture overlay */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: `
          radial-gradient(circle at 20% 20%, rgba(139,69,19,0.03) 1px, transparent 1px),
          radial-gradient(circle at 80% 80%, rgba(139,69,19,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '15px 15px',
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '4px',
              color: '#333',
              opacity: 0.9
            }}>
              {content.title || 'Progress Tracker'}
            </h3>
            {content.description && (
              <div style={{
                fontSize: '12px',
                color: '#666',
                opacity: 0.8
              }}>
                {content.description}
              </div>
            )}
          </div>
          <div style={{
            fontSize: '20px',
            opacity: 0.8
          }}>
            📊
          </div>
        </div>

        {/* Circular Progress */}
        <div style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Background circle */}
          <svg width="100" height="100" style={{ position: 'absolute' }}>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#4caf50"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercent / 100)}`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                transform: 'rotate(-90deg)',
                transformOrigin: '50px 50px'
              }}
            />
          </svg>
          
          {/* Center content */}
          <div style={{
            textAlign: 'center',
            zIndex: 3
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              lineHeight: '1'
            }}>
              {Math.round(progressPercent)}%
            </div>
            <div style={{
              fontSize: '10px',
              opacity: 0.8,
              marginTop: '2px'
            }}>
              {currentValue}/{maxValue}
            </div>
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div 
          onClick={handleProgressClick}
          style={{
            cursor: onUpdate ? 'pointer' : 'default',
            marginBottom: '16px'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#666'
            }}>
              Progress
            </span>
            <span style={{
              fontSize: '12px',
              color: '#666'
            }}>
              {content.unit || 'items'}
            </span>
          </div>
          
          <div 
            className="progress-bar"
            style={{
              height: '8px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div style={{
              height: '100%',
              backgroundColor: '#4caf50',
              width: `${progressPercent}%`,
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }} />
          </div>
        </div>

        {/* Status */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          {progressPercent >= 100 ? (
            <>🎉 Complete!</>
          ) : (
            <>{maxValue - currentValue} remaining</>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;