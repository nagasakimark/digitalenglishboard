import React from 'react';
import StickyNote from './StickyNote';
import PolaroidCard from './PolaroidCard';
import NoteCard from './NoteCard';
import LinkPreview from './LinkPreview';
import ChecklistItem from './ChecklistItem';
import CalendarEvent from './CalendarEvent';
import CalendarCard from './CalendarCard';
import YouTubeEmbed from './YouTubeEmbed';
import YouTubePlaylist from './YouTubePlaylist';
import TikTokEmbed from './TikTokEmbed';
import LocalVideo from './LocalVideo';
import QuizCard from './QuizCard';
import QuoteCard from './QuoteCard';
import AudioNote from './AudioNote';
import FileAttachment from './FileAttachment';
import CountdownTimer from './CountdownTimer';
import WeatherWidget from './WeatherWidget';
import BookmarkCollection from './BookmarkCollection';
import ProgressTracker from './ProgressTracker';
import Flashcard from './FlashCard';
import ScavengerItem from './ScavengerItem';
import ScratchCard from './ScratchCard';
import TimeLockedCard from './TimeLockedCard';
import MadLibsCard from './MadLibsCard';
import CrosswordCard from './CrosswordCard';
import WordsearchCard from './WordsearchCard';
import SnowballCatchCard from './SnowballCatchCard';
import AdventCalendarCard from './AdventCalendarCard';
import DecorateTreeCard from './DecorateTreeCard';

// Item types that would send students to another website.
// They are hidden on the student board (safeguarding) and not offered in the editor dock.
export const EXTERNAL_LINK_TYPES = ['link', 'tiktok', 'bookmark', 'bookmarks'];

// Item types that award a sticker when a student finishes them.
export const STICKER_TYPES = ['quiz', 'crossword', 'wordsearch', 'scavenger-item', 'snowball-catch', 'advent', 'decorate-tree', 'mad-libs', 'scratch-card'];

/**
 * Render the inner content of a board item.
 * ctx: { isEditing, boardItems, onUpdate }
 */
export const renderItem = (item, ctx = {}) => {
  const { isEditing = false, boardItems = [], onUpdate } = ctx;
  switch (item.type) {
    case 'note':
      return item.style === 'note-card' ? <NoteCard item={item} /> : <StickyNote item={item} />;
    case 'link':
      return <LinkPreview item={item} />;
    case 'image':
      return <PolaroidCard item={item} />;
    case 'checklist':
      return <ChecklistItem item={item} />;
    case 'calendar-event':
      return <CalendarEvent item={item} />;
    case 'quote':
      return <QuoteCard item={item} />;
    case 'audio-note':
      return <AudioNote item={item} />;
    case 'file-attachment':
      return <FileAttachment item={item} />;
    case 'countdown':
      return <CountdownTimer item={item} />;
    case 'weather':
      return <WeatherWidget item={item} onUpdate={isEditing ? onUpdate : undefined} />;
    case 'bookmark':
    case 'bookmarks':
      return <BookmarkCollection item={item} />;
    case 'progress':
      return <ProgressTracker item={item} />;
    case 'flashcard':
      return <Flashcard item={item} />;
    case 'calendar':
      return <CalendarCard item={item} />;
    case 'youtube':
      return <YouTubeEmbed item={item} isEditing={isEditing} />;
    case 'youtube-playlist':
      return <YouTubePlaylist item={item} isEditing={isEditing} />;
    case 'tiktok':
      return <TikTokEmbed item={item} isEditing={isEditing} />;
    case 'local-video':
      return <LocalVideo item={item} isEditing={isEditing} />;
    case 'quiz':
      return <QuizCard item={item} isEditing={isEditing} />;
    case 'scavenger-item':
      return <ScavengerItem item={item} isEditable={isEditing} />;
    case 'scratch-card':
      return <ScratchCard item={item} isEditable={isEditing} />;
    case 'time-locked':
      return <TimeLockedCard item={item} />;
    case 'mad-libs':
      return <MadLibsCard item={item} isEditable={isEditing} />;
    case 'crossword':
      return <CrosswordCard item={item} isEditing={isEditing} />;
    case 'wordsearch':
      return <WordsearchCard item={item} isEditing={isEditing} />;
    case 'snowball-catch':
      return <SnowballCatchCard item={item} isEditing={isEditing} boardItems={boardItems} />;
    case 'advent':
      return <AdventCalendarCard item={item} isEditing={isEditing} />;
    case 'decorate-tree':
      return <DecorateTreeCard item={item} isEditing={isEditing} />;
    default:
      return <StickyNote item={item} />;
  }
};
