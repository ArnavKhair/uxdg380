import { WifiOff } from 'lucide-react';
import { Button } from './Button';
import styles from './ErrorState.module.css';
import { ICON } from './icons';

/** Something failed to load, with a way to try again. `compact` fits inside a section. */
interface Props {
  title: string;
  message: string;
  onRetry: () => void;
  compact?: boolean;
}

export function ErrorState({ title, message, onRetry, compact }: Props) {
  return (
    <div className={`${styles.error} ${compact ? styles.compact : ''}`} role="alert">
      <WifiOff size={compact ? ICON.large : ICON.state} className={styles.icon} />
      <h2>{title}</h2>
      <p>{message}</p>
      <Button onClick={onRetry}>TRY AGAIN</Button>
    </div>
  );
}
