import { animate, cubicBezier, svg, utils, type JSAnimation } from 'animejs';

/**
 * Every admin animation goes through this file so the whole dashboard moves with one voice:
 * one enter curve, one exit curve, three durations. Components never call anime.js directly.
 *
 * Dial MOTION 2: transitions with a purpose (a menu appearing, a value settling, a panel
 * opening), no loops and no entrance choreography for a tool that is opened dozens of times a day.
 */

export const DURATION = {
  /** Popovers, tooltips, value settle. Short enough to never feel like waiting. */
  fast: 150,
  /** Modal panels, collapsibles. */
  base: 220,
  /** The one long motion: the cash chart drawing its lines once on mount. */
  draw: 900,
} as const;

/** Decelerating curve for everything that appears; the same curve the landing page uses. */
export const EASE_OUT = cubicBezier(0.22, 1, 0.36, 1);
/** Accelerating curve for everything that leaves, so exits feel quicker than entries. */
export const EASE_IN = cubicBezier(0.4, 0, 1, 1);

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Collapses a duration to zero when the OS asks for reduced motion; the CSS side already does this for keyframes. */
export function ms(duration: number): number {
  return reducedMotion() ? 0 : duration;
}

export type Preset = (el: HTMLElement) => JSAnimation;

/* ───────────────── Popover (dropdown menu, date picker, chart HUD) ───────────────── */

export const popoverIn: Preset = (el) => {
  utils.set(el, { opacity: 0, translateY: -6, scale: 0.98 });
  return animate(el, {
    opacity: 1,
    translateY: 0,
    scale: 1,
    duration: ms(DURATION.fast),
    ease: EASE_OUT,
  });
};

export const popoverOut: Preset = (el) =>
  animate(el, {
    opacity: 0,
    translateY: -6,
    scale: 0.98,
    duration: ms(DURATION.fast),
    ease: EASE_IN,
  });

/** Same shape as popoverIn but rising from below, for a popover that opens above its anchor. */
export const popoverInUp: Preset = (el) => {
  utils.set(el, { opacity: 0, translateY: 6, scale: 0.98 });
  return animate(el, {
    opacity: 1,
    translateY: 0,
    scale: 1,
    duration: ms(DURATION.fast),
    ease: EASE_OUT,
  });
};

export const popoverOutDown: Preset = (el) =>
  animate(el, {
    opacity: 0,
    translateY: 6,
    scale: 0.98,
    duration: ms(DURATION.fast),
    ease: EASE_IN,
  });

/* ───────────────── Modal (backdrop + panel) ───────────────── */

export const overlayIn: Preset = (el) => {
  utils.set(el, { opacity: 0 });
  return animate(el, { opacity: 1, duration: ms(DURATION.base), ease: 'linear' });
};

export const overlayOut: Preset = (el) =>
  animate(el, { opacity: 0, duration: ms(DURATION.base), ease: 'linear' });

export const panelIn: Preset = (el) => {
  utils.set(el, { opacity: 0, translateY: 16, scale: 0.98 });
  return animate(el, {
    opacity: 1,
    translateY: 0,
    scale: 1,
    duration: ms(DURATION.base),
    ease: EASE_OUT,
  });
};

export const panelOut: Preset = (el) =>
  animate(el, {
    opacity: 0,
    translateY: 16,
    scale: 0.98,
    duration: ms(DURATION.base),
    ease: EASE_IN,
  });

/* ───────────────── Collapsible section ───────────────── */

export const collapseIn: Preset = (el) => {
  const target = el.scrollHeight;
  utils.set(el, { height: 0, opacity: 0, overflow: 'hidden' });
  return animate(el, {
    height: target,
    opacity: 1,
    duration: ms(DURATION.base),
    ease: EASE_OUT,
    onComplete: () => utils.set(el, { height: 'auto', overflow: '' }),
  });
};

export const collapseOut: Preset = (el) => {
  utils.set(el, { height: el.offsetHeight, overflow: 'hidden' });
  return animate(el, {
    height: 0,
    opacity: 0,
    duration: ms(DURATION.base),
    ease: EASE_IN,
  });
};

/* ───────────────── Small cues ───────────────── */

/** A freshly chosen value slides into its slot, so the eye gets confirmation that the pick landed. */
export function settleIn(el: HTMLElement): JSAnimation {
  utils.set(el, { opacity: 0, translateY: 4 });
  return animate(el, { opacity: 1, translateY: 0, duration: ms(DURATION.fast), ease: EASE_OUT });
}

/** Month grid in the date picker: slides in from the side the user navigated towards. */
export function slideIn(el: HTMLElement, direction: 1 | -1): JSAnimation {
  utils.set(el, { opacity: 0, translateX: 16 * direction });
  return animate(el, { opacity: 1, translateX: 0, duration: ms(DURATION.fast), ease: EASE_OUT });
}

/** Rotates a chevron to point at the open state. */
export function rotateTo(el: Element, degrees: number): JSAnimation {
  return animate(el, { rotate: degrees, duration: ms(DURATION.fast), ease: EASE_OUT });
}

/* ───────────────── SVG chart ───────────────── */

/** Draws a stroke from its start to its end once, as the chart's single long motion. */
export function drawPath(path: SVGPathElement, duration = DURATION.draw): JSAnimation {
  const [drawable] = svg.createDrawable(path);
  return animate(drawable, {
    draw: ['0 0', '0 1'],
    opacity: [0, 1],
    duration: ms(duration),
    ease: EASE_OUT,
  });
}

export function fadeIn(el: Element, duration = DURATION.draw * 0.7): JSAnimation {
  utils.set(el, { opacity: 0 });
  return animate(el, { opacity: 1, duration: ms(duration), ease: 'linear' });
}
