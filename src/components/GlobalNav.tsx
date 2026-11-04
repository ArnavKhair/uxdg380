import { NavLink } from 'react-router-dom';
import { BookOpenText, CircleUserRound, Compass, Globe, Music, UsersRound, type LucideIcon } from 'lucide-react';
import styles from './GlobalNav.module.css';
import { ICON } from './icons';

/** "Global nav menu" component (Figma 262:1864). */
const primary: NavItem[] = [
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/feed', label: 'Feed', icon: UsersRound },
  { to: '/profile', label: 'Profile', icon: CircleUserRound },
];

const secondary: NavItem[] = [
  { to: '/world', label: 'Audiomack World', icon: Globe },
  { to: '/studios', label: 'Audiomack Studios', icon: Music },
  { to: '/artists-guide', label: 'Artists Guide', icon: BookOpenText },
];

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

function Item({ to, label, icon: Icon }: NavItem) {
  return (
    <NavLink to={to} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
      <Icon size={ICON.nav} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

export function GlobalNav() {
  return (
    <nav className={styles.nav} aria-label="Main">
      {primary.map((item) => (
        <Item key={item.to} {...item} />
      ))}
      <hr className={styles.divider} />
      {secondary.map((item) => (
        <Item key={item.to} {...item} />
      ))}
    </nav>
  );
}
