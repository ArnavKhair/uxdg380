import data from './itunes.json';
import type { Track } from './types';

/*
 * 30-second iTunes previews, looked up ahead of time by `npm run fetch-previews`
 * (scripts/fetch-itunes.mjs) and saved in itunes.json. The app never calls the iTunes API;
 * it only streams the saved preview / artwork URLs from Apple's CDN, so nothing heavy ships
 * with the prototype.
 */
export interface ItunesTrack {
  itunesId: number;
  title: string; // as iTunes names it, for checking the match
  artist: string;
  previewUrl: string | null;
  artwork: string | null;
  durationSec: number; // full song length
}

export interface ItunesAlbum {
  collectionId: number;
  title: string;
  artist: string;
  releaseDate: string; // ISO date
  genre: string;
  copyright: string | null;
  artwork: string | null;
  tracks: (ItunesTrack & { trackNumber: number })[];
}

interface ItunesData {
  generatedAt: string | null;
  tracks: Record<string, ItunesTrack | null>; // null = looked up, no match
  albums: Record<string, ItunesAlbum | null>;
}

const itunes = data as ItunesData;

/** Lower-case, accent-free, without "(feat. …)", brackets or punctuation. Shared with the fetch script. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[“”"’']/g, '')
    .replace(/\((feat|ft|with|from)[^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\s(feat\.?|ft\.?|featuring)\s.*$/, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Lookup key for a song: survives the cloned/renamed copies the edge-case scenarios make. */
export function songKey(title: string, artist: string): string {
  return `${normalize(title)}|${normalize(artist)}`;
}

export function itunesTrack(title: string, artist: string): ItunesTrack | null {
  return itunes.tracks[songKey(title, artist)] ?? null;
}

export function previewFor(track: Pick<Track, 'title' | 'artist'>): string | null {
  return itunesTrack(track.title, track.artist)?.previewUrl ?? null;
}

export function itunesAlbum(albumId: string): ItunesAlbum | null {
  return itunes.albums[albumId] ?? null;
}
