// Constants for localStorage keys
const FOLDER_PREF_KEY = 'selectedFolderPref';
const RECENTS_KEY = 'recentDocs';

// Type definitions
export interface FolderPreference {
  id: string;
  name?: string;
  platform: 'native' | 'web';
  _originalRef?: any; // Store original ScopedStorage reference
}

export interface RecentDoc {
  id: string;
  name: string;
  lastOpened: number;
  source: 'Device' | 'Cloud' | 'Unknown';
  filePath?: string;
  cached?: boolean;
}

// Folder preference functions
export function saveFolderPreference(folder: { id: string; name?: string }, platform: 'native' | 'web'): void {
  try {
    const preference: FolderPreference = {
      id: folder.id,
      name: folder.name,
      platform
    };
    localStorage.setItem(FOLDER_PREF_KEY, JSON.stringify(preference));
  } catch (error) {
    console.warn('Failed to save folder preference:', error);
  }
}

export function getFolderPreference(): FolderPreference | null {
  try {
    const stored = localStorage.getItem(FOLDER_PREF_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as FolderPreference;
  } catch (error) {
    console.warn('Failed to get folder preference:', error);
    return null;
  }
}

export function clearFolderPreference(): void {
  try {
    localStorage.removeItem(FOLDER_PREF_KEY);
  } catch (error) {
    console.warn('Failed to clear folder preference:', error);
  }
}

// Recent documents functions
export function getRecentDocs(): RecentDoc[] {
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as RecentDoc[];
  } catch (error) {
    console.warn('Failed to get recent docs:', error);
    return [];
  }
}

export function addRecentDoc(name: string, source: 'Device' | 'Cloud' | 'Unknown', filePath?: string): void {
  try {
    const recents = getRecentDocs();
    
    // Remove any existing document with the same name
    const filteredRecents = recents.filter(doc => doc.name !== name);
    
    // Add the new document at the beginning
    const newDoc: RecentDoc = {
      id: Date.now().toString(),
      name,
      lastOpened: Date.now(),
      source,
      filePath
    };
    
    filteredRecents.unshift(newDoc);
    
    // Keep only the 20 most recent documents
    const limitedRecents = filteredRecents.slice(0, 20);
    
    localStorage.setItem(RECENTS_KEY, JSON.stringify(limitedRecents));
  } catch (error) {
    console.warn('Failed to add recent doc:', error);
  }
}
