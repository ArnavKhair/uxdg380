import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Ellipsis, Heart, ListMusic, Lock, Pause, Play, Send, Shuffle } from 'lucide-react';
import { genres } from '../data/discover';
import { compactCount } from '../data/format';
import { ME_ID, profiles } from '../data/mock';
import type { Playlist } from '../data/types';
import { useAsync } from '../state/useAsync';
import { useScenario } from '../state/useScenario';
import { useLibrary } from '../state/library';
import { usePlayer } from '../state/player';
import { usePlaylists } from '../state/playlists';
import { useToast } from '../state/toast';
import { Artwork } from '../components/Artwork';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { buttonClassName } from '../components/buttonClassName';
import { Hyperlink } from '../components/Hyperlink';
import { ErrorState } from '../components/ErrorState';
import { Menu, type MenuItem } from '../components/Menu';
import { SongListRow } from '../components/SongListRow';
import styles from './PlaylistPage.module.css';
import { ICON } from '../components/icons';

/*
 * Playlist screen — Figma "playlist page" (182:1231). Content comes straight from the
 * playlist store, so edits, added/removed songs and privacy changes show immediately.
 */
const PAGE_SIZE = 20;
const LONG = 'Songs for the long drive home when the sky goes orange and nobody wants to talk';

type Gate = 'ok' | 'not-found' | 'private';

function fetchGate(scenario: string, exists: boolean): Promise<Gate> {
  return new Promise((resolve, reject) => {
    if (scenario === 'loading') return;
    setTimeout(() => {
      if (scenario === 'error') reject(new Error('We couldn’t load this playlist. Check your connection and try again.'));
      else if (scenario === 'not-found' || !exists) resolve('not-found');
      else if (scenario === 'private') resolve('private');
      else resolve('ok');
    }, 500);
  });
}

/** Apply the edge-case scenario on top of the live playlist. */
function withScenario(p: Playlist, scenario: string): Playlist {
  switch (scenario) {
    case 'empty':
      return { ...p, tracks: [] };
    case 'many':
      return {
        ...p,
        tracks: Array.from({ length: 60 }, (_, i) => {
          const t = p.tracks[i % Math.max(p.tracks.length, 1)];
          return t ? { ...t, id: `${t.id}-${i}` } : t;
        }).filter(Boolean),
      };
    case 'long-text':
      return {
        ...p,
        title: LONG,
        description: `${LONG}. `.repeat(6).trim(),
        tracks: p.tracks.map((t, i) => (i === 0 ? { ...t, title: `${LONG} (Extended Mix)`, artist: 'Ariana Grande, The Weeknd & Friends' } : t)),
      };
    case 'missing-art':
      return { ...p, cover: 'broken://image', tracks: p.tracks.map((t) => ({ ...t, cover: 'broken://image' })) };
    default:
      return p;
  }
}

export function PlaylistPage() {
  const { id = '' } = useParams();
  const scenario = useScenario('playlist');
  const { byId } = usePlaylists();
  const live = byId(id);
  const [state, retry] = useAsync(() => fetchGate(scenario, !!live), [id, scenario]);

  if (state.status === 'loading') return <PlaylistSkeleton />;
  if (state.status === 'error') {
    return <ErrorState title="Couldn’t load this playlist" message={state.error.message} onRetry={retry} />;
  }
  if (state.data === 'not-found' || !live) {
    return (
      <Blocked
        title="This playlist doesn’t exist"
        body="It may have been deleted, or the link is wrong."
      />
    );
  }
  if (state.data === 'private') {
    return <Blocked lock title="This playlist is private" body="Only its owner can see it." />;
  }

  return <Loaded playlist={withScenario(live, scenario)} paged={scenario === 'many'} />;
}

