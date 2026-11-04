/**
 * Safe Storage Utility
 * Prevents "Access is denied for this document" when running in sandboxed iframes.
 */

const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore[key] ?? null;
      }
    }
    return memoryStore[key] ?? null;
  },

  setItem(key: string, value: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memoryStore
      }
    }
    memoryStore[key] = value;
  },

  removeItem(key: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fallback to memoryStore
      }
    }
    delete memoryStore[key];
  },
};
