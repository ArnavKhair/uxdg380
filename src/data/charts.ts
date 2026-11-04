import bannerUsa from '../assets/collections/chart-banner-usa.jpg';
import bannerJamaica from '../assets/collections/chart-jamaica.png';
import verifiedHipHop from '../assets/playlists/verified-hip-hop.png';
import youngboyEssentials from '../assets/playlists/youngboy-essentials.png';
import southernHeat from '../assets/playlists/southern-heat.png';
import naijaHits from '../assets/playlists/naija-hits.png';
import flagNigeria from '../assets/collections/flag-ng.svg';
import flagUk from '../assets/collections/flag-gb.svg';
import flagCanada from '../assets/collections/flag-ca.svg';
import flagBrazil from '../assets/collections/flag-br.svg';
import { songsByGenre, trendingAlbums } from './discover';
import type { Album, Playlist, Track } from './types';

/*
 * Charts screen content (Figma "Charts page base", 439:7103). Only the United States
 * chart is designed; the other countries reuse artwork already in the file so the
 * country switcher has somewhere to go.
 */
const coverFiles = import.meta.glob<string>('../assets/covers/*.png', { eager: true, import: 'default' });
const cover = (slug: string) => coverFiles[`../assets/covers/${slug}.png`] ?? null;

function song(slug: string, title: string, artist: string, durationSec: number): Track {
  return { id: slug, title, artist, cover: cover(slug), durationSec };
}

/** Curated playlists shown on charts; owned by Audiomack. */
export type ChartPlaylist = Playlist;

export interface Chart {
  country: string; // URL id
  name: string;
  banner: string | null;
  bannerPosition?: string;
  songs: Track[];
  albums: Album[];
  playlists: ChartPlaylist[];
}

const usSongs: Track[] = [
  song('banks-house', 'BANKS HOUSE', 'Fatt Smaxk', 206),
  song('gta', 'GTA', 'Seyi Vibez', 252),
  song('up-the-score', 'UP THE SCORE', 'Fatt Smaxk', 308),
  song('volume', 'Volume', 'Seyi Vibez', 225),
  song('back-2-u', 'Back 2 U', 'Seyi Vibez', 270),
];

const usAlbums: Album[] = [
  { id: 'swaguu', title: 'SWAGUU', artist: 'Seyi Vibez', cover: cover('swaguu') },
  { id: 'fola-9', title: '9', artist: 'FOLA', cover: cover('fola-9') },
  { id: 'smaxk-season-3', title: 'Smaxk Season 3: Banks House', artist: 'Fatt Smaxk', cover: cover('smaxk-season-3') },
  { id: 'all-eyes-on-shiest', title: 'All Eyes on Shiest', artist: 'Pooh Shiesty', cover: cover('all-eyes-on-shiest') },
];

const curated = { ownerId: 'audiomack', privacy: 'public' as const, updatedAt: new Date('2026-10-20T12:00:00').getTime() };

const playlists: ChartPlaylist[] = [
  {
    ...curated,
    id: 'verified-hip-hop',
    genre: 'hip-hop',
    title: 'Verified: Hip-Hop',
    description: 'Youngboy Never Broke Again, Kodak Black, Lil Baby, Gunna, Future & more!',
    cover: verifiedHipHop,
    tracks: [usSongs[0], usSongs[2], ...songsByGenre['hip-hop']],
  },
  {
    ...curated,
    id: 'youngboy-essentials',
    genre: 'hip-hop',
    title: 'YoungBoy never broke again essentials',
    description: 'The best songs from YoungBoy Never Broke Again',
    cover: youngboyEssentials,
    tracks: [usSongs[1], usSongs[3], usSongs[4]],
  },
  {
    ...curated,
    id: 'southern-heat',
    genre: 'hip-hop',
    title: 'Southern Heat',
    description: 'Southern rap hits',
    cover: southernHeat,
    tracks: [usSongs[2], usSongs[0], songsByGenre['hip-hop'][2]],
  },
  {
    ...curated,
    id: 'naija-hits',
    genre: 'afrosounds',
    title: 'Naija Hits',
    description: 'as e dey hot 🔥',
    cover: naijaHits,
    tracks: [...songsByGenre.afrosounds, usSongs[1]],
  },
];

export const charts: Chart[] = [
  {
    country: 'usa',
    name: 'United States',
    banner: bannerUsa,
    bannerPosition: 'center 39%', // matches the Figma crop of the flag photo
    songs: usSongs,
    albums: usAlbums,
    playlists,
  },
  {
    country: 'jamaica',
    name: 'Jamaica',
    banner: bannerJamaica,
    songs: songsByGenre.caribbean,
    albums: trendingAlbums,
    playlists: [playlists[3], playlists[0]],
  },
  {
    country: 'nigeria',
    name: 'Nigeria',
    banner: flagNigeria,
    songs: [...songsByGenre.afrosounds, usSongs[1]],
    albums: [usAlbums[0], usAlbums[1], trendingAlbums[1]],
    playlists: [playlists[3]],
  },
  {
    country: 'uk',
    name: 'United Kingdom',
    banner: flagUk,
    songs: [...songsByGenre.pop, songsByGenre.electronic[0]],
    albums: trendingAlbums,
    playlists: [playlists[0], playlists[2]],
  },
  {
    country: 'canada',
    name: 'Canada',
    banner: flagCanada,
    songs: [...songsByGenre['hip-hop'].slice(4), ...songsByGenre.pop.slice(0, 4)],
    albums: trendingAlbums.slice(4),
    playlists: [playlists[0], playlists[2]],
  },
  {
    country: 'brazil',
    name: 'Brazil',
    banner: flagBrazil,
    songs: [...songsByGenre.latin, songsByGenre.electronic[4]],
    albums: [...trendingAlbums.slice(6), trendingAlbums[0]],
    playlists: [playlists[3]],
  },
];

export const DEFAULT_COUNTRY = 'usa';

/** Registered in the playlist store so /playlist/:id works for them too. */
export const curatedPlaylists = playlists;