function Loaded({ playlist, paged }: { playlist: Playlist; paged: boolean }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { current, isPlaying, context, play, toggle, queueNext, queueLast } = usePlayer();
  const { isLiked, toggleLike, openEdit, update, removeTrack } = usePlaylists();
  const { followerCount } = useLibrary();
  const [shown, setShown] = useState(PAGE_SIZE);

  const owner = profiles[playlist.ownerId];
  const isMine = playlist.ownerId === ME_ID;
  const ctx = `playlist:${playlist.id}`;
  const playingThis = context === ctx && !!current;
  const tracks = playlist.tracks;
  const visible = paged ? tracks.slice(0, shown) : tracks;
  const genreLabel = playlist.genre === 'all' ? 'All Genres' : genres.find((g) => g.id === playlist.genre)?.label;
  const liked = isLiked(playlist.id);

  function copyLink() {
    navigator.clipboard?.writeText(`${window.location.origin}/playlist/${playlist.id}`).catch(() => {});
    toast('Playlist link copied');
  }

  function queueAll(where: 'next' | 'last') {
    if (!tracks.length) return toast('This playlist has no songs yet');
    const list = where === 'next' ? [...tracks].reverse() : tracks;
    list.forEach((t) => (where === 'next' ? queueNext(t) : queueLast(t)));
    toast(where === 'next' ? 'Playlist will play next' : 'Playlist added to the end of your queue');
  }

  // Figma popup 194:2773 for your own playlists; a shorter menu for other people's.
  const menu: MenuItem[] = [
    ...(isMine
      ? [
          { label: 'Edit/Delete Playlist', onSelect: () => openEdit(playlist.id) },
          { label: 'Add to Linktree', onSelect: () => toast('Linktree isn’t part of this prototype') },
          {
            label: playlist.privacy === 'private' ? 'Make Public' : 'Make Private',
            onSelect: () => {
              const privacy = playlist.privacy === 'private' ? 'public' : 'private';
              update(playlist.id, { privacy });
              toast(privacy === 'private' ? 'Only you can see this playlist now' : 'Anyone can see this playlist now');
            },
          },
        ]
      : []),
    { label: 'Queue Next', onSelect: () => queueAll('next') },
    { label: 'Queue Last', onSelect: () => queueAll('last') },
    { label: 'Copy Music URL', onSelect: copyLink },
  ];

  function playAll(shuffle = false) {
    if (!tracks.length) return toast('Add some songs first');
    if (!shuffle && playingThis) return toggle();
    const order = shuffle ? [...tracks].sort(() => Math.random() - 0.5) : tracks;
    play(order[0], order, ctx);
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          {playlist.cover && <img src={playlist.cover} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />}
        </div>
        <div className={styles.heroContent}>
          <div className={styles.cover}>
            <Artwork src={playlist.cover} />
          </div>
          <div className={styles.heroText}>
            {/* "Public Playlist" / "Private Playlist" label (Figma 802:13360, 182:1231) */}
            <div className={styles.titleBlock}>
              <p className={styles.visibility}>
                {playlist.privacy === 'private' && <Lock size={ICON.inline} aria-hidden="true" />}
                {playlist.privacy === 'private' ? 'Private Playlist' : 'Public Playlist'}
              </p>
              <h1 className={styles.title} title={playlist.title}>
                {playlist.title}
              </h1>
            </div>
            <div className={styles.pills}>
              <Button
                variant={liked ? 'filled' : 'outline'}
                icon={<Heart fill={liked ? 'currentColor' : 'none'} />}
                onClick={() => toggleLike(playlist.id)}
                aria-pressed={liked}
              >
                {liked ? 'Liked' : 'Like'}
              </Button>
              <Button icon={<Send />} onClick={copyLink}>
                Share
              </Button>
              <Menu items={menu} label="Playlist options" trigger={<Ellipsis size={ICON.control} />} triggerClassName={buttonClassName()} />
            </div>
          </div>
        </div>
        <div className={styles.bigButtons}>
          <button
            className={styles.playBig}
            onClick={() => playAll()}
            aria-label={playingThis && isPlaying ? 'Pause playlist' : 'Play playlist'}
          >
            {playingThis && isPlaying ? <Pause size={ICON.large} /> : <Play size={ICON.large} />}
          </button>
          <button className={styles.shuffleBig} onClick={() => playAll(true)} aria-label="Shuffle playlist">
            <Shuffle size={ICON.large} />
          </button>
        </div>
      </header>

      {tracks.length === 0 ? (
        <div className={styles.empty}>
          <ListMusic size={ICON.state} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>This playlist is empty</p>
          {isMine ? (
            <>
              <p>Use the + next to any song, or “Add to Playlist” in a song’s menu, to add it here.</p>
              <Button variant="filled" onClick={() => navigate('/discover')}>
                FIND SONGS
              </Button>
            </>
          ) : (
            <p>{owner?.name ?? 'The owner'} hasn’t added any songs yet.</p>
          )}
        </div>
      ) : (
        <ol className={styles.tracks}>
          {visible.map((t, i) => (
            <SongListRow
              key={t.id}
              track={t}
              rank={i + 1}
              queue={tracks}
              context={ctx}
              onRemove={
                isMine
                  ? () => {
                      removeTrack(playlist.id, t.id);
                      toast('Music was removed from playlist');
                    }
                  : undefined
              }
            />
          ))}
          {paged && tracks.length > shown && (
            <li className={styles.more}>
              <Button onClick={() => setShown((s) => s + PAGE_SIZE)}>
                SHOW MORE ({tracks.length - shown} more)
              </Button>
            </li>
          )}
        </ol>
      )}

      {owner && (
        <section className={styles.owner}>
          <div className={styles.ownerHead}>
            <h2>UPLOADED BY</h2>
            <Hyperlink to={isMine ? '/profile' : `/user/${owner.id}`}>VIEW PROFILE</Hyperlink>
          </div>
          <Link to={isMine ? '/profile' : `/user/${owner.id}`} className={styles.ownerCard}>
            <Avatar src={owner.avatar} name={owner.name} size={124} />
            <span className={styles.ownerText}>
              <span className={styles.ownerName}>{owner.name}</span>
              <span className={styles.ownerFollowers}>
                <b>{compactCount(isMine ? owner.followers : followerCount(owner))}</b> Followers
              </span>
            </span>
          </Link>
          {genreLabel && <span className={styles.tag}>#{genreLabel}</span>}
          {playlist.description && <p className={styles.description}>{playlist.description}</p>}
          <dl className={styles.details}>
            <div>
              <dt>Last updated:</dt>
              <dd>{new Date(playlist.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
            </div>
            <div>
              <dt>Number of Songs:</dt>
              <dd>{tracks.length}</dd>
            </div>
            <div>
              <dt>Genre:</dt>
              <dd>{genreLabel}</dd>
            </div>
            <div>
              <dt>Visibility:</dt>
              <dd>{playlist.privacy === 'private' ? 'Private - Only you can view' : 'Public'}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}

function PlaylistSkeleton() {
  return (
    <div className={styles.page} aria-busy="true">
      <div className={`${styles.hero} ${styles.skel}`} />
      <div className={styles.tracks}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={styles.skelRow}>
            <span className={styles.skel} style={{ width: 40, height: 40 }} />
            <span className={styles.skel} style={{ width: 220, height: 16 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Blocked({ title, body, lock }: { title: string; body: string; lock?: boolean }) {
  return (
    <div className={styles.blocked}>
      {lock ? <Lock size={ICON.state} className={styles.emptyIcon} /> : <ListMusic size={ICON.state} className={styles.emptyIcon} />}
      <h1>{title}</h1>
      <p>{body}</p>
      <Link to="/profile/playlists">
        <Button variant="filled">YOUR PLAYLISTS</Button>
      </Link>
    </div>
  );
}
