import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { myInitialFollowing, myLikedTracks, myReuppedTracks } from '../data/mock';
import type { Profile, Track } from '../data/types';
import { useSession } from './session';
import { useToast } from './toast';

/**
 * The signed-in user's library (in memory only). Liking a song anywhere adds it
 * to Profile → Liked songs; Re-Ups work the same way. Each toggle returns false
 * (and explains why) when a guest tries it.
 */
interface LibraryState {
  following: Set<string>;
  liked: Track[]; // newest first
  reupped: Track[];
  /** Re-Ups made this session, newest first, with when they happened (shown in the Feed). */
  reupActivity: { track: Track; at: number }[];
  isLiked: (trackId: string) => boolean;
  isReupped: (trackId: string) => boolean;
  toggleFollow: (profileId: string) => boolean;
  toggleLike: (track: Track) => boolean;
  toggleReup: (track: Track) => boolean;
  isAlbumLiked: (albumId: string) => boolean;
  toggleAlbumLike: (albumId: string) => boolean;
  /** Follower count adjusted for the user following/unfollowing during the session. */
  followerCount: (profile: Profile) => number;
}

const LibraryContext = createContext<LibraryState | null>(null);

function toggleTrack(list: Track[], track: Track) {
  return list.some((t) => t.id === track.id) ? list.filter((t) => t.id !== track.id) : [track, ...list];
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const toast = useToast();
  const [following, setFollowing] = useState<Set<string>>(() => new Set(myInitialFollowing));
  const [liked, setLiked] = useState<Track[]>(myLikedTracks);
  const [reupped, setReupped] = useState<Track[]>(myReuppedTracks);
  const [reupActivity, setReupActivity] = useState<{ track: Track; at: number }[]>([]);
  const [likedAlbums, setLikedAlbums] = useState<Set<string>>(() => new Set());

  const guarded = useCallback(
    (verb: string, apply: () => void) => {
      if (!signedIn) {
        toast(`Sign in to ${verb}`);
        return false;
      }
      apply();
      return true;
    },
    [signedIn, toast],
  );

  const toggleFollow = useCallback(
    (id: string) =>
      guarded('follow profiles', () =>
        setFollowing((s) => {
          const next = new Set(s);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      ),
    [guarded],
  );
  const toggleLike = useCallback(
    (track: Track) => guarded('like songs', () => setLiked((l) => toggleTrack(l, track))),
    [guarded],
  );
  const toggleReup = useCallback(
    (track: Track) =>
      guarded('Re-Up songs', () => {
        const removing = reupped.some((t) => t.id === track.id);
        setReupped((l) => toggleTrack(l, track));
        // Re-Upping posts to your followers' feeds (and yours); undoing it takes the post down.
        setReupActivity((a) =>
          removing ? a.filter((r) => r.track.id !== track.id) : [{ track, at: Date.now() }, ...a],
        );
      }),
    [guarded, reupped],
  );
  const toggleAlbumLike = useCallback(
    (id: string) =>
      guarded('like albums', () =>
        setLikedAlbums((s) => {
          const next = new Set(s);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      ),
    [guarded],
  );

  const value = useMemo(
    () => ({
      following,
      liked,
      reupped,
      reupActivity,
      isLiked: (id: string) => liked.some((t) => t.id === id),
      isReupped: (id: string) => reupped.some((t) => t.id === id),
      toggleFollow,
      toggleLike,
      toggleReup,
      isAlbumLiked: (id: string) => likedAlbums.has(id),
      toggleAlbumLike,
      followerCount: (p: Profile) =>
        p.followers + Number(following.has(p.id)) - Number(myInitialFollowing.includes(p.id)),
    }),
    [following, liked, reupped, reupActivity, likedAlbums, toggleFollow, toggleLike, toggleReup, toggleAlbumLike],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
}
