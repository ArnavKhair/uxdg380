/*
 * Icon size scale. Every icon in the prototype is a Lucide icon (lucide-react), matching
 * the "lucide" set on the Figma Icons page (73:14): default 2px stroke, round caps/joins,
 * colour from `currentColor`. Use these sizes instead of raw numbers so icons stay consistent.
 *
 *   nav     30  Global nav options (Figma "Global nav option" 262:1816)
 *   large   24  Player transport, play buttons, section chevrons, "…" menu triggers, modal close
 *   control 20  Icons inside Buttons and icon-only row buttons ("Song cards", "Music player")
 *   pill    18  Like / Share pills (Figma "Like" 247:1438, "Share" 247:1340)
 *   inline  16  Icons sitting next to small text (labels, activity types, compact rows)
 *   state   40  Empty, error and not-found states
 */
export const ICON = {
  nav: 30,
  large: 24,
  control: 20,
  pill: 18,
  inline: 16,
  state: 40,
} as const;
