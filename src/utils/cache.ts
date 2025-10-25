import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Cache management for offline document support
 * Stores SFDT format for offline access
 */

const CACHE_DIR = 'offline_cache';
const CACHE_METADATA_KEY = 'cache_metadata';

export interface CachedDocument {
  id: string;
  filename: string;
  originalPath?: string;
  timestamp: number;
  size: number;
  hash?: string;
}

export interface CacheMetadata {
  documents: CachedDocument[];
  totalSize: number;
  lastUpdated: number;
}

/**
 * Initialize cache directory
 */
export async function initializeCache(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Web platform - use IndexedDB or localStorage
    return;
  }

  try {
    // Check if cache directory exists, create if not
    await Filesystem.mkdir({
      path: CACHE_DIR,
      directory: Directory.Data,
      recursive: true
    });
  } catch (error) {
    console.warn('Cache directory already exists or error creating:', error);
  }
}

/**
 * Get cache metadata
 */
export async function getCacheMetadata(): Promise<CacheMetadata> {
  try {
    const stored = localStorage.getItem(CACHE_METADATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to get cache metadata:', error);
  }

  return {
    documents: [],
    totalSize: 0,
    lastUpdated: Date.now()
  };
}

/**
 * Save cache metadata
 */
async function saveCacheMetadata(metadata: CacheMetadata): Promise<void> {
  try {
    metadata.lastUpdated = Date.now();
    const value = JSON.stringify(metadata);
    localStorage.setItem(CACHE_METADATA_KEY, value);
  } catch (error) {
    console.error('Failed to save cache metadata:', error);
  }
}

/**
 * Cache a document (SFDT content)
 */
export async function cacheDocument(
  filename: string,
  sfdtContent: string,
  originalPath?: string
): Promise<boolean> {
  try {
    const id = `${Date.now()}_${filename.replace(/\s+/g, '_')}`;
    const cacheFilename = `${id}.sfdt`;

    if (Capacitor.isNativePlatform()) {
      // Save to filesystem
      await Filesystem.writeFile({
        path: `${CACHE_DIR}/${cacheFilename}`,
        data: sfdtContent,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
    } else {
      // Save to localStorage (web)
      localStorage.setItem(`cache_${cacheFilename}`, sfdtContent);
    }

    // Update metadata
    const metadata = await getCacheMetadata();
    const size = new Blob([sfdtContent]).size;
    
    // Remove old cache entry for the same filename if exists
    metadata.documents = metadata.documents.filter(
      doc => doc.filename !== filename
    );

    metadata.documents.push({
      id,
      filename,
      originalPath,
      timestamp: Date.now(),
      size
    });

    metadata.totalSize = metadata.documents.reduce((sum, doc) => sum + doc.size, 0);
    await saveCacheMetadata(metadata);

    return true;
  } catch (error) {
    console.error('Failed to cache document:', error);
    return false;
  }
}

/**
 * Get cached document content
 */
export async function getCachedDocument(filename: string): Promise<string | null> {
  try {
    const metadata = await getCacheMetadata();
    const doc = metadata.documents.find(d => d.filename === filename);
    
    if (!doc) return null;

    const cacheFilename = `${doc.id}.sfdt`;

    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.readFile({
        path: `${CACHE_DIR}/${cacheFilename}`,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      return result.data as string;
    } else {
      return localStorage.getItem(`cache_${cacheFilename}`);
    }
  } catch (error) {
    console.error('Failed to get cached document:', error);
    return null;
  }
}

/**
 * Check if document is cached
 */
export async function isDocumentCached(filename: string): Promise<boolean> {
  const metadata = await getCacheMetadata();
  return metadata.documents.some(doc => doc.filename === filename);
}

/**
 * Remove cached document
 */
export async function removeCachedDocument(filename: string): Promise<boolean> {
  try {
    const metadata = await getCacheMetadata();
    const doc = metadata.documents.find(d => d.filename === filename);
    
    if (!doc) return false;

    const cacheFilename = `${doc.id}.sfdt`;

    if (Capacitor.isNativePlatform()) {
      await Filesystem.deleteFile({
        path: `${CACHE_DIR}/${cacheFilename}`,
        directory: Directory.Data
      });
    } else {
      localStorage.removeItem(`cache_${cacheFilename}`);
    }

    // Update metadata
    metadata.documents = metadata.documents.filter(d => d.filename !== filename);
    metadata.totalSize = metadata.documents.reduce((sum, doc) => sum + doc.size, 0);
    await saveCacheMetadata(metadata);

    return true;
  } catch (error) {
    console.error('Failed to remove cached document:', error);
    return false;
  }
}

/**
 * Clear all cached documents
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    const metadata = await getCacheMetadata();

    for (const doc of metadata.documents) {
      const cacheFilename = `${doc.id}.sfdt`;
      
      if (Capacitor.isNativePlatform()) {
        try {
          await Filesystem.deleteFile({
            path: `${CACHE_DIR}/${cacheFilename}`,
            directory: Directory.Data
          });
        } catch (error) {
          console.warn('Failed to delete cache file:', cacheFilename);
        }
      } else {
        localStorage.removeItem(`cache_${cacheFilename}`);
      }
    }

    // Reset metadata
    await saveCacheMetadata({
      documents: [],
      totalSize: 0,
      lastUpdated: Date.now()
    });

    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}

/**
 * Get total cache size in bytes
 */
export async function getCacheSize(): Promise<number> {
  const metadata = await getCacheMetadata();
  return metadata.totalSize;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
