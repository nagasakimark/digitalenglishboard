import React, { useEffect, useState } from 'react';
import { parseWordLines } from '../../Items/SnowballCatchCard';
import { parseDoorLines, doorsToLines } from '../../Items/AdventCalendarCard';
import { parseOrnamentLines, ornamentsToLines, DEFAULT_ORNAMENTS } from '../../Items/DecorateTreeCard';

const inputCls = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1';

const useDraft = (value, deps) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), deps); // eslint-disable-line react-hooks/exhaustive-deps
  return [draft, setDraft];
};

const TitleField = ({ item, onUpdate, placeholder }) => {
  const [title, setTitle] = useDraft(item.content?.title || '', [item.id]);
  return (
    <div>
      <label className={labelCls}>Title</label>
      <input
        className={inputCls}
        value={title}
        placeholder={placeholder}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => onUpdate(item.id, { content: { ...item.content, title } })}
      />
    </div>
  );
};

const WidthField = ({ item, onUpdate, def }) => (
  <div>
    <label className={labelCls}>Card width (px)</label>
    <input
      type="number"
      className={inputCls}
      defaultValue={item.width || def}
      key={item.id}
      onBlur={(e) => onUpdate(item.id, { width: parseInt(e.target.value, 10) || def })}
    />
  </div>
);

export const SnowballCatchEditor = ({ item, onUpdate }) => {
  const c = item.content || {};
  const [lines, setLines] = useDraft(
    (c.words || []).map((w) => [w.en, w.jp, w.image].filter(Boolean).join(' = ')).join('\n'),
    [item.id]
  );
  const count = parseWordLines(lines).length;
  return (
    <div className="space-y-4">
      <TitleField item={item} onUpdate={onUpdate} placeholder="Snowball Catch!" />
      <div>
        <label className={labelCls}>Words — one per line: English = 日本語</label>
        <textarea
          className={`${inputCls} font-mono h-40`}
          value={lines}
          placeholder={'snow = 雪\nreindeer = トナカイ\nstar = 星'}
          onChange={(e) => setLines(e.target.value)}
          onBlur={() => onUpdate(item.id, { content: { ...c, words: parseWordLines(lines) } })}
        />
        <p className="text-xs text-gray-500 mt-1">
          {count} words. Optional picture: <code>snow = 雪 = assets/images/snow.png</code>
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={c.useFlashcards !== false}
          onChange={(e) => onUpdate(item.id, { content: { ...c, useFlashcards: e.target.checked } })}
        />
        Also use every flashcard on this month&apos;s board
      </label>
      <WidthField item={item} onUpdate={onUpdate} def={240} />
    </div>
  );
};

export const AdventEditor = ({ item, onUpdate }) => {
  const c = item.content || {};
  const [lines, setLines] = useDraft(doorsToLines(c.doors), [item.id]);
  const fill24 = () => {
    const existing = parseDoorLines(lines);
    const have = new Set(existing.map((d) => d.day));
    const extra = [];
    for (let d = 1; d <= 24; d += 1) if (!have.has(d)) extra.push({ day: d, pic: '🎁', en: '', jp: '' });
    const merged = [...existing, ...extra].sort((a, b) => a.day - b.day);
    const text = doorsToLines(merged);
    setLines(text);
    onUpdate(item.id, { content: { ...c, doors: merged } });
  };
  return (
    <div className="space-y-4">
      <TitleField item={item} onUpdate={onUpdate} placeholder="Advent Calendar" />
      <div>
        <label className={labelCls}>Doors — day | picture | English | 日本語</label>
        <textarea
          className={`${inputCls} font-mono h-56 text-xs`}
          value={lines}
          placeholder={'1 | ⭐ | star | 星\n2 | 🔔 | bell | ベル\n3 | assets/images/santa.png | Santa | サンタ'}
          onChange={(e) => setLines(e.target.value)}
          onBlur={() => onUpdate(item.id, { content: { ...c, doors: parseDoorLines(lines) } })}
        />
        <p className="text-xs text-gray-500 mt-1">
          A door opens on its day of this item&apos;s month. Picture = an emoji or an image path. Doors are all unlocked here in the editor.
        </p>
        <button onClick={fill24} className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">
          Fill in missing days 1–24
        </button>
      </div>
      <WidthField item={item} onUpdate={onUpdate} def={380} />
    </div>
  );
};

export const DecorateTreeEditor = ({ item, onUpdate }) => {
  const c = item.content || {};
  const [lines, setLines] = useDraft(ornamentsToLines(c.ornaments?.length ? c.ornaments : DEFAULT_ORNAMENTS), [item.id]);
  return (
    <div className="space-y-4">
      <TitleField item={item} onUpdate={onUpdate} placeholder="Decorate the Tree!" />
      <div>
        <label className={labelCls}>Ornaments — picture | English | 日本語</label>
        <textarea
          className={`${inputCls} font-mono h-48 text-xs`}
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          onBlur={() => onUpdate(item.id, { content: { ...c, ornaments: parseOrnamentLines(lines) } })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Students read &quot;Put a bell on the tree.&quot; and drag the right picture. Words are hidden until the missions are done.
        </p>
      </div>
      <div>
        <label className={labelCls}>Number of missions</label>
        <input
          type="number"
          min={1}
          max={20}
          className={inputCls}
          defaultValue={c.missionCount || 6}
          key={item.id}
          onBlur={(e) => onUpdate(item.id, { content: { ...c, missionCount: parseInt(e.target.value, 10) || 6 } })}
        />
      </div>
      <WidthField item={item} onUpdate={onUpdate} def={220} />
    </div>
  );
};
