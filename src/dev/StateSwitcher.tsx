import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { FlaskConical, X } from 'lucide-react';
import { DEFAULT_SCENARIO, screenScenarios } from '../data/scenarios';
import { useSession } from '../state/session';
import styles from './StateSwitcher.module.css';

/*
 * Prototype-only panel for forcing a screen into an edge-case state.
 * Not part of the product design. Toggle with the flask button or Shift+S.
 */
export function StateSwitcher() {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const { signedIn, setSignedIn } = useSession();
  const [open, setOpen] = useState(false);

  const screen = pathname.split('/')[1];
  const scenarios = screenScenarios[screen];
  const active = params.get('state') ?? DEFAULT_SCENARIO;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.shiftKey && e.key.toLowerCase() === 's' && !typing) setOpen((o) => !o);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function select(id: string) {
    const next = new URLSearchParams(params);
    if (id === DEFAULT_SCENARIO) next.delete('state');
    else next.set('state', id);
    setParams(next);
  }

  const activeLabel = scenarios?.find((s) => s.id === active)?.label;
  const badge = [active !== DEFAULT_SCENARIO && activeLabel, !signedIn && 'Guest'].filter(Boolean).join(' · ');

  return (
    <div className={styles.root}>
      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Screen states">
          <div className={styles.head}>
            <span>Prototype states</span>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <p className={styles.group}>Everywhere</p>
          <ul>
            {[
              { value: true, label: 'Signed in', description: 'Feed header, can like/follow/Re-Up' },
              { value: false, label: 'Guest (signed out)', description: 'Discover header with Sign Up | Sign In' },
            ].map((s) => (
              <li key={s.label}>
                <button className={signedIn === s.value ? styles.active : undefined} onClick={() => setSignedIn(s.value)}>
                  <span className={styles.label}>{s.label}</span>
                  <span className={styles.desc}>{s.description}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className={styles.group}>This screen · /{screen}</p>
          {scenarios ? (
            <ul>
              {scenarios.map((s) => (
                <li key={s.id}>
                  <button className={s.id === active ? styles.active : undefined} onClick={() => select(s.id)}>
                    <span className={styles.label}>{s.label}</span>
                    <span className={styles.desc}>{s.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.none}>No edge cases for this screen yet.</p>
          )}
          <p className={styles.hint}>Shift + S to toggle · screen state is saved in the URL</p>
        </div>
      ) : (
        <button className={styles.fab} onClick={() => setOpen(true)}>
          <FlaskConical size={18} />
          {badge || 'States'}
        </button>
      )}
    </div>
  );
}
