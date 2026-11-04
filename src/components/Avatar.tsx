import { useState } from 'react';
import { initials } from '../data/format';
import styles from './Avatar.module.css';

/** Circular profile image; falls back to initials if missing or it fails to load. */
export function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {showImage ? (
        <img src={src} alt="" width={size} height={size} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
