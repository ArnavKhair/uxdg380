import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CircleCheck, Ellipsis, Heart, ListMusic, Menu as MenuIcon, Pause, Play, Repeat2, Search, Send } from 'lucide-react';
import { fetchSearch } from '../data/api';
import type { AlbumDetail } from '../data/albums';
import { compactCount } from '../data/format';
import { ME_ID } from '../data/mock';
import type { SearchResults, SearchTab } from '../data/search';
import type { Playlist, Profile, Track } from '../data/types';
import { useAsync } from '../state/useAsync';
import { useScenario } from '../state/useScenario';
import { useLibrary } from '../state/library';
import { usePlayer } from '../state/player';
import { usePlaylists } from '../state/playlists';
import { useSession } from '../state/session';
import { useToast } from '../state/toast';
import { Artwork } from '../components/Artwork';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ErrorState';
import { Menu, type MenuItem } from '../components/Menu';
import { Waveform } from '../components/Waveform';
import styles from './SearchPage.module.css';
import { ICON } from '../components/icons';

/*
 * Search results, built only from the "search bar" frames in Figma's "playlist + search" section:
 * - 253:2079  All: "Results Matching", Accounts, PLAYLISTS, SONGS & ALBUMS
 * - 253:2285  All with several matching people: profile grid + LOAD MORE
 * - 253:2491  Profiles tab: profile grid + LOAD MORE
 * - 539:5887 / 539:5954 / 539:6021  Playlist / Songs / Albums with nothing found
 * The query and tab are in the URL (/search?q=goose&type=profiles) so any view can be shared.
 */
const TABS: { id: SearchTab; label: string; noun: string }[] = [
  { id: 'all', label: 'All', noun: 'results' },
  { id: 'playlists', label: 'Playlist', noun: 'playlists' },
  { id: 'profiles', label: 'Profiles', noun: 'profiles' },
  { id: 'songs', label: 'Songs', noun: 'songs' },
  { id: 'albums', label: 'Albums', noun: 'albums' },
];

const PAGE_SIZE = 6;

export function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  const typeParam = params.get('type');
  const tab: SearchTab = TABS.some((t) => t.id === typeParam) ? (typeParam as SearchTab) : 'all';
  const scenario = useScenario('search');
  const { playlists } = usePlaylists();
  const { signedIn } = useSession();

  // Other people's private playlists never show up in search.
  const visible = playlists.filter((p) => p.privacy === 'public' || (signedIn && p.ownerId === ME_ID));
  const [state, retry] = useAsync(() => fetchSearch(query, visible, scenario), [query, scenario]);

  return (
    <div className={styles.page}>
      <Tabs active={tab} />
      {!query ? (
        <p className={styles.sorry}>Type in the search bar above to find artists, songs, albums and playlists.</p>
      ) : state.status === 'error' ? (
        <ErrorState title="Search failed" message={state.error.message} onRetry={retry} />
      ) : state.status === 'loading' ? (
        <Loading />
      ) : (
        <Results key={`${query}|${tab}`} results={state.data} query={query} tab={tab} />
      )}
    </div>
  );
}

