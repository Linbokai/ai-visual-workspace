const DB_NAME = 'ai-workspace-cache';
const DB_VERSION = 1;
const STORE_NAME = 'images';

interface CachedImage {
  id: string;
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  type: string;
  projectId?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };
  });
}

/**
 * Store an image in IndexedDB cache
 */
export async function cacheImage(id: string, blob: Blob, projectId?: string): Promise<void> {
  const db = await openDB();
  const blobUrl = URL.createObjectURL(blob);
  const entry: CachedImage = {
    id,
    url: blobUrl,
    blob,
    timestamp: Date.now(),
    size: blob.size,
    type: blob.type,
    projectId,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve a cached image by ID
 */
export async function getCachedImage(id: string): Promise<CachedImage | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a blob URL for a cached image, falling back to the original URL
 */
export async function getCachedImageUrl(id: string, fallbackUrl: string): Promise<string> {
  try {
    const cached = await getCachedImage(id);
    if (cached) {
      return URL.createObjectURL(cached.blob);
    }
  } catch {
    // Fall through to fallback
  }
  return fallbackUrl;
}

/**
 * Cache an image from a URL
 */
export async function cacheImageFromUrl(id: string, url: string, projectId?: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    await cacheImage(id, blob, projectId);
  } catch {
    // Silently fail - caching is best-effort
  }
}

/**
 * Delete a cached image
 */
export async function deleteCachedImage(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all cached images for a project
 */
export async function getProjectImages(projectId: string): Promise<CachedImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('projectId');
    const request = index.getAll(projectId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get total cache size in bytes
 */
export async function getCacheSize(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const total = (request.result as CachedImage[]).reduce((sum, img) => sum + img.size, 0);
      resolve(total);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear old cache entries beyond a size limit (default 500MB)
 */
export async function pruneCache(maxSizeBytes: number = 500 * 1024 * 1024): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();
    request.onsuccess = () => {
      const entries = (request.result as CachedImage[]).sort((a, b) => a.timestamp - b.timestamp);
      let totalSize = entries.reduce((sum, e) => sum + e.size, 0);
      let deleted = 0;
      for (const entry of entries) {
        if (totalSize <= maxSizeBytes) break;
        store.delete(entry.id);
        totalSize -= entry.size;
        deleted++;
      }
      tx.oncomplete = () => resolve(deleted);
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Clear all cached images
 */
export async function clearCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
