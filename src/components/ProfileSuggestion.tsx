import { Link } from 'react-router-dom';
import type { Profile } from '../data/types';
import { compactCount } from '../data/format';
import { ME_ID } from '../data/mock';
import { useLibrary } from '../state/library';
import { Avatar } from './Avatar';
import { Button } from './Button';
import styles from './ProfileSuggestion.module.css';

/*
 * Profile card with a Follow button. Large: "Unpopulated feed" suggestions (439:4019).
 * Small: profile Followers/Following tabs (439:3264).
 */
export function ProfileSuggestion({ profile, size = 'lg' }: { profile: Profile; size?: 'lg' | 'sm' }) {
  const { following, toggleFollow, followerCount } = useLibrary();
  const isFollowing = following.has(profile.id);
  const to = profile.id === ME_ID ? '/profile' : `/user/${profile.id}`;

  return (
    <div className={`${styles.card} ${styles[size]}`}>
      <Link to={to} className={styles.avatarLink} tabIndex={-1} aria-hidden="true">
        <Avatar src={profile.avatar} name={profile.name} size={size === 'lg' ? 225 : 127} />
      </Link>
      <div className={styles.info}>
        <Link to={to} className={styles.name} title={profile.name}>
          {profile.name}
        </Link>
        <div className={styles.actions}>
          <p className={styles.followers}>{compactCount(followerCount(profile))} Followers</p>
          {profile.id !== ME_ID && (
            <Button
              variant={isFollowing ? 'filled' : 'outline'}
              fullWidth
              aria-pressed={isFollowing}
              onClick={() => toggleFollow(profile.id)}
            >
              {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
