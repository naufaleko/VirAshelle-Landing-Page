import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usePresence } from '../lib/usePresence';
import { useAnchoredPopover } from '../lib/useAnchoredPopover';
import { popoverIn, popoverOut, popoverInUp, popoverOutDown, settleIn, slideIn } from '../lib/motion';

interface BrandedDatePickerProps {
  /** `YYYY-MM-DD` or empty string, the same shape a native date input produces. */
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  label?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Adds a clear control on the trigger and in the popover footer. */
  clearable?: boolean;
}

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const POPOVER_WIDTH = 296;
const POPOVER_HEIGHT = 348;

function parseISO(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  // Clamp so Jan 31 + 1 month lands on Feb 28, not Mar 3.
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(date.getDate(), lastDay));
  return next;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function monthKey(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

const displayFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFormat = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
const cellFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function BrandedDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'Pilih tanggal',
  label,
  ariaLabel,
  id,
  className = '',
  size = 'md',
  disabled = false,
  clearable = false,
}: BrandedDatePickerProps) {
  const reactId = useId();
  const triggerId = id ?? `${reactId}-trigger`;
  const labelId = `${reactId}-label`;
  const dialogId = `${reactId}-dialog`;

  const today = useMemo(() => startOfDay(new Date()), []);
  const selected = useMemo(() => parseISO(value), [value]);
  const minDate = useMemo(() => (min ? parseISO(min) : null), [min]);
  const maxDate = useMemo(() => (max ? parseISO(max) : null), [max]);

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => selected ?? today);
  const [focusDate, setFocusDate] = useState<Date>(() => selected ?? today);
  const slideDir = useRef<1 | -1>(1);
  const lastMonthKey = useRef<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);
  const pendingFocus = useRef(false);

  const { style: popoverStyle, placement } = useAnchoredPopover(isOpen, triggerRef, {
    estimatedHeight: POPOVER_HEIGHT,
    width: POPOVER_WIDTH,
  });
  const { mounted, ref: popoverRef } = usePresence<HTMLDivElement>(
    isOpen,
    placement === 'top' ? popoverInUp : popoverIn,
    placement === 'top' ? popoverOutDown : popoverOut
  );

  const isDisabledDate = (date: Date) =>
    (minDate !== null && date < minDate) || (maxDate !== null && date > maxDate);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const open = () => {
    if (disabled) return;
    const anchor = selected ?? today;
    setViewMonth(anchor);
    setFocusDate(anchor);
    lastMonthKey.current = monthKey(anchor);
    pendingFocus.current = true;
    setIsOpen(true);
  };

  const pick = (date: Date) => {
    if (isDisabledDate(date)) return;
    onChange(toISO(date));
    close();
  };

  const clear = () => {
    onChange('');
    if (isOpen) close();
  };

  // Escape closes only this popover; stopping the event keeps a parent dialog open.
  const onEscape = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || !isOpen) return false;
    e.preventDefault();
    e.stopPropagation();
    close();
    return true;
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isOpen, popoverRef]);

  useLayoutEffect(() => {
    if (lastValue.current === value) return;
    lastValue.current = value;
    if (valueRef.current) settleIn(valueRef.current);
  }, [value]);

  // Move keyboard focus onto the focused day once the popover exists.
  useEffect(() => {
    if (!mounted || !isOpen) return;
    const cell = gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]');
    if (pendingFocus.current || document.activeElement === document.body || gridRef.current?.contains(document.activeElement)) {
      cell?.focus({ preventScroll: true });
    }
    pendingFocus.current = false;
  }, [mounted, isOpen, focusDate]);

  // Slide the month grid in from the direction of travel; the popover's own entrance covers the first month.
  useLayoutEffect(() => {
    if (!isOpen || !gridRef.current) return;
    const key = monthKey(viewMonth);
    if (lastMonthKey.current !== null && lastMonthKey.current !== key) {
      slideIn(gridRef.current, slideDir.current);
    }
    lastMonthKey.current = key;
  }, [isOpen, viewMonth]);

  const goToMonth = (delta: number) => {
    slideDir.current = delta > 0 ? 1 : -1;
    const next = addMonths(viewMonth, delta);
    setViewMonth(next);
    setFocusDate((prev) => addMonths(prev, delta));
  };

  const moveFocus = (next: Date) => {
    const currentKey = monthKey(viewMonth);
    const nextKey = monthKey(next);
    if (nextKey !== currentKey) {
      slideDir.current = nextKey > currentKey ? 1 : -1;
      setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
    setFocusDate(next);
  };

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveFocus(addDays(focusDate, -1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveFocus(addDays(focusDate, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveFocus(addDays(focusDate, -7));
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveFocus(addDays(focusDate, 7));
        break;
      case 'Home': {
        e.preventDefault();
        const offset = (focusDate.getDay() + 6) % 7;
        moveFocus(addDays(focusDate, -offset));
        break;
      }
      case 'End': {
        e.preventDefault();
        const offset = (focusDate.getDay() + 6) % 7;
        moveFocus(addDays(focusDate, 6 - offset));
        break;
      }
      case 'PageUp':
        e.preventDefault();
        moveFocus(addMonths(focusDate, e.shiftKey ? -12 : -1));
        break;
      case 'PageDown':
        e.preventDefault();
        moveFocus(addMonths(focusDate, e.shiftKey ? 12 : 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        pick(focusDate);
        break;
    }
  };

  // Tab cycles inside the popover; it lives at the end of <body>, so the page's own order would lose it.
  const onPopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onEscape(e)) return;
    if (e.key !== 'Tab' || !popoverRef.current) return;
    const focusables = Array.from(
      popoverRef.current.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"])')
    );
    if (focusables.length === 0) return;
    const first = focusables[0] as HTMLElement;
    const last = focusables[focusables.length - 1] as HTMLElement;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const cells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7;
    const start = addDays(first, -lead);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [viewMonth]);

  const todayDisabled = isDisabledDate(today);
  const triggerPadding = size === 'sm' ? 'pl-8 pr-3 py-2' : 'pl-9 pr-3.5 py-2.5';
  const iconLeft = size === 'sm' ? 'left-2.5' : 'left-3';

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <span className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5" id={labelId}>
          {label}
        </span>
      )}

      <div className="relative">
        <Calendar
          size={14}
          aria-hidden="true"
          className={`absolute ${iconLeft} top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
            isOpen ? 'text-[#4BD200]' : 'text-dim'
          }`}
        />
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          disabled={disabled}
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          onKeyDown={onEscape}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={mounted ? dialogId : undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-label={ariaLabel}
          className={`w-full bg-[#0a0a0f] border rounded-xl ${triggerPadding} ${
            clearable && value ? 'pr-9' : ''
          } text-left flex items-center transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen
              ? 'border-[#4BD200] ring-1 ring-[#4BD200]/30'
              : 'border-white/10 hover:border-[#4BD200]/40 hover:bg-[#111118]'
          }`}
        >
          <span
            ref={valueRef}
            className={`text-xs truncate ${selected ? 'font-mono text-white' : 'font-ui font-medium text-dim'}`}
          >
            {selected ? displayFormat.format(selected) : placeholder}
          </span>
        </button>

        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={clear}
            aria-label="Hapus tanggal"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-dim hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {mounted &&
        popoverStyle &&
        createPortal(
          <div
            ref={popoverRef}
            id={dialogId}
            role="dialog"
            aria-modal="false"
            aria-label={label ?? ariaLabel ?? 'Pilih tanggal'}
            style={popoverStyle}
            onKeyDown={onPopoverKeyDown}
            className="z-[70] bg-[#0a0a0f] border border-white/10 rounded-xl p-3 shadow-[0_24px_64px_rgba(0,0,0,0.8)] font-ui"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                aria-label="Bulan sebelumnya"
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="text-sm font-display font-bold text-white capitalize" aria-live="polite">
                {monthFormat.format(viewMonth)}
              </span>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                aria-label="Bulan berikutnya"
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1" aria-hidden="true">
              {WEEKDAYS.map((day) => (
                <span key={day} className="text-center text-[11px] font-semibold text-dim py-1">
                  {day}
                </span>
              ))}
            </div>

            <div ref={gridRef} role="grid" aria-label={monthFormat.format(viewMonth)} onKeyDown={onGridKeyDown}>
              {Array.from({ length: 6 }, (_, row) => (
                <div key={row} role="row" className="grid grid-cols-7">
                  {cells.slice(row * 7, row * 7 + 7).map((date) => {
                    const inMonth = date.getMonth() === viewMonth.getMonth();
                    const isSelected = selected !== null && sameDay(date, selected);
                    const isToday = sameDay(date, today);
                    const isFocused = sameDay(date, focusDate);
                    const isOff = isDisabledDate(date);

                    if (!inMonth) {
                      return (
                        <span
                          key={date.getTime()}
                          role="gridcell"
                          aria-hidden="true"
                          className="h-9 flex items-center justify-center text-xs font-mono text-white/20 select-none"
                        >
                          {date.getDate()}
                        </span>
                      );
                    }

                    return (
                      <button
                        key={date.getTime()}
                        type="button"
                        role="gridcell"
                        tabIndex={isFocused ? 0 : -1}
                        data-focused={isFocused ? 'true' : undefined}
                        aria-selected={isSelected}
                        aria-disabled={isOff || undefined}
                        aria-label={cellFormat.format(date)}
                        aria-current={isToday ? 'date' : undefined}
                        onClick={() => pick(date)}
                        onFocus={() => !sameDay(focusDate, date) && setFocusDate(date)}
                        className={`h-9 m-0.5 rounded-lg text-xs font-mono flex items-center justify-center transition-colors duration-100 ${
                          isOff
                            ? 'text-white/25 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#4BD200] text-black font-bold'
                              : isToday
                                ? 'text-[#4BD200] font-bold border border-[#4BD200]/50 hover:bg-[#4BD200]/10'
                                : 'text-zinc-300 hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/[0.08]">
              {todayDisabled ? (
                <span />
              ) : (
                <button
                  type="button"
                  onClick={() => pick(today)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#4BD200] hover:bg-[#4BD200]/10 transition-colors"
                >
                  Hari ini
                </button>
              )}
              {clearable && value && (
                <button
                  type="button"
                  onClick={clear}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Hapus tanggal
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
