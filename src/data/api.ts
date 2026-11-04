import { baseFeed, myFollowers, myLikedTracks, myReuppedTracks, profileTracks, profiles, tracks, ME_ID } from './mock';
import { charts as countryCharts, type Chart } from './charts';
import { charts, moods, songsByGenre, trendingAlbums, trendingSongs, worldStories } from './discover';
import type { Activity, ActivityType, Album, Collection, Profile, Track } from './types';

/*
 * Fake backend. Responses are shaped by the active scenario so every edge case
 * goes through the same loading → success/error path a real API would.
 */
const LATENCY_MS = 700;

function respond<T>(value: T, delay = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

function fail(message: string, delay = LATENCY_MS): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}

export function fetchFeed(scenario: string): Promise<Activity[]> {
  const now = Date.now();
  switch (scenario) {
    case 'loading':
      return new Promise(() => {}); // never resolves
    case 'error':
      return fail('We couldn’t reach Audiomack. Check your connection and try again.');
    case 'empty':
      return respond([]);
    case 'single':
      return respond(baseFeed(now).slice(0, 1));
    case 'all-types': {
      const types: ActivityType[] = ['uploaded', 'liked', 'reup', 'listening'];
      return respond(baseFeed(now).map((a, i) => ({ ...a, type: types[i] })));
    }
    case 'long-text':
      return respond([
        {
          id: 'l1',
          profile: { ...profiles.painting, name: 'TheOfficialProbablyPaintingFanAccountNumberOneSince2009' },
          track: {
            ...tracks.clearDay,
            title:
              'On a Clear Day (From “Kiki’s Delivery Service”) [Extended Lullaby Version for Sleeping, Studying and Relaxing] (Remastered 2024)',
            artist: 'Studio Ghibli Lullabies, The Tokyo Philharmonic Orchestra & Friends',
          },
          type: 'reup',
          at: now - 2 * 60 * 60_000,
        },
        ...baseFeed(now).slice(0, 2),
      ]);
    case 'missing-images':
      return respond(baseFeed(now).map((a) => ({ ...a, profile: { ...a.profile, avatar: 'broken://image' } })));
    case 'many': {
      const base = baseFeed(now);
      const types: ActivityType[] = ['reup', 'liked', 'uploaded', 'listening'];
      return respond(
        Array.from({ length: 40 }, (_, i) => ({
          ...base[i % base.length],
          id: `m${i}`,
          type: types[i % types.length],
          at: now - i * 47 * 60_000,
        })),
      );
    }
    default:
      return respond(baseFeed(now));
  }
}

export interface DiscoverContent {
  trendingSongs: Track[];
  trendingAlbums: Album[];
  charts: Collection[];
  moods: Collection[];
  world: Collection[];
}

const LONG_TITLE = 'A Very Long Song Title That Keeps Going (feat. Several Guest Artists) [Deluxe Edition Remix]';
const LONG_ARTIST = 'The Artist Formerly Known As Someone, Featuring Another Artist & Friends';

function brokenArt<T extends { cover?: string | null; image?: string | null }>(item: T): T {
  return { ...item, ...('cover' in item ? { cover: 'broken://image' } : { image: 'broken://image' }) };
}

export function fetchDiscover(scenario: string): Promise<DiscoverContent> {
  const content: DiscoverContent = {
    trendingSongs,
    trendingAlbums,
    charts,
    moods,
    world: worldStories,
  };
  switch (scenario) {
    case 'loading':
      return new Promise(() => {});
    case 'error':
      return fail('Discover is taking a break. Check your connection and try again.');
    case 'sparse':
      return respond({
        trendingSongs: trendingSongs.slice(0, 1),
        trendingAlbums: trendingAlbums.slice(0, 2),
        charts: charts.slice(0, 1),
        moods: [],
        world: worldStories.slice(0, 1),
      });
    case 'long-text':
      return respond({
        ...content,
        trendingSongs: trendingSongs.map((s, i) => (i % 2 ? s : { ...s, title: LONG_TITLE, artist: LONG_ARTIST })),
        trendingAlbums: trendingAlbums.map((a, i) => (i % 2 ? { ...a, title: LONG_TITLE, artist: LONG_ARTIST } : a)),
        charts: charts.map((c) => ({ ...c, title: `${c.title}: The Hottest Songs Everyone Is Talking About Right Now` })),
      });
    case 'missing-art':
      return respond({
        trendingSongs: trendingSongs.map(brokenArt),
        trendingAlbums: trendingAlbums.map(brokenArt),
        charts: charts.map(brokenArt),
        moods: moods.map(brokenArt),
        world: worldStories.map(brokenArt),
      });
    case 'slow':
      return respond(content, 2500);
    default:
      return respond(content);
  }
}

export function fetchGenreSongs(genre: string, scenario: string): Promise<Track[]> {
  const songs = songsByGenre[genre] ?? [];
  switch (scenario) {
    case 'loading':
      return new Promise(() => {});
    case 'error':
    case 'genre-error':
      return fail('We couldn’t load these songs.', 500);
    case 'genre-empty':
      return respond(genre === 'all' ? songs : [], 400);
    case 'sparse':
      return respond(songs.slice(0, 1), 400);
    case 'long-text':
      return respond(songs.map((s, i) => (i % 2 ? s : { ...s, title: LONG_TITLE, artist: LONG_ARTIST })), 400);
    case 'missing-art':
      return respond(songs.map(brokenArt), 400);
    case 'slow':
      return respond(songs, 2500);
    default:
      return respond(songs, 400);
  }
}

export interface ProfileContent {
  profile: Profile;
  liked: Track[];
  reups: Track[];
  followers: Profile[];
  following: Profile[];
}

export class NotFoundError extends Error {}

const pt = profileTracks;

/** Fixed content for people other than the signed-in user. */
const otherContent: Record<string, Omit<ProfileContent, 'profile'>> = {
  goose: {
    liked: [pt.helena2025, pt.papaute],
    reups: [pt.dynamite],
    followers: [profiles.me, profiles.paris, profiles.lofi],
    following: [profiles.painting, profiles.top],
  },
};

function contentFor(id: string): Omit<ProfileContent, 'profile'> {
  if (id === ME_ID) {
    return {
      liked: myLikedTracks,
      reups: myReuppedTracks,
      followers: myFollowers,
      following: [profiles.paris, profiles.painting],
    };
  }
  return (
    otherContent[id] ?? {
      liked: [pt.teImagino, pt.dynamite, pt.papaute],
      reups: [pt.helena2025],
      followers: [profiles.me, profiles.goose],
      following: [profiles.phoebe],
    }
  );
}

export function fetchProfile(id: string, scenario: string): Promise<ProfileContent> {
  const profile = profiles[id];
  if (!profile || scenario === 'not-found') {
    return fail('not found').catch(() => Promise.reject(new NotFoundError('This profile doesn’t exist.')));
  }
  const content = { profile, ...contentFor(id) };

  switch (scenario) {
    case 'loading':
      return new Promise(() => {});
    case 'error':
      return fail('We couldn’t load this profile. Check your connection and try again.');
    case 'empty':
      return respond({
        profile: { ...profile, banner: null, followers: 0, following: 0 },
        liked: [],
        reups: [],
        followers: [],
        following: [],
      });
    case 'missing-images':
      return respond({
        ...content,
        profile: { ...profile, avatar: 'broken://image', banner: 'broken://image' },
        liked: content.liked.map((t) => ({ ...t, cover: 'broken://image' })),
        reups: content.reups.map((t) => ({ ...t, cover: 'broken://image' })),
      });
    case 'long-text':
      return respond({
        ...content,
        profile: {
          ...profile,
          name: 'John "The Playlist Curator" Doe-Montgomery',
          handle: 'john_doe_official_music_account_2026',
        },
        liked: content.liked.map((t, i) =>
          i === 0 ? { ...t, title: LONG_TITLE, artist: LONG_ARTIST, tag: 'Alternative Experimental Bedroom Pop' } : t,
        ),
      });
    case 'big-numbers':
      return respond({ ...content, profile: { ...profile, followers: 1_284_311, following: 12_402 } });
    case 'many': {
      const pool = Object.values(pt);
      const people = Object.values(profiles).filter((p) => p.id !== id);
      return respond({
        ...content,
        liked: Array.from({ length: 24 }, (_, i) => ({ ...pool[i % pool.length], id: `${pool[i % pool.length].id}-${i}` })),
        followers: Array.from({ length: 30 }, (_, i) => ({ ...people[i % people.length], id: people[i % people.length].id })),
      });
    }
    default:
      return respond(content);
  }
}

export function fetchChart(country: string, scenario: string): Promise<Chart> {
  const chart = countryCharts.find((c) => c.country === country) ?? countryCharts[0];
  switch (scenario) {
    case 'loading':
      return new Promise(() => {});
    case 'error':
      return fail('We couldn’t load this chart. Check your connection and try again.');
    case 'empty':
      return respond({ ...chart, songs: [], albums: [], playlists: [] });
    case 'full':
      // A full Top 100: repeat the designed songs with unique ids so ranks run 1–100.
      return respond({
        ...chart,
        songs: Array.from({ length: 100 }, (_, i) => {
          const s = chart.songs[i % chart.songs.length];
          return { ...s, id: `${s.id}-${i}` };
        }),
      });
    case 'long-text':
      return respond({
        ...chart,
        songs: chart.songs.map((s, i) => (i % 2 ? s : { ...s, title: LONG_TITLE, artist: LONG_ARTIST })),
        albums: chart.albums.map((a, i) => (i % 2 ? { ...a, title: LONG_TITLE } : a)),
      });
    case 'missing-art':
      return respond({
        ...chart,
        banner: 'broken://image',
        songs: chart.songs.map(brokenArt),
        albums: chart.albums.map(brokenArt),
        playlists: chart.playlists.map(brokenArt),
      });
    case 'slow':
      return respond(chart, 2500);
    default:
      return respond(chart);
  }
}
