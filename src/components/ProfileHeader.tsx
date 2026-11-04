import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import type { Profile } from '../data/types';
import { compactCount } from '../data/format';
import { useLibrary } from '../state/library';
import { useToast } from '../state/toast';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { buttonClassName } from './buttonClassName';
import { Menu, type MenuItem } from './Menu';
import styles from './ProfileHeader.module.css';
import { ICON } from './icons';

/*
 * Banner, photo, name/handle, "…" menu and follower stats
 * (Figma "Profile Banner" 439:3788, "Info" 439:3923).
 */
interface Props {
  profile: Profile;
  isMe: boolean;
  followers: number;
  following: number;
  basePath: string; // e.g. /profile or /user/goose — stats link to its tabs
}

export function ProfileHeader({ profile, isMe, followers, following, basePath }: Props) {
  const { following: followingSet, toggleFollow } = useLibrary();
  const toast = useToast();
  const [bannerFailed, setBannerFailed] = useState(false);
  const isFollowing = followingSet.has(profile.id);
  const handle = profile.handle ?? profile.name;

  function copyLink() {
    navigator.clipboard?.writeText(`${window.location.origin}${basePath}`).catch(() => {});
    toast('Profile link copied');
  }

  const menu: MenuItem[] = isMe
    ? [
        { label: 'Edit profile', onSelect: () => toast('Profile editing isn’t part of this prototype') },
        { label: 'Share profile', onSelect: copyLink },
        { label: 'Copy profile URL', onSelect: copyLink },
      ]
    : [
        { label: 'Share profile', onSelect: copyLink },
        { label: 'Copy profile URL', onSelect: copyLink },
        { label: 'Block', onSelect: () => toast(`You won’t see activity from ${profile.name}`), danger: true },
        { label: 'Report', onSelect: () => toast('Thanks — we’ll review this profile'), danger: true },
      ];

  const showBanner = profile.banner && !bannerFailed;

  return (
    <header className={styles.header}>
      <div
        className={styles.banner}
        style={{ background: showBanner ? profile.bannerColor ?? 'var(--grey-100)' : undefined }}
      >
        {showBanner && (
          <img
            src={profile.banner!}
            alt=""
            className={profile.bannerFit === 'contain' ? styles.contain : styles.cover}
            onError={() => setBannerFailed(true)}
          />
        )}
      </div>

      <div className={styles.avatar}>
        <Avatar src={profile.avatar} name={profile.name} size={200} />
      </div>

      <div className={styles.info}>
        <div className={styles.identity}>
          <div className={styles.names}>
            <p className={styles.handle} title={`@${handle}`}>
              @{handle}
            </p>
            <h1 className={styles.name} title={profile.name}>
              {profile.name}
            </h1>
          </div>
          {!isMe && (
            <Button
              variant={isFollowing ? 'filled' : 'outline'}
              aria-pressed={isFollowing}
              onClick={() => toggleFollow(profile.id)}
            >
              {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </Button>
          )}
          <Menu
            items={menu}
            label="Profile options"
            trigger={<Ellipsis size={ICON.control} />}
            triggerClassName={buttonClassName()}
          />
        </div>

        <div className={styles.stats}>
          <Link to={`${basePath}/followers`} className={styles.stat}>
            <span className={styles.statLabel}>Followers</span>
            <span className={styles.statValue}>{compactCount(followers)}</span>
          </Link>
          <Link to={`${basePath}/following`} className={styles.stat}>
            <span className={styles.statLabel}>Following</span>
            <span className={styles.statValue}>{compactCount(following)}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <header className={styles.header} aria-hidden="true">
      <div className={`${styles.banner} ${styles.skel}`} />
      <div className={styles.avatar}>
        <span className={`${styles.skel} ${styles.skelAvatar}`} />
      </div>
      <div className={styles.info}>
        <div className={styles.names}>
          <span className={styles.skel} style={{ width: 110, height: 18 }} />
          <span className={styles.skel} style={{ width: 180, height: 28 }} />
        </div>
      </div>
    </header>
  );
}
