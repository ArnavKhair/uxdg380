import { Fragment, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchFeed } from '../data/api';
import { suggestedProfiles } from '../data/mock';
import { useAsync } from '../state/useAsync';
import { useScenario } from '../state/useScenario';
import { usePlayer } from '../state/player';
import { useLibrary } from '../state/library';
import { useSession } from '../state/session';
import { ErrorState } from '../components/ErrorState';
import { ActivityRow, ActivityRowSkeleton } from '../components/ActivityRow';
import { ProfileSuggestion } from '../components/ProfileSuggestion';
import { AdSpace } from '../components/AdSpace';
import { Button } from '../components/Button';
import { Hyperlink } from '../components/Hyperlink';
import type { Activity } from '../data/types';
import styles from './FeedPage.module.css';

const AD_EVERY = 8;

/** Feed screen — Figma "Feed" (439:4230) and "Unpopulated feed" (439:4005). */
export function FeedPage() {
  const scenario = useScenario('feed');
  const [state, retry] = useAsync(() => fetchFeed(scenario), [scenario]);
  const { signedIn } = useSession();

  if (!signedIn) return <GuestFeed />;

  if (state.status === 'loading') {
    return (
      <section className={styles.page} aria-busy="true">
        <h1 className={styles.heading}>RECENT ACTIVITY</h1>
        <ul className={styles.list}>
          {Array.from({ length: 4 }, (_, i) => (
            <ActivityRowSkeleton key={i} />
          ))}
        </ul>
        <span className="visually-hidden">Loading your feed…</span>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className={styles.page}>
        <h1 className={styles.heading}>RECENT ACTIVITY</h1>
        <ErrorState title="Couldn’t load your feed" message={state.error.message} onRetry={retry} />
        <AdSpace />
      </section>
    );
  }

  return state.data.length === 0 ? <EmptyFeed /> : <ActivityList items={state.data} />;
}

function ActivityList({ items }: { items: Activity[] }) {
  const { current, isPlaying, play, toggle } = usePlayer();
  const queue = items.map((a) => a.track);

  // Split into chunks so an ad breaks up long feeds (design note: "ad breaks").
  const chunks: Activity[][] = [];
  for (let i = 0; i < items.length; i += AD_EVERY) chunks.push(items.slice(i, i + AD_EVERY));

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>RECENT ACTIVITY</h1>
      {chunks.map((chunk, i) => (
        <Fragment key={i}>
          <ul className={styles.list}>
            {chunk.map((a) => {
              const isCurrent = current?.id === a.track.id;
              return (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  isCurrent={isCurrent}
                  isPlaying={isPlaying}
                  onPlay={() => (isCurrent ? toggle() : play(a.track, queue))}
                />
              );
            })}
          </ul>
          <AdSpace />
        </Fragment>
      ))}
    </section>
  );
}

function EmptyFeed() {
  const { following } = useLibrary();
  const [, setParams] = useSearchParams();
  const [showAll, setShowAll] = useState(false);

  return (
    <section className={styles.page}>
      <div className={styles.emptyIntro}>
        <h1 className={styles.emptyTitle}>It’s quiet...too quiet.</h1>
        <p className={styles.emptySubtitle}>Follow some profiles to see when they Upload, Like, and Re-Up songs</p>
      </div>

      <div>
        <div className={styles.sectionHead}>
          <h2>PROFILES FOR YOU</h2>
          <Hyperlink onClick={() => setShowAll((s) => !s)}>{showAll ? 'SHOW LESS' : 'VIEW ALL'}</Hyperlink>
        </div>
        <div className={showAll ? styles.suggestionGrid : styles.suggestionRow}>
          {suggestedProfiles.map((p) => (
            <ProfileSuggestion key={p.id} profile={p} />
          ))}
        </div>
      </div>

      {following.size > 0 && (
        <div className={styles.followedBanner}>
          <p>
            You’re following {following.size} {following.size === 1 ? 'profile' : 'profiles'}. Their activity will
            show up here.
          </p>
          <Button variant="filled" onClick={() => setParams({})}>
            SEE MY FEED
          </Button>
        </div>
      )}

      <AdSpace />
    </section>
  );
}

/** Signed out: the feed is personal, so explain why it's empty and offer sign-in. */
function GuestFeed() {
  const { setSignedIn } = useSession();
  return (
    <section className={styles.page}>
      <div className={styles.emptyIntro}>
        <h1 className={styles.emptyTitle}>Your feed lives here.</h1>
        <p className={styles.emptySubtitle}>
          Sign in to see what the people you follow are uploading, liking and Re-Upping.
        </p>
      </div>
      <div>
        <Button variant="filled" onClick={() => setSignedIn(true)}>
          SIGN IN
        </Button>
      </div>
      <AdSpace />
    </section>
  );
}
