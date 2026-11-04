import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
import { ICON } from './icons';

/*
 * Dialog shell matching the playlist modals in Figma (#1c1c1c panel, 25px padding,
 * uppercase title + close X). Escape and the backdrop close it; focus moves inside.
 */
interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function Modal({ title, onClose, children, width = 1032 }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  // Latest onClose without re-running the focus/scroll-lock effect on every render.
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>('input, textarea, select, button:not([data-close])');
    first?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, []);

  return createPortal(
    <div className={styles.backdrop} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        className={styles.panel}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          <h2 id="modal-title">{title}</h2>
          <button data-close className={styles.close} onClick={onClose} aria-label="Close">
            <X size={ICON.large} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
