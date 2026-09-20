import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { JSAnimation } from 'animejs';
import { overlayIn, overlayOut, panelIn, panelOut, type Preset } from './motion';

/**
 * Keeps an element mounted while its exit animation plays, then unmounts it.
 * React has no built-in exit phase, so `mounted` lags `open` by one animation.
 *
 *   const { mounted, ref } = usePresence(isOpen, popoverIn, popoverOut);
 *   return mounted ? <div ref={ref}>...</div> : null;
 */
export function usePresence<T extends HTMLElement = HTMLDivElement>(open: boolean, enter: Preset, exit: Preset) {
  const [mounted, setMounted] = useState(open);
  const ref = useRef<T | null>(null);
  const running = useRef<JSAnimation | null>(null);
  // Bumped on every transition so a stale exit callback can't unmount a menu that was reopened mid-fade.
  const seq = useRef(0);

  useLayoutEffect(() => {
    const token = ++seq.current;
    if (open) {
      if (!mounted) {
        setMounted(true);
        return;
      }
      if (!ref.current) return;
      running.current?.cancel();
      running.current = enter(ref.current);
      return;
    }
    if (!mounted) return;
    if (!ref.current) {
      setMounted(false);
      return;
    }
    running.current?.cancel();
    running.current = exit(ref.current);
    running.current.then(() => {
      if (seq.current === token) setMounted(false);
    });
  }, [open, mounted]);

  useEffect(() => () => running.current?.cancel(), []);

  return { mounted, ref };
}

/**
 * Two-element variant for dialogs: the backdrop fades while the panel rises, and both reverse on close.
 */
export function useModalPresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const running = useRef<JSAnimation[]>([]);
  const seq = useRef(0);

  const stop = () => {
    running.current.forEach((a) => a.cancel());
    running.current = [];
  };

  useLayoutEffect(() => {
    const token = ++seq.current;
    if (open) {
      if (!mounted) {
        setMounted(true);
        return;
      }
      stop();
      if (overlayRef.current) running.current.push(overlayIn(overlayRef.current));
      if (panelRef.current) running.current.push(panelIn(panelRef.current));
      return;
    }
    if (!mounted) return;
    stop();
    if (!panelRef.current) {
      setMounted(false);
      return;
    }
    if (overlayRef.current) running.current.push(overlayOut(overlayRef.current));
    const panel = panelOut(panelRef.current);
    running.current.push(panel);
    panel.then(() => {
      if (seq.current === token) setMounted(false);
    });
  }, [open, mounted]);

  useEffect(() => () => stop(), []);

  return { mounted, overlayRef, panelRef };
}
