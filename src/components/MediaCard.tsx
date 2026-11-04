import { Pause, Play } from 'lucide-react';
import { Artwork } from './Artwork';
import styles from './MediaCard.module.css';
import { ICON } from './icons';

/*
 * "Songs & Collections" card (Figma 163:401): 225px cover, subtitle, title.
 * - playable: song card; play button on hover, playing song stays highlighted.
 * - stacked: album card with a "shadow" record behind the cover (Charts, 573:10037).
 * - onPlay: playlist card with an always-visible yellow play button (Charts, 596:12883);
 *   the card itself opens the playlist.
 */
interface Props {
  cover: string | null;
  artist: string;
  title: string;
  onClick: () => void;
  playable?: boolean;
  isCurrent?: boolean;
  isPlaying?: boolean;
  stacked?: boolean;
  onPlay?: () => void;
}

export function MediaCard({ cover, artist, title, onClick, playable, isCurrent, isPlaying, stacked, onPlay }: Props) {
  const playingThis = isCurrent && isPlaying;
  const label = playable ? `${playingThis ? 'Pause' : 'Play'} ${title} by ${artist}` : `${title} by ${artist}`;

  return (
    <div className={`${styles.card} ${isCurrent ? styles.current : ''} ${stacked ? styles.stacked : ''}`}>
      <button className={styles.hit} onClick={onClick} aria-label={label}>
        <span className={styles.cover}>
          <Artwork src={cover} />
          {playable && (
            <span className={styles.overlay} aria-hidden="true">
              <span className={styles.playButton}>{playingThis ? <Pause size={ICON.large} /> : <Play size={ICON.large} />}</span>
            </span>
          )}
        </span>
        <span className={styles.info}>
          <span className={styles.artist} title={artist}>
            {artist}
          </span>
          <span className={styles.title} title={title}>
            {title}
          </span>
        </span>
      </button>
      {onPlay && (
        <button
          className={`${styles.playButton} ${styles.fixedPlay}`}
          onClick={onPlay}
          aria-label={playingThis ? `Pause ${title}` : `Play ${title}`}
        >
          {playingThis ? <Pause size={ICON.large} /> : <Play size={ICON.large} />}
        </button>
      )}
    </div>
  );
}

export function MediaCardSkeleton() {
  return (
    <span className={styles.card} aria-hidden="true">
      <span className={`${styles.cover} ${styles.skel}`} />
      <span className={styles.info}>
        <span className={styles.skel} style={{ width: 110, height: 16, alignSelf: 'center' }} />
        <span className={styles.skel} style={{ width: 170, height: 26, alignSelf: 'center' }} />
      </span>
    </span>
  );
}
