import { charts } from './charts';
import { trendingAlbums } from './discover';
import { itunesAlbum } from './itunes';
import type { Album, Profile, Track } from './types';

/*
 * Album screen content. Every album card on Discover ("Trending albums") and Charts
 * ("Top albums") links to /album/:id, so each of those albums gets a detail record here.
 *
 * The layout follows the Figma design system: "Song cards → Card Expanded" (401:5039)
 * for the header and "Song cards → Song list" for each track row, plus the artist /
 * stats block from the song pages ("Song page - MCR Helena", 439:4361).
 *
 * Tracklists, release dates, genres and the ℗ line come from iTunes (saved in itunes.json
 * by `npm run fetch-previews`), so every song has a real 30-second preview. The lists
 * written out below are only a fallback for albums iTunes doesn't have.
 * Follower counts and stats are still made up for the prototype.
 */
export interface AlbumDetail extends Album {
  artistProfile: Profile;
  tracks: Track[];
  releaseDate: string; // ISO
  genre: string; // shown as #TAG
  label: string; // full ℗ line, e.g. "℗ 2026 Dvpper Music"
  stats: { plays: number; likes: number; reups: number; playlistAdds: number };
}

const allAlbums: Album[] = [...trendingAlbums, ...charts[0].albums];
const byId = Object.fromEntries(allAlbums.map((a) => [a.id, a]));

/** Chart songs that already exist in the prototype, reused on their artist's album. */
const chartSong = Object.fromEntries(charts[0].songs.map((s) => [s.id, s]));

function artist(id: string, name: string, avatar: string | null, followers: number): Profile {
  return { id: `artist-${id}`, name, handle: id, avatar, followers };
}

function build(
  id: string,
  meta: Omit<AlbumDetail, keyof Album | 'tracks' | 'artistProfile'> & { followers: number },
  songs: (Track | [title: string, durationSec: number])[],
): AlbumDetail {
  const album = byId[id];
  const { followers, ...rest } = meta;
  const it = itunesAlbum(id);
  if (it && it.tracks.length) {
    const genre = it.genre || meta.genre;
    return {
      ...album,
      ...rest,
      releaseDate: it.releaseDate,
      genre,
      label: it.copyright ?? `℗ ${it.releaseDate.slice(0, 4)} ${meta.label}`,
      artistProfile: artist(id, album.artist, album.cover, followers),
      tracks: it.tracks.map((t) => ({
        id: `${id}-${t.trackNumber}`,
        title: t.title,
        artist: t.artist,
        cover: album.cover,
        durationSec: t.durationSec,
        releaseDate: it.releaseDate,
        tag: genre,
      })),
    };
  }
  return {
    ...album,
    ...rest,
    label: `℗ ${meta.releaseDate.slice(0, 4)} ${meta.label}`,
    artistProfile: artist(id, album.artist, album.cover, followers),
    tracks: songs.map((s, i) =>
      Array.isArray(s)
        ? {
            id: `${id}-${i + 1}`,
            title: s[0],
            artist: album.artist,
            cover: album.cover,
            durationSec: s[1],
            releaseDate: meta.releaseDate,
            tag: meta.genre,
          }
        : { ...s, cover: album.cover, releaseDate: meta.releaseDate, tag: meta.genre },
    ),
  };
}

