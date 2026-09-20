import { useCallback, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

export type Placement = 'bottom' | 'top';

interface Options {
  /** How tall the popover is expected to be; decides whether it opens above or below the anchor. */
  estimatedHeight: number;
  /** Fixed popover width. Omit to match the anchor's width (with `minWidth` as the floor). */
  width?: number;
  minWidth?: number;
}

const GAP = 6;
const VIEWPORT_MARGIN = 8;

/**
 * Positions a popover next to its anchor with `position: fixed`, so it can escape a modal's
 * overflow clipping and its scroll container. Flips above the anchor when the space below is short.
 */
export function useAnchoredPopover(open: boolean, anchorRef: RefObject<HTMLElement | null>, opts: Options) {
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const [placement, setPlacement] = useState<Placement>('bottom');

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const width = Math.min(
      opts.width ?? Math.max(rect.width, opts.minWidth ?? 0),
      vw - VIEWPORT_MARGIN * 2
    );
    const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, vw - width - VIEWPORT_MARGIN));

    const spaceBelow = vh - rect.bottom - GAP;
    const spaceAbove = rect.top - GAP;
    const flip = spaceBelow < opts.estimatedHeight && spaceAbove > spaceBelow;
    setPlacement(flip ? 'top' : 'bottom');

    const maxHeight = Math.max(160, (flip ? spaceAbove : spaceBelow) - VIEWPORT_MARGIN);
    setStyle(
      flip
        ? { position: 'fixed', left, bottom: vh - rect.top + GAP, width, maxHeight }
        : { position: 'fixed', left, top: rect.bottom + GAP, width, maxHeight }
    );
  }, [anchorRef, opts.estimatedHeight, opts.width, opts.minWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    window.addEventListener('resize', update);
    // Capture phase so scrolling inside a modal body repositions the popover too.
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, update]);

  return { style, placement };
}
