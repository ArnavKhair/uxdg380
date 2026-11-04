import type { CSSProperties, MouseEvent } from 'react';
import waveform from '../assets/icons/waveform.png';
import styles from './Waveform.module.css';

/*
 * "Progress bar" on profile song cards (Figma 401:5029): elapsed time, the
 * waveform image, total time. The played part is tinted yellow; clicking the
 * waveform seeks within the 30-second preview when this song is the one playing,
 * and starts it otherwise. While playing, `duration` is the preview length.
 */
interface Props {
  elapsed: number;
  duration: number;
  active: boolean;
  onSeek: (seconds: number) => void;
}

function clock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Waveform({ elapsed, duration, active, onSeek }: Props) {
  const progress = active ? Math.min(elapsed / duration, 1) : 0;

  function seek(e: MouseEvent<HTMLButtonElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    onSeek(((e.clientX - box.left) / box.width) * duration);
  }

  return (
    <div className={styles.row}>
      <span className={styles.time}>{clock(active ? elapsed : 0)}</span>
      <button
        type="button"
        className={styles.wave}
        onClick={seek}
        aria-label={active ? 'Seek' : 'Play from here'}
        style={{ '--wave': `url(${waveform})` } as CSSProperties}
      >
        <span className={styles.base} />
        <span className={styles.played} style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }} />
      </button>
      <span className={styles.time}>{clock(duration)}</span>
    </div>
  );
}
