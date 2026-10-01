import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { usePresence } from '../lib/usePresence';
import { useAnchoredPopover } from '../lib/useAnchoredPopover';
import { popoverIn, popoverOut, popoverInUp, popoverOutDown, rotateTo, settleIn } from '../lib/motion';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

interface BrandedDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  placeholder?: string;
  /** Visible label rendered above the trigger. Use `ariaLabel` instead for compact filter rows. */
  label?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
  /** `sm` matches the filter-bar inputs; `md` matches form inputs. */
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Shown when `options` is empty. */
  emptyText?: string;
}

const ROW_HEIGHT = 40;

export function BrandedDropdown({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi',
  label,
  ariaLabel,
  id,
  className = '',
  size = 'md',
  disabled = false,
  emptyText = 'Belum ada opsi',
}: BrandedDropdownProps) {
  const reactId = useId();
  const triggerId = id ?? `${reactId}-trigger`;
  const labelId = `${reactId}-label`;
  const listId = `${reactId}-list`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const lastValue = useRef(value);

  const normalized: DropdownOption[] = useMemo(
    () => options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt)),
    [options]
  );
  const selected = normalized.find((opt) => opt.value === value);
  const selectedIndex = normalized.findIndex((opt) => opt.value === value);

  const estimatedHeight = Math.min(normalized.length || 1, 6) * ROW_HEIGHT + 12;
  const { style: popoverStyle, placement } = useAnchoredPopover(isOpen, triggerRef, {
    estimatedHeight,
    minWidth: size === 'sm' ? 200 : 0,
  });
  const { mounted, ref: menuRef } = usePresence<HTMLDivElement>(
    isOpen,
    placement === 'top' ? popoverInUp : popoverIn,
    placement === 'top' ? popoverOutDown : popoverOut
  );

  const open = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : normalized.findIndex((o) => !o.disabled));
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const choose = (opt: DropdownOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    close();
  };

  // Close when clicking outside both the trigger and the portaled menu.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isOpen, menuRef]);

  useEffect(() => {
    if (chevronRef.current) rotateTo(chevronRef.current, isOpen ? 180 : 0);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (lastValue.current === value) return;
    lastValue.current = value;
    if (valueRef.current) settleIn(valueRef.current);
  }, [value]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    document.getElementById(`${listId}-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex, listId]);

  const moveActive = (delta: number) => {
    if (normalized.length === 0) return;
    let next = activeIndex;
    for (let i = 0; i < normalized.length; i++) {
      next = (next + delta + normalized.length) % normalized.length;
      if (!normalized[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const jumpTo = (edge: 'first' | 'last') => {
    const enabled = normalized.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabled.length === 0) return;
    setActiveIndex(edge === 'first' ? enabled[0] : enabled[enabled.length - 1]);
  };

  const typeAhead = (char: string) => {
    const lower = char.toLowerCase();
    const start = activeIndex + 1;
    for (let i = 0; i < normalized.length; i++) {
      const idx = (start + i) % normalized.length;
      const opt = normalized[idx];
      if (!opt.disabled && opt.label.toLowerCase().startsWith(lower)) {
        setActiveIndex(idx);
        return;
      }
    }
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        open();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        jumpTo('first');
        break;
      case 'End':
        e.preventDefault();
        jumpTo('last');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) choose(normalized[activeIndex]);
        break;
      case 'Tab':
        close();
        break;
      case 'Escape':
        // Only this menu closes; the keydown must not reach a parent dialog's Escape listener.
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) typeAhead(e.key);
    }
  };

  const triggerPadding = size === 'sm' ? 'px-3 py-2' : 'px-3.5 py-2.5';

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <span className="block text-xs font-ui font-semibold text-zinc-400 mb-1.5" id={labelId}>
          {label}
        </span>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={onTriggerKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={mounted ? listId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-label={ariaLabel}
        className={`w-full pointer-coarse:min-h-11 bg-[#0a0a0f] border rounded-xl ${triggerPadding} text-left flex items-center justify-between gap-2 transition-colors duration-150 group disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-[#4BD200] ring-1 ring-[#4BD200]/30'
            : 'border-white/10 hover:border-[#4BD200]/40 hover:bg-[#111118]'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            ref={valueRef}
            className={`text-xs font-ui truncate ${selected ? 'text-white font-semibold' : 'text-dim font-medium'}`}
          >
            {selected ? selected.label : placeholder}
          </span>
          {selected?.badge && (
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400 shrink-0">
              {selected.badge}
            </span>
          )}
        </span>

        <ChevronDown
          ref={chevronRef}
          size={15}
          aria-hidden="true"
          className={`shrink-0 ${isOpen ? 'text-[#4BD200]' : 'text-dim group-hover:text-[#4BD200]'}`}
        />
      </button>

      {mounted &&
        popoverStyle &&
        createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : ariaLabel}
            style={popoverStyle}
            // Keep focus on the trigger so arrow keys keep working after a mouse pick.
            onMouseDown={(e) => e.preventDefault()}
            className="z-[70] bg-[#0a0a0f] border border-white/10 rounded-xl p-1.5 shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-y-auto"
          >
            {normalized.length === 0 ? (
              <div className="p-3 text-center text-xs font-ui text-dim">{emptyText}</div>
            ) : (
              <div className="space-y-0.5">
                {normalized.map((opt, index) => {
                  const isSelected = opt.value === value;
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={opt.value}
                      id={`${listId}-opt-${index}`}
                      type="button"
                      role="option"
                      tabIndex={-1}
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled || undefined}
                      onClick={() => choose(opt)}
                      onMouseMove={() => !opt.disabled && activeIndex !== index && setActiveIndex(index)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-ui font-medium flex items-center justify-between gap-2 border transition-colors duration-100 ${
                        opt.disabled
                          ? 'text-dim/60 border-transparent cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#4BD200]/15 text-[#4BD200] font-semibold border-[#4BD200]/30'
                            : isActive
                              ? 'bg-white/[0.07] text-white border-transparent'
                              : 'text-zinc-300 border-transparent'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-[9px] font-mono text-zinc-400">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} aria-hidden="true" className="text-[#4BD200]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
