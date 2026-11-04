import { Link } from 'react-router-dom';
import type { Playlist } from '../data/types';
import { Artwork } from './Artwork';
import styles from './PlaylistCard.module.css';

/** Playlist tile on profile → Playlists (Figma 439:3484): stacked cover, title, song count. */
export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link to={`/playlist/${playlist.id}`} className={styles.card}>
      <span className={styles.cover}>
        <Artwork src={playlist.cover} />
      </span>
      <span className={styles.title} title={playlist.title}>
        {playlist.title}
      </span>
      <span className={styles.count}>
        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'}
        {playlist.privacy === 'private' && ' · Private'}
      </span>
    </Link>
  );
}
