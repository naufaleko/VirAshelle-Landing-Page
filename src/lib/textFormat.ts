/**
 * Helper utilities for human-friendly text formatting without raw HTML tags.
 */

/**
 * Converts *word* or [word] into <span class="text-brand">word</span>,
 * and replaces newlines with <br/> tags.
 */
export function formatBrandText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*([^*]+)\*/g, '<span class="text-brand font-semibold">$1</span>')
    .replace(/\[([^\]]+)\]/g, '<span class="text-brand font-semibold">$1</span>')
    .replace(/\n/g, '<br/>');
}

/**
 * Strips raw <span class="..."> HTML tags back into *word* syntax
 * for clean, user-friendly editing in input fields.
 */
export function unformatBrandText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<span\s+class=["'][^"']*text-brand[^"']*["']>([\s\S]*?)<\/span>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n');
}

