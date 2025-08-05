/**
 * Utility function to check if a string is a valid URL.
 */
export function isValidURL(url: string): boolean {
  return Boolean(createURLSafe(url));
}
/**
 * Utility function to create a URL object safely.
 */
export function createURLSafe(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
