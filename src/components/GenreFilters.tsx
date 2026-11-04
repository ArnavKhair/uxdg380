import type { Genre } from '../data/discover';
import styles from './GenreFilters.module.css';

/** "Genre Filters" component (Figma 262:2002). Selected pill is filled yellow. */
interface Props {
  genres: Genre[];
  selected: string;
  onSelect: (id: string) => void;
}

export function GenreFilters({ genres, selected, onSelect }: Props) {
  return (
    <div className={styles.filters} role="radiogroup" aria-label="Genre">
      {genres.map((g) => {
        const isSelected = g.id === selected;
        return (
          <button
            key={g.id}
            role="radio"
            aria-checked={isSelected}
            className={`${styles.pill} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelect(g.id)}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}
