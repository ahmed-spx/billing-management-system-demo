/** Join truthy class names. Tiny helper so components read cleanly. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
