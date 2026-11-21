import React from 'react';

const CalendarEventCard = ({ item }) => {
  const { content, color = '#e3f2fd' } = item;
  
  const getTimeRemaining = () => {
    if (!content.eventDate) return null;
    
    const now = new Date();
    const eventDate = new Date(content.eventDate);
    const diffMs = eventDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days ago`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Today!', isToday: true };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', isSoon: true };
    } else if (diffDays <= 7) {
      return { text: `In ${diffDays} days`, isSoon: true };
    } else {
      return { text: `In ${diffDays} days`, isLater: true };
    }
  };

  const timeRemaining = getTimeRemaining();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="calendar-event-card"
      style={{
        width: '280px',
        minHeight: '160px',
        backgroundColor: '#fff',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#333',
        position: 'relative',
        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.15), 0 2px 8px rgba(33, 150, 243, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid #e3f2fd'
      }}
    >
      {/* Header Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        padding: '16px 20px',
        color: '#fff',
        borderRadius: '12px 12px 0 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: '0',
            flex: 1
          }}>
            {content.title || 'Event Reminder'}
          </h3>
          <div style={{
            fontSize: '18px',
            opacity: 0.9
          }}>
            📅
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        padding: '20px'
      }}>

        {/* Time Remaining Badge */}
        {timeRemaining && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '16px',
            backgroundColor: timeRemaining.isOverdue ? '#ffebee' : 
                            timeRemaining.isToday ? '#e8f5e8' :
                            timeRemaining.isSoon ? '#fff3e0' : '#f3e5f5',
            color: timeRemaining.isOverdue ? '#d32f2f' :
                   timeRemaining.isToday ? '#2e7d32' :
                   timeRemaining.isSoon ? '#f57c00' : '#7b1fa2',
            border: `1px solid ${
              timeRemaining.isOverdue ? '#ffcdd2' :
              timeRemaining.isToday ? '#c8e6c9' :
              timeRemaining.isSoon ? '#ffe0b2' : '#e1bee7'
            }`
          }}>
            <span style={{ marginRight: '6px' }}>
              {timeRemaining.isOverdue ? '⚠️' : 
               timeRemaining.isToday ? '🎯' :
               timeRemaining.isSoon ? '⏰' : '📌'}
            </span>
            {timeRemaining.text}
          </div>
        )}

        {/* Date and Time Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '60px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#2196F3',
              lineHeight: '1'
            }}>
              {content.eventDate ? new Date(content.eventDate).getDate() : '--'}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '2px'
            }}>
              {content.eventDate ? new Date(content.eventDate).toLocaleDateString('en-US', { month: 'short' }) : 'Month'}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '4px'
            }}>
              {formatDate(content.eventDate)}
            </div>
            {content.eventTime && (
              <div style={{
                fontSize: '13px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                🕐 {formatTime(content.eventDate + 'T' + content.eventTime)}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {content.description && (
          <div style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#555',
            marginBottom: '12px',
            backgroundColor: '#f9f9f9',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #eee'
          }}>
            {content.description}
          </div>
        )}

        {/* Location */}
        {content.location && (
          <div style={{
            fontSize: '12px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f5f5f5',
            padding: '8px 12px',
            borderRadius: '6px'
          }}>
            📍 {content.location}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEventCard;