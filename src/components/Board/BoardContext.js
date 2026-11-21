import React, { createContext, useContext } from 'react';

const BoardContext = createContext({
  scale: 1
});

export const useBoardScale = () => useContext(BoardContext);

export default BoardContext;
