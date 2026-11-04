import { useNavigate } from 'react-router-dom';
import promo from '../assets/ads/upload-promo.png';
import styles from './AdSpace.module.css';

/** "Ad Space" component (Figma 262:2001) — the house ad used as a section breaker. */
export function AdSpace() {
  const navigate = useNavigate();
  return (
    <aside className={styles.ad} aria-label="Advertisement">
      <div className={styles.art} aria-hidden="true">
        <img src={promo} alt="" />
      </div>
      <div className={styles.copy}>
        <p className={styles.title}>
          The music platform <span className={styles.accent}>empowering artists</span>
        </p>
        <p className={styles.body}>
          Audiomack is an artist-first music platform that helps musicians{' '}
          <strong>reach and engage fans across the world.</strong>
        </p>
        <button className={styles.cta} onClick={() => navigate('/upload')}>
          Upload your music for FREE
        </button>
      </div>
    </aside>
  );
}
