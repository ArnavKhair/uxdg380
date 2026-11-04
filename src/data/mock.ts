import goose from '../assets/avatars/goose11.png';
import paris from '../assets/avatars/parispaloma.png';
import painting from '../assets/avatars/probablypainting.png';
import lofi from '../assets/avatars/lofienthusiast.png';
import phoebe from '../assets/avatars/phoebebridgers.png';
import top from '../assets/avatars/twentyonepilots.png';
import gooseBanner from '../assets/profile/goose-banner.jpg';
import papauteCover from '../assets/covers/papaute.png';
import dynamiteCover from '../assets/covers/dynamite.png';
import teImaginoCover from '../assets/covers/te-imagino.png';
import helenaCover from '../assets/covers/helena.png';
import songsForMe from '../assets/playlists/songs-for-me.png';
import songsCover from '../assets/playlists/songs.png';
import roadtrip from '../assets/playlists/roadtrip.png';
import byeCover from '../assets/covers/bye.png';
import hateThatCover from '../assets/covers/hate-that-i-made-you-love-me.png';
import eternalCover from '../assets/covers/eternal-sunshine.png';
import type { Activity, Playlist, Profile, Track } from './types';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** The signed-in user (Figma "Profile page" section, 439:4003). */
export const ME_ID = 'me';

export const profiles: Record<string, Profile> = {
  me: {
    id: ME_ID,
    name: 'John Doe', // Figma "V3 - playlist" (439:3759): "J" initial, no photo or banner
    handle: 'JohnDoe',
    avatar: null,
    banner: null,
    followers: 67,
    following: 420,
  },
  goose: {
    id: 'goose',
    name: 'Goose12',
    handle: 'Goose12',
    avatar: goose,
    banner: gooseBanner,
    bannerFit: 'contain',
    bannerColor: '#276ebc',
    followers: 67,
    following: 420,
  },
  paris: { id: 'paris', name: 'Paris Paloma', handle: 'parispaloma', avatar: paris, followers: 3090, following: 112 },
  painting: { id: 'painting', name: 'ProbablyPainting', avatar: painting, followers: 22, following: 48 },
  lofi: { id: 'lofi', name: 'LofiEnthusiast', avatar: lofi, followers: 10, following: 301 },
  phoebe: { id: 'phoebe', name: 'Phoebe Bridgers', handle: 'phoebebridgers', avatar: phoebe, followers: 2310, following: 87 },
  top: { id: 'top', name: 'Twenty One Pilots', handle: 'twentyonepilots', avatar: top, followers: 28700, following: 12 },
  audiomack: { id: 'audiomack', name: 'Audiomack', handle: 'audiomack', avatar: null, followers: 1_240_000, following: 0 },
};

export const tracks: Record<string, Track> = {
  helena: { id: 'helena', title: 'Helena', artist: 'My Chemical Romance', cover: null, durationSec: 203 },
  stem: { id: 'stem', title: 'Stem the Flow', artist: 'Paris Paloma', cover: null, durationSec: 187 },
  clearDay: {
    id: 'clearDay',
    title: 'On a Clear Day (From “Kiki’s Delivery Service”)',
    artist: 'Studio Ghibli Lullabies',
    cover: null,
    durationSec: 164,
  },
  luv: { id: 'luv', title: 'Luv (sic) pt2', artist: 'Nujabes', cover: null, durationSec: 236 },
  motion: { id: 'motion', title: 'Motion Sickness', artist: 'Phoebe Bridgers', cover: null, durationSec: 230 },
};

