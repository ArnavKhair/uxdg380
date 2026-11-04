import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ICON } from './icons';
import styles from './ScrollRow.module.css';

/*
 * One row of cards that scrolls sideways. A chevron at the end of the row scrolls it by
 * about a screen's worth; once scrolled, a chevron at the start scrolls back. Chevrons only
 * show when there's more content in that direction. Trackpads and shift+wheel still work.
 */
interface Props {
  label: string; // section name, for the chevrons' accessible names
  children: ReactNode;
  /** Vertical centre of the chevrons, e.g. the middle of the cover art (px from the top). */
  chevronTop?: number;
  className?: string;
}

export function ScrollRow({ label, children, chevronTop, className }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanBack(el.scrollLeft > 4);
    setCanForward(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    update();
    const resize = new ResizeObserver(update);
    resize.observe(el);
    for (const child of Array.from(el.children)) resize.observe(child);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      resize.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [update, children]);

  function scrollBy(direction: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  const style = chevronTop !== undefined ? ({ '--chevron-top': `${chevronTop}px` } as CSSProperties) : undefined;

  return (
    <div className={styles.wrap} style={style}>
      <div ref={scroller} className={`${styles.scroller} ${className ?? ''}`}>
        {children}
      </div>
      {canBack && (
        <button type="button" className={`${styles.chevron} ${styles.back}`} onClick={() => scrollBy(-1)} aria-label={`Scroll ${label} back`}>
          <ChevronLeft size={ICON.large} />
        </button>
      )}
      {canForward && (
        <button type="button" className={`${styles.chevron} ${styles.forward}`} onClick={() => scrollBy(1)} aria-label={`Scroll ${label} forward`}>
          <ChevronRight size={ICON.large} />
        </button>
      )}
    </div>
  );
}
