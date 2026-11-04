import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClassName, type ButtonVariant } from './buttonClassName';

/*
 * "Button" component (Figma 195:5169). Outline is the default look in the design;
 * `filled` is used for selected/toggled-on states (e.g. FOLLOWING, liked) and primary CTAs;
 * `ghost` is the "no border" variant (icon buttons inside cards).
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = 'outline', icon, fullWidth, className, children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={buttonClassName(variant, className, fullWidth)} {...rest}>
      {icon}
      {children && <span>{children}</span>}
    </button>
  );
}
