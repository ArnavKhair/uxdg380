import { albums, type AlbumDetail } from './albums';
import { charts } from './charts';
import { songsByGenre, trendingSongs } from './discover';
import { normalize } from './itunes';
import { ME_ID, profileTracks, profiles, roadtripTracks, searchTracks, tracks } from './mock';
import type { Playlist, Profile, Track } from './types';

/*
 * Search index for the global search bar (Figma "search bar" frames in "playlist + search", 444:2632).
 * Everything searchable in the prototype: people, every song on any screen, every album
 * with a detail page, and playlists (passed in, because they live in state and change).
 */
export interface SearchResults {
  profiles: Profile[];
  playlists: Playlist[];
  songs: Track[];
  albums: AlbumDetail[];
}

export type SearchTab = 'all' | keyof SearchResults;

/** Accounts with a profile page (/user/:id). Artist records on albums have no page, so they're left out. */
const people: Profile[] = Object.values(profiles).filter((p) => p.id !== ME_ID);

/** Every song in the prototype, de-duplicated (the same song appears on several screens). */
const songs: Track[] = (() => {
  const all = [
    ...searchTracks, // first, so the copies with the search frame's details win
    ...Object.values(profileTracks),
    ...roadtripTracks,
    ...trendingSongs,
    ...charts.flatMap((c) => [...c.songs, ...c.playlists.flatMap((p) => p.tracks)]),
    ...Object.values(songsByGenre).flat(),
    ...Object.values(albums).flatMap((a) => a.tracks),
    ...Object.values(tracks),
  ];
  const byKey = new Map<string, Track>();
  for (const t of all) {
    const key = `${normalize(t.title)}|${normalize(t.artist)}`;
    const seen = byKey.get(key);
    // Keep the copy with artwork / release info when there are several.
    if (!seen || (!seen.cover && t.cover)) {
      byKey.set(key, t);
    }
  }
  return [...byKey.values()];
})();

const albumList: AlbumDetail[] = Object.values(albums);

/**
 * 0 = no match. Every word of the query has to start a word somewhere in the fields;
 * a match on the first field (the name/title) ranks above a match on the others.
 */
function score(query: string, fields: (string | undefined)[]): number {
  const words = query.split(' ').filter(Boolean);
  const [primary, ...rest] = fields.map((f) => normalize(f ?? ''));
  // Words match from the start of a word, so "ari" finds Ariana but not Paris.
  const haystack = ` ${[primary, ...rest].join(' ')}`;
  if (!words.every((w) => haystack.includes(` ${w}`))) return 0;
  if (primary === query) return 4;
  if (primary.startsWith(query)) return 3;
  if (words.every((w) => ` ${primary}`.includes(` ${w}`))) return 2;
  return 1;
}

function rank<T>(items: T[], query: string, fields: (item: T) => (string | undefined)[]): T[] {
  return items
    .map((item, i) => ({ item, i, s: score(query, fields(item)) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((r) => r.item);
}

/** `playlists` should already exclude anything the viewer can't see (other people's private ones). */
export function search(rawQuery: string, playlists: Playlist[]): SearchResults {
  const query = normalize(rawQuery);
  if (!query) return { profiles: [], playlists: [], songs: [], albums: [] };

  return {
    profiles: rank(people, query, (p) => [p.name, p.handle]),
    // A playlist also matches on the artists inside it, so "Ariana Grande" finds Roadtrip!.
    playlists: rank(playlists, query, (p) => [
      p.title,
      p.description,
      profiles[p.ownerId]?.name,
      [...new Set(p.tracks.map((t) => t.artist))].join(' '),
    ]),
    songs: rank(songs, query, (t) => [t.title, t.artist, t.tag]),
    albums: rank(albumList, query, (a) => [a.title, a.artist, a.genre]),
  };
}
