import React from 'react';
import { 
  StickyNote, Image, CheckSquare, Calendar, Quote, Mic, File, 
  Timer, CloudSun, BarChart, CreditCard, Youtube, Music, 
  HelpCircle, Palette, Plus, Film, Wrench, Trophy, Eraser, Lock, PenTool,
  Grid, Search, Snowflake, Gift, TreePine
} from 'lucide-react';

const EditorDock = ({ onAddItem, onOpenTools }) => {
  const items = [
    { type: 'note', label: 'Note', icon: StickyNote, color: 'bg-yellow-400' },
    { type: 'image', label: 'Image', icon: Image, color: 'bg-green-400' },
    { type: 'checklist', label: 'Task', icon: CheckSquare, color: 'bg-purple-400' },
    { type: 'calendar-event', label: 'Event', icon: Calendar, color: 'bg-red-400' },
    { type: 'quote', label: 'Quote', icon: Quote, color: 'bg-gray-400' },
    { type: 'audio-note', label: 'Audio', icon: Mic, color: 'bg-pink-400' },
    { type: 'file-attachment', label: 'File', icon: File, color: 'bg-orange-400' },
    { type: 'countdown', label: 'Timer', icon: Timer, color: 'bg-indigo-400' },
    { type: 'weather', label: 'Weather', icon: CloudSun, color: 'bg-sky-400' },
    { type: 'progress', label: 'Tracker', icon: BarChart, color: 'bg-emerald-400' },
    { type: 'flashcard', label: 'Flash', icon: CreditCard, color: 'bg-amber-400' },
    { type: 'scratch-card', label: 'Scratch', icon: Eraser, color: 'bg-slate-400' },
    { type: 'scavenger-item', label: 'Hunt', icon: Trophy, color: 'bg-yellow-500' },
    { type: 'time-locked', label: 'Locked', icon: Lock, color: 'bg-red-700' },
    { type: 'mad-libs', label: 'MadLib', icon: PenTool, color: 'bg-fuchsia-500' },
    { type: 'calendar', label: 'Cal', icon: Calendar, color: 'bg-rose-400' },
    { type: 'youtube', label: 'YT', icon: Youtube, color: 'bg-red-600' },
    { type: 'youtube-playlist', label: 'Music', icon: Music, color: 'bg-red-500' },
    { type: 'local-video', label: 'Video', icon: Film, color: 'bg-blue-600' },
    { type: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'bg-violet-400' },
    { type: 'crossword', label: 'X-Word', icon: Grid, color: 'bg-blue-500' },
    { type: 'wordsearch', label: 'Search', icon: Search, color: 'bg-emerald-500' },
    { type: 'snowball-catch', label: 'Snowball', icon: Snowflake, color: 'bg-sky-600' },
    { type: 'advent', label: 'Advent', icon: Gift, color: 'bg-red-700' },
    { type: 'decorate-tree', label: 'Tree', icon: TreePine, color: 'bg-green-700' },
    { type: 'decoration', label: 'Deco', icon: Palette, color: 'bg-pink-500' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
      <div className="w-full px-4 py-3">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {items.map((item) => (
            <button
              key={item.type}
              onClick={() => onAddItem(item.type)}
              className="flex flex-col items-center gap-1.5 group transition-all hover:-translate-y-1"
              title={item.label}
            >
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                <item.icon size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-gray-900">{item.label}</span>
            </button>
          ))}
          
          <div className="w-px h-12 bg-gray-300 mx-2"></div>

          <button
            onClick={onOpenTools}
            className="flex flex-col items-center gap-1.5 group transition-all hover:-translate-y-1"
            title="Tools"
          >
            <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <Wrench size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-gray-900">Tools</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorDock;
