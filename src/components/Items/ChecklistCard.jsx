import React, { useState } from 'react';

const ChecklistCard = ({ item, onUpdate }) => {
  const { content, color = '#fff9c4' } = item;
  const checklist = content.checklist || [];

  const handleToggleItem = (index) => {
    if (!onUpdate) return;
    
    const updatedChecklist = checklist.map((checkItem, i) => 
      i === index ? { ...checkItem, completed: !checkItem.completed } : checkItem
    );
    
    onUpdate(item.id, {
      content: {
        ...content,
        checklist: updatedChecklist
      }
    });
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;

  return (
    <div
      className="checklist-card"
      style={{
        width: '280px',
        minHeight: '220px',
        backgroundColor: '#ffffff',
        padding: '0',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        color: '#333',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        background: `linear-gradient(to right, #f8f9fa 0px, #f8f9fa 40px, #ffffff 40px)`
      }}
    >
      {/* Red margin line (notebook style) */}
      <div style={{
        position: 'absolute',
        left: '40px',
        top: '0',
        bottom: '0',
        width: '1px',
        backgroundColor: '#ff6b6b',
        opacity: 0.8
      }} />

      {/* Hole punches */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: '20px',
          top: `${i * 60}px`,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }} />
      ))}

      {/* Content Container */}
      <div style={{
        padding: '20px 20px 20px 60px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '15px',
          color: '#1a1a1a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{content.title || 'Checklist'}</span>
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#666',
            background: '#f0f0f0',
            padding: '4px 8px',
            borderRadius: '8px'
          }}>
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Checklist Items */}
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {checklist.length > 0 ? checklist.map((checkItem, index) => (
            <div
              key={index}
              onClick={() => handleToggleItem(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #4285f4',
                borderRadius: '4px',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: checkItem.completed ? '#4285f4' : '#fff',
                color: checkItem.completed ? '#fff' : 'transparent',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}>
                {checkItem.completed ? '✓' : ''}
              </div>
              <span style={{
                textDecoration: checkItem.completed ? 'line-through' : 'none',
                color: checkItem.completed ? '#666' : '#333',
                fontSize: '14px',
                flex: 1,
                fontWeight: checkItem.completed ? '400' : '500'
              }}>
                {checkItem.text}
              </span>
            </div>
          )) : (
            <div style={{
              color: '#999',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px 0'
            }}>
              No items in checklist
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div style={{
            marginTop: '15px',
            height: '6px',
            backgroundColor: '#e8eaed',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#4285f4',
              width: `${(completedCount / totalCount) * 100}%`,
              transition: 'width 0.3s ease',
              borderRadius: '3px'
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistCard;