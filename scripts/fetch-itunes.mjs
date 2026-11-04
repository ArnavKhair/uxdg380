#!/usr/bin/env node
/*
 * Looks up 30-second iTunes previews (and real album tracklists) for every song and album in
 * the prototype, and saves them to src/data/itunes.json. Run it whenever songs are added:
 *
 *   npm run fetch-previews            # only looks up songs/albums not found yet
 *   npm run fetch-previews -- --force # looks everything up again
 *
 * Wrong match? Pin the right iTunes ID in scripts/itunes-overrides.json, e.g.
 *   { "tracks": { "blinding lights|the weeknd": 1488408568 }, "albums": { "swaguu": 1234567 } }
 * (keys are printed in the report at the end), then run the script again.
 *
 * The iTunes Search API allows ~20 requests a minute, so requests are spaced out.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'src/data/itunes.json');
const OVERRIDES = resolve(root, 'scripts/itunes-overrides.json');
const FORCE = process.argv.includes('--force');
const GAP_MS = 3200;
const COUNTRY = 'us';

// ---- load the prototype's own data through Vite (handles TS, image imports, import.meta.glob)
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const { allSongs, allAlbums } = await vite.ssrLoadModule('/src/data/catalog.ts');
const { normalize, songKey } = await vite.ssrLoadModule('/src/data/itunes.ts');
const songs = allSongs();
const albums = allAlbums();
await vite.close();

const data = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { tracks: {}, albums: {} };
const overrides = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf8')) : { tracks: {}, albums: {} };
const report = { matched: [], fuzzy: [], missing: [] };

// ---- iTunes helpers
let last = 0;
async function itunes(path, params) {
  const wait = last + GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const url = `https://itunes.apple.com/${path}?${new URLSearchParams({ country: COUNTRY, ...params })}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    last = Date.now();
    const res = await fetch(url);
    if (res.ok) return (await res.json()).results ?? [];
    if (res.status === 403 || res.status === 429) {
      process.stdout.write(` (rate limited, waiting ${20 * (attempt + 1)}s)`);
      await new Promise((r) => setTimeout(r, 20_000 * (attempt + 1)));
      continue;
    }
    throw new Error(`${res.status} ${url}`);
  }
  throw new Error(`gave up: ${url}`);
}

const artwork = (r) => r.artworkUrl100?.replace('100x100bb', '600x600bb') ?? null;
const firstArtist = (a) => normalize(a.split(/,|&| x | ft\.? | feat\.? | with /i)[0]);
const UNWANTED = /\b(remix|live|instrumental|karaoke|sped up|slowed|acoustic|cover|tribute|8d|reverb|version)\b/;

function toTrack(r) {
  return {
    itunesId: r.trackId,
    title: r.trackName,
    artist: r.artistName,
    previewUrl: r.previewUrl ?? null,
    artwork: artwork(r),
    durationSec: Math.round((r.trackTimeMillis ?? 0) / 1000),
  };
}

/** Score an iTunes result against what we asked for. 0 = not the same song. */
function score(r, title, artist) {
  const want = normalize(title);
  const got = normalize(r.trackName ?? r.collectionName ?? '');
  const gotArtist = normalize(r.artistName ?? '');
  const lead = firstArtist(artist);
  const tight = (x) => x.replace(/\s+/g, '');
  let s = 0;
  if (got === want || tight(got) === tight(want)) s += 6;
  else if (got.startsWith(want)) s += 3; // e.g. "Title (Remastered)"
  else return 0;
  // Every word of the lead artist must appear in iTunes' artist credit ("Rosa" ≠ "Rosalía").
  const words = new Set(gotArtist.split(' '));
  if (!lead || !gotArtist) return 0;
  if (gotArtist === normalize(artist)) s += 4;
  else if (lead.split(' ').every((w) => words.has(w))) s += 3;
  else return 0;
  if (UNWANTED.test(got) && !UNWANTED.test(want)) s -= 4;
  if (r.previewUrl || r.wrapperType === 'collection') s += 1;
  return s;
}

/** Search strategies, tried in order until one finds the song (the API's relevance is shaky). */
async function searchBest(title, artist, entity) {
  const attr = entity === 'album' ? 'albumTerm' : 'songTerm';
  const tries = [
    { term: `${title} ${firstArtist(artist)}`, entity, limit: '15' },
    { term: title, entity, attribute: attr, limit: '50' },
    { term: firstArtist(artist), entity, attribute: 'artistTerm', limit: '200' },
  ];
  for (const params of tries) {
    const hit = best(await itunes('search', params), title, artist);
    if (hit) return hit;
  }
  return undefined;
}

