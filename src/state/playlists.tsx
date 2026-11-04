import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initialPlaylists, ME_ID, searchPlaylists } from '../data/mock';
import { curatedPlaylists } from '../data/charts';
import type { Playlist, Track } from '../data/types';
import { useSession } from './session';
import { useToast } from './toast';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { PlaylistFormModal, type PlaylistDraft } from '../components/PlaylistFormModal';

/*
 * Every playlist in the prototype (in memory). Also owns the two playlist modals
 * so any screen can open them: "Add to playlist" (Figma Frame 44, 235:4694) and the
 * shared Create/Edit form (Frame 58, 235:5473 / 446:2983 — "one screen for both").
 */
interface PlaylistsState {
  playlists: Playlist[];
  byId: (id: string) => Playlist | undefined;
  byOwner: (ownerId: string) => Playlist[];
  update: (id: string, changes: Partial<Playlist>) => void;
  remove: (id: string) => void;
  toggleTrack: (playlistId: string, track: Track) => void;
  removeTrack: (playlistId: string, trackId: string) => void;
  openAddTo: (track: Track) => void;
  openCreate: (thenAdd?: Track) => void;
  openEdit: (id: string) => void;
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;
}

const PlaylistsContext = createContext<PlaylistsState | null>(null);

type FormState = { mode: 'create'; thenAdd?: Track } | { mode: 'edit'; id: string } | null;

let nextId = 1;

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const toast = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([...searchPlaylists, ...initialPlaylists, ...curatedPlaylists]);
  const [addTrack, setAddTrack] = useState<Track | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const byId = useCallback((id: string) => playlists.find((p) => p.id === id), [playlists]);
  const byOwner = useCallback((ownerId: string) => playlists.filter((p) => p.ownerId === ownerId), [playlists]);

  const update = useCallback((id: string, changes: Partial<Playlist>) => {
    setPlaylists((all) => all.map((p) => (p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p)));
  }, []);

  const remove = useCallback((id: string) => setPlaylists((all) => all.filter((p) => p.id !== id)), []);

  const toggleTrack = useCallback(
    (playlistId: string, track: Track) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return;
      const has = playlist.tracks.some((t) => t.id === track.id);
      update(playlistId, {
        tracks: has ? playlist.tracks.filter((t) => t.id !== track.id) : [...playlist.tracks, track],
      });
      // Wording from Figma Frames 121 / 122
      toast(has ? 'Music was removed from playlist' : 'Music was added to playlist');
    },
    [playlists, update, toast],
  );

  const removeTrack = useCallback(
    (playlistId: string, trackId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) update(playlistId, { tracks: playlist.tracks.filter((t) => t.id !== trackId) });
    },
    [playlists, update],
  );

  const openAddTo = useCallback(
    (track: Track) => {
      if (!signedIn) return toast('Sign in to add songs to playlists');
      setAddTrack(track);
    },
    [signedIn, toast],
  );

  const openCreate = useCallback(
    (thenAdd?: Track) => {
      if (!signedIn) return toast('Sign in to create playlists');
      setAddTrack(null);
      setForm({ mode: 'create', thenAdd });
    },
    [signedIn, toast],
  );

  const openEdit = useCallback((id: string) => setForm({ mode: 'edit', id }), []);

  const isLiked = useCallback((id: string) => liked.has(id), [liked]);
  const toggleLike = useCallback(
    (id: string) => {
      if (!signedIn) return toast('Sign in to like playlists');
      const has = liked.has(id);
      setLiked((s) => {
        const next = new Set(s);
        if (has) next.delete(id);
        else next.add(id);
        return next;
      });
      toast(has ? 'Removed from your liked playlists' : 'Added to your liked playlists');
    },
    [liked, signedIn, toast],
  );

  function save(draft: PlaylistDraft) {
    if (form?.mode === 'edit') {
      update(form.id, draft);
      toast('Playlist saved');
    } else if (form?.mode === 'create') {
      const created: Playlist = {
        ...draft,
        id: `new-${nextId++}`,
        ownerId: ME_ID,
        tracks: form.thenAdd ? [form.thenAdd] : [],
        updatedAt: Date.now(),
      };
      setPlaylists((all) => [created, ...all]);
      toast(form.thenAdd ? `Created “${created.title}” and added the song` : `Created “${created.title}”`);
    }
    setForm(null);
  }

  const value = useMemo(
    () => ({
      playlists,
      byId,
      byOwner,
      update,
      remove,
      toggleTrack,
      removeTrack,
      openAddTo,
      openCreate,
      openEdit,
      isLiked,
      toggleLike,
    }),
    [playlists, byId, byOwner, update, remove, toggleTrack, removeTrack, openAddTo, openCreate, openEdit, isLiked, toggleLike],
  );

  const editing = form?.mode === 'edit' ? byId(form.id) : undefined;

  return (
    <PlaylistsContext.Provider value={value}>
      {children}
      {addTrack && (
        <AddToPlaylistModal
          track={addTrack}
          playlists={byOwner(ME_ID)}
          onToggle={(id) => toggleTrack(id, addTrack)}
          onCreate={() => openCreate(addTrack)}
          onClose={() => setAddTrack(null)}
        />
      )}
      {form && (
        <PlaylistFormModal
          initial={editing}
          onSave={save}
          onDelete={
            editing
              ? () => {
                  remove(editing.id);
                  setForm(null);
                  toast(`Deleted “${editing.title}”`);
                  // Don't leave the user on the page of a playlist that no longer exists.
                  if (pathname === `/playlist/${editing.id}`) navigate('/profile/playlists', { replace: true });
                }
              : undefined
          }
          onClose={() => setForm(null)}
        />
      )}
    </PlaylistsContext.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(PlaylistsContext);
  if (!ctx) throw new Error('usePlaylists must be used inside <PlaylistsProvider>');
  return ctx;
}
