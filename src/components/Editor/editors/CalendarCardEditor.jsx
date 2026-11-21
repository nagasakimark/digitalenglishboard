// Calendar card editor with modal for event details
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

const CalendarCardEditor = ({ item, onUpdate }) => {
  const [editingDay, setEditingDay] = useState(null);
  const events = item.content.events || {};

  const handleSaveEvent = (day, eventData) => {
    const dayKey = day.toString().padStart(2, '0');
    const newEvents = { ...events, [dayKey]: eventData };
    onUpdate(item.id, {
      content: { ...item.content, events: newEvents }
    });
    setEditingDay(null);
  };

  const handleDeleteEvent = (day) => {
    const dayKey = day.toString().padStart(2, '0');
    const newEvents = { ...events };
    delete newEvents[dayKey];
    onUpdate(item.id, {
      content: { ...item.content, events: newEvents }
    });
    setEditingDay(null);
  };

  const getDaysInMonth = () => {
    const monthStr = item.content.month || new Date().toISOString().slice(0, 7);
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth();

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2">
        ✨ Enhanced Calendar Editor Active
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Calendar Month</label>
        <input
          type="month"
          value={item.content.month || ''}
          onChange={(e) => onUpdate(item.id, {
            content: { ...item.content, month: e.target.value }
          })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Events</label>
        <div className="text-xs text-gray-600 mb-2">
          Click a day to add/edit an event
        </div>
        
        {/* Day selector grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayKey = day.toString().padStart(2, '0');
            const hasEvent = !!events[dayKey];
            
            return (
              <button
                key={day}
                onClick={() => setEditingDay(day)}
                className={`p-2 text-sm rounded ${
                  hasEvent 
                    ? 'bg-orange-500 text-white font-bold' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* List of events */}
        {Object.keys(events).length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Current Events:</div>
            {Object.entries(events).sort().map(([day, event]) => (
              <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="font-medium">Day {parseInt(day)}:</span> {event.title || 'Untitled'}
                </div>
                <button
                  onClick={() => setEditingDay(parseInt(day))}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for editing event */}
      {editingDay !== null && (
        <EventModal
          day={editingDay}
          event={events[editingDay.toString().padStart(2, '0')]}
          onSave={(eventData) => handleSaveEvent(editingDay, eventData)}
          onDelete={() => handleDeleteEvent(editingDay)}
          onClose={() => setEditingDay(null)}
        />
      )}
    </div>
  );
};

// Modal component for event editing
const EventModal = ({ day, event, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  // Support both legacy single image and new multiple images
  const [images, setImages] = useState(event?.images || (event?.image ? [event.image] : []));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter an event title');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      images: images,
      // Keep legacy field for backward compatibility if needed, or just use first image
      image: images.length > 0 ? images[0] : null
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">
            Event for Day {day}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Field Trip, Test Day, Guest Speaker"
              className="w-full p-2 border border-gray-300 rounded"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the event..."
              rows={6}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <div className="text-xs text-gray-500 mt-1">
              Supports line breaks for formatting
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Event Images</label>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-blue-700 w-fit">
                <Upload size={16} />
                Choose Images
              </div>
            </label>
            <div className="text-xs text-gray-500 mt-1">
              Optional: Add photos or illustrations (Multiple allowed)
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {images.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={img} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover rounded border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div>
            {event && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Event
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarCardEditor;
