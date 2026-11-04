import { charts } from './charts';
import { songsByGenre, trendingAlbums, trendingSongs } from './discover';
import { profileTracks, roadtripTracks, tracks } from './mock';
import type { Album, Track } from './types';

/*
 * Every song and album in the prototype, for scripts/fetch-itunes.mjs to look up.
 * Not imported by the app. Add new data sources here so their songs get previews.
 */
export function allSongs(): Pick<Track, 'title' | 'artist'>[] {
  const list: Track[] = [
    ...Object.values(tracks),
    ...Object.values(profileTracks),
    ...roadtripTracks,
    ...trendingSongs,
    ...Object.values(songsByGenre).flat(),
    ...charts.flatMap((c) => [...c.songs, ...c.playlists.flatMap((p) => p.tracks)]),
  ];
  return list.map(({ title, artist }) => ({ title, artist }));
}

export function allAlbums(): Pick<Album, 'id' | 'title' | 'artist'>[] {
  const list = [...trendingAlbums, ...charts.flatMap((c) => c.albums)];
  const seen = new Set<string>();
  return list.filter((a) => !seen.has(a.id) && seen.add(a.id)).map(({ id, title, artist }) => ({ id, title, artist }));
}
