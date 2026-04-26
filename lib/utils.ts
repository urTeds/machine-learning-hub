/**
 * Lightweight class name utility.
 * Filters out falsy values and joins remaining strings with a space.
 * For this project we don't need tailwind-merge since Tailwind v4 handles
 * specificity at the CSS layer — last class wins naturally.
 */
export function cn(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
