import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

      <SearchBar />

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

/*
 * Global search bar (Header "Form:margin", 721:12585). Enter opens the results page,
 * /search?q=… (Figma "search bar" frames, 253:2079). While on that page the box keeps
 * showing the current search so it can be edited and run again.
 */
function SearchBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const urlQuery = pathname === '/search' ? (params.get('q') ?? '') : '';
  const [query, setQuery] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the box showing the current search; empty it when leaving the results page.
  useEffect(() => setQuery(urlQuery), [urlQuery]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    inputRef.current?.blur();
    // A new search starts on the All tab.
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className={styles.search} role="search" onSubmit={submit}>
      <Search size={ICON.control} className={styles.searchIcon} aria-hidden="true" />
      <label htmlFor="global-search" className="visually-hidden">
        Search
      </label>
      <input
        ref={inputRef}
        id="global-search"
        type="search"
        placeholder="Search for artists, songs, albums!"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
