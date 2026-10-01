import React, { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { SiteContent } from '../lib/useCms';
import { formatBrandText } from '../lib/textFormat';

type EditableTextProps = {
  contentKey: keyof SiteContent;
  field: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  multiline?: boolean;
};

export function EditableText({ contentKey, field, className = '', as: Component = 'span', multiline = false }: EditableTextProps) {
  const { content, updateContent, isAdminMode } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');

  // Cast through any to access nested objects dynamically
  const sectionData = content[contentKey] as any;
  const initialValue = sectionData?.[field] || '';

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    setIsEditing(false);
    if (localValue !== initialValue) {
      updateContent({
        ...content,
        [contentKey]: {
          ...content[contentKey],
          [field]: localValue
        }
      }).catch(() => alert("Failed to update content. Are you logged in as admin?"));
    }
  };

  if (isAdminMode && isEditing) {
    return (
      <div className="relative group/edit block w-full">
        {multiline ? (
          <textarea
            autoFocus
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            className={`w-full bg-zinc-800/80 text-white border border-brand rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
            rows={5}
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className={`w-full bg-zinc-800/80 text-white border border-brand rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
          />
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <button onMouseDown={(e) => { e.preventDefault(); handleSave(); }} className="bg-brand text-black text-[10px] px-2 py-1 rounded">Save</button>
        </div>
      </div>
    );
  }

  // Convert formatting (*word* -> brand green span, \n -> <br/>)
  const processedValue = formatBrandText(initialValue);

  return (
    <Component 
      className={`${className} ${isAdminMode ? 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-brand hover:bg-brand/10 cursor-pointer transition-all rounded px-1 -mx-1' : ''}`}
      onClick={() => isAdminMode && setIsEditing(true)}
      dangerouslySetInnerHTML={{ __html: processedValue }}
    />
  );
}