/** Songs on the profile "Liked songs" / "Re-Ups" tabs (439:3759, 439:3550). */
export const profileTracks: Record<string, Track> = {
  papaute: {
    id: 'papaute',
    title: 'Papaute',
    artist: 'San_Olamine',
    cover: papauteCover,
    durationSec: 200,
    releaseDate: '2026-02-10',
    tag: 'Afro-Soul',
  },
  dynamite: {
    id: 'dynamite',
    title: 'Dynamite',
    artist: 'BTS',
    cover: dynamiteCover,
    durationSec: 200,
    releaseDate: '2020-08-28',
    tag: 'KPOP',
  },
  teImagino: {
    id: 'teImagino',
    title: 'Te Imagino',
    artist: 'Myke Towers',
    cover: teImaginoCover,
    durationSec: 200,
    releaseDate: '2026-10-21',
    tag: 'Urban Music',
  },
  helena2025: {
    id: 'helena2025',
    title: 'Helena (2025 Mix)',
    artist: 'My Chemical Romance',
    cover: helenaCover,
    durationSec: 200,
    releaseDate: '2025-05-16',
    tag: 'Punk Rock',
  },
};

export const myLikedTracks: Track[] = [
  profileTracks.papaute,
  profileTracks.dynamite,
  profileTracks.teImagino,
  profileTracks.helena2025,
];

export const myReuppedTracks: Track[] = [...myLikedTracks];

/** Profiles the signed-in user follows at the start (Figma "Following" tab shows ProbablyPainting). */
export const myInitialFollowing = ['paris', 'painting'];

export const myFollowers: Profile[] = [
  profiles.paris,
  profiles.painting,
  profiles.goose,
  profiles.lofi,
  profiles.phoebe,
  profiles.top,
];

const ariana = (id: string, title: string, cover: string, durationSec: number): Track => ({
  id,
  title,
  artist: 'Ariana Grande',
  cover,
  durationSec,
  releaseDate: '2024-03-08',
  tag: 'Pop',
});

/** Songs in "Roadtrip!" (Figma "playlist page", 182:1231). */
export const roadtripTracks: Track[] = [
  ariana('bye', 'bye', byeCover, 184),
  ariana('hate-that', 'hate that i made you love me', hateThatCover, 246),
  ariana('eternal-sunshine', 'eternal sunshine', eternalCover, 211),
];

/** Playlists that exist when the prototype starts; chart playlists are added in state/playlists.tsx. */
export const initialPlaylists: Playlist[] = [
  {
    id: 'roadtrip',
    title: 'Roadtrip!',
    cover: roadtrip,
    ownerId: ME_ID,
    tracks: roadtripTracks,
    genre: 'pop',
    privacy: 'public',
    description: '',
    updatedAt: new Date('2026-10-21T12:00:00').getTime(),
  },
  {
    id: 'songs-for-me',
    title: 'songs for me',
    cover: songsForMe,
    ownerId: 'goose',
    tracks: [profileTracks.papaute, profileTracks.dynamite],
    genre: 'all',
    privacy: 'public',
    description: '',
    updatedAt: new Date('2026-09-02T12:00:00').getTime(),
  },
  {
    id: 'songs',
    title: 'songs',
    cover: songsCover,
    ownerId: 'goose',
    tracks: [profileTracks.helena2025],
    genre: 'all',
    privacy: 'public',
    description: '',
    updatedAt: new Date('2026-08-14T12:00:00').getTime(),
  },
];

/** The four rows from the Figma "Feed" frame (439:4230). */
export function baseFeed(now = Date.now()): Activity[] {
  return [
    { id: 'a1', profile: profiles.goose, track: tracks.helena, type: 'reup', at: now - 3 * MIN },
    { id: 'a2', profile: profiles.paris, track: tracks.stem, type: 'reup', at: now - 24 * MIN },
    { id: 'a3', profile: profiles.painting, track: tracks.clearDay, type: 'reup', at: now - 2 * HOUR },
    { id: 'a4', profile: profiles.lofi, track: tracks.luv, type: 'reup', at: now - DAY - HOUR },
  ];
}

/** Profiles suggested on the empty feed ("Unpopulated feed", 439:4005). */
export const suggestedProfiles: Profile[] = [
  profiles.paris,
  profiles.painting,
  profiles.goose,
  profiles.lofi,
  profiles.phoebe,
];
