import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { Plus, UserX } from 'lucide-react';
import { fetchProfile, NotFoundError, type ProfileContent } from '../data/api';
import { ME_ID, myInitialFollowing, profiles } from '../data/mock';
import type { Profile } from '../data/types';
import { useAsync } from '../state/useAsync';
import { useScenario } from '../state/useScenario';
import { useLibrary } from '../state/library';
import { useSession } from '../state/session';
import { useToast } from '../state/toast';
import { usePlaylists } from '../state/playlists';
import { Button } from '../components/Button';
import { ErrorState } from '../components/ErrorState';
import { PlaylistCard } from '../components/PlaylistCard';
import { ProfileHeader, ProfileHeaderSkeleton } from '../components/ProfileHeader';
import { ProfileSuggestion } from '../components/ProfileSuggestion';
import { SongCard, SongCardSkeleton } from '../components/SongCard';
import styles from './ProfilePage.module.css';
import { ICON } from '../components/icons';

/*
 * Profile screen. Your own: Figma "Profile page" section (439:4003) at /profile.
 * Someone else's: "Reworked screens" (e.g. Goose12, 471:6318) at /user/:id.
 */
const TABS = [
  { id: 'liked', label: 'Liked songs', heading: 'Likes' },
  { id: 'reups', label: 'Re-Ups', heading: 'Re-Ups' },
  { id: 'playlists', label: 'Playlists', heading: 'Playlists' },
  { id: 'followers', label: 'Followers', heading: 'Followers' },
  { id: 'following', label: 'Following', heading: 'Following' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** States where your own lists come from what you've actually liked/followed this session. */
const LIVE_SCENARIOS = ['default', 'missing-images', 'big-numbers'];

const PAGE_SIZE = 10;

export function ProfilePage() {
  const { id: routeId, tab: routeTab } = useParams();
  const id = routeId ?? ME_ID;
  const isMe = id === ME_ID;
  const scenario = useScenario(isMe ? 'profile' : 'user');
  const { signedIn } = useSession();
  const [state, retry] = useAsync(() => fetchProfile(id, scenario), [id, scenario]);

  const basePath = isMe ? '/profile' : `/user/${id}`;
  const tab: TabId = TABS.some((t) => t.id === routeTab) ? (routeTab as TabId) : 'liked';

  if (isMe && !signedIn) return <GuestProfile />;

  if (state.status === 'error') {
    if (state.error instanceof NotFoundError) return <NotFound />;
    return (
      <div className={styles.page}>
        <ErrorState title="Couldn’t load this profile" message={state.error.message} onRetry={retry} />
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className={styles.page} aria-busy="true">
        <ProfileHeaderSkeleton />
        <Tabs basePath={basePath} active={tab} />
        <div className={styles.list}>
          <SongCardSkeleton />
          <SongCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <Loaded
      content={state.data}
      isMe={isMe}
      live={isMe && LIVE_SCENARIOS.includes(scenario)}
      tab={tab}
      basePath={basePath}
      scenario={scenario}
    />
  );
}

function Loaded({
  content,
  isMe,
  live,
  tab,
  basePath,
  scenario,
}: {
  content: ProfileContent;
  isMe: boolean;
  live: boolean;
  tab: TabId;
  basePath: string;
  scenario: string;
}) {
  const library = useLibrary();
  const { byOwner, openCreate } = usePlaylists();
  const { profile } = content;

  // Playlists come from the shared store, so ones you create or edit appear here.
  // Other people's private playlists are hidden.
  const ownPlaylists = byOwner(profile.id).filter((p) => isMe || p.privacy === 'public');
  const playlists =
    scenario === 'empty'
      ? []
      : scenario === 'missing-images'
        ? ownPlaylists.map((p) => ({ ...p, cover: 'broken://image' }))
        : scenario === 'long-text'
          ? ownPlaylists.map((p) => ({ ...p, title: 'Songs I listen to on the bus when it is raining and I miss home' }))
          : ownPlaylists;

  // On your own profile, likes/Re-Ups/follows made anywhere in the app show up here.
  const liked = live ? library.liked : content.liked;
  const reups = live ? library.reupped : content.reups;
  const following = live ? [...library.following].map((pid) => profiles[pid]).filter(Boolean) : content.following;
  const followingCount = live
    ? (profile.following ?? 0) + library.following.size - myInitialFollowing.length
    : profile.following ?? 0;
  const followerCount = isMe ? profile.followers : library.followerCount(profile);

  const heading = TABS.find((t) => t.id === tab)!.heading;

  return (
    <div className={styles.page}>
      <ProfileHeader
        profile={profile}
        isMe={isMe}
        followers={followerCount}
        following={followingCount}
        basePath={basePath}
      />
      <Tabs basePath={basePath} active={tab} />

      <section className={styles.section} aria-label={heading}>
        <h2 className={styles.heading}>{heading}</h2>
        {tab === 'liked' && <SongList tracks={liked} empty={<EmptyTab kind="liked" profile={profile} isMe={isMe} />} />}
        {tab === 'reups' && <SongList tracks={reups} empty={<EmptyTab kind="reups" profile={profile} isMe={isMe} />} />}
        {tab === 'playlists' &&
          (playlists.length ? (
            <>
              {isMe && (
                <Button icon={<Plus />} className={styles.newPlaylist} onClick={() => openCreate()}>
                  Create new playlist
                </Button>
              )}
              <div className={styles.playlists}>
                {playlists.map((p) => (
                  <PlaylistCard key={p.id} playlist={p} />
                ))}
              </div>
            </>
          ) : (
            <EmptyTab kind="playlists" profile={profile} isMe={isMe} />
          ))}
        {tab === 'followers' && (
          <PeopleGrid people={content.followers} empty={<EmptyTab kind="followers" profile={profile} isMe={isMe} />} />
        )}
        {tab === 'following' && (
          <PeopleGrid people={following} empty={<EmptyTab kind="following" profile={profile} isMe={isMe} />} />
        )}
      </section>
    </div>
  );
}

/** "Local nav" (Figma 439:3790). Each tab has its own URL so it survives refresh and can be shared. */
function Tabs({ basePath, active }: { basePath: string; active: TabId }) {
  return (
    <nav className={styles.tabs} aria-label="Profile sections">
      {TABS.map((t) => (
        <NavLink
          key={t.id}
          to={`${basePath}/${t.id}`}
          className={`${styles.tab} ${t.id === active ? styles.activeTab : ''}`}
          aria-current={t.id === active ? 'page' : undefined}
          replace
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

function SongList({ tracks, empty }: { tracks: ProfileContent['liked']; empty: ReactNode }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  if (tracks.length === 0) return <>{empty}</>;

  return (
    <div className={styles.list}>
      {tracks.slice(0, shown).map((t) => (
        <SongCard key={t.id} track={t} queue={tracks} />
      ))}
      {tracks.length > shown && (
        <div className={styles.more}>
          <Button onClick={() => setShown((s) => s + PAGE_SIZE)}>
            SHOW MORE ({tracks.length - shown} more)
          </Button>
        </div>
      )}
    </div>
  );
}

function PeopleGrid({ people, empty }: { people: Profile[]; empty: ReactNode }) {
  if (people.length === 0) return <>{empty}</>;
  return (
    <div className={styles.people}>
      {people.map((p, i) => (
        <ProfileSuggestion key={`${p.id}-${i}`} profile={p} size="sm" />
      ))}
    </div>
  );
}

type EmptyKind = 'liked' | 'reups' | 'playlists' | 'followers' | 'following';

/** Empty state per tab; copy differs on your own profile vs someone else's. */
function EmptyTab({ kind, profile, isMe }: { kind: EmptyKind; profile: Profile; isMe: boolean }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { toggleFollow } = useLibrary();
  const { openCreate } = usePlaylists();
  const name = profile.name;

  const copy: Record<EmptyKind, { title: string; body: string; action?: [string, () => void] }> = isMe
    ? {
        liked: {
          title: 'No liked songs yet',
          body: 'Tap the heart on any song and it’ll show up here.',
          action: ['DISCOVER MUSIC', () => navigate('/discover')],
        },
        reups: {
          title: 'You haven’t Re-Upped anything',
          body: 'Re-Up a song to share it with everyone who follows you.',
          action: ['DISCOVER MUSIC', () => navigate('/discover')],
        },
        playlists: {
          title: 'No playlists yet',
          body: 'Group songs you love into a playlist.',
          action: ['CREATE PLAYLIST', () => openCreate()],
        },
        followers: {
          title: 'No followers yet',
          body: 'Share your profile so people can find you.',
          action: [
            'COPY PROFILE LINK',
            () => {
              navigator.clipboard?.writeText(`${window.location.origin}/profile`).catch(() => {});
              toast('Profile link copied');
            },
          ],
        },
        following: {
          title: 'You’re not following anyone',
          body: 'Follow people to see their uploads, likes and Re-Ups in your Feed.',
          action: ['FIND PEOPLE', () => navigate('/feed?state=empty')],
        },
      }
    : {
        liked: { title: `${name} hasn’t liked any songs yet`, body: 'Check back later.' },
        reups: { title: `${name} hasn’t Re-Upped anything yet`, body: 'Check back later.' },
        playlists: { title: `${name} hasn’t made any playlists`, body: 'Check back later.' },
        followers: {
          title: `Be the first to follow ${name}`,
          body: 'You’ll see their activity in your Feed.',
          action: ['FOLLOW', () => toggleFollow(profile.id)],
        },
        following: { title: `${name} isn’t following anyone yet`, body: 'Check back later.' },
      };

  const { title, body, action } = copy[kind];
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      <p>{body}</p>
      {action && (
        <Button variant="filled" onClick={action[1]}>
          {action[0]}
        </Button>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className={`${styles.page} ${styles.notFound}`}>
      <UserX size={ICON.state} className={styles.notFoundIcon} />
      <h1>This profile doesn’t exist</h1>
      <p>The link may be broken, or the account may have been deleted.</p>
      <Link to="/discover">
        <Button variant="filled">BACK TO DISCOVER</Button>
      </Link>
    </div>
  );
}

function GuestProfile() {
  const { setSignedIn } = useSession();
  return (
    <div className={`${styles.page} ${styles.notFound}`}>
      <h1>Your profile lives here</h1>
      <p>Sign in to see your liked songs, Re-Ups, playlists and followers.</p>
      <Button variant="filled" onClick={() => setSignedIn(true)}>
        SIGN IN
      </Button>
    </div>
  );
}
