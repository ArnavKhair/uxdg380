import { useNavigate, useParams } from 'react-router-dom';
import { Disc3, Ellipsis, Heart, Pause, Play, Send, Shuffle } from 'lucide-react';
import { albums, relatedAlbums, type AlbumDetail } from '../data/albums';
import { compactCount } from '../data/format';
import { useAsync } from '../state/useAsync';
import { useScenario } from '../state/useScenario';
import { useLibrary } from '../state/library';
import { usePlayer } from '../state/player';
import { useToast } from '../state/toast';
import { Artwork } from '../components/Artwork';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { buttonClassName } from '../components/buttonClassName';
import { ErrorState } from '../components/ErrorState';
import { MediaCard } from '../components/MediaCard';
import { Menu, type MenuItem } from '../components/Menu';
import { SongListRow } from '../components/SongListRow';
import { SectionHeader } from '../components/SectionHeader';
import shared from './PlaylistPage.module.css';
import styles from './AlbumPage.module.css';
import { ICON } from '../components/icons';

/*
 * Album screen, built from the Figma design system:
 * - Header: "Song cards → Card Expanded" (401:5039) on the playlist page's blurred hero
 *   (182:1231) so albums and playlists read as the same family.
 * - Tracklist: "Song cards → Song list" rows (shared SongListRow, same as Charts).
 * - Artist, details and stats: the block under the player on "Song page - MCR Helena" (439:4361).
 * - "More albums like this": "Songs & Collections → Albums" (573:8992) stacked cards.
 */
const LONG = 'The Extremely Long Deluxe Anniversary Edition With Bonus Tracks, Live Recordings & Remixes';

function fetchAlbum(id: string, scenario: string): Promise<AlbumDetail | null> {
  return new Promise((resolve, reject) => {
    if (scenario === 'loading') return;
    setTimeout(() => {
      if (scenario === 'error') reject(new Error('We couldn’t load this album. Check your connection and try again.'));
      else if (scenario === 'not-found') resolve(null);
      else resolve(albums[id] ?? null);
    }, 500);
  });
}

function withScenario(a: AlbumDetail, scenario: string): AlbumDetail {
  switch (scenario) {
    case 'single':
      return { ...a, tracks: a.tracks.slice(0, 1) };
    case 'long-text':
      return {
        ...a,
        title: `${a.title}: ${LONG}`,
        artist: `${a.artist}, Featuring Several Guest Artists & Friends`,
        label: 'An Independent Label Distributed Worldwide by a Much Larger Label Group',
        artistProfile: { ...a.artistProfile, name: `${a.artist}, Featuring Several Guest Artists & Friends` },
        tracks: a.tracks.map((t, i) => (i === 0 ? { ...t, title: `${t.title} (${LONG})` } : t)),
      };
    case 'missing-art':
      return {
        ...a,
        cover: 'broken://image',
        artistProfile: { ...a.artistProfile, avatar: 'broken://image' },
        tracks: a.tracks.map((t) => ({ ...t, cover: 'broken://image' })),
      };
    default:
      return a;
  }
}

function longDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function runtime(sec: number) {
  const min = Math.round(sec / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} hr ${min % 60} min`;
}

export function AlbumPage() {
  const { id = '' } = useParams();
  const scenario = useScenario('album');
  const [state, retry] = useAsync(() => fetchAlbum(id, scenario), [id, scenario]);

  if (state.status === 'loading') return <AlbumSkeleton />;
  if (state.status === 'error') {
    return <ErrorState title="Couldn’t load this album" message={state.error.message} onRetry={retry} />;
  }
  if (!state.data) return <NotFound />;
  return <Loaded album={withScenario(state.data, scenario)} />;
}

function Loaded({ album }: { album: AlbumDetail }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { current, isPlaying, context, play, toggle, queueNext, queueLast } = usePlayer();
  const { following, toggleFollow, followerCount, isAlbumLiked, toggleAlbumLike } = useLibrary();

  const ctx = `album:${album.id}`;
  const tracks = album.tracks;
  const playingThis = context === ctx && !!current;
  const liked = isAlbumLiked(album.id);
  const artist = album.artistProfile;
  const isFollowing = following.has(artist.id);
  const totalSec = tracks.reduce((sum, t) => sum + t.durationSec, 0);
  const year = album.releaseDate.slice(0, 4);

  function copyLink() {
    navigator.clipboard?.writeText(`${window.location.origin}/album/${album.id}`).catch(() => {});
    toast('Album link copied');
  }

  function playAll(shuffle = false) {
    if (!shuffle && playingThis) return toggle();
    const order = shuffle ? [...tracks].sort(() => Math.random() - 0.5) : tracks;
    play(order[0], order, ctx);
  }

  function queueAll(where: 'next' | 'last') {
    const list = where === 'next' ? [...tracks].reverse() : tracks;
    list.forEach((t) => (where === 'next' ? queueNext(t) : queueLast(t)));
    toast(where === 'next' ? 'Album will play next' : 'Album added to the end of your queue');
  }

  const menu: MenuItem[] = [
    { label: 'Queue Next', onSelect: () => queueAll('next') },
    { label: 'Queue Last', onSelect: () => queueAll('last') },
    { label: 'Copy Music URL', onSelect: copyLink },
    { label: 'Embed', onSelect: () => toast('Embed code copied') },
    { label: 'Report Content', onSelect: () => toast('Thanks — we’ll review this album'), danger: true },
  ];

  return (
    <div className={shared.page}>
      <header className={shared.hero}>
        <div className={shared.heroBg} aria-hidden="true">
          {album.cover && <img src={album.cover} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />}
        </div>
        <div className={shared.heroContent}>
          <div className={shared.cover}>
            <Artwork src={album.cover} />
          </div>
          <div className={styles.heroText}>
            <p className={styles.kind}>
              <Disc3 size={ICON.inline} aria-hidden="true" /> ALBUM · {year}
            </p>
            <p className={styles.artistLine} title={album.artist}>
              {album.artist}
            </p>
            <h1 className={styles.title} title={album.title}>
              {album.title}
            </h1>
            <p className={styles.meta}>
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} · {runtime(totalSec)}
              <span className={styles.tag}>#{album.genre}</span>
            </p>
            <div className={`${shared.pills} ${styles.pills}`}>
              <Button
                variant={liked ? 'filled' : 'outline'}
                icon={<Heart fill={liked ? 'currentColor' : 'none'} />}
                onClick={() => toggleAlbumLike(album.id) && toast(liked ? 'Removed from your liked albums' : 'Added to your liked albums')}
                aria-pressed={liked}
              >
                {liked ? 'Liked' : 'Like'}
              </Button>
              <Button icon={<Send />} onClick={copyLink}>
                Share
              </Button>
              <Menu items={menu} label="Album options" trigger={<Ellipsis size={ICON.control} />} triggerClassName={buttonClassName()} />
            </div>
          </div>
        </div>
        <div className={shared.bigButtons}>
          <button
            className={shared.playBig}
            onClick={() => playAll()}
            aria-label={playingThis && isPlaying ? 'Pause album' : 'Play album'}
          >
            {playingThis && isPlaying ? <Pause size={ICON.large} /> : <Play size={ICON.large} />}
          </button>
          <button className={shared.shuffleBig} onClick={() => playAll(true)} aria-label="Shuffle album">
            <Shuffle size={ICON.large} />
          </button>
        </div>
      </header>

      <ol className={shared.tracks}>
        {tracks.map((t, i) => (
          <SongListRow key={t.id} track={t} rank={i + 1} queue={tracks} context={ctx} />
        ))}
      </ol>

      <section className={styles.about}>
        <div className={styles.artistRow}>
          <div className={styles.artistCard}>
            <Avatar src={artist.avatar} name={artist.name} size={124} />
            <span className={styles.artistText}>
              <span className={styles.artistName} title={artist.name}>
                {artist.name}
              </span>
              <span className={styles.followers}>
                <b>{compactCount(followerCount(artist))}</b> Followers
              </span>
            </span>
          </div>
          <Button
            variant={isFollowing ? 'filled' : 'outline'}
            onClick={() =>
              toggleFollow(artist.id) && toast(isFollowing ? `Unfollowed ${artist.name}` : `Following ${artist.name}`)
            }
            aria-pressed={isFollowing}
          >
            {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
          </Button>
        </div>

        <dl className={styles.details}>
          <div>
            <dt>Release Date:</dt>
            <dd>{longDate(album.releaseDate)}</dd>
          </div>
          <div>
            <dt>Genre:</dt>
            <dd>{album.genre}</dd>
          </div>
          <div>
            <dt>Songs:</dt>
            <dd>
              {tracks.length} · {runtime(totalSec)}
            </dd>
          </div>
          <div>
            <dt>Label:</dt>
            <dd>{album.label}</dd>
          </div>
        </dl>

        <dl className={styles.stats}>
          <div>
            <dt>Total plays</dt>
            <dd>{compactCount(album.stats.plays)}</dd>
          </div>
          <div>
            <dt>Likes</dt>
            <dd>{compactCount(album.stats.likes + Number(liked))}</dd>
          </div>
          <div>
            <dt>Re-Ups</dt>
            <dd>{compactCount(album.stats.reups)}</dd>
          </div>
          <div>
            <dt>Playlist Adds</dt>
            <dd>{compactCount(album.stats.playlistAdds)}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.more}>
        <SectionHeader title="More albums like this" description={`More ${album.genre} albums trending on Audiomack`} />
        <div className={styles.cards}>
          {relatedAlbums(album.id).map((a) => (
            <MediaCard
              key={a.id}
              stacked
              cover={a.cover}
              artist={a.artist}
              title={a.title}
              onClick={() => navigate(`/album/${a.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function AlbumSkeleton() {
  return (
    <div className={shared.page} aria-busy="true">
      <div className={`${shared.hero} ${shared.skel}`} />
      <div className={shared.tracks}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={shared.skelRow}>
            <span className={shared.skel} style={{ width: 40, height: 40 }} />
            <span className={shared.skel} style={{ width: 220, height: 16 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className={shared.blocked}>
      <Disc3 size={ICON.state} className={shared.emptyIcon} />
      <h1>This album isn’t available</h1>
      <p>It may have been taken down, or the link is wrong.</p>
      <Button variant="filled" onClick={() => navigate('/discover')}>
        BACK TO DISCOVER
      </Button>
    </div>
  );
}
