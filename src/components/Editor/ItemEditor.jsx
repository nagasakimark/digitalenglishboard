// Unified item editor that delegates to specific editors
import React from 'react';
import BasicFieldsEditor from './editors/BasicFieldsEditor';
import LinkEditor from './editors/LinkEditor';
import ImageEditor from './editors/ImageEditor';
import QuoteEditor from './editors/QuoteEditor';
import DecorationEditor from './editors/DecorationEditor';
import ChecklistEditor from './editors/ChecklistEditor';
import CalendarEventEditor from './editors/CalendarEventEditor';
import WeatherEditor from './editors/WeatherEditor';
import BookmarkEditor from './editors/BookmarkEditor';
import ProgressEditor from './editors/ProgressEditor';
import FlashcardEditor from './editors/FlashcardEditor';
import CountdownEditor from './editors/CountdownEditor';
import AudioNoteEditor from './editors/AudioNoteEditor';
import FileAttachmentEditor from './editors/FileAttachmentEditor';
import CalendarCardEditor from './editors/CalendarCardEditor';
import YouTubeEditor from './editors/YouTubeEditor';
import YouTubePlaylistEditor from './editors/YouTubePlaylistEditor';
import TikTokEditor from './editors/TikTokEditor';
import LocalVideoEditor from './editors/LocalVideoEditor';
import QuizEditor from './editors/QuizEditor';
import ScavengerEditor from './editors/ScavengerEditor';
import ScratchCardEditor from './editors/ScratchCardEditor';
import TimeLockedEditor from './editors/TimeLockedEditor';
import MadLibsEditor from './editors/MadLibsEditor';
import CrosswordEditor from './editors/CrosswordEditor';
import WordsearchEditor from './editors/WordsearchEditor';
import { SnowballCatchEditor, AdventEditor, DecorateTreeEditor } from './editors/GameEditors';

const ItemEditor = ({
  item,
  onUpdate,
  localState,
  setLocalState,
  onGeneratePreview
}) => {
  const isDecoration = item.type === 'decoration' || item.imageUrl;

  // Items that use basic fields (title + text)
  const usesBasicFields = !isDecoration && ![
    'quote', 'checklist', 'calendar-event', 'weather',
    'bookmark', 'progress', 'flashcard', 'countdown',
    'audio-note', 'file-attachment', 'calendar', 'youtube',
    'youtube-playlist', 'tiktok', 'local-video', 'quiz',
    'scavenger-item', 'scratch-card', 'time-locked', 'mad-libs',
    'crossword', 'wordsearch', 'snowball-catch', 'advent', 'decorate-tree'
  ].includes(item.type);

  // Render type-specific editor
  const renderEditor = () => {
    if (isDecoration) {
      return <DecorationEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;
    }

    switch (item.type) {
      case 'link':
        return <LinkEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} onGeneratePreview={onGeneratePreview} />;

      case 'image':
        return <ImageEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;

      case 'quote':
        return <QuoteEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;

      case 'checklist':
        return <ChecklistEditor item={item} onUpdate={onUpdate} />;

      case 'calendar-event':
        return <CalendarEventEditor item={item} onUpdate={onUpdate} />;

      case 'weather':
        return <WeatherEditor item={item} onUpdate={onUpdate} />;

      case 'bookmark':
      case 'bookmarks':
        return <BookmarkEditor item={item} onUpdate={onUpdate} />;

      case 'progress':
        return <ProgressEditor item={item} onUpdate={onUpdate} />;

      case 'flashcard':
        return <FlashcardEditor item={item} onUpdate={onUpdate} />;

      case 'countdown':
        return <CountdownEditor item={item} onUpdate={onUpdate} />;

      case 'audio-note':
        return <AudioNoteEditor item={item} onUpdate={onUpdate} />;

      case 'file-attachment':
        return <FileAttachmentEditor item={item} onUpdate={onUpdate} />;

      case 'calendar':
        return <CalendarCardEditor item={item} onUpdate={onUpdate} />;

      case 'youtube':
        return <YouTubeEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;

      case 'youtube-playlist':
        return <YouTubePlaylistEditor item={item} onUpdate={onUpdate} />;

      case 'tiktok':
        return <TikTokEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;

      case 'local-video':
        return <LocalVideoEditor item={item} onUpdate={onUpdate} />;

      case 'quiz':
        return <QuizEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;

      case 'scavenger-item':
        return <ScavengerEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;

      case 'scratch-card':
        return <ScratchCardEditor item={item} localState={localState} setLocalState={setLocalState} onUpdate={onUpdate} />;

      case 'time-locked':
        return <TimeLockedEditor content={item.content} onChange={(newContent) => onUpdate(item.id, { content: newContent })} />;

      case 'mad-libs':
        return <MadLibsEditor item={item} onUpdate={onUpdate} />;

      case 'crossword':
        return <CrosswordEditor item={item} onUpdate={onUpdate} />;

      case 'wordsearch':
        return <WordsearchEditor item={item} onUpdate={onUpdate} />;

      case 'snowball-catch':
        return <SnowballCatchEditor item={item} onUpdate={onUpdate} />;

      case 'advent':
        return <AdventEditor item={item} onUpdate={onUpdate} />;

      case 'decorate-tree':
        return <DecorateTreeEditor item={item} onUpdate={onUpdate} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {usesBasicFields && (
        <BasicFieldsEditor
          item={item}
          localState={localState}
          setLocalState={setLocalState}
          onUpdate={onUpdate}
        />
      )}
      {renderEditor()}
    </div>
  );
};

export default ItemEditor;
