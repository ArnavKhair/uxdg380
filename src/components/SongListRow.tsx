import { AudioLines, Ellipsis, Plus } from 'lucide-react';
import type { Track } from '../data/types';
import { usePlayer } from '../state/player';
import { useLibrary } from '../state/library';
import { useToast } from '../state/toast';
import { usePlaylists } from '../state/playlists';
import { Artwork } from './Artwork';
import { Menu, type MenuItem } from './Menu';
import styles from './SongListRow.module.css';
import { ICON } from './icons';

/*
 * "Song cards → Song list" row (Figma 401:5041): number, 75px cover, title, artist,
 * add-to-playlist, duration, "…". Clicking the row plays from that song.
 * Used for every song list: Charts, playlists and albums.
 */
interface Props {
  track: Track;
  rank: number; // position in the list, shown as 01, 02…
  queue: Track[];
  context?: string; // player context, e.g. playlist:roadtrip — lets the page's big play button track it
  onRemove?: () => void; // playlist owner only: adds "Remove from this playlist" to the menu
}
function clock(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export function SongListRow({ track, rank, queue, context, onRemove }: Props) {
  const { current, isPlaying, play, toggle, queueNext, queueLast } = usePlayer();
  const { isLiked, isReupped, toggleLike, toggleReup } = useLibrary();
  const toast = useToast();
  const { openAddTo } = usePlaylists();
  const isCurrent = current?.id === track.id;
  const liked = isLiked(track.id);
  const reupped = isReupped(track.id);

  const menu: MenuItem[] = [
    {
      label: liked ? 'Unlike' : 'Like',
      onSelect: () => toggleLike(track) && toast(liked ? 'Removed from Liked Songs' : 'Added to Liked Songs'),
    },
    {
      label: reupped ? 'Remove Re-up' : 'Re-Up',
      onSelect: () => toggleReup(track) && toast(reupped ? 'Removed Re-Up' : 'Re-Upped to your followers'),
    },
    { label: 'Add to Playlist', onSelect: () => openAddTo(track) },
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
    ...(onRemove ? [{ label: 'Remove from this playlist', onSelect: onRemove, danger: true }] : []),
  ];

  return (
    <li className={`${styles.row} ${isCurrent ? styles.current : ''}`}>
      <button
        className={styles.hit}
        onClick={() => (isCurrent ? toggle() : play(track, queue, context))}
        aria-label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} number ${rank}, ${track.title} by ${track.artist}`}
      >
        <span className={styles.rank}>
          {isCurrent && isPlaying ? <AudioLines size={ICON.inline} aria-hidden="true" /> : String(rank).padStart(2, '0')}
        </span>
        <span className={styles.cover}>
          <Artwork src={track.cover} />
        </span>
        <span className={styles.names}>
          <span className={styles.title} title={track.title}>
            {track.title}
          </span>
          <span className={styles.artist} title={track.artist}>
            {track.artist}
          </span>
        </span>
      </button>
      <div className={styles.actions}>
        <button
          className={styles.iconButton}
          aria-label={`Add ${track.title} to a playlist`}
          onClick={() => openAddTo(track)}
        >
          <Plus size={ICON.control} />
        </button>
        <span className={styles.duration}>{clock(track.durationSec)}</span>
        <Menu
          items={menu}
          label={`More options for ${track.title}`}
          trigger={<Ellipsis size={ICON.control} />}
          triggerClassName={styles.iconButton}
        />
      </div>
    </li>
  );
}

export function SongListRowSkeleton() {
  return (
    <li className={styles.row} aria-hidden="true">
      <div className={styles.hit}>
        <span className={styles.rank}>··</span>
        <span className={`${styles.cover} ${styles.skel}`} />
        <span className={styles.names}>
          <span className={styles.skel} style={{ width: 180, height: 28 }} />
          <span className={styles.skel} style={{ width: 100, height: 18 }} />
        </span>
      </div>
    </li>
  );
}
