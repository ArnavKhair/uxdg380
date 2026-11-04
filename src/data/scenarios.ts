/*
 * Edge-case scenarios. Each screen declares the states it can be forced into;
 * add `?state=<id>` to a screen's URL (e.g. /feed?state=empty) to force one,
 * so any state can be bookmarked or shared with the team as a link.
 */
export interface Scenario {
  id: string;
  label: string;
  description: string;
}

export const DEFAULT_SCENARIO = 'default';

export const screenScenarios: Record<string, Scenario[]> = {
  feed: [
    { id: 'default', label: 'Populated', description: 'The four activity rows from Figma' },
    { id: 'loading', label: 'Loading', description: 'Skeleton rows while the feed is fetched' },
    { id: 'empty', label: 'Empty (new user)', description: 'Follows nobody yet; shows profile suggestions' },
    { id: 'error', label: 'Failed to load', description: 'Network/server error with retry' },
    { id: 'single', label: 'Single item', description: 'Only one activity in the feed' },
    { id: 'all-types', label: 'All activity types', description: 'Uploaded, liked, re-upped and listening rows' },
    { id: 'long-text', label: 'Very long text', description: 'Long usernames and song titles truncate cleanly' },
    { id: 'missing-images', label: 'Missing images', description: 'Avatars fail to load; initials fallback' },
    { id: 'many', label: 'Long feed + ad breaks', description: '40 items with an ad every 8 rows' },
  ],
  discover: [
    { id: 'default', label: 'Populated', description: 'Discovery page option 18 from Figma' },
    { id: 'loading', label: 'Loading', description: 'Skeleton cards while the page is fetched' },
    { id: 'error', label: 'Failed to load', description: 'The whole page failed, with retry' },
    { id: 'genre-error', label: 'Genre failed', description: 'Only the "Songs in" row fails; rest of page is fine' },
    { id: 'genre-empty', label: 'Genre has no songs', description: 'Any filter except All returns nothing' },
    { id: 'slow', label: 'Slow connection', description: '2.5s delay so loading states are easy to see' },
    { id: 'sparse', label: 'Sparse content', description: 'Rows with only 1–2 items; Moods row hidden' },
    { id: 'long-text', label: 'Very long text', description: 'Long titles and artist names' },
    { id: 'missing-art', label: 'Missing artwork', description: 'Covers and images fail to load' },
  ],
  charts: [
    { id: 'default', label: 'Populated', description: 'Charts page base from Figma' },
    { id: 'loading', label: 'Loading', description: 'Skeleton banner, rows and cards' },
    { id: 'error', label: 'Failed to load', description: 'Chart request failed, with retry' },
    { id: 'empty', label: 'No chart for region', description: 'Country has no chart data yet' },
    { id: 'full', label: 'Full Top 100', description: 'Shows 5, expand to the full 100' },
    { id: 'slow', label: 'Slow connection', description: '2.5s delay when switching country' },
    { id: 'long-text', label: 'Very long text', description: 'Long song, artist and album names' },
    { id: 'missing-art', label: 'Missing artwork', description: 'Banner and covers fail to load' },
  ],
  playlist: [
    { id: 'default', label: 'Populated', description: 'Playlist page from Figma (live data)' },
    { id: 'loading', label: 'Loading', description: 'Skeleton header and rows' },
    { id: 'error', label: 'Failed to load', description: 'Request failed, with retry' },
    { id: 'not-found', label: 'Deleted / not found', description: 'Playlist was deleted or link is wrong' },
    { id: 'private', label: 'Someone else’s private', description: 'You don’t have access' },
    { id: 'empty', label: 'Empty playlist', description: 'No songs yet' },
    { id: 'many', label: '60 songs', description: 'Long list, shown 20 at a time' },
    { id: 'long-text', label: 'Very long text', description: 'Long title, description and song names' },
    { id: 'missing-art', label: 'Missing artwork', description: 'Cover and song art fail to load' },
  ],
  album: [
    { id: 'default', label: 'Populated', description: 'Album page built from the Figma design system' },
    { id: 'loading', label: 'Loading', description: 'Skeleton header and rows' },
    { id: 'error', label: 'Failed to load', description: 'Request failed, with retry' },
    { id: 'not-found', label: 'Removed / not found', description: 'Album was taken down or link is wrong' },
    { id: 'single', label: 'Single-track release', description: 'Only one song on the album' },
    { id: 'long-text', label: 'Very long text', description: 'Long album, artist, label and song names' },
    { id: 'missing-art', label: 'Missing artwork', description: 'Cover and song art fail to load' },
  ],
  profile: profileScenarios(),
  user: profileScenarios(),
};

/** Shared by your own profile (/profile) and other people's (/user/:id). */
function profileScenarios(): Scenario[] {
  return [
    { id: 'default', label: 'Populated', description: 'Profile frames from Figma' },
    { id: 'loading', label: 'Loading', description: 'Skeleton header and cards' },
    { id: 'error', label: 'Failed to load', description: 'Profile request failed, with retry' },
    { id: 'not-found', label: 'Profile not found', description: 'Deleted account or mistyped link' },
    { id: 'empty', label: 'Brand-new account', description: 'No likes, Re-Ups, playlists, followers' },
    { id: 'missing-images', label: 'Missing images', description: 'No banner/avatar; covers fail to load' },
    { id: 'long-text', label: 'Very long text', description: 'Long name, handle, titles, genre tag' },
    { id: 'big-numbers', label: 'Huge follower counts', description: '1.2M followers, 12.4k following' },
    { id: 'many', label: 'Lots of content', description: '24 liked songs (paged), 30 followers' },
  ];
}
