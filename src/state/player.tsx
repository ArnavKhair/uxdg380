import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { previewFor } from '../data/itunes';
import type { Track } from '../data/types';
import { useToast } from './toast';

/*
 * Player state. Songs play their 30-second iTunes preview (saved in data/itunes.json and
 * streamed from Apple) through one shared <audio> element. `duration` is the preview's
 * length, so the progress bar and waveforms show real progress out of 0:30.
 *
 * Songs with no preview fall back to the old silent simulation (a 1-second timer over a
 * 30-second "preview") so the UI still behaves the same.
 */
const PREVIEW_SEC = 30;

interface PlayerState {
  current: Track | null;
  queue: Track[];
  isPlaying: boolean;
  elapsed: number; // seconds into the preview
  duration: number; // preview length in seconds (≈30)
  hasAudio: boolean; // false when the current song has no preview
  context: string | null; // what started playback, e.g. "playlist:naija-hits"
  play: (track: Track, queue?: Track[], context?: string) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  queueNext: (track: Track) => void;
  queueLast: (track: Track) => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const audio = useRef<HTMLAudioElement | null>(null);
  if (!audio.current && typeof Audio !== 'undefined') {
    audio.current = new Audio();
    audio.current.preload = 'auto';
  }

  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(PREVIEW_SEC);
  const [context, setContext] = useState<string | null>(null);

  const current = index >= 0 ? queue[index] ?? null : null;
  const src = current ? previewFor(current) : null;
  const hasAudio = !!src;

  const play = useCallback((track: Track, newQueue?: Track[], newContext?: string) => {
    const q = newQueue && newQueue.some((t) => t.id === track.id) ? newQueue : [track];
    setContext(newContext ?? null);
    setQueue(q);
    setIndex(q.findIndex((t) => t.id === track.id));
    setElapsed(0);
    setIsPlaying(true);
    // Start loading inside the click so the browser counts it as user-initiated playback.
    const url = previewFor(track);
    const el = audio.current;
    if (el && url) {
      if (el.src !== url) el.src = url;
      else el.currentTime = 0; // replaying the same song starts it over
      el.play().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    if (current) setIsPlaying((p) => !p);
  }, [current]);

  const next = useCallback(() => {
    if (index < queue.length - 1) {
      setIndex(index + 1);
      setElapsed(0);
    } else {
      setIsPlaying(false);
      setElapsed(0);
      if (audio.current) audio.current.currentTime = 0;
    }
  }, [index, queue.length]);

  const prev = useCallback(() => {
    // Like most players: restart the song unless we're in its first 3 seconds.
    if (elapsed > 3 || index <= 0) {
      setElapsed(0);
      if (audio.current && hasAudio) audio.current.currentTime = 0;
    } else {
      setIndex(index - 1);
      setElapsed(0);
    }
  }, [elapsed, index, hasAudio]);

  const seek = useCallback(
    (seconds: number) => {
      if (!current) return;
      const to = Math.max(0, Math.min(seconds, duration - 0.25));
      setElapsed(to);
      if (audio.current && hasAudio) audio.current.currentTime = to;
    },
    [current, duration, hasAudio],
  );

  // With nothing playing, queueing a song just starts it.
  const queueNext = useCallback(
    (track: Track) => {
      if (!current) return play(track);
      setQueue((q) => {
        const without = q.filter((t, i) => t.id !== track.id || i === index);
        const at = without.findIndex((t) => t.id === current.id) + 1;
        return [...without.slice(0, at), track, ...without.slice(at)];
      });
    },
    [current, index, play],
  );

  const queueLast = useCallback(
    (track: Track) => {
      if (!current) return play(track);
      setQueue((q) => [...q.filter((t, i) => t.id !== track.id || i === index), track]);
    },
    [current, index, play],
  );

  // Keep `index` pointing at the current song when the queue is reordered.
  useEffect(() => {
    if (!current) return;
    const i = queue.findIndex((t) => t.id === current.id);
    if (i !== -1 && i !== index) setIndex(i);
  }, [queue, current, index]);

  // Load the current song's preview (or reset to the silent fallback).
  const currentId = current?.id;
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    if (!src) {
      el.pause();
      el.removeAttribute('src');
      el.load();
      setDuration(PREVIEW_SEC);
      if (currentId) toast('No preview for this song — playing silently');
      return;
    }
    if (el.src !== src) {
      el.src = src;
      setElapsed(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, currentId]);

  // Play / pause the element to match state.
  useEffect(() => {
    const el = audio.current;
    if (!el || !src) return;
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false)); // e.g. preview URL expired or offline
    } else {
      el.pause();
    }
  }, [isPlaying, src]);

  // Mirror the element's clock into state; auto-advance when the preview ends.
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const onTime = () => setElapsed(el.currentTime);
    const onMeta = () => setDuration(Number.isFinite(el.duration) && el.duration > 0 ? el.duration : PREVIEW_SEC);
    const onEnded = () => next();
    const onError = () => {
      if (el.getAttribute('src')) {
        toast('Couldn’t load this preview. Check your connection.');
        setIsPlaying(false);
      }
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [next, toast]);

  // Silent fallback for songs without a preview: tick once a second over a 30s "preview".
  useEffect(() => {
    if (!isPlaying || !current || hasAudio) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying, current, hasAudio]);

  useEffect(() => {
    if (!hasAudio && current && isPlaying && elapsed >= PREVIEW_SEC) next();
  }, [elapsed, current, isPlaying, hasAudio, next]);

  // Stop audio if the provider unmounts (e.g. hot reload).
  useEffect(() => () => audio.current?.pause(), []);

  const value = useMemo(
    () => ({
      current,
      queue,
      isPlaying,
      elapsed,
      duration,
      hasAudio,
      context,
      play,
      toggle,
      next,
      prev,
      seek,
      queueNext,
      queueLast,
    }),
    [current, queue, isPlaying, elapsed, duration, hasAudio, context, play, toggle, next, prev, seek, queueNext, queueLast],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return ctx;
}
