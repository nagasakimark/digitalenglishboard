// Calendar event editor
import React, { useState, useEffect } from 'react';

const CalendarEventEditor = ({ item, onUpdate }) => {
  const [localState, setLocalState] = useState({
    title: item.content.title || 'Event',
    eventDate: item.content.eventDate || '',
    eventTime: item.content.eventTime || '',
    description: item.content.description || '',
    location: item.content.location || ''
  });

  useEffect(() => {
    setLocalState({
      title: item.content.title || 'Event',
      eventDate: item.content.eventDate || '',
      eventTime: item.content.eventTime || '',
      description: item.content.description || '',
      location: item.content.location || ''
    });
  }, [item.id]);

  const handleBlur = () => {
    onUpdate(item.id, {
      content: {
        ...item.content,
        title: localState.title,
        eventDate: localState.eventDate,
        eventTime: localState.eventTime,
        description: localState.description,
        location: localState.location
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Event Name</label>
        <input
          type="text"
          value={localState.title}
          onChange={(e) => setLocalState({ ...localState, title: e.target.value })}
          onBlur={handleBlur}
          placeholder="e.g., Field Trip, Parent Meeting"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Event Date</label>
        <input
          type="date"
          value={localState.eventDate}
          onChange={(e) => setLocalState({ ...localState, eventDate: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Event Time</label>
        <input
          type="time"
          value={localState.eventTime}
          onChange={(e) => setLocalState({ ...localState, eventTime: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={localState.description}
          onChange={(e) => setLocalState({ ...localState, description: e.target.value })}
          onBlur={handleBlur}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          value={localState.location}
          onChange={(e) => setLocalState({ ...localState, location: e.target.value })}
          onBlur={handleBlur}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

export default CalendarEventEditor;