function best(results, title, artist) {
  return results
    .map((r) => ({ r, s: score(r, title, artist) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)[0];
}

// ---- albums: real tracklists
data.albums ??= {};
data.tracks ??= {};
for (const album of albums) {
  if (!FORCE && data.albums[album.id] && !overrides.albums?.[album.id]) continue; // misses (null) are retried
  process.stdout.write(`album  ${album.title} — ${album.artist}`);
  let collectionId = overrides.albums?.[album.id];
  if (!collectionId) {
    const hit = await searchBest(album.title, album.artist, 'album');
    collectionId = hit?.r.collectionId;
    if (hit && hit.s < 9) report.fuzzy.push(`album "${album.id}": "${album.title}" → "${hit.r.collectionName}" by ${hit.r.artistName}`);
  }
  if (!collectionId) {
    data.albums[album.id] = null;
    report.missing.push(`album "${album.id}": ${album.title} — ${album.artist}`);
    console.log('  ✗ not found');
    continue;
  }
  const rows = await itunes('lookup', { id: String(collectionId), entity: 'song' });
  const info = rows.find((r) => r.wrapperType === 'collection');
  const trackRows = rows.filter((r) => r.wrapperType === 'track' && r.kind === 'song');
  data.albums[album.id] = {
    collectionId,
    title: info.collectionName,
    artist: info.artistName,
    releaseDate: info.releaseDate.slice(0, 10),
    genre: info.primaryGenreName,
    copyright: info.copyright ?? null,
    artwork: artwork(info),
    tracks: trackRows.map((r) => ({ ...toTrack(r), trackNumber: r.trackNumber })),
  };
  // Album songs are also playable by title/artist lookup.
  for (const r of trackRows) data.tracks[songKey(r.trackName, r.artistName)] = toTrack(r);
  report.matched.push(`album ${album.id}`);
  console.log(`  ✓ ${info.collectionName} (${trackRows.length} songs)`);
}

// ---- songs
const unique = [...new Map(songs.map((s) => [songKey(s.title, s.artist), s])).entries()];
for (const [key, song] of unique) {
  if (!FORCE && data.tracks[key] && !overrides.tracks?.[key]) continue; // misses (null) are retried
  process.stdout.write(`song   ${song.title} — ${song.artist}`);
  const pinned = overrides.tracks?.[key];
  let hit;
  if (pinned) {
    const [r] = await itunes('lookup', { id: String(pinned) });
    hit = r && { r, s: 99 };
  } else {
    hit = await searchBest(song.title, song.artist, 'song');
  }
  if (!hit) {
    data.tracks[key] = null;
    report.missing.push(`"${key}": ${song.title} — ${song.artist}`);
    console.log('  ✗ not found');
    continue;
  }
  data.tracks[key] = toTrack(hit.r);
  if (hit.s < 9) report.fuzzy.push(`"${key}": → "${hit.r.trackName}" by ${hit.r.artistName}`);
  report.matched.push(key);
  console.log(`  ✓ ${hit.r.trackName} — ${hit.r.artistName}${hit.r.previewUrl ? '' : ' (no preview)'}`);
}

// Drop songs that are no longer in the prototype (album songs are kept with their album).
const keep = new Set(unique.map(([key]) => key));
for (const album of Object.values(data.albums)) for (const t of album?.tracks ?? []) keep.add(songKey(t.title, t.artist));
for (const key of Object.keys(data.tracks)) if (!keep.has(key)) delete data.tracks[key];

data.generatedAt = new Date().toISOString();
writeFileSync(OUT, JSON.stringify({ generatedAt: data.generatedAt, tracks: data.tracks, albums: data.albums }, null, 2) + '\n');

console.log(`\nSaved ${OUT}`);
console.log(`Looked up this run: ${report.matched.length} matched, ${report.fuzzy.length} to double-check, ${report.missing.length} not found`);
if (report.fuzzy.length) console.log('\nDouble-check these (not an exact title/artist match):\n  ' + report.fuzzy.join('\n  '));
if (report.missing.length) console.log('\nNot found on iTunes (will play silently):\n  ' + report.missing.join('\n  '));
