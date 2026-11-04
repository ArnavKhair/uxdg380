import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchDiscover, fetchGenreSongs } from '../data/api';
import { genres } from '../data/discover';
import type { Album, Collection, Track } from '../data/types';
import { useAsync } from '../state/useAsync';
import { useScenario } from '../state/useScenario';
import { usePlayer } from '../state/player';
import { AdSpace } from '../components/AdSpace';
import { CollectionCard, CollectionCardSkeleton } from '../components/CollectionCard';
import { ErrorState } from '../components/ErrorState';
import { GenreFilters } from '../components/GenreFilters';
import { Hyperlink } from '../components/Hyperlink';
import { MediaCard, MediaCardSkeleton } from '../components/MediaCard';
import { ScrollRow } from '../components/ScrollRow';
import { SectionHeader } from '../components/SectionHeader';
import styles from './DiscoverPage.module.css';

/** Discover screen — Figma "Discovery page option 18" (550:19711). */
export function DiscoverPage() {
  const scenario = useScenario('discover');
  const [state, retry] = useAsync(() => fetchDiscover(scenario), [scenario]);

  if (state.status === 'error') {
    return (
      <div className={styles.page}>
        <ErrorState title="Couldn’t load Discover" message={state.error.message} onRetry={retry} />
        <AdSpace />
      </div>
    );
  }

  const content = state.status === 'success' ? state.data : null;

  return (
    <div className={styles.page} aria-busy={!content}>
      <AdSpace />
      <GenreSection scenario={scenario} />

      <section className={styles.section}>
        <SectionHeader title="Trending songs" description="Find the hottest tracks on audiomack" />
        <SongRow label="Trending songs" songs={content?.trendingSongs} />
      </section>

      <AlbumSection albums={content?.trendingAlbums} />

      <CollectionSection
        title="Charts"
        description="Find the best songs from all around the world"
        to="/charts"
        items={content?.charts}
      />
      <CollectionSection title="Moods" description="Get the perfect vibe" to="/moods" items={content?.moods} />

      <AdSpace />

      <CollectionSection
        title="Audiomack World"
        description="Welcome to the world of Audiomack!"
        items={content?.world}
      />
    </div>
  );
}

/** "Songs in [genre]" — filters swap the row; the selection lives in the URL (?genre=). */
function GenreSection({ scenario }: { scenario: string }) {
  const [params, setParams] = useSearchParams();
  const genre = genres.some((g) => g.id === params.get('genre')) ? params.get('genre')! : 'all';
  const [state, retry] = useAsync(() => fetchGenreSongs(genre, scenario), [genre, scenario]);
  const label = genres.find((g) => g.id === genre)!.label;

  function select(id: string) {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('genre');
    else next.set('genre', id);
    setParams(next, { replace: true });
  }

  return (
    <section className={styles.section}>
      <SectionHeader title="Songs in" description="Use the filters above to select the genre you want to listen to">
        <GenreFilters genres={genres} selected={genre} onSelect={select} />
      </SectionHeader>

      {state.status === 'error' ? (
        <ErrorState compact title={`Couldn’t load ${label} songs`} message={state.error.message} onRetry={retry} />
      ) : state.status === 'success' && state.data.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No {label} songs right now</p>
          <p>New music drops every day — check back soon, or try another genre.</p>
          <Hyperlink className={styles.emptyAction} onClick={() => select('all')}>
            Show all genres
          </Hyperlink>
        </div>
      ) : (
        <SongRow label={`${label} songs`} songs={state.status === 'success' ? state.data : undefined} />
      )}
    </section>
  );
}

/** Chevrons sit on the middle of the 225px cover (MediaCard) or 267px image (CollectionCard). */
const COVER_MIDDLE = 112;
const IMAGE_MIDDLE = 133;

/** One sideways-scrolling row of song cards. */
function SongRow({ label, songs }: { label: string; songs: Track[] | undefined }) {
  const { current, isPlaying, play, toggle } = usePlayer();

  if (!songs) {
    return (
      <ScrollRow label={label} chevronTop={COVER_MIDDLE}>
        {Array.from({ length: 4 }, (_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </ScrollRow>
    );
  }

  return (
    <ScrollRow label={label} chevronTop={COVER_MIDDLE}>
      {songs.map((song) => {
        const isCurrent = current?.id === song.id;
        return (
          <MediaCard
            key={song.id}
            cover={song.cover}
            artist={song.artist}
            title={song.title}
            playable
            isCurrent={isCurrent}
            isPlaying={isPlaying}
            onClick={() => (isCurrent ? toggle() : play(song, songs))}
          />
        );
      })}
    </ScrollRow>
  );
}

function AlbumSection({ albums }: { albums: Album[] | undefined }) {
  const navigate = useNavigate();
  return (
    <section className={styles.section}>
      <SectionHeader title="Trending albums" description="Find the hottest albums on Audiomack" />
      <ScrollRow label="Trending albums" chevronTop={COVER_MIDDLE} className={styles.albumRow}>
        {albums
          ? albums.map((a) => (
              <MediaCard
                key={a.id}
                stacked /* "Songs & Collections → Albums" (573:8992) */
                cover={a.cover}
                artist={a.artist}
                title={a.title}
                onClick={() => navigate(`/album/${a.id}`)}
              />
            ))
          : Array.from({ length: 4 }, (_, i) => <MediaCardSkeleton key={i} />)}
      </ScrollRow>
    </section>
  );
}

interface CollectionSectionProps {
  title: string;
  description: string;
  to?: string;
  items: Collection[] | undefined;
}

function CollectionSection({ title, description, to, items }: CollectionSectionProps) {
  // A section with nothing in it is hidden rather than shown empty.
  if (items && items.length === 0) return null;

  return (
    <section className={styles.section}>
      <SectionHeader title={title} description={description} to={to} />
      <ScrollRow label={title} chevronTop={IMAGE_MIDDLE}>
        {items
          ? items.map((c) => <CollectionCard key={c.id} collection={c} />)
          : Array.from({ length: 2 }, (_, i) => <CollectionCardSkeleton key={i} />)}
      </ScrollRow>
    </section>
  );
}
