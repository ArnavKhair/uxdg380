import chartUsa from '../assets/collections/chart-usa.png';
import chartJamaica from '../assets/collections/chart-jamaica.png';
import moodEnergetic from '../assets/collections/mood-energetic.png';
import moodLove from '../assets/collections/mood-love.png';
import worldOmb from '../assets/collections/world-omb-peezy.png';
import worldAmazon from '../assets/collections/world-amazon.png';
import flagNigeria from '../assets/collections/flag-ng.svg';
import flagUk from '../assets/collections/flag-gb.svg';
import flagCanada from '../assets/collections/flag-ca.svg';
import flagBrazil from '../assets/collections/flag-br.svg';
import moodChill from '../assets/collections/mood-chill.jpg';
import moodWorkout from '../assets/collections/mood-workout.jpg';
import moodParty from '../assets/collections/mood-party.jpg';
import moodHeartbreak from '../assets/collections/mood-heartbreak.jpg';
import moodLateNight from '../assets/collections/mood-late-night.jpg';
import moodFocus from '../assets/collections/mood-focus.jpg';
import { itunesAlbum, itunesTrack } from './itunes';
import type { Album, Collection, Track } from './types';

/*
 * Content for the Discover screen (Figma "Discovery page option 18", 550:19711).
 * Genre rows start with the team's four songs per filter from the Figma state frames,
 * followed by eight more real songs per genre (all available on iTunes, so they have previews).
 * Songs without local artwork use the iTunes
 * artwork saved in itunes.json (streamed from Apple, not bundled).
 */
const coverFiles = import.meta.glob<string>('../assets/covers/*.png', { eager: true, import: 'default' });
const cover = (slug: string) => coverFiles[`../assets/covers/${slug}.png`] ?? null;

function track(slug: string, title: string, artist: string, durationSec?: number): Track {
  const it = itunesTrack(title, artist);
  return {
    id: slug,
    title,
    artist,
    cover: cover(slug) ?? it?.artwork ?? null,
    durationSec: durationSec ?? it?.durationSec ?? 200,
  };
}

