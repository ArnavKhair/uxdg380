import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera } from 'lucide-react';
import { genres } from '../data/discover';
import type { Playlist, Privacy } from '../data/types';
import { Artwork } from './Artwork';
import { Button } from './Button';
import { Modal } from './Modal';
import styles from './PlaylistFormModal.module.css';
import { ICON } from './icons';

/*
 * Create / Edit playlist — one form for both, per the design note
 * (Figma "Create playlist" 235:5473, "Edit playlist" 446:2983).
 */
export type PlaylistDraft = Pick<Playlist, 'title' | 'cover' | 'genre' | 'privacy' | 'description'>;

interface Props {
  initial?: Playlist; // present → edit mode
  onSave: (draft: PlaylistDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const NAME_MAX = 100;
const DESCRIPTION_MAX = 1200;
const COVER_MAX_BYTES = 10 * 1024 * 1024;

export function PlaylistFormModal({ initial, onSave, onDelete, onClose }: Props) {
  const editing = !!initial;
  const start: PlaylistDraft = {
    title: initial?.title ?? '',
    cover: initial?.cover ?? null,
    genre: initial?.genre ?? 'all',
    privacy: initial?.privacy ?? 'private',
    description: initial?.description ?? '',
  };
  const [draft, setDraft] = useState<PlaylistDraft>(start);
  const [nameError, setNameError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'discard' | 'delete' | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(start);
  const left = DESCRIPTION_MAX - draft.description.length;

  function set<K extends keyof PlaylistDraft>(key: K, value: PlaylistDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function requestClose() {
    if (dirty) setConfirm('discard');
    else onClose();
  }

  function pickCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setCoverError('Cover must be a JPG or PNG.');
    if (file.size > COVER_MAX_BYTES) return setCoverError('Cover must be 10MB or smaller.');
    setCoverError(null);
    set('cover', URL.createObjectURL(file));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) return setNameError('Give your playlist a name.');
    onSave({ ...draft, title, description: draft.description.trim() });
  }

  return (
    <Modal title={editing ? 'Edit playlist' : 'Create playlist'} onClose={requestClose}>
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.top}>
          <div className={styles.cover}>
            {draft.cover && <Artwork src={draft.cover} className={styles.coverImage} />}
            <div className={styles.coverOverlay}>
              <Camera size={ICON.state} aria-hidden="true" />
              <strong>Playlist Cover</strong>
              <span>Recommend 800x800, 10MB JPG/PNG</span>
              <Button className={styles.coverButton} onClick={() => fileInput.current?.click()}>
                {draft.cover ? 'Edit Cover' : 'Add Cover'}
              </Button>
              {draft.cover && (
                <button type="button" className={styles.coverRemove} onClick={() => set('cover', null)}>
                  Remove
                </button>
              )}
              <input ref={fileInput} type="file" accept="image/png,image/jpeg" hidden onChange={pickCover} />
            </div>
            {coverError && (
              <p className={styles.coverError} role="alert">
                {coverError}
              </p>
            )}
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="pl-name">
                Playlist Name <span className={styles.required}>*</span>
              </label>
              <input
                id="pl-name"
                className={`${styles.input} ${styles.nameInput} ${nameError ? styles.invalid : ''}`}
                placeholder="Enter Playlist Name"
                value={draft.title}
                maxLength={NAME_MAX}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'pl-name-error' : undefined}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (nameError) setNameError(null);
                }}
              />
              {nameError && (
                <p id="pl-name-error" className={styles.error}>
                  {nameError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="pl-genre">
                Genre <span className={styles.required}>*</span>
              </label>
              <select
                id="pl-genre"
                className={`${styles.input} ${styles.select}`}
                value={draft.genre}
                onChange={(e) => set('genre', e.target.value)}
              >
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.id === 'all' ? 'All Genres' : g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="pl-privacy">
                Release <span className={styles.required}>*</span>
              </label>
              <select
                id="pl-privacy"
                className={`${styles.input} ${styles.select}`}
                value={draft.privacy}
                onChange={(e) => set('privacy', e.target.value as Privacy)}
              >
                <option value="private">Private - Only you can view</option>
                <option value="public">Public - Anyone can view</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.descriptionHead}>
            <label htmlFor="pl-description">Playlist Description</label>
            <em className={left < 100 ? styles.lowCount : undefined}>You have {left} characters</em>
          </div>
          <textarea
            id="pl-description"
            className={`${styles.input} ${styles.textarea}`}
            placeholder={`Enter playlist description. You have ${DESCRIPTION_MAX} characters left.`}
            value={draft.description}
            maxLength={DESCRIPTION_MAX}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {confirm ? (
          <div className={styles.confirm} role="alertdialog" aria-label="Confirm">
            <p>
              {confirm === 'discard'
                ? 'Discard your changes?'
                : `Delete “${initial?.title}”? This can’t be undone.`}
            </p>
            <div className={styles.buttons}>
              <Button onClick={() => setConfirm(null)}>{confirm === 'discard' ? 'Keep editing' : 'Cancel'}</Button>
              <Button className={styles.danger} onClick={confirm === 'discard' ? onClose : onDelete}>
                {confirm === 'discard' ? 'Discard' : 'Delete'}
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.footer}>
            {onDelete && (
              <button type="button" className={styles.deleteLink} onClick={() => setConfirm('delete')}>
                Delete playlist
              </button>
            )}
            <div className={styles.buttons}>
              <Button onClick={requestClose}>Cancel</Button>
              <Button type="submit" disabled={editing && !dirty}>
                {editing ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