export const albums: Record<string, AlbumDetail> = {
  'watch-dis': build(
    'watch-dis',
    {
      releaseDate: '2026-09-19',
      genre: 'Hip-Hop/Rap',
      label: 'Paper Route Empire',
      followers: 412_000,
      stats: { plays: 1_820_000, likes: 48_200, reups: 3_100, playlistAdds: 21_400 },
    },
    [
      ['Watch Dis!', 162],
      ['Pressure', 175],
      ['Miami Nights', 198],
      ['No Cap', 151],
      ['Caresha Says', 184],
      ['Outro (Thank You)', 133],
    ],
  ),
  wayward: build(
    'wayward',
    {
      releaseDate: '2026-08-02',
      genre: 'Afrosounds',
      label: 'Dapper Music',
      followers: 286_000,
      stats: { plays: 3_400_000, likes: 92_600, reups: 7_800, playlistAdds: 40_100 },
    },
    [
      ['WayWard', 171],
      ['Benin Boys', 189],
      ['Cast', 160],
      ['Ex Convict', 202],
      ['Elon Musk', 177],
      ['Obapluto', 194],
      ['Aza', 168],
    ],
  ),
  'luh-leakyz': build(
    'luh-leakyz',
    {
      releaseDate: '2026-07-11',
      genre: 'Hip-Hop/Rap',
      label: 'Lyfestyle Corporation',
      followers: 1_120_000,
      stats: { plays: 5_900_000, likes: 141_000, reups: 12_300, playlistAdds: 66_800 },
    },
    [
      ['Leakyz Intro', 98],
      ['Rich Rich', 143],
      ['Twizzy Talk', 156],
      ['Back On', 139],
      ['Sorry Bout That', 167],
    ],
  ),
  'press-play': build(
    'press-play',
    {
      releaseDate: '2026-10-03',
      genre: 'Pop',
      label: 'LLOUD',
      followers: 2_310_000,
      stats: { plays: 8_700_000, likes: 260_000, reups: 19_400, playlistAdds: 120_500 },
    },
    [
      ['Press Play', 184],
      ['Moonlit Floor', 172],
      ['Rockstar', 155],
      ['New Woman', 190],
      ['Born Again', 199],
      ['When I’m With You', 181],
      ['Dream', 207],
      ['Thunder', 176],
    ],
  ),
  swaguu: build(
    'swaguu',
    {
      releaseDate: '2026-06-20',
      genre: 'Afrosounds',
      label: 'Dvpper Music',
      followers: 930_000,
      stats: { plays: 4_200_000, likes: 118_000, reups: 9_900, playlistAdds: 52_700 },
    },
    [chartSong['gta'], chartSong['volume'], chartSong['back-2-u'], ['Billion Dollar Baby', 213], ['Different Pattern', 196]],
  ),
  'fola-9': build(
    'fola-9',
    {
      releaseDate: '2026-05-09',
      genre: 'Afrosounds',
      label: 'Native Records',
      followers: 154_000,
      stats: { plays: 960_000, likes: 22_800, reups: 1_400, playlistAdds: 8_900 },
    },
    [
      ['Intro', 74],
      ['Nine Lives', 188],
      ['Bad Energy', 171],
      ['Lagos Love', 203],
      ['Only You', 179],
      ['Ìyá', 214],
      ['Outro', 96],
    ],
  ),
  'smaxk-season-3': build(
    'smaxk-season-3',
    {
      releaseDate: '2026-09-26',
      genre: 'Hip-Hop/Rap',
      label: 'Smaxk Season LLC',
      followers: 64_300,
      stats: { plays: 2_050_000, likes: 37_900, reups: 4_600, playlistAdds: 15_200 },
    },
    [chartSong['banks-house'], chartSong['up-the-score'], ['Season Opener', 158], ['Bag Talk', 181], ['No Days Off', 194]],
  ),
  'all-eyes-on-shiest': build(
    'all-eyes-on-shiest',
    {
      releaseDate: '2026-04-17',
      genre: 'Hip-Hop/Rap',
      label: '1017 Records',
      followers: 1_480_000,
      stats: { plays: 6_300_000, likes: 174_000, reups: 15_600, playlistAdds: 70_300 },
    },
    [
      ['All Eyes', 166],
      ['Back In Blood', 159],
      ['Memphis Made', 172],
      ['Shiesty Season', 188],
      ['No Hooks', 147],
      ['Last Word', 201],
    ],
  ),
};

/*
 * Albums added to Discover without hand-written details (GNX, MAYHEM, …) get everything from
 * iTunes; follower counts and stats are generated from the album id so they stay stable.
 */
function made(id: string, scale: number) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Math.round(scale * (0.5 + (h % 1000) / 1000));
}

for (const a of allAlbums) {
  const it = itunesAlbum(a.id);
  if (albums[a.id] || !it) continue;
  albums[a.id] = build(
    a.id,
    {
      releaseDate: it.releaseDate,
      genre: it.genre,
      label: it.artist,
      followers: made(a.id, 4_000_000),
      stats: {
        plays: made(a.id + 'p', 20_000_000),
        likes: made(a.id + 'l', 500_000),
        reups: made(a.id + 'r', 40_000),
        playlistAdds: made(a.id + 'a', 250_000),
      },
    },
    [],
  );
}

/** Other albums to suggest under the current one ("More albums like this"). */
export function relatedAlbums(id: string, count = 4): AlbumDetail[] {
  const current = albums[id];
  const rest = Object.values(albums).filter((a) => a.id !== id);
  // Same genre first, then everything else, keeping the original order.
  const sameGenre = rest.filter((a) => a.genre === current?.genre);
  const other = rest.filter((a) => a.genre !== current?.genre);
  return [...sameGenre, ...other].slice(0, count);
}
