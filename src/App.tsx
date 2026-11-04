import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PlayerProvider } from './state/player';
import { LibraryProvider } from './state/library';
import { PlaylistsProvider } from './state/playlists';
import { SessionProvider } from './state/session';
import { ToastProvider } from './state/toast';
import { AppShell } from './components/AppShell';
import { DiscoverPage } from './pages/DiscoverPage';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChartsPage } from './pages/ChartsPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { AlbumPage } from './pages/AlbumPage';
import { ComingSoonPage } from './pages/ComingSoonPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SessionProvider>
          <LibraryProvider>
            <PlaylistsProvider>
              <PlayerProvider>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<Navigate to="/discover" replace />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/profile/:tab?" element={<ProfilePage />} />
                    <Route path="/user/:id/:tab?" element={<ProfilePage />} />
                    <Route path="/playlist/:id" element={<PlaylistPage />} />
                    <Route path="/charts/:country?" element={<ChartsPage />} />
                    <Route path="/search" element={<ComingSoonPage title="Search" />} />
                    <Route path="/upload" element={<ComingSoonPage title="Upload" />} />
                    <Route path="/album/:id" element={<AlbumPage />} />
                    <Route path="/moods/*" element={<ComingSoonPage title="Moods" />} />
                    <Route path="/world" element={<ComingSoonPage title="Audiomack World" />} />
                    <Route path="/studios" element={<ComingSoonPage title="Audiomack Studios" />} />
                    <Route path="/artists-guide" element={<ComingSoonPage title="Artists Guide" />} />
                    <Route path="*" element={<ComingSoonPage title="Page not found" />} />
                  </Route>
                </Routes>
              </PlayerProvider>
            </PlaylistsProvider>
          </LibraryProvider>
        </SessionProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
