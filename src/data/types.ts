export interface Profile {
  id: string;
  name: string;
  handle?: string; // shown as @handle; falls back to name
  avatar: string | null; // null → initials fallback
  banner?: string | null; // null/undefined → default banner
  bannerFit?: 'cover' | 'contain'; // Goose's banner is a centred illustration on a colour
  bannerColor?: string;
  followers: number;
  following?: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string | null; // null → placeholder art
  durationSec: number;
  releaseDate?: string; // ISO date, shown on profile song cards
  tag?: string; // genre tag, e.g. "Afro-Soul"
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
}

export type Privacy = 'public' | 'private';

export interface Playlist {
  id: string;
  title: string;
  cover: string | null;
  ownerId: string;
  tracks: Track[];
  genre: string; // genre id from discover.ts ('all' = All Genres)
  privacy: Privacy;
  description: string;
  updatedAt: number; // epoch ms
}

/** A chart, mood or Audiomack World story — the wide "Video card" in Figma (262:3235). */
export interface Collection {
  id: string;
  title: string;
  description: string;
  image: string | null;
  to: string;
}

export type ActivityType = 'reup' | 'liked' | 'uploaded' | 'listening';

export interface Activity {
  id: string;
  profile: Profile;
  track: Track;
  type: ActivityType;
  at: number; // epoch ms
}
