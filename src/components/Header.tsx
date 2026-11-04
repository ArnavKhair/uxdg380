import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload } from 'lucide-react';
import logo from '../assets/brand/logo.svg';
import { useSession } from '../state/session';
import { useToast } from '../state/toast';
import { Button } from './Button';
import { Hyperlink } from './Hyperlink';
import styles from './Header.module.css';
import { ICON } from './icons';

/** "Header" component (Figma 262:2034); signed-out variant from Discover (550:19806). */
export function Header() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signedIn, setSignedIn } = useSession();
  const [query, setQuery] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function signIn(how: string) {
    setSignedIn(true);
    toast(`${how} as demo user`);
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/discover" aria-label="Audiomack home">
          <img src={logo} alt="" width={132} height={18} />
        </Link>
        <button className={styles.plus} onClick={() => toast('Audiomack+ isn’t part of this prototype')}>
          Get Plus <span className={styles.plusMark}>+</span>
        </button>
      </div>

      <form className={styles.search} role="search" onSubmit={submit}>
        <Search size={ICON.control} className={styles.searchIcon} aria-hidden="true" />
        <label htmlFor="global-search" className="visually-hidden">
          Search
        </label>
        <input
          id="global-search"
          type="search"
          placeholder="Search for artists, songs, albums!"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className={styles.right}>
        {!signedIn && (
          <div className={styles.auth}>
            <Hyperlink className={styles.authLink} onClick={() => signIn('Signed up')}>
              Sign Up
            </Hyperlink>
            <span className={styles.authDivider} aria-hidden="true">
              |
            </span>
            <Hyperlink className={styles.authLink} onClick={() => signIn('Signed in')}>
              Sign In
            </Hyperlink>
          </div>
        )}
        <Button icon={<Upload />} onClick={() => navigate('/upload')}>
          UPLOAD
        </Button>
      </div>
    </header>
  );
}
