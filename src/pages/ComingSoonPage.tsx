import { useSearchParams } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import styles from './ComingSoonPage.module.css';
import { ICON } from '../components/icons';

/** Stand-in for screens that haven't been built yet, so navigation never dead-ends. */
export function ComingSoonPage({ title }: { title: string }) {
  const [params] = useSearchParams();
  const query = params.get('q');

  return (
    <section className={styles.page}>
      <Hammer size={ICON.state} className={styles.icon} />
      <h1>{title}</h1>
      {query !== null && <p className={styles.query}>You searched for “{query || '(nothing)'}”</p>}
      <p>This screen isn’t in the prototype yet.</p>
    </section>
  );
}
