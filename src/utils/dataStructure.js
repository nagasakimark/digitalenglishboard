// New single-file data structure for all months

export const createEmptyBoardData = () => ({
  version: "2.0",
  lastUpdated: new Date().toISOString(),
  months: {
    // Each month key (YYYY-MM) contains its own items and decorations
    // Example:
    // "2025-01": {
    //   items: [],
    //   decorations: []
    // }
  },
  tags: [
    { id: "homework", label: "Homework", color: "#ff6b6b" },
    { id: "reading", label: "Reading Material", color: "#4ecdc4" },
    { id: "resources", label: "Online Resources", color: "#45b7d1" },
    { id: "announcement", label: "Announcements", color: "#96ceb4" }
  ]
});

export const migrateLegacyData = (legacyData) => {
  if (legacyData.version === "2.0") {
    return legacyData; // Already new format
  }

  // Convert v1.0 format to v2.0
  const newData = createEmptyBoardData();
  newData.tags = legacyData.tags || newData.tags;

  // Group items by month
  if (legacyData.items) {
    legacyData.items.forEach(item => {
      const month = item.month || "2025-01";
      if (!newData.months[month]) {
        newData.months[month] = { items: [], decorations: [] };
      }
      newData.months[month].items.push(item);
    });
  }

  // Add decorations to current month or default month
  if (legacyData.decorations) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!newData.months[currentMonth]) {
      newData.months[currentMonth] = { items: [], decorations: [] };
    }
    newData.months[currentMonth].decorations = legacyData.decorations;
  }

  return newData;
};

export const getMonthData = (boardData, month) => {
  if (!boardData || !boardData.months) return { items: [], decorations: [], customHtml: '', customCss: '', effectIds: [], backgroundImage: '', borderImage: '' };
  return boardData.months[month] || { items: [], decorations: [], customHtml: '', customCss: '', effectIds: [], backgroundImage: '', borderImage: '' };
};

export const setMonthData = (boardData, month, monthData) => {
  const newBoardData = { ...boardData };
  if (!newBoardData.months) {
    newBoardData.months = {};
  }
  newBoardData.months[month] = monthData;
  newBoardData.lastUpdated = new Date().toISOString();
  return newBoardData;
};

export const getAllAvailableMonths = (boardData) => {
  if (!boardData || !boardData.months) return [];
  return Object.keys(boardData.months).sort();
};