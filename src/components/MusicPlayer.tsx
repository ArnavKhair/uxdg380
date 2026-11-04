import { useState } from 'react';
import { ArrowDownWideNarrow, Heart, ListPlus, Music, Pause, Play, Repeat2, SkipBack, SkipForward } from 'lucide-react';
import { usePlayer } from '../state/player';
import { useLibrary } from '../state/library';
import { useToast } from '../state/toast';
import { usePlaylists } from '../state/playlists';
import { Button } from './Button';
import styles from './MusicPlayer.module.css';
import { ICON } from './icons';

function clock(sec: number) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** "Music player" component (Figma 401:4971). Pinned to the bottom of the window. Plays 30s iTunes previews. */
export function MusicPlayer() {
  const { current, queue, isPlaying, elapsed, duration, hasAudio, toggle, next, prev, play, seek } = usePlayer();
  const { isLiked: likedId, isReupped: reuppedId, toggleLike, toggleReup } = useLibrary();
  const toast = useToast();
  const { openAddTo } = usePlaylists();
  const [queueOpen, setQueueOpen] = useState(false);

  const progress = current ? Math.min(elapsed / duration, 1) : 0;
  const isLiked = !!current && likedId(current.id);
  const isReupped = !!current && reuppedId(current.id);

  return (
    <div className={styles.player} role="region" aria-label="Music player">
      {/* Progress bar: click to seek within the 30-second preview */}
      <button
        type="button"
        className={styles.track}
        disabled={!current}
        aria-label={current ? `Seek, ${clock(elapsed)} of ${clock(duration)}` : 'Seek'}
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          seek(((e.clientX - box.left) / box.width) * duration);
        }}
      >
        <span className={styles.progress} style={{ width: `${progress * 100}%` }} />
      </button>

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.controls}>
            <button className={styles.control} onClick={prev} disabled={!current} aria-label="Previous">
              <SkipBack size={ICON.large} />
            </button>
            <button
              className={styles.control}
              onClick={toggle}
              disabled={!current}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={ICON.large} /> : <Play size={ICON.large} />}
            </button>
            <button
              className={styles.control}
              onClick={next}
              disabled={!current || queue.indexOf(current) === queue.length - 1}
              aria-label="Next"
            >
              <SkipForward size={ICON.large} />
            </button>
          </div>

          <div className={styles.song}>
            {current?.cover ? (
              <img className={styles.cover} src={current.cover} alt="" width={65} height={65} />
            ) : (
              <span className={styles.cover} aria-hidden="true">
                <Music size={ICON.large} />
              </span>
            )}
            <div className={styles.text}>
              <p className={styles.artist}>{current ? current.artist : 'Nothing playing'}</p>
              <p className={styles.title} title={current?.title}>
                {current ? current.title : 'Pick a song to play'}
              </p>
              {current && (
                <p className={styles.time}>
                  {clock(elapsed)} / {clock(duration)} · {hasAudio ? 'Preview' : 'No preview'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <Button
            variant={isReupped ? 'filled' : 'outline'}
            icon={<Repeat2 />}
            disabled={!current}
            aria-label={isReupped ? 'Undo Re-Up' : 'Re-Up'}
            aria-pressed={isReupped}
            onClick={() => {
              if (toggleReup(current!)) toast(isReupped ? 'Removed Re-Up' : 'Re-Upped to your followers');
            }}
          />
          <Button
            variant={isLiked ? 'filled' : 'outline'}
            icon={<Heart fill={isLiked ? 'currentColor' : 'none'} />}
            disabled={!current}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            aria-pressed={isLiked}
            onClick={() => {
              if (toggleLike(current!)) toast(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs');
            }}
          />
          <Button
            icon={<ListPlus />}
            disabled={!current}
            aria-label="Add to playlist"
            onClick={() => openAddTo(current!)}
          />
          <div className={styles.queueWrap}>
            <Button
              variant={queueOpen ? 'filled' : 'outline'}
              icon={<ArrowDownWideNarrow />}
              aria-expanded={queueOpen}
              onClick={() => setQueueOpen((o) => !o)}
            >
              QUEUE
            </Button>
            {queueOpen && (
              <div className={styles.queue}>
                <p className={styles.queueHeading}>Up next</p>
                {queue.length === 0 ? (
                  <p className={styles.queueEmpty}>Your queue is empty. Play a song to fill it.</p>
                ) : (
                  <ol>
                    {queue.map((t) => (
                      <li key={t.id}>
                        <button
                          className={t.id === current?.id ? styles.queueCurrent : undefined}
                          onClick={() => play(t, queue)}
                        >
                          <span className={styles.queueTitle}>{t.title}</span>
                          <span className={styles.queueArtist}>{t.artist}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
