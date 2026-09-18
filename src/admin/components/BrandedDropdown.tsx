import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
}

interface BrandedDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export function BrandedDropdown({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  label,
  className = '',
}: BrandedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to DropdownOption[]
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4BD200]/60" />
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-zinc-950/90 hover:bg-zinc-900/90 border rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between transition-all duration-200 shadow-inner group ${
          isOpen
            ? 'border-[#4BD200] ring-1 ring-[#4BD200]/30 shadow-[0_0_15px_rgba(75,210,0,0.15)]'
            : 'border-white/10 hover:border-[#4BD200]/40'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          {/* Status Dot / Glow */}
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${
              value
                ? 'bg-[#4BD200] shadow-[0_0_8px_#4BD200]'
                : 'bg-zinc-600'
            }`}
          />

          <span
            className={`text-xs font-medium truncate ${
              value ? 'text-white font-semibold' : 'text-zinc-500'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono uppercase tracking-wider text-zinc-400">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#4BD200]' : 'text-zinc-500 group-hover:text-[#4BD200]'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-1 max-h-64 overflow-y-auto"
          >
            {normalizedOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-500">
                Belum ada opsi layanan
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#4BD200]/15 text-[#4BD200] font-semibold border border-[#4BD200]/30 shadow-[0_0_10px_rgba(75,210,0,0.1)]'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-[#4BD200] shadow-[0_0_6px_#4BD200]' : 'bg-transparent'
                        }`}
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-[9px] font-mono text-zinc-400">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-[#4BD200]" />}
                    </div>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
