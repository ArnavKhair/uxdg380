import { Link } from 'react-router-dom';
import type { Collection } from '../data/types';
import { Artwork } from './Artwork';
import styles from './CollectionCard.module.css';

/** Wide card for charts, moods and Audiomack World ("Video card", Figma 262:3235). */
export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link to={collection.to} className={styles.card}>
      <span className={styles.image}>
        <Artwork src={collection.image} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{collection.title}</span>
        <span className={styles.description}>{collection.description}</span>
      </span>
    </Link>
  );
}

export function CollectionCardSkeleton() {
  return (
    <span className={styles.card} aria-hidden="true">
      <span className={`${styles.image} ${styles.skel}`} />
      <span className={styles.text}>
        <span className={styles.skel} style={{ width: 260, height: 37 }} />
        <span className={styles.skel} style={{ width: 180, height: 19 }} />
      </span>
    </span>
  );
}
