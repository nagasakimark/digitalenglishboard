import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import ImageLightbox from '../Lightbox/ImageLightbox';
import TextWithTranslation from '../TextWithTranslation';
import borderImage from '../../assets/border.jpg';

const CalendarCard = ({ item }) => {
  const { content, color = '#f8f9fa' } = item;
  const [selectedDay, setSelectedDay] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Parse the month/year from content or use current
  const targetDate = content.month ? new Date(content.month + '-01') : new Date();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get events for the month
  const events = content.events || {};

  const getDayEvent = (day) => {
    const dayKey = day.toString().padStart(2, '0');
    return events[dayKey];
  };

  const handleDayClick = (day) => {
    const event = getDayEvent(day);
    if (event) {
      setSelectedDay({ day, event });
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const currentDay = today.getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'transparent'
        }} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const event = getDayEvent(day);
      const isToday = isCurrentMonth && day === currentDay;
      const hasEvent = !!event;

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: isToday ? 'bold' : hasEvent ? '600' : 'normal',
            backgroundColor: isToday ? '#8B4513' : hasEvent ? '#D2691E' : 'transparent',
            color: isToday ? '#fff' : hasEvent ? '#fff' : '#333',
            cursor: hasEvent ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            position: 'relative',
            borderRadius: isToday ? '50%' : '4px',
            border: isToday ? '2px solid #5D4037' : 'none'
          }}
          onMouseEnter={(e) => {
            if (hasEvent && !isToday) {
              e.target.style.backgroundColor = '#A0522D';
              e.target.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (hasEvent && !isToday) {
              e.target.style.backgroundColor = '#D2691E';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          {day}
          {hasEvent && !isToday && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '4px',
              height: '4px',
              backgroundColor: '#fff',
              borderRadius: '50%'
            }} />
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div
      className="calendar-card"
      style={{
        width: '300px',
        minHeight: '280px',
        backgroundColor: '#FFF9F0', // Paper color
        padding: '0',
        fontFamily: 'Georgia, serif',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'visible',
        borderRadius: '4px',
        border: '8px solid #8B4513', // Wood frame
        borderImage: `url(${borderImage}) 30 round`, // Try to use existing asset if possible, fallback to color
      }}
    >
      {/* Calendar top binding with spiral - Updated to look more like a hanging calendar */}
      <div style={{
        background: '#5D4037',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderBottom: '2px solid #3E2723'
      }}>
        <div style={{
          color: '#EFEBE9',
          fontWeight: 'bold',
          fontSize: '14px',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {monthNames[month]} {year}
        </div>
        
        {/* Hanging hole */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '12px',
          height: '12px',
          backgroundColor: '#333',
          borderRadius: '50%',
          border: '2px solid #8B4513',
          zIndex: 10
        }} />
      </div>

      {/* Calendar content */}
      <div style={{
        padding: '12px',
        background: '#FFF9F0'
      }}>
        {/* Day Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          marginBottom: '8px',
          borderBottom: '1px solid #D7CCC8',
          paddingBottom: '4px'
        }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#5D4037',
              padding: '2px'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
        }}>
          {renderCalendarDays()}
        </div>
      </div>

      {/* Event Modal - Updated to be cleaner and more modern */}
      {selectedDay && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  <TextWithTranslation text={selectedDay.event.title || 'Event Details'} />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {monthNames[month]} {selectedDay.day}, {year}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="flex flex-col gap-8">
                
                {/* Description */}
                {selectedDay.event.description && (
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                      <TextWithTranslation text={selectedDay.event.description} />
                    </p>
                  </div>
                )}

                {/* Images Gallery */}
                {(() => {
                  const images = selectedDay.event.images || (selectedDay.event.image ? [selectedDay.event.image] : []);
                  if (images.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Gallery ({images.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((img, index) => (
                          <div 
                            key={index}
                            onClick={() => setLightboxImage({ url: img, title: selectedDay.event.title })}
                            className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                          >
                            <img
                              src={img}
                              alt={`${selectedDay.event.title} ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-full p-2 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Empty State */}
                {!selectedDay.event.description && (!selectedDay.event.images && !selectedDay.event.image) && (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                      📝
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Details Yet
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Use the editor sidebar to add a description and photo gallery to this event.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
              <span></span>
              {selectedDay.event.time && (
                <span className="font-medium text-gray-700 bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">
                  Time: {selectedDay.event.time}
                </span>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox for full screen images */}
      <ImageLightbox 
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage?.url}
        title={lightboxImage?.title}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

export default CalendarCard;