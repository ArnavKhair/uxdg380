import { Ellipsis, Pause, Play } from 'lucide-react';
import type { Track } from '../data/types';
import { usePlayer } from '../state/player';
import { useLibrary } from '../state/library';
import { useToast } from '../state/toast';
import { usePlaylists } from '../state/playlists';
import { Artwork } from './Artwork';
import { Menu, type MenuItem } from './Menu';
import { Waveform } from './Waveform';
import styles from './SongCard.module.css';
import { ICON } from './icons';

/*
 * Wide song card used on profile tabs ("Song cards", Figma 401:4981):
 * cover, artist, title, release date, genre tag, play + "…" menu, waveform.
 */
interface Props {
  track: Track;
  queue: Track[];
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function SongCard({ track, queue }: Props) {
  const { current, isPlaying, elapsed, duration, play, toggle, seek, queueNext, queueLast } = usePlayer();
  const { isLiked, isReupped, toggleLike, toggleReup } = useLibrary();
  const toast = useToast();
  const { openAddTo } = usePlaylists();

  const isCurrent = current?.id === track.id;
  const playingThis = isCurrent && isPlaying;
  const liked = isLiked(track.id);
  const reupped = isReupped(track.id);

  // Labels flip with state, as in the Figma variants ("Unlike", "Remove Re-up").
  const menu: MenuItem[] = [
    {
      label: liked ? 'Unlike' : 'Like',
      onSelect: () => toggleLike(track) && toast(liked ? `Removed “${track.title}” from Liked Songs` : 'Added to Liked Songs'),
    },
    { label: 'Add To Playlist', onSelect: () => openAddTo(track) },
    {
      label: reupped ? 'Remove Re-up' : 'Re-Up',
      onSelect: () => toggleReup(track) && toast(reupped ? 'Removed Re-Up' : 'Re-Upped to your followers'),
    },
    { label: 'Embed', onSelect: () => toast('Embed code copied') },
    { label: 'Highlight', onSelect: () => toast(`“${track.title}” pinned to the top of your profile`) },
    {
      label: 'Queue Next',
      onSelect: () => {
        queueNext(track);
        toast(current ? 'Playing next' : `Playing “${track.title}”`);
      },
    },
    {
      label: 'Queue Last',
      onSelect: () => {
        queueLast(track);
        toast(current ? 'Added to the end of your queue' : `Playing “${track.title}”`);
      },
    },
    {
      label: 'Copy Music URL',
      onSelect: () => {
        navigator.clipboard?.writeText(`${window.location.origin}/song/${track.id}`).catch(() => {});
        toast('Link copied');
      },
    },
  ];

  return (
    <article className={`${styles.card} ${isCurrent ? styles.current : ''}`}>
      <div className={styles.info}>
        <div className={styles.cover}>
          <Artwork src={track.cover} />
        </div>
        <div className={styles.details}>
          <div className={styles.text}>
            <div className={styles.names}>
              <p className={styles.artist} title={track.artist}>
                {track.artist}
              </p>
              <h3 className={styles.title} title={track.title}>
                {track.title}
              </h3>
            </div>
            <div className={styles.meta}>
              {track.releaseDate && <p>Release date: {formatDate(track.releaseDate)}</p>}
              {track.tag && <span className={styles.tag}>#{track.tag}</span>}
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.iconButton}
              onClick={() => (isCurrent ? toggle() : play(track, queue))}
              aria-label={playingThis ? `Pause ${track.title}` : `Play ${track.title}`}
            >
              {playingThis ? <Pause size={ICON.control} /> : <Play size={ICON.control} />}
            </button>
            <Menu
              items={menu}
              label={`More options for ${track.title}`}
              trigger={<Ellipsis size={ICON.control} />}
              triggerClassName={styles.iconButton}
            />
          </div>
        </div>
      </div>
      <Waveform
        elapsed={elapsed}
        duration={isCurrent ? duration : track.durationSec} /* 0:30 preview while playing */
        active={isCurrent}
        onSeek={(s) => (isCurrent ? seek(s) : play(track, queue))}
      />
    </article>
  );
}

export function SongCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.info}>
        <span className={`${styles.cover} ${styles.skel}`} />
        <div className={styles.text}>
          <span className={styles.skel} style={{ width: 140, height: 28 }} />
          <span className={styles.skel} style={{ width: 220, height: 36 }} />
          <span className={styles.skel} style={{ width: 200, height: 18 }} />
        </div>
      </div>
      <div className={styles.skelWave}>
        <span className={styles.skel} style={{ height: 38 }} />
      </div>
    </div>
  );
}
