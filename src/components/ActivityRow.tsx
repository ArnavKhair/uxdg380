import { Link } from 'react-router-dom';
import { CirclePause, CirclePlay, Headphones, Heart, Upload, Repeat2 } from 'lucide-react';
import type { Activity, ActivityType } from '../data/types';
import { timeAgo } from '../data/format';
import { ME_ID } from '../data/mock';
import { Avatar } from './Avatar';
import styles from './ActivityRow.module.css';
import { ICON } from './icons';

/*
 * One feed item — the "Profile Card - Re-upped / Liked / Uploaded / currently listening"
 * variants in Figma (e.g. 439:4266).
 */
const verbs: Record<ActivityType, string> = {
  reup: 'Re-Upped',
  liked: 'Liked',
  uploaded: 'Uploaded',
  listening: 'Listening now',
};

function TypeIcon({ type }: { type: ActivityType }) {
  switch (type) {
    case 'reup':
      return <Repeat2 size={ICON.inline} />;
    case 'liked':
      return <Heart size={ICON.inline} />;
    case 'uploaded':
      return <Upload size={ICON.inline} />;
    case 'listening':
      return <Headphones size={ICON.inline} />;
  }
}

interface Props {
  activity: Activity;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}

export function ActivityRow({ activity, isCurrent, isPlaying, onPlay }: Props) {
  const { profile, track, type, at } = activity;
  // An artist's own upload just shows the title (Figma: "Stem the Flow" by Paris Paloma).
  const songLine = track.artist === profile.name ? track.title : `${track.title} - ${track.artist}`;
  const playingThis = isCurrent && isPlaying;
  const profileLink = profile.id === ME_ID ? '/profile' : `/user/${profile.id}`;

  return (
    <li className={`${styles.row} ${isCurrent ? styles.current : ''}`}>
      <div className={styles.main}>
        <Link to={profileLink} className={styles.avatarLink} tabIndex={-1} aria-hidden="true">
          <Avatar src={profile.avatar} name={profile.name} size={78} />
        </Link>
        <div className={styles.text}>
          <Link to={profileLink} className={styles.name} title={profile.name}>
            {profile.name}
          </Link>
          <div className={styles.details}>
            <p className={styles.song} title={songLine}>
              {songLine}
            </p>
            <p className={`${styles.meta} ${type === 'listening' ? styles.live : ''}`}>
              <TypeIcon type={type} />
              {type === 'listening' ? verbs[type] : `${verbs[type]} ${timeAgo(at)}`}
            </p>
          </div>
        </div>
      </div>
      <button
        className={styles.play}
        onClick={onPlay}
        aria-label={playingThis ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        {playingThis ? <CirclePause size={ICON.large} /> : <CirclePlay size={ICON.large} />}
      </button>
    </li>
  );
}

export function ActivityRowSkeleton() {
  return (
    <li className={styles.row} aria-hidden="true">
      <div className={styles.main}>
        <span className={`${styles.skel} ${styles.skelAvatar}`} />
        <div className={styles.text}>
          <span className={styles.skel} style={{ width: 140, height: 18 }} />
          <span className={styles.skel} style={{ width: 320, height: 16 }} />
          <span className={styles.skel} style={{ width: 160, height: 14 }} />
        </div>
      </div>
    </li>
  );
}
