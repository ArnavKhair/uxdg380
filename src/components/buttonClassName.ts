import styles from './Button.module.css';

export type ButtonVariant = 'outline' | 'filled' | 'ghost';

/**
 * Class names for the global Button look (Figma 195:5169), for elements that can't be a
 * <Button> themselves, e.g. the trigger that <Menu> renders.
 */
export function buttonClassName(variant: ButtonVariant = 'outline', className?: string, fullWidth?: boolean) {
  return [styles.button, styles[variant], fullWidth && styles.fullWidth, className].filter(Boolean).join(' ');
}
