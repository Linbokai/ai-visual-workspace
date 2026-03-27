/**
 * Three-Level Cache Manager
 * Level 1: In-memory LRU cache for frequently accessed assets
 * Level 2: IndexedDB for persistent local storage (images/thumbnails)
 * Level 3: Original remote URLs as fallback
 */

// ============================================================
// LRU Cache (Level 1 - Memory)
// ============================================================

interface LRUEntry<T> {
  key: string;
  value: T;
  size: number;
  accessedAt: number;
}

class LRUCache<T> {
  private map = new Map<string, LRUEntry<T>>();
  private maxSize: number;
  private currentSize = 0;

  constructor(maxSizeBytes: number) {
    this.maxSize = maxSizeBytes;
  }

  get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    // Update access time (move to "most recently used")
    entry.accessedAt = Date.now();
    return entry.value;
  }

  set(key: string, value: T, size: number): void {
    // Remove existing entry if present
    if (this.map.has(key)) {
      this.currentSize -= this.map.get(key)!.size;
      this.map.delete(key);
    }

    // Evict least recently used entries until we have space
    while (this.currentSize + size > this.maxSize && this.map.size > 0) {
      this.evictLRU();
    }

    // If single item exceeds max size, skip caching
    if (size > this.maxSize) return;

    this.map.set(key, { key, value, size, accessedAt: Date.now() });
    this.currentSize += size;
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  delete(key: string): boolean {
    const entry = this.map.get(key);
    if (!entry) return false;
    this.currentSize -= entry.size;
    this.map.delete(key);
    return true;
  }

  clear(): void {
    this.map.clear();
    this.currentSize = 0;
  }

  get stats() {
    return {
      entries: this.map.size,
      currentSize: this.currentSize,
      maxSize: this.maxSize,
      utilization: this.maxSize > 0 ? this.currentSize / this.maxSize : 0,
    };
  }

  private evictLRU(): void {
    let oldest: LRUEntry<T> | null = null;
    for (const entry of this.map.values()) {
      if (!oldest || entry.accessedAt < oldest.accessedAt) {
        oldest = entry;
      }
    }
    if (oldest) {
      this.currentSize -= oldest.size;
      this.map.delete(oldest.key);
    }
  }
}

// ============================================================
// IndexedDB Store (Level 2 - Persistent)
// ============================================================

const DB_NAME = 'ai-workspace-cache';
const DB_VERSION = 1;
const STORE_ASSETS = 'assets';
const STORE_THUMBNAILS = 'thumbnails';
const STORE_PROJECTS = 'projects';

interface CachedAsset {
  key: string;
  blob: Blob;
  mimeType: string;
  size: number;
  createdAt: number;
  accessedAt: number;
  thumbnailKey?: string;
}

