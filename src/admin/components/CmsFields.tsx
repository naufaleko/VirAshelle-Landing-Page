import React, { useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { formatBrandText } from '../../lib/textFormat';

/*
 * Form building blocks for the CMS page. Inputs sit a shade darker than the card
 * (#0a0a0f on #111118) so the editable area reads as recessed, and the only green
 * is the focus state; the page's one filled green element is the save button.
 */

export const inputClass =
  'w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2.5 text-sm font-body text-white placeholder:text-dim ' +
  'hover:border-white/20 transition-colors';

const labelClass = 'block text-xs font-ui font-semibold text-zinc-300 mb-1.5';
const hintClass = 'mt-1.5 text-[11px] font-ui text-dim leading-relaxed';

interface BaseFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: React.ReactNode;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  autoFocus,
  className = '',
  type = 'text',
  mono = false,
}: BaseFieldProps & { type?: 'text' | 'email' | 'tel'; mono?: boolean }) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${mono ? 'font-mono' : ''}`}
      />
      {hint && <p id={hintId} className={hintClass}>{hint}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  autoFocus,
  className = '',
  rows = 3,
}: BaseFieldProps & { rows?: number }) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y leading-relaxed`}
      />
      {hint && <p id={hintId} className={hintClass}>{hint}</p>}
    </div>
  );
}

/**
 * Textarea for the fields the landing renders through formatBrandText (*word* turns green,
 * Enter becomes a line break). The preview uses the same function, so what shows here is
 * what the landing shows.
 */
export function FormattedTextField({
  label,
  value,
  onChange,
  rows = 3,
  previewClassName,
}: Omit<BaseFieldProps, 'hint' | 'placeholder'> & { rows?: number; previewClassName: string }) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        aria-describedby={hintId}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y leading-relaxed`}
      />
      <p id={hintId} className={hintClass}>
        Apit kata dengan bintang, misalnya <code className="font-mono text-zinc-300">*BRIEF*</code>, untuk warna hijau. Enter membuat baris baru.
      </p>
      {value.trim() && (
        <div className="mt-3 rounded-lg border border-dashed border-white/15 px-4 py-3">
          <p className="text-[11px] font-ui text-dim mb-2">Pratinjau</p>
          <div className={previewClassName} dangerouslySetInnerHTML={{ __html: formatBrandText(value) }} />
        </div>
      )}
    </div>
  );
}

/* ───────────────── Section header ───────────────── */

export function SectionHeader({ title, where }: { title: string; where: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">{title}</h2>
      <p className="mt-1 text-xs font-ui text-zinc-400">{where}</p>
    </div>
  );
}

export function SubHeading({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h3 className="flex items-baseline gap-2 text-sm font-ui font-bold text-zinc-200 mb-3">
      {children}
      {count !== undefined && <span className="font-mono text-xs font-normal text-dim">{count}</span>}
    </h3>
  );
}

/* ───────────────── Repeating items ───────────────── */

function iconButtonClass(tone: 'neutral' | 'danger', disabled = false) {
  const base = 'h-11 w-11 pointer-fine:h-9 pointer-fine:w-9 shrink-0 flex items-center justify-center rounded-lg text-zinc-400 transition-colors';
  if (disabled) return `${base} opacity-30 cursor-not-allowed`;
  return tone === 'danger'
    ? `${base} hover:text-red-400 hover:bg-red-500/10`
    : `${base} hover:text-white hover:bg-white/[0.06]`;
}

let keySeed = 0;
const newKey = () => `item-${++keySeed}`;

interface ItemListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  /** A blank item. New items start empty so nothing unreviewed can go live. */
  makeItem: () => T;
  /** Singular noun for labels and announcements, e.g. "layanan". */
  noun: string;
  titleOf: (item: T) => string;
  emptyText: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void, ctx: { index: number; autoFocus: boolean }) => React.ReactNode;
}

/**
 * Ordered list editor shared by every repeating section. Order is content here: the landing
 * renders items in this order, so each row can move up and down.
 */
export function ItemList<T extends object>({ items, onChange, makeItem, noun, titleOf, emptyText, renderItem }: ItemListProps<T>) {
  // Stable keys so a moved row keeps its DOM (and keyboard focus) instead of swapping contents.
  const keysRef = useRef<string[]>([]);
  if (keysRef.current.length !== items.length) keysRef.current = items.map(newKey);

  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // One field can fire two patches in the same tick (MediaUploader sets src, then type).
  // Each change builds on the last one sent, not on the props of this render, or the
  // second patch would bring back the old value of the first.
  const latest = useRef(items);
  latest.current = items;
  const commit = (next: T[]) => {
    latest.current = next;
    onChange(next);
  };

  const update = (index: number, patch: Partial<T>) => {
    const next = [...latest.current];
    next[index] = { ...next[index], ...patch };
    commit(next);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= latest.current.length) return;
    const next = [...latest.current];
    [next[index], next[target]] = [next[target], next[index]];
    const keys = [...keysRef.current];
    [keys[index], keys[target]] = [keys[target], keys[index]];
    keysRef.current = keys;
    commit(next);
    setAnnouncement(`${capitalize(noun)} dipindah ke urutan ${target + 1} dari ${next.length}.`);
  };

  const remove = (index: number) => {
    const title = titleOf(latest.current[index]).trim();
    keysRef.current = keysRef.current.filter((_, i) => i !== index);
    commit(latest.current.filter((_, i) => i !== index));
    setAnnouncement(`${capitalize(noun)} ${title || index + 1} dihapus. Batalkan perubahan untuk mengembalikannya.`);
  };

  const add = () => {
    const key = newKey();
    keysRef.current = [...keysRef.current, key];
    setAddedKey(key);
    commit([...latest.current, makeItem()]);
  };

  return (
    <div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-xs font-ui text-zinc-400">
          {emptyText}
        </p>
      ) : (
        <ol className="rounded-xl border border-white/10 divide-y divide-white/10">
          {items.map((item, index) => {
            const key = keysRef.current[index];
            const title = titleOf(item).trim();
            const position = index + 1;
            const atTop = index === 0;
            const atBottom = index === items.length - 1;
            return (
              <li key={key} className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 shrink-0 font-mono text-xs text-dim" aria-hidden="true">
                    {String(position).padStart(2, '0')}
                  </span>
                  <p className={`flex-1 min-w-0 truncate text-sm ${title ? 'font-ui font-bold text-white' : 'font-ui text-dim'}`}>
                    {title || `${capitalize(noun)} tanpa judul`}
                  </p>
                  <button
                    type="button"
                    aria-label={`Pindahkan ${noun} ${position} ke atas`}
                    aria-disabled={atTop || undefined}
                    onClick={() => !atTop && move(index, -1)}
                    className={iconButtonClass('neutral', atTop)}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Pindahkan ${noun} ${position} ke bawah`}
                    aria-disabled={atBottom || undefined}
                    onClick={() => !atBottom && move(index, 1)}
                    className={iconButtonClass('neutral', atBottom)}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Hapus ${noun} ${position}${title ? `: ${title}` : ''}`}
                    onClick={() => remove(index)}
                    className={iconButtonClass('danger')}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-4">
                  {renderItem(item, (patch) => update(index, patch), { index, autoFocus: key === addedKey })}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-2 h-11 pointer-fine:h-9 px-3.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-ui font-semibold text-zinc-200 transition-colors"
      >
        <Plus size={15} aria-hidden="true" />
        Tambah {noun}
      </button>

      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
