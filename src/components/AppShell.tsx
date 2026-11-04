import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { GlobalNav } from './GlobalNav';
import { MusicPlayer } from './MusicPlayer';
import styles from './AppShell.module.css';

/** Layout shared by every screen: header, left nav, page content, player bar. */
export function AppShell() {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.body}>
        <aside className={styles.nav}>
          <GlobalNav />
        </aside>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
}
