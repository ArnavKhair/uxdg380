import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, Plus, Search, SquareArrowOutUpRight } from 'lucide-react';
import type { Playlist, Track } from '../data/types';
import { Artwork } from './Artwork';
import { Button } from './Button';
import { Modal } from './Modal';
import styles from './AddToPlaylistModal.module.css';
import { ICON } from './icons';

/*
 * "Add to playlist" (Figma Frame 44, 235:4694; added state Frame 121).
 * Per the design note, the whole playlist row is the click target to add/remove.
 */
interface Props {
  track: Track;
  playlists: Playlist[];
  onToggle: (playlistId: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function AddToPlaylistModal({ track, playlists, onToggle, onCreate, onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const matches = playlists.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Modal title="Add to playlist" onClose={onClose}>
      <p className={styles.song}>
        Adding <strong>{track.title}</strong> by {track.artist}
      </p>

      <div className={styles.create}>
        <Button onClick={onCreate}>
          Create new playlist
        </Button>
      </div>

      <div className={styles.section}>
        <p className={styles.label}>Or add to existing playlist</p>
        {playlists.length > 0 && (
          <label className={styles.search}>
            <Search size={ICON.inline} aria-hidden="true" />
            <span className="visually-hidden">Search in playlists</span>
            <input
              type="search"
              placeholder="Search in playlists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
      </div>

      {playlists.length === 0 ? (
        <p className={styles.end}>You don’t have any playlists yet — create one above.</p>
      ) : matches.length === 0 ? (
        <p className={styles.end}>No playlists match “{query}”.</p>
      ) : (
        <>
          <ul className={styles.list}>
            {matches.map((p) => {
              const added = p.tracks.some((t) => t.id === track.id);
              const count = p.tracks.length;
              return (
                <li key={p.id} className={styles.row}>
                  <button
                    className={styles.rowHit}
                    onClick={() => onToggle(p.id)}
                    aria-pressed={added}
                    aria-label={`${added ? 'Remove from' : 'Add to'} ${p.title}`}
                  >
                    <span className={styles.cover}>
                      <Artwork src={p.cover} />
                    </span>
                    <span className={styles.info}>
                      <span className={styles.title}>{p.title}</span>
                      <span>
                        {count} {count === 1 ? 'song' : 'songs'}
                        {p.privacy === 'private' && ' · Private'}
                      </span>
                    </span>
                    <span className={`${styles.state} ${added ? styles.added : ''}`} aria-hidden="true">
                      {added ? <CircleCheck size={ICON.large} /> : <Plus size={ICON.large} />}
                    </span>
                  </button>
                  <button
                    className={styles.open}
                    aria-label={`Open ${p.title}`}
                    onClick={() => {
                      onClose();
                      navigate(`/playlist/${p.id}`);
                    }}
                  >
                    <SquareArrowOutUpRight size={ICON.large} />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.end}>You’ve reached the end.</p>
        </>
      )}
    </Modal>
  );
}