interface CachedThumbnail {
  key: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        const store = db.createObjectStore(STORE_ASSETS, { keyPath: 'key' });
        store.createIndex('accessedAt', 'accessedAt');
        store.createIndex('size', 'size');
      }
      if (!db.objectStoreNames.contains(STORE_THUMBNAILS)) {
        db.createObjectStore(STORE_THUMBNAILS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class IndexedDBStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB();
    }
    return this.dbPromise;
  }

  async getAsset(key: string): Promise<CachedAsset | undefined> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSETS, 'readwrite');
        const store = tx.objectStore(STORE_ASSETS);
        const req = store.get(key);
        req.onsuccess = () => {
          const result = req.result as CachedAsset | undefined;
          if (result) {
            // Update access time
            result.accessedAt = Date.now();
            store.put(result);
          }
          resolve(result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return undefined;
    }
  }

  async setAsset(key: string, blob: Blob, mimeType: string, thumbnailKey?: string): Promise<void> {
    try {
      const db = await this.getDB();
      const asset: CachedAsset = {
        key,
        blob,
        mimeType,
        size: blob.size,
        createdAt: Date.now(),
        accessedAt: Date.now(),
        thumbnailKey,
      };
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSETS, 'readwrite');
        const store = tx.objectStore(STORE_ASSETS);
        const req = store.put(asset);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Silent fail for cache writes
    }
  }

  async getThumbnail(key: string): Promise<CachedThumbnail | undefined> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_THUMBNAILS, 'readonly');
        const store = tx.objectStore(STORE_THUMBNAILS);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result as CachedThumbnail | undefined);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return undefined;
    }
  }

  async setThumbnail(key: string, blob: Blob, width: number, height: number): Promise<void> {
    try {
      const db = await this.getDB();
      const thumbnail: CachedThumbnail = {
        key,
        blob,
        width,
        height,
        createdAt: Date.now(),
      };
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_THUMBNAILS, 'readwrite');
        const store = tx.objectStore(STORE_THUMBNAILS);
        const req = store.put(thumbnail);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Silent fail
    }
  }

  async deleteAsset(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSETS, 'readwrite');
        const store = tx.objectStore(STORE_ASSETS);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Silent fail
    }
  }

  async getStats(): Promise<{ assetCount: number; thumbnailCount: number; totalSize: number }> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        let assetCount = 0;
        let thumbnailCount = 0;
        let totalSize = 0;

        const tx = db.transaction([STORE_ASSETS, STORE_THUMBNAILS], 'readonly');

        const assetReq = tx.objectStore(STORE_ASSETS).openCursor();
        assetReq.onsuccess = () => {
          const cursor = assetReq.result;
          if (cursor) {
            assetCount++;
            totalSize += (cursor.value as CachedAsset).size;
            cursor.continue();
          }
        };

        const thumbReq = tx.objectStore(STORE_THUMBNAILS).openCursor();
        thumbReq.onsuccess = () => {
          const cursor = thumbReq.result;
          if (cursor) {
            thumbnailCount++;
            totalSize += (cursor.value as CachedThumbnail).blob.size;
            cursor.continue();
          }
        };

        tx.oncomplete = () => resolve({ assetCount, thumbnailCount, totalSize });
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      return { assetCount: 0, thumbnailCount: 0, totalSize: 0 };
    }
  }

  async clearAll(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_ASSETS, STORE_THUMBNAILS], 'readwrite');
        tx.objectStore(STORE_ASSETS).clear();
        tx.objectStore(STORE_THUMBNAILS).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Silent fail
    }
  }

  async evictOldest(maxSizeBytes: number): Promise<number> {
    try {
      const db = await this.getDB();
      const stats = await this.getStats();
      if (stats.totalSize <= maxSizeBytes) return 0;

      let evicted = 0;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ASSETS, 'readwrite');
        const store = tx.objectStore(STORE_ASSETS);
        const index = store.index('accessedAt');
        const req = index.openCursor();
        let currentSize = stats.totalSize;

        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor && currentSize > maxSizeBytes) {
            const asset = cursor.value as CachedAsset;
            currentSize -= asset.size;
            cursor.delete();
            evicted++;
            cursor.continue();
          }
        };

        tx.oncomplete = () => resolve(evicted);
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      return 0;
    }
  }

  // Project data storage (for auto-save)
  async saveProject(id: string, data: unknown): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.put({ id, data, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Silent fail
    }
  }

  async loadProject(id: string): Promise<unknown | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.get(id);
        req.onsuccess = () => {
          const result = req.result as { id: string; data: unknown; updatedAt: number } | undefined;
          resolve(result?.data ?? null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Silent fail
    }
  }
}

// ============================================================
// Thumbnail Generator
// ============================================================

const THUMBNAIL_MAX_WIDTH = 200;
const THUMBNAIL_MAX_HEIGHT = 200;
const THUMBNAIL_QUALITY = 0.7;

async function generateThumbnail(
  blob: Blob,
  maxWidth = THUMBNAIL_MAX_WIDTH,
  maxHeight = THUMBNAIL_MAX_HEIGHT,
): Promise<{ blob: Blob; width: number; height: number } | null> {
  try {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;

        // Don't generate thumbnail for small images
        if (width <= maxWidth && height <= maxHeight) {
          resolve(null);
          return;
        }

        // Calculate scaled dimensions
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve({ blob: result, width, height });
            } else {
              resolve(null);
            }
          },
          'image/webp',
          THUMBNAIL_QUALITY,
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    });
  } catch {
    return null;
  }
}

// ============================================================
// Cache Manager (Unified Interface)
// ============================================================

const DEFAULT_MEMORY_CACHE_SIZE = 50 * 1024 * 1024; // 50MB memory cache
const DEFAULT_IDB_MAX_SIZE = 500 * 1024 * 1024; // 500MB IndexedDB limit

export interface CacheStats {
  memory: {
    entries: number;
    currentSize: number;
    maxSize: number;
    utilization: number;
  };
  indexedDB: {
    assetCount: number;
    thumbnailCount: number;
    totalSize: number;
  };
}

class CacheManager {
  private memoryCache: LRUCache<string>; // Stores object URLs
  private idbStore: IndexedDBStore;
  private objectUrls = new Map<string, string>(); // Track object URLs for cleanup
  private maxIDBSize: number;

