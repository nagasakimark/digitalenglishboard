import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import TextWithTranslation from '../TextWithTranslation';

const CalendarEvent = ({ item }) => {
  const { content } = item;
  const { title = 'Event', date, time, location, description, eventDate, eventTime } = content;
  
  // Support both date/time and eventDate/eventTime formats
  const actualDate = date || eventDate;
  const actualTime = time || eventTime;

  const getTimeUntil = (dateStr) => {
    if (!dateStr) return '';
    
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Past event';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="calendar-event"
      style={{
        width: '240px',
        minHeight: '180px',
        backgroundColor: '#FFF9F0',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        border: '3px solid #E8A87C',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Header with countdown */}
      <div style={{
        backgroundColor: '#FFE8D6',
        padding: '16px',
        borderBottom: '3px solid #E8A87C'
      }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#C85A28', 
          marginBottom: '4px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {getTimeUntil(actualDate)}
        </div>
        <h3 style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Georgia, serif'
        }}>
          <TextWithTranslation text={title} />
        </h3>
      </div>

      {/* Event details */}
      <div style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
        {actualDate && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '10px',
            color: '#333'
          }}>
            <Calendar size={16} color="#C85A28" />
            <span style={{ fontSize: '14px' }}>{formatDate(actualDate)}</span>
          </div>
        )}

        {actualTime && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '10px',
            color: '#333'
          }}>
            <Clock size={16} color="#C85A28" />
            <span style={{ fontSize: '14px' }}>{actualTime}</span>
          </div>
        )}

        {location && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '10px',
            color: '#333'
          }}>
            <MapPin size={16} color="#C85A28" />
            <span style={{ fontSize: '14px' }}>{location}</span>
          </div>
        )}

        {description && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #FFE8D6',
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.4',
            fontStyle: 'italic'
          }}>
            <TextWithTranslation text={description} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEvent;
