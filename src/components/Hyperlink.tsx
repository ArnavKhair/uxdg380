import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Hyperlink.module.css';

/*
 * "Hyperlink" component (Figma 262:2014): Yellow/50 text, Medium 16; hover/active = Yellow/80.
 * Renders a router Link when `to` is set, otherwise a button.
 */
type Props = { children: ReactNode; className?: string } & (
  | { to: string; onClick?: never }
  | { to?: never; onClick: () => void }
);

export function Hyperlink({ children, className, to, onClick }: Props) {
  const classes = [styles.link, className].filter(Boolean).join(' ');
  return to ? (
    <Link to={to} className={classes}>
      {children}
    </Link>
  ) : (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
