import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import LoadingScreen from '../components/LoadingScreen';
import CorkBoard from '../components/Board/CorkBoard';
import BoardItem from '../components/Board/BoardItem';
import DecorationItem from '../components/Board/DecorationItem';
import CollapsibleNav from '../components/Navigation/CollapsibleNav';
import BoardMinimap, { computeBoardHeight } from '../components/Navigation/BoardMinimap';
import ImageLightbox from '../components/Lightbox/ImageLightbox';
import StickerBook from '../components/StickerBook';
import { renderItem, EXTERNAL_LINK_TYPES } from '../components/Items/registry';
import { useBoardData } from '../hooks/useBoardData';
import { useMonthFilter } from '../hooks/useMonthFilter';
import { getMonthData } from '../utils/dataStructure';

const GUTTER = 80; // room on the right for the board map

const StudentView = () => {
  const { boardData, loading, error, ensureMonthLoaded, availableMonths, startMonth } = useBoardData();
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Start on this month's board, or the newest one if this month isn't ready yet
  useEffect(() => {
    if (startMonth && !selectedMonth) setSelectedMonth(startMonth);
  }, [startMonth, selectedMonth]);

  // Load month data when selectedMonth changes
  useEffect(() => {
    if (!loading && selectedMonth && ensureMonthLoaded) {
      ensureMonthLoaded(selectedMonth);
    }
  }, [selectedMonth, ensureMonthLoaded, loading]);

  // Update page title
  useEffect(() => {
    if (selectedMonth) {
      const date = new Date(selectedMonth + '-01');
      document.title = `Digital English Board - ${format(date, 'MMMM yyyy')}`;
    }
  }, [selectedMonth]);

  const { filteredItems } = useMonthFilter(boardData, selectedMonth, []);

  // Safeguarding: never show cards that link students out to other websites
  const items = useMemo(
    () => filteredItems.filter((i) => !EXTERNAL_LINK_TYPES.includes(i.type)),
    [filteredItems]
  );

  const handleItemClick = (item) => {
    if (item.type === 'image' && item.content.imageUrl) {
      setLightboxImage({
        url: item.content.imageUrl,
        title: item.content.title || item.content.text
      });
    }
  };

  if (loading || !selectedMonth) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cork-light">
        <div className="text-xl text-red-600 font-handwriting">
          Error loading board: {error}
        </div>
      </div>
    );
  }

  const monthData = getMonthData(boardData, selectedMonth);
  const boardHeight = computeBoardHeight(items, monthData.decorations);
  const ctx = { isEditing: false, boardItems: items };

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      <CollapsibleNav
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        boardData={boardData}
        activeFilters={[]}
        onTagToggle={() => {}}
        months={availableMonths}
      />

      <div className="w-full h-screen overflow-hidden" style={{ paddingRight: GUTTER, background: '#5b3a1e' }}>
        <CorkBoard
          backgroundImage={monthData.backgroundImage}
          borderImage={monthData.borderImage}
          customHtml={monthData.customHtml}
          customCss={monthData.customCss}
          contentHeight={boardHeight}
        >
          {boardData && monthData.decorations?.map((decoration) => (
            <DecorationItem
              key={decoration.id}
              decoration={decoration}
              isEditable={false}
            />
          ))}

          {items.map((item) => (
            <BoardItem
              key={item.id}
              item={item}
              isEditable={false}
              onSelect={handleItemClick}
            >
              {renderItem(item, ctx)}
            </BoardItem>
          ))}
        </CorkBoard>
      </div>

      <BoardMinimap items={items} boardHeight={boardHeight} />
      <StickerBook items={items} monthKey={selectedMonth} />

      <ImageLightbox
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage?.url}
        title={lightboxImage?.title}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

export default StudentView;