/** "Local nav" (Figma 453:5242). Switching tab keeps the query and any ?state=. */
function Tabs({ active }: { active: SearchTab }) {
  const href = useTabHref();
  return (
    <nav className={styles.tabs} aria-label="Search result types">
      {TABS.map((t) => (
        <Link
          key={t.id}
          to={href(t.id)}
          replace
          className={`${styles.tab} ${t.id === active ? styles.activeTab : ''}`}
          aria-current={t.id === active ? 'page' : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

function useTabHref() {
  const [params] = useSearchParams();
  return (id: SearchTab) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('type');
    else next.set('type', id);
    return `/search?${next}`;
  };
}

function Results({ results, query, tab }: { results: SearchResults; query: string; tab: SearchTab }) {
  const noun = TABS.find((t) => t.id === tab)!.noun;
  const { profiles, playlists, songs, albums } = results;
  const nothing = tab === 'all' ? !profiles.length && !playlists.length && !songs.length && !albums.length : !results[tab].length;

  if (nothing) {
    // Wording from 539:5888
    return (
      <p className={styles.sorry} role="status">
        Sorry we couldn't find any {noun} for "{query}" try searching for something else.
      </p>
    );
  }

  switch (tab) {
    case 'profiles':
      return <ProfileGrid people={profiles} />;
    case 'playlists':
      return (
        <Paged items={playlists} className={styles.cards}>
          {(p) => <PlaylistResult key={p.id} playlist={p} />}
        </Paged>
      );
    case 'songs':
      return (
        <Paged items={songs} className={styles.rows}>
          {(t) => <SongResult key={t.id} track={t} queue={songs} />}
        </Paged>
      );
    case 'albums':
      return (
        <Paged items={albums} className={styles.rows}>
          {(a) => <AlbumResult key={a.id} album={a} />}
        </Paged>
      );
  }

  // All tab. When only people match, the frame (253:2285) is just the profile grid.
  if (!playlists.length && !songs.length && !albums.length) return <ProfileGrid people={profiles} />;
  return <AllResults results={results} query={query} />;
}

/** Figma 253:2079 */
function AllResults({ results, query }: { results: SearchResults; query: string }) {
  const href = useTabHref();
  const navigate = useNavigate();
  const [top] = results.profiles;
  const songs = results.songs.slice(0, 3);
  const albums = results.albums.slice(0, 2);

  const listMenu: MenuItem[] = [
    { label: `All songs (${results.songs.length})`, onSelect: () => navigate(href('songs'), { replace: true }) },
    { label: `All albums (${results.albums.length})`, onSelect: () => navigate(href('albums'), { replace: true }) },
  ];

  return (
    <>
      <h1 className={styles.matching}>
        Results Matching <span className={styles.query}>“{query}”</span>
      </h1>

      {top && (
        <section className={styles.section} aria-label="Accounts">
          <h2 className={styles.heading}>Accounts</h2>
          {/* One match → the large account (253:2079); several → the grid (253:2285) */}
          {results.profiles.length === 1 ? <TopAccount profile={top} /> : <ProfileGrid people={results.profiles} />}
        </section>
      )}

      {results.playlists.length > 0 && (
        <section className={styles.section} aria-label="Playlists">
          <h2 className={styles.heading}>PLAYLISTS</h2>
          <div className={styles.cardRow}>
            {results.playlists.slice(0, 4).map((p) => (
              <PlaylistResult key={p.id} playlist={p} />
            ))}
          </div>
        </section>
      )}

      {(songs.length > 0 || albums.length > 0) && (
        <section className={styles.section} aria-label="Songs and albums">
          <div className={styles.sectionHeader}>
            <h2 className={styles.heading}>SONGS &amp; ALBUMS</h2>
            <Menu
              items={listMenu}
              label="See all songs or albums"
              trigger={<MenuIcon size={ICON.large} />}
              triggerClassName={styles.iconButton}
            />
          </div>
          <div className={styles.rows}>
            {songs.map((t) => (
              <SongResult key={t.id} track={t} queue={results.songs} />
            ))}
            {albums.map((a) => (
              <AlbumResult key={a.id} album={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** "Accounts" (539:5287–539:5292): 192px avatar, 39px name with a check if verified, followers, FOLLOW. */
function TopAccount({ profile }: { profile: Profile }) {
  const { following, toggleFollow, followerCount } = useLibrary();
  const isFollowing = following.has(profile.id);
  const to = `/user/${profile.id}`;

  return (
    <div className={styles.topAccount}>
      <Link to={to} className={styles.topAvatar} tabIndex={-1} aria-hidden="true">
        <Avatar src={profile.avatar} name={profile.name} size={192} />
      </Link>
      <div className={styles.topInfo}>
        <p className={styles.topNameRow}>
          <Link to={to} className={styles.topName} title={profile.name}>
            {profile.name}
          </Link>
          {profile.verified && <CircleCheck size={ICON.large} className={styles.verified} aria-label="Verified" />}
        </p>
        <p className={styles.topFollowers}>{followerCount(profile).toLocaleString('en-US')} Followers</p>
        <button
          className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
          aria-pressed={isFollowing}
          onClick={() => toggleFollow(profile.id)}
        >
          {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
        </button>
      </div>
    </div>
  );
}

/** Profile grid (253:2285 / 253:2491): 91px avatar, name, followers, FOLLOW pill; LOAD MORE below. */
function ProfileGrid({ people }: { people: Profile[] }) {
  return (
    <Paged items={people} className={styles.people}>
      {(p) => <PersonResult key={p.id} profile={p} />}
    </Paged>
  );
}

function PersonResult({ profile }: { profile: Profile }) {
  const { following, toggleFollow, followerCount } = useLibrary();
  const isFollowing = following.has(profile.id);
  const to = `/user/${profile.id}`;

  return (
    <div className={styles.person}>
      <Link to={to} className={styles.personAvatar} tabIndex={-1} aria-hidden="true">
        <Avatar src={profile.avatar} name={profile.name} size={91} />
      </Link>
      <div className={styles.personInfo}>
        <div className={styles.personText}>
          <Link to={to} className={styles.personName} title={profile.name}>
            {profile.name}
          </Link>
          <p className={styles.personFollowers}>{compactCount(followerCount(profile))} Followers</p>
        </div>
        <button
          className={`${styles.pillButton} ${isFollowing ? styles.pillButtonOn : ''}`}
          aria-pressed={isFollowing}
          onClick={() => toggleFollow(profile.id)}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
}

/** "Card Template" (539:5296): 225px cover, bold title, description (or song count). */
function PlaylistResult({ playlist }: { playlist: Playlist }) {
  const count = `${playlist.tracks.length} ${playlist.tracks.length === 1 ? 'song' : 'songs'}`;
  return (
    <Link to={`/playlist/${playlist.id}`} className={styles.card}>
      <span className={styles.cardCover}>
        <Artwork src={playlist.cover} />
      </span>
      <span className={styles.cardText}>
        <span className={styles.cardTitle} title={playlist.title}>
          {playlist.title}
        </span>
        <span className={styles.cardSubtitle}>{playlist.description || count}</span>
      </span>
    </Link>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Song row under "SONGS & ALBUMS" (539:5319–539:5342): cover, details, action pills, waveform. */
function SongResult({ track, queue }: { track: Track; queue: Track[] }) {
  const { current, isPlaying, elapsed, duration, play, toggle, seek, queueNext, queueLast } = usePlayer();
  const { isLiked, isReupped, toggleLike, toggleReup } = useLibrary();
  const { openAddTo } = usePlaylists();
  const toast = useToast();
  const isCurrent = current?.id === track.id;
  const playingThis = isCurrent && isPlaying;
  const liked = isLiked(track.id);
  const reupped = isReupped(track.id);

  const menu: MenuItem[] = [
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
    { label: 'Embed', onSelect: () => toast('Embed code copied') },
  ];

  return (
    <article className={`${styles.row} ${isCurrent ? styles.current : ''}`}>
      <div className={styles.rowMain}>
        <button
          className={styles.rowCover}
          onClick={() => (isCurrent ? toggle() : play(track, queue))}
          aria-label={playingThis ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          <Artwork src={track.cover} />
        </button>
        <div className={styles.rowInfo}>
          <p className={styles.rowArtist} title={track.artist}>
            {track.artist}
          </p>
          <h3 className={styles.rowTitle} title={track.title}>
            {track.title}
          </h3>
          <div className={styles.rowMeta}>
            {track.album && <p>Album: {track.album}</p>}
            {track.releaseDate && (
              <p>
                Release Date: {formatDate(track.releaseDate)}
                {track.uploader && (
                  <>
                    {' '}
                    by <span className={styles.uploader}>{track.uploader}</span>
                  </>
                )}
              </p>
            )}
          </div>
          {track.tag && <span className={styles.tag}>#{track.tag}</span>}
          <div className={styles.pills}>
            <button
              className={`${styles.pill} ${liked ? styles.pillOn : ''}`}
              aria-pressed={liked}
              onClick={() => toggleLike(track) && toast(liked ? 'Removed from Liked Songs' : 'Added to Liked Songs')}
            >
              <Heart size={ICON.pill} fill={liked ? 'currentColor' : 'none'} /> Like
            </button>
            <button className={styles.pill} onClick={() => openAddTo(track)}>
              <ListMusic size={ICON.control} /> Playlist
            </button>
            <button className={styles.pill} onClick={() => copyLink(`/song/${track.id}`, toast)}>
              <Send size={ICON.pill} /> Share
            </button>
            <button
              className={`${styles.pill} ${reupped ? styles.pillOn : ''}`}
              aria-pressed={reupped}
              onClick={() => toggleReup(track) && toast(reupped ? 'Removed Re-Up' : 'Re-Upped to your followers')}
            >
              <Repeat2 size={ICON.control} /> Re-Up
            </button>
            <Menu
              items={menu}
              label={`More options for ${track.title}`}
              trigger={<Ellipsis size={ICON.large} />}
              triggerClassName={styles.pill}
            />
          </div>
        </div>
      </div>
      <div className={styles.wave}>
        <button
          className={styles.playCircle}
          onClick={() => (isCurrent ? toggle() : play(track, queue))}
          aria-label={playingThis ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {playingThis ? <Pause size={ICON.large} /> : <Play size={ICON.large} />}
        </button>
        <Waveform
          elapsed={elapsed}
          duration={isCurrent ? duration : track.durationSec}
          active={isCurrent}
          onSeek={(s) => (isCurrent ? seek(s) : play(track, queue))}
        />
      </div>
    </article>
  );
}

/** Album row, same layout as a song row without the waveform; the cover and title open the album. */
function AlbumResult({ album }: { album: AlbumDetail }) {
  const { isAlbumLiked, toggleAlbumLike } = useLibrary();
  const toast = useToast();
  const liked = isAlbumLiked(album.id);
  const to = `/album/${album.id}`;

  return (
    <article className={styles.row}>
      <div className={styles.rowMain}>
        <Link to={to} className={styles.rowCover} aria-label={`Open ${album.title}`}>
          <Artwork src={album.cover} />
        </Link>
        <div className={styles.rowInfo}>
          <p className={styles.rowArtist} title={album.artist}>
            {album.artist}
          </p>
          <h3 className={styles.rowTitle} title={album.title}>
            <Link to={to}>{album.title}</Link>
          </h3>
          <div className={styles.rowMeta}>
            <p>
              Album · {album.tracks.length} {album.tracks.length === 1 ? 'song' : 'songs'}
            </p>
            <p>Release Date: {formatDate(album.releaseDate)}</p>
          </div>
          <span className={styles.tag}>#{album.genre}</span>
          <div className={styles.pills}>
            <button
              className={`${styles.pill} ${liked ? styles.pillOn : ''}`}
              aria-pressed={liked}
              onClick={() =>
                toggleAlbumLike(album.id) && toast(liked ? 'Removed from your liked albums' : 'Added to your liked albums')
              }
            >
              <Heart size={ICON.pill} fill={liked ? 'currentColor' : 'none'} /> Like
            </button>
            <button className={styles.pill} onClick={() => copyLink(to, toast)}>
              <Send size={ICON.pill} /> Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function copyLink(path: string, toast: (message: string) => void) {
  navigator.clipboard?.writeText(`${window.location.origin}${path}`).catch(() => {});
  toast('Link copied');
}

/** Shows PAGE_SIZE items, then the yellow LOAD MORE pill (631:8432). */
function Paged<T>({ items, className, children }: { items: T[]; className: string; children: (item: T) => ReactNode }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  return (
    <div className={styles.paged}>
      <div className={className}>{items.slice(0, shown).map(children)}</div>
      {items.length > shown && (
        <button className={styles.loadMore} onClick={() => setShown((s) => s + PAGE_SIZE)}>
          Load More
        </button>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className={styles.loading} aria-busy="true" aria-label="Searching">
      <Search size={ICON.large} className={styles.loadingIcon} aria-hidden="true" />
      <span className={styles.skel} style={{ width: 360, height: 28 }} />
      <div className={styles.cardRow}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={styles.skel} style={{ width: 225, height: 225 }} />
        ))}
      </div>
    </div>
  );
}
