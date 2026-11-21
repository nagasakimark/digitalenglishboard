import React, { useState } from 'react';
import { Check } from 'lucide-react';

const ChecklistItem = ({ item }) => {
  const { content } = item;
  const { title = 'Checklist', tasks = [] } = content;

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className="checklist-item"
      style={{
        width: '220px',
        minHeight: '180px',
        backgroundColor: '#FFF9E6',
        padding: '16px',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #E8D7B0'
      }}
    >
      <h3 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '16px', 
        fontWeight: 'bold',
        color: '#333',
        borderBottom: '2px solid #D4AF37',
        paddingBottom: '8px'
      }}>
        {title}
      </h3>

      <div style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px'
        }}>
          {completedCount} of {totalCount} completed
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#E8D7B0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map((task, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px',
              backgroundColor: task.completed ? '#F0F0F0' : 'white',
              borderRadius: '4px',
              border: '1px solid #DDD'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              border: '2px solid #4CAF50',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: task.completed ? '#4CAF50' : 'white',
              flexShrink: 0
            }}>
              {task.completed && <Check size={14} color="white" />}
            </div>
            <span style={{
              fontSize: '13px',
              color: task.completed ? '#999' : '#333',
              textDecoration: task.completed ? 'line-through' : 'none',
              wordBreak: 'break-word'
            }}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistItem;
