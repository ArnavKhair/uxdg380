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
import arianaAvatar from '../assets/search/ariana-grande.png';
import arianaEssentials from '../assets/search/ariana-essentials.png';
import holidayClassics from '../assets/search/new-holiday-classics.png';
import noelSeason from '../assets/search/noel-season.png';
import vocalsChills from '../assets/search/vocals-chills.png';
import intoYouCover from '../assets/search/into-you-x-bye.png';
import moodLateNight from '../assets/collections/mood-late-night.jpg';
import moodHeartbreak from '../assets/collections/mood-heartbreak.jpg';
import moodParty from '../assets/collections/mood-party.jpg';
import blindingLightsCover from '../assets/covers/blinding-lights.png';
import { albums } from './albums';
import { songsByGenre } from './discover';
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
  // Extra accounts from the Figma search results ("search bar", 253:2285), so searching "goose" finds several people.
  goose1177: { id: 'goose1177', name: 'goose1177', avatar: null, followers: 0, following: 3 },
  goose1100: { id: 'goose1100', name: 'goose1100', avatar: null, followers: 0, following: 1 },
  // The "Accounts" result in the search frame (253:2079)
  // Artist account so searching "The Weeknd" gets the same results layout as Ariana Grande.
  // Avatar is the Hurry Up Tomorrow artwork, as on his album page.
  weeknd: {
    id: 'weeknd',
    name: 'The Weeknd',
    handle: 'theweeknd',
    avatar: albums['hurry-up-tomorrow']?.cover ?? blindingLightsCover,
    verified: true,
    followers: 2_418_553,
    following: 0,
  },
  ariana: { id: 'ariana', name: 'Ariana Grande', handle: 'arianagrande', avatar: arianaAvatar, verified: true, followers: 664_291, following: 0 },
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

/** The two songs under "SONGS & ALBUMS" in the search frame (253:2079), with the details it shows. */
export const searchTracks: Track[] = [
  {
    ...roadtripTracks[0],
    album: 'eternal sunshine',
    releaseDate: '2026-05-21',
    uploader: 'sturvi2306',
    tag: 'Hip-Hop',
  },
  {
    id: 'into-you-x-bye',
    title: 'Into You X bye (altare remix)',
    artist: 'Ariana Grande (mashup)',
    cover: intoYouCover,
    durationSec: 245,
    releaseDate: '2026-07-28',
    uploader: 'Vi',
    tag: 'Pop',
  },
];

const curated = (
  id: string,
  title: string,
  cover: string,
  description: string,
  songs: Track[],
): Playlist => ({
  id,
  title,
  cover,
  ownerId: 'audiomack',
  tracks: songs,
  genre: 'pop',
  privacy: 'public',
  description,
  updatedAt: new Date('2026-10-01T12:00:00').getTime(),
});

/** The Weeknd's songs: Blinding Lights plus the Hurry Up Tomorrow tracklist (real iTunes previews). */
const hurryUp = albums['hurry-up-tomorrow'];
const blindingLights: Track = {
  ...(Object.values(songsByGenre)
    .flat()
    .find((t) => t.id === 'blinding-lights') ?? {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    cover: blindingLightsCover,
    durationSec: 200,
  }),
  album: 'After Hours',
  releaseDate: '2019-11-29',
  uploader: 'theweeknd',
  tag: 'R&B',
};
const weekndAlbumTracks: Track[] = (hurryUp?.tracks ?? []).map((t) => ({
  ...t,
  album: hurryUp.title,
  uploader: 'theweeknd',
}));
// Solo tracks first, so the top results are his own songs rather than features.
// Short interludes (under 90s) are left out of the picks.
const weekndSolo = weekndAlbumTracks.filter((t) => t.artist === 'The Weeknd' && t.durationSec >= 90);
const weekndTracks: Track[] = [blindingLights, ...weekndSolo, ...weekndAlbumTracks.filter((t) => t.artist !== 'The Weeknd')];

/** Songs shown on the artist accounts' profile tabs (data/api.ts). */
export const artistTracks: Record<string, Track[]> = {
  weeknd: weekndTracks,
};

searchTracks.push(blindingLights, ...weekndSolo.slice(0, 2));

/** Four playlists for The Weeknd's search results, laid out like the Ariana frame (253:2079). */
const weekndPlaylists: Playlist[] = [
  { ...curated('the-weeknd-essentials', 'The Weeknd Essentials', blindingLightsCover, 'The best songs by The Weeknd', weekndTracks.slice(0, 8)), ownerId: 'weeknd' },
  curated('late-night-drive', 'Late Night Drive', moodLateNight, 'Neon-lit R&B for the empty highway', [
    blindingLights,
    ...weekndSolo.slice(2, 6),
  ]),
  curated('heartbreak-hotel', 'Heartbreak Hotel', moodHeartbreak, '', [weekndSolo[0] ?? blindingLights, roadtripTracks[1]]),
  curated('synth-pop-revival', 'Synth-Pop Revival', moodParty, '', [blindingLights, ...weekndSolo.slice(6, 9)]),
];

/** The four playlists under "PLAYLISTS" in the search frame (253:2079). */
export const searchPlaylists: Playlist[] = [
  {
    ...curated('ariana-essentials', 'Ariana Grande Essentials', arianaEssentials, 'The best songs by Ariana Grande', [
      ...roadtripTracks,
      searchTracks[1],
    ]),
    ownerId: 'ariana', // shows on her profile's Playlists tab
  },
  curated('new-holiday-classics', 'New Holiday Classics', holidayClassics, 'Give the holidays a modern spin', [
    roadtripTracks[2],
    roadtripTracks[0],
  ]),
  curated('noel-season-vol-1', 'Noel Season Vol. 1', noelSeason, '', [roadtripTracks[1], roadtripTracks[2]]),
  curated('vocals-that-give-you-chills', 'Vocals That Give You Chills', vocalsChills, '', [
    roadtripTracks[1],
    searchTracks[1],
  ]),
  ...weekndPlaylists,
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