/** Extra songs: id from the title, cover + length from iTunes. */
const more = (title: string, artist: string) =>
  track(
    `${title}-${artist}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    title,
    artist,
  );

const t = {
  blindingLights: track('blinding-lights', 'Blinding Lights', 'The Weeknd', 200),
  calmDown: track('calm-down', 'Calm Down', 'Rema', 239),
  paintTheTown: track('paint-the-town-red', 'Paint The Town Red', 'Doja Cat', 231),
  moscowMule: track('moscow-mule', 'Moscow Mule', 'Bad Bunny', 245),
  levitating: track('levitating', 'Levitating', 'Dua Lipa', 203),
  espresso: track('espresso', 'Espresso', 'Sabrina Carpenter', 175),
  good4u: track('good-4-u', 'good 4 u', 'Olivia Rodrigo', 178),
  rush: track('rush', 'Rush', 'Ayra Starr', 185),
  essence: track('essence', 'Essence', 'Wizkid ft. Tems', 249),
  water: track('water', 'Water', 'Tyla', 200),
  snooze: track('snooze', 'Snooze', 'SZA', 201),
  superBass: track('super-bass', 'Super Bass', 'Nicki Minaj', 200),
  seeYouAgain: track('see-you-again', 'See You Again', 'Tyler, The Creator ft. Kali Uchis', 180),
  despecha: track('despecha', 'Despecha', 'Rosalia', 157),
  provenza: track('provenza', 'Provenza', 'Karol G', 210),
  bailando: track('bailando', 'Bailando', 'Enrique Iglesias ft. Sean Paul', 243),
  getYou: track('get-you', 'Get You', 'Daniel Caesar ft. Kali Uchis', 278),
  bestPart: track('best-part', 'Best Part', 'Daniel Caesar ft. H.E.R.', 209),
  records: track('put-your-records-on', 'Put Your Records On', 'Corinne Bailey Rae', 215),
  comeAway: track('come-away-with-me', 'Come Away With Me', 'Norah Jones', 198),
  temperature: track('temperature', 'Temperature', 'Sean Paul', 218),
  toast: track('toast', 'Toast', 'Koffee', 190),
  cheerleader: track('cheerleader', 'Cheerleader (Felix Jaehn Remix)', 'OMI', 180),
  turnMeOn: track('turn-me-on', 'Turn Me On', 'Kevin Lyttle', 192),
  oneKiss: track('one-kiss', 'One Kiss', 'Calvin Harris & Dua Lipa', 214),
  theMiddle: track('the-middle', 'The Middle', 'Zedd, Maren Morris & Grey', 184),
  clarity: track('clarity', 'Clarity', 'Zedd ft. Foxes', 271),
  nanana: track('it-goes-like-nanana', 'It Goes Like (Nanana)', 'Peggy Gou', 232),
  customMade: track('custom-made', 'custom MADE. Feat Tink', 'YFN Lucci & Tink', 196),
  conversation: track('conversation', 'Conversation', 'FattMack', 174),
  bodies: track('bodies-on-the-floor', 'Bodies on the Floor', 'John Legend, Clipse', 222),
  melody: track('melody', 'Melody', 'King Promise', 188),
};

export interface Genre {
  id: string;
  label: string;
}

export const genres: Genre[] = [
  { id: 'all', label: 'All' },
  { id: 'pop', label: 'Pop' },
  { id: 'afrosounds', label: 'Afrosounds' },
  { id: 'hip-hop', label: 'Hip-Hop/Rap' },
  { id: 'latin', label: 'Latin' },
  { id: 'jazz-blues', label: 'Jazz/Blues' },
  { id: 'caribbean', label: 'Caribbean' },
  { id: 'electronic', label: 'Electronic' },
];

export const songsByGenre: Record<string, Track[]> = {
  all: [
    t.blindingLights, t.calmDown, t.paintTheTown, t.moscowMule,
    more('Flowers', 'Miley Cyrus'),
    more('Anti-Hero', 'Taylor Swift'),
    more('As It Was', 'Harry Styles'),
    more('Not Like Us', 'Kendrick Lamar'),
    more('Shape of You', 'Ed Sheeran'),
    more('Unholy', 'Sam Smith & Kim Petras'),
    more('Lose Control', 'Teddy Swims'),
    more('Die With A Smile', 'Lady Gaga & Bruno Mars'),
  ],
  pop: [
    t.levitating, t.espresso, t.blindingLights, t.good4u,
    more('Cruel Summer', 'Taylor Swift'),
    more('Watermelon Sugar', 'Harry Styles'),
    more('Houdini', 'Dua Lipa'),
    more('vampire', 'Olivia Rodrigo'),
    more('BIRDS OF A FEATHER', 'Billie Eilish'),
    more('greedy', 'Tate McRae'),
    more('Good Luck, Babe!', 'Chappell Roan'),
    more('Please Please Please', 'Sabrina Carpenter'),
  ],
  afrosounds: [
    t.calmDown, t.rush, t.essence, t.water,
    more('love nwantiti (ah ah ah)', 'CKay'),
    more('Last Last', 'Burna Boy'),
    more('KU LO SA', 'Oxlade'),
    more('UNAVAILABLE', 'Davido ft. Musa Keys'),
    more('Peru', 'Fireboy DML'),
    more('Sungba', 'Asake'),
    more('Commas', 'Ayra Starr'),
    more('City Boys', 'Burna Boy'),
  ],
  'hip-hop': [
    t.paintTheTown, t.snooze, t.superBass, t.seeYouAgain,
    more('SICKO MODE', 'Travis Scott'),
    more('HUMBLE.', 'Kendrick Lamar'),
    more('God’s Plan', 'Drake'),
    more('Rich Flex', 'Drake & 21 Savage'),
    more('Lovin On Me', 'Jack Harlow'),
    more('Big Energy', 'Latto'),
    more('Savage', 'Megan Thee Stallion'),
    more('FE!N', 'Travis Scott ft. Playboi Carti'),
  ],
  latin: [
    t.moscowMule, t.despecha, t.provenza, t.bailando,
    more('Despacito', 'Luis Fonsi ft. Daddy Yankee'),
    more('Hips Don’t Lie', 'Shakira ft. Wyclef Jean'),
    more('Ella Baila Sola', 'Eslabon Armado & Peso Pluma'),
    more('Mi Gente', 'J Balvin & Willy William'),
    more('Gasolina', 'Daddy Yankee'),
    more('Vivir Mi Vida', 'Marc Anthony'),
    more('La Bachata', 'Manuel Turizo'),
    more('Hawái', 'Maluma'),
  ],
  'jazz-blues': [
    t.getYou, t.bestPart, t.records, t.comeAway,
    more('Feeling Good', 'Nina Simone'),
    more('Fly Me to the Moon', 'Frank Sinatra'),
    more('At Last', 'Etta James'),
    more('What a Wonderful World', 'Louis Armstrong'),
    more('Take Five', 'The Dave Brubeck Quartet'),
    more('The Thrill Is Gone', 'B.B. King'),
    more('Back to Black', 'Amy Winehouse'),
    more('Sway', 'Michael Bublé'),
  ],
  caribbean: [
    t.temperature, t.toast, t.cheerleader, t.turnMeOn,
    more('Murder She Wrote', 'Chaka Demus & Pliers'),
    more('It Wasn’t Me', 'Shaggy'),
    more('Three Little Birds', 'Bob Marley & The Wailers'),
    more('Pon de Replay', 'Rihanna'),
    more('Bam Bam', 'Sister Nancy'),
    more('No Letting Go', 'Wayne Wonder'),
    more('Here Comes the Hotstepper', 'Ini Kamoze'),
    more('Welcome to Jamrock', 'Damian Marley'),
  ],
  electronic: [
    t.oneKiss, t.theMiddle, t.clarity, t.nanana,
    more('Titanium', 'David Guetta ft. Sia'),
    more('Wake Me Up', 'Avicii'),
    more('Don’t You Worry Child', 'Swedish House Mafia'),
    more('Lean On', 'Major Lazer & DJ Snake'),
    more('Animals', 'Martin Garrix'),
    more('Strobe', 'deadmau5'),
    more('Get Lucky', 'Daft Punk ft. Pharrell Williams'),
    more('Midnight City', 'M83'),
  ],
};

export const trendingSongs: Track[] = [
  t.customMade, t.conversation, t.bodies, t.melody,
  more('luther', 'Kendrick Lamar & SZA'),
  more('APT.', 'ROSÉ & Bruno Mars'),
  more('Beautiful Things', 'Benson Boone'),
  more('Messy', 'Lola Young'),
  more('A Bar Song (Tipsy)', 'Shaboozey'),
  more('Abracadabra', 'Lady Gaga'),
  more('Ordinary', 'Alex Warren'),
  more('Manchild', 'Sabrina Carpenter'),
];

/** Extra albums: cover from iTunes (the tracklist and album page come from itunes.json too). */
const album = (id: string, title: string, artist: string): Album => ({
  id,
  title,
  artist,
  cover: cover(id) ?? itunesAlbum(id)?.artwork ?? null,
});

export const trendingAlbums: Album[] = [
  { id: 'watch-dis', title: 'Watch Dis!', artist: 'Yung Miami', cover: cover('watch-dis') },
  { id: 'wayward', title: 'WayWard', artist: 'Shallipopi', cover: cover('wayward') },
  { id: 'luh-leakyz', title: 'Luh Leakyz Vol. 1', artist: 'Yeat, Lyfestyle Corporation', cover: cover('luh-leakyz') },
  { id: 'press-play', title: 'Press Play', artist: 'LISA', cover: cover('press-play') },
  album('gnx', 'GNX', 'Kendrick Lamar'),
  album('short-n-sweet', 'Short n’ Sweet', 'Sabrina Carpenter'),
  album('hit-me-hard-and-soft', 'HIT ME HARD AND SOFT', 'Billie Eilish'),
  album('sos', 'SOS', 'SZA'),
  album('hurry-up-tomorrow', 'Hurry Up Tomorrow', 'The Weeknd'),
  album('midwest-princess', 'The Rise and Fall of a Midwest Princess', 'Chappell Roan'),
];

/*
 * Chart cards use public-domain flag SVGs (flagcdn.com); mood cards use CC0 / public-domain
 * photos (sources in src/assets/collections/CREDITS.md). World stories reuse album art.
 */
const albumArt = (id: string) => trendingAlbums.find((a) => a.id === id)?.cover ?? null;

export const charts: Collection[] = [
  { id: 'usa', title: 'Top 100 - USA', description: 'Best songs in the US', image: chartUsa, to: '/charts/usa' },
  {
    id: 'jamaica',
    title: 'Top 100 - Jamaica',
    description: 'Best songs in Jamaica',
    image: chartJamaica,
    to: '/charts/jamaica',
  },
  { id: 'nigeria', title: 'Top 100 - Nigeria', description: 'Best songs in Nigeria', image: flagNigeria, to: '/charts/nigeria' },
  { id: 'uk', title: 'Top 100 - UK', description: 'Best songs in the UK', image: flagUk, to: '/charts/uk' },
  { id: 'canada', title: 'Top 100 - Canada', description: 'Best songs in Canada', image: flagCanada, to: '/charts/canada' },
  { id: 'brazil', title: 'Top 100 - Brazil', description: 'Best songs in Brazil', image: flagBrazil, to: '/charts/brazil' },
];

export const moods: Collection[] = [
  { id: 'energetic', title: 'Energetic', description: 'Something upbeat', image: moodEnergetic, to: '/moods/energetic' },
  { id: 'love', title: 'Love', description: 'Fall in love with these songs', image: moodLove, to: '/moods/love' },
  { id: 'chill', title: 'Chill', description: 'Slow it down and unwind', image: moodChill, to: '/moods/chill' },
  { id: 'workout', title: 'Workout', description: 'Hard-hitting tracks to keep you moving', image: moodWorkout, to: '/moods/workout' },
  { id: 'party', title: 'Party', description: 'Turn it up and get the room going', image: moodParty, to: '/moods/party' },
  { id: 'heartbreak', title: 'Heartbreak', description: 'For when you need a good cry', image: moodHeartbreak, to: '/moods/heartbreak' },
  { id: 'late-night', title: 'Late Night', description: 'Driving through the city after dark', image: moodLateNight, to: '/moods/late-night' },
  { id: 'focus', title: 'Focus', description: 'Instrumental grooves to get work done', image: moodFocus, to: '/moods/focus' },
];

export const worldStories: Collection[] = [
  {
    id: 'omb-peezy',
    title: 'OMB Peezy Performs "LANGUAGE BARRIER" at Audiomack Studios',
    description: 'The Alabama rapper came through to perform "LANGUAGE BARRIER."',
    image: worldOmb,
    to: '/world',
  },
  {
    id: 'amazon',
    title: 'Exploring the Amazon Rainforest',
    description:
      'A captivating journey through the diverse ecosystems of the Amazon, highlighting its unique wildlife and conservation efforts.',
    image: worldAmazon,
    to: '/world',
  },
  // Placeholder editorial written for the prototype; images reuse album art already in the app.
  {
    id: 'gnx-track-by-track',
    title: 'Kendrick Lamar’s GNX, Track by Track',
    description: 'A close listen to the surprise album that took over the year, from “wacced out murals” to “gloria.”',
    image: albumArt('gnx'),
    to: '/world',
  },
  {
    id: 'chappell-roan',
    title: 'Chappell Roan: From Midwest Princess to Main Stage',
    description: 'How a cult-favourite debut turned into one of pop’s biggest breakout stories.',
    image: albumArt('midwest-princess'),
    to: '/world',
  },
  {
    id: 'billie-hmhas',
    title: 'Inside Billie Eilish’s HIT ME HARD AND SOFT',
    description: 'Billie and FINNEAS on writing an album meant to be heard front to back.',
    image: albumArt('hit-me-hard-and-soft'),
    to: '/world',
  },
  {
    id: 'weeknd-trilogy',
    title: 'The Weeknd Closes the Trilogy',
    description: 'Hurry Up Tomorrow ends the story that began with After Hours. Here’s what to listen for.',
    image: albumArt('hurry-up-tomorrow'),
    to: '/world',
  },
];
