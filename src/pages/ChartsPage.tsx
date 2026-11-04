import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { fetchChart } from '../data/api';
import { charts, DEFAULT_COUNTRY, type Chart } from '../data/charts';
import { useAsync } from '../state/useAsync';
import { useScenario } from '../state/useScenario';
import { usePlayer } from '../state/player';
import { AdSpace } from '../components/AdSpace';
import { Button } from '../components/Button';
import { SongListRow, SongListRowSkeleton } from '../components/SongListRow';
import { ErrorState } from '../components/ErrorState';
import { MediaCard, MediaCardSkeleton } from '../components/MediaCard';
import { SectionHeader } from '../components/SectionHeader';
import styles from './ChartsPage.module.css';
import { ICON } from '../components/icons';

/*
 * Charts screen — Figma "Charts page base" (439:7103). The five "top song N" frames
 * are this page with song N playing, which the real player now covers.
 */
const PREVIEW_ROWS = 5;

export function ChartsPage() {
  const { country: routeCountry } = useParams();
  const country = charts.some((c) => c.country === routeCountry) ? routeCountry! : DEFAULT_COUNTRY;
  const scenario = useScenario('charts');
  const [state, retry] = useAsync(() => fetchChart(country, scenario), [country, scenario]);
  const name = charts.find((c) => c.country === country)!.name;

  if (state.status === 'error') {
    return (
      <div className={styles.page}>
        <Banner chart={null} name={name} country={country} />
        <ErrorState title={`Couldn’t load the ${name} chart`} message={state.error.message} onRetry={retry} />
      </div>
    );
  }

  const chart = state.status === 'success' ? state.data : null;

  return (
    <div className={styles.page} aria-busy={!chart}>
      <Banner chart={chart} name={name} country={country} />
      {chart && chart.songs.length === 0 ? <EmptyChart name={name} /> : <ChartBody key={country} chart={chart} name={name} />}
    </div>
  );
}

function ChartBody({ chart, name }: { chart: Chart | null; name: string }) {
  const navigate = useNavigate();
  const { current, isPlaying, context, play, toggle } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const songs = chart?.songs ?? [];
  const shown = expanded ? songs : songs.slice(0, PREVIEW_ROWS);

  return (
    <>
      <section className={styles.section}>
        <SectionHeader title="Songs ranked" description={`Best songs in ${withThe(name)}`} />
        <ol className={styles.rows}>
          {chart
            ? shown.map((t, i) => <SongListRow key={t.id} track={t} rank={i + 1} queue={songs} />)
            : Array.from({ length: PREVIEW_ROWS }, (_, i) => <SongListRowSkeleton key={i} />)}
        </ol>
        {songs.length > PREVIEW_ROWS && (
          <div className={styles.expand}>
            <Button onClick={() => setExpanded((e) => !e)}>
              {expanded ? 'SHOW TOP 5' : `SHOW FULL CHART (${songs.length})`}
            </Button>
          </div>
        )}
      </section>

      <AdSpace />

      {(!chart || chart.albums.length > 0) && (
        <section className={styles.section}>
          <SectionHeader title="Top Albums" description={`Popular songs in ${name}`} />
          <div className={styles.cards}>
            {chart
              ? chart.albums.map((a) => (
                  <MediaCard
                    key={a.id}
                    stacked
                    cover={a.cover}
                    artist={a.artist}
                    title={a.title}
                    onClick={() => navigate(`/album/${a.id}`)}
                  />
                ))
              : Array.from({ length: 4 }, (_, i) => <MediaCardSkeleton key={i} />)}
          </div>
        </section>
      )}

      {(!chart || chart.playlists.length > 0) && (
        <section className={styles.section}>
          <SectionHeader title="Top playlists" description="Playlists people are listening to" />
          <div className={styles.cards}>
            {chart
              ? chart.playlists.map((p) => {
                  const ctx = `playlist:${p.id}`;
                  const isThis = context === ctx;
                  return (
                    <MediaCard
                      key={p.id}
                      cover={p.cover}
                      artist={p.description}
                      title={p.title}
                      isCurrent={isThis}
                      isPlaying={isPlaying}
                      onClick={() => navigate(`/playlist/${p.id}`)}
                      onPlay={() => (isThis && current ? toggle() : play(p.tracks[0], p.tracks, ctx))}
                    />
                  );
                })
              : Array.from({ length: 4 }, (_, i) => <MediaCardSkeleton key={i} />)}
          </div>
        </section>
      )}
    </>
  );
}

/** "Chart banner" (Figma 439:7105) with the country name doubling as a country picker. */
function Banner({ chart, name, country }: { chart: Chart | null; name: string; country: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => setImageFailed(false), [chart?.banner]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  function choose(id: string) {
    setOpen(false);
    // Keep the edge-case state (?state=) when switching country.
    const qs = params.toString();
    navigate(`/charts/${id}${qs ? `?${qs}` : ''}`);
  }

  return (
    <div className={styles.banner}>
      {chart?.banner && !imageFailed && (
        <img
          src={chart.banner}
          alt=""
          className={styles.bannerImage}
          style={{ objectPosition: chart.bannerPosition ?? 'center' }}
          onError={() => setImageFailed(true)}
        />
      )}
      <div className={styles.picker} ref={root}>
        <button
          className={styles.pickerButton}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Chart country: ${name}. Change country`}
          onClick={() => setOpen((o) => !o)}
        >
          <h1>{name}</h1>
          <ChevronDown size={60} className={open ? styles.chevronOpen : undefined} aria-hidden="true" />
        </button>
        {open && (
          <ul className={styles.countries} role="listbox" aria-label="Country">
            {charts.map((c) => (
              <li key={c.country} role="option" aria-selected={c.country === country}>
                <button onClick={() => choose(c.country)}>
                  {c.name}
                  {c.country === country && <Check size={ICON.pill} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ name }: { name: string }) {
  const navigate = useNavigate();
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No chart for {withThe(name)} yet</p>
      <p>We need a little more listening data before we can rank songs here.</p>
      <Button variant="filled" onClick={() => navigate('/charts/usa')}>
        SEE UNITED STATES CHART
      </Button>
    </div>
  );
}

function withThe(name: string) {
  return /^United /.test(name) ? `the ${name}` : name;
}