  constructor(memoryCacheSize = DEFAULT_MEMORY_CACHE_SIZE, maxIDBSize = DEFAULT_IDB_MAX_SIZE) {
    this.memoryCache = new LRUCache<string>(memoryCacheSize);
    this.idbStore = new IndexedDBStore();
    this.maxIDBSize = maxIDBSize;
  }

  /**
   * Get a cached asset URL, checking all three levels.
   * Returns an object URL for cached blobs, or the original URL as fallback.
   */
  async get(key: string, fallbackUrl?: string): Promise<string | null> {
    // Level 1: Memory cache
    const memoryUrl = this.memoryCache.get(key);
    if (memoryUrl) return memoryUrl;

    // Level 2: IndexedDB
    const idbAsset = await this.idbStore.getAsset(key);
    if (idbAsset) {
      const objectUrl = URL.createObjectURL(idbAsset.blob);
      this.memoryCache.set(key, objectUrl, idbAsset.size);
      this.objectUrls.set(key, objectUrl);
      return objectUrl;
    }

    // Level 3: Fallback URL
    return fallbackUrl ?? null;
  }

  /**
   * Get a thumbnail URL for a cached asset.
   * Falls back to full asset if no thumbnail exists.
   */
  async getThumbnail(key: string, fallbackUrl?: string): Promise<string | null> {
    const thumbKey = `thumb_${key}`;

    // Check memory for thumbnail
    const memThumb = this.memoryCache.get(thumbKey);
    if (memThumb) return memThumb;

    // Check IDB for thumbnail
    const idbThumb = await this.idbStore.getThumbnail(thumbKey);
    if (idbThumb) {
      const objectUrl = URL.createObjectURL(idbThumb.blob);
      this.memoryCache.set(thumbKey, objectUrl, idbThumb.blob.size);
      this.objectUrls.set(thumbKey, objectUrl);
      return objectUrl;
    }

    // Fall back to full asset or URL
    return this.get(key, fallbackUrl);
  }

  /**
   * Cache an asset from a Blob, automatically generating a thumbnail for images.
   */
  async set(key: string, blob: Blob, mimeType: string): Promise<string> {
    const objectUrl = URL.createObjectURL(blob);

    // Level 1: Memory
    this.memoryCache.set(key, objectUrl, blob.size);
    this.objectUrls.set(key, objectUrl);

    // Level 2: IndexedDB (async, non-blocking)
    const thumbKey = `thumb_${key}`;
    this.idbStore.setAsset(key, blob, mimeType, thumbKey);

    // Generate thumbnail for images
    if (mimeType.startsWith('image/')) {
      generateThumbnail(blob).then((thumb) => {
        if (thumb) {
          this.idbStore.setThumbnail(thumbKey, thumb.blob, thumb.width, thumb.height);
        }
      });
    }

    // Evict old entries if needed
    this.idbStore.evictOldest(this.maxIDBSize);

    return objectUrl;
  }

  /**
   * Cache an asset from a remote URL by fetching it.
   */
  async cacheFromUrl(key: string, url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) return url;
      const blob = await response.blob();
      return this.set(key, blob, blob.type);
    } catch {
      return url; // Fall back to original URL
    }
  }

  /**
   * Remove a cached asset from all levels.
   */
  async remove(key: string): Promise<void> {
    // Clean up object URL
    const objectUrl = this.objectUrls.get(key);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.objectUrls.delete(key);
    }
    const thumbUrl = this.objectUrls.get(`thumb_${key}`);
    if (thumbUrl) {
      URL.revokeObjectURL(thumbUrl);
      this.objectUrls.delete(`thumb_${key}`);
    }

    this.memoryCache.delete(key);
    this.memoryCache.delete(`thumb_${key}`);
    await this.idbStore.deleteAsset(key);
  }

  /**
   * Get cache statistics across all levels.
   */
  async getStats(): Promise<CacheStats> {
    const idbStats = await this.idbStore.getStats();
    return {
      memory: this.memoryCache.stats,
      indexedDB: idbStats,
    };
  }

  /**
   * Clear all caches.
   */
  async clearAll(): Promise<void> {
    // Revoke all object URLs
    for (const url of this.objectUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.objectUrls.clear();
    this.memoryCache.clear();
    await this.idbStore.clearAll();
  }

  /**
   * Access the IndexedDB store directly for project data.
   */
  get projects() {
    return {
      save: (id: string, data: unknown) => this.idbStore.saveProject(id, data),
      load: (id: string) => this.idbStore.loadProject(id),
      delete: (id: string) => this.idbStore.deleteProject(id),
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Format bytes for display
export function formatCacheSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
