import { useState } from 'react';
import { Music } from 'lucide-react';
import styles from './Artwork.module.css';
import { ICON } from './icons';

/** Cover/thumbnail image that shows a neutral tile if it's missing or fails to load. */
export function Artwork({ src, className }: { src: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  const classes = `${styles.art} ${className ?? ''}`;

  if (!src || failed) {
    return (
      <span className={`${classes} ${styles.fallback}`} aria-hidden="true">
        <Music size={ICON.state} />
      </span>
    );
  }
  return <img className={classes} src={src} alt="" onError={() => setFailed(true)} />;
}
