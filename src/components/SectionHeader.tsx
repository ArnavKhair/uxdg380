import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './SectionHeader.module.css';
import { ICON } from './icons';

/** Section title (H4, 31px) + description, as used throughout Discover. */
interface Props {
  title: string;
  description: string;
  to?: string; // adds the chevron and makes the title a link (Charts, Moods)
  children?: ReactNode; // inline content after the title (genre filters)
}

export function SectionHeader({ title, description, to, children }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        {to ? (
          <Link to={to} className={styles.titleLink}>
            <h2 className={styles.title}>{title}</h2>
            <ChevronRight size={ICON.large} aria-hidden="true" />
          </Link>
        ) : (
          <h2 className={styles.title}>{title}</h2>
        )}
        {children}
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
