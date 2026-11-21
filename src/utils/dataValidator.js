// Data validation utilities
export const validateBoardData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  if (!data.version) {
    throw new Error('Missing version number');
  }

  if (!Array.isArray(data.items)) {
    throw new Error('Items must be an array');
  }

  if (!Array.isArray(data.tags)) {
    throw new Error('Tags must be an array');
  }

  // Validate each item
  data.items.forEach((item, index) => {
    validateItem(item, index);
  });

  return true;
};

export const validateItem = (item, index = 0) => {
  const requiredFields = ['id', 'type', 'position', 'month', 'content'];
  
  for (const field of requiredFields) {
    if (!(field in item)) {
      throw new Error(`Item ${index}: Missing required field '${field}'`);
    }
  }

  // Validate position
  if (!item.position.x || !item.position.y) {
    throw new Error(`Item ${index}: Invalid position coordinates`);
  }

  // Validate month format
  if (!/^\d{4}-\d{2}$/.test(item.month)) {
    throw new Error(`Item ${index}: Invalid month format. Use YYYY-MM`);
  }

  // Validate rotation
  if (item.rotation && (item.rotation < -180 || item.rotation > 180)) {
    throw new Error(`Item ${index}: Rotation must be between -180 and 180 degrees`);
  }

  // Validate item type
  const validTypes = ['note', 'link', 'image', 'pdf', 'video'];
  if (!validTypes.includes(item.type)) {
    throw new Error(`Item ${index}: Invalid item type '${item.type}'`);
  }

  return true;
};

export const sanitizeContent = (content) => {
  if (typeof content !== 'string') return content;
  
  // Basic XSS prevention
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};