import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PullToRefresh, ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import { triggerImpact, triggerSuccess } from '../utils/haptics';
import { isDocumentCached } from '../utils/cache';
import { isOnline, addConnectivityListener } from '../utils/connectivity';
import { getRecentDocs } from '../utils/storage';
import OfflineWarning from '../components/OfflineWarning';
import './Home.css';

type RecentDoc = {
  id: string;
  name: string;
  lastOpened: number;
  source: 'Device' | 'Cloud' | 'Unknown';
  filePath?: string;
  cached?: boolean;
};

const RECENTS_KEY = 'recentDocs';

function formatRelativeTime(timestamp: number): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffInSeconds = Math.round((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function readRecents(): RecentDoc[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as RecentDoc[]).sort((a, b) => b.lastOpened - a.lastOpened) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<RecentDoc[]>(readRecents);
  const [online, setOnline] = useState(isOnline());
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  useEffect(() => {
    // Check and show offline warning on mount if offline
    if (!isOnline()) {
      setShowOfflineWarning(true);
    }

    // Listen for connectivity changes
    const unsubscribe = addConnectivityListener((status) => {
      setOnline(status.isOnline);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const onStorage = () => setRecents(readRecents());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Update cached status for recents
  useEffect(() => {
    const updateCachedStatus = async () => {
      const updated = await Promise.all(
        recents.map(async (doc) => ({
          ...doc,
          cached: await isDocumentCached(doc.name)
        }))
      );
      if (JSON.stringify(updated) !== JSON.stringify(recents)) {
        setRecents(updated);
      }
    };
    updateCachedStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recents.length]);

  const filteredRecents = useMemo(() => {
    if (!query.trim()) return recents;
    const q = query.toLowerCase();
    return recents.filter(r => r.name.toLowerCase().includes(q));
  }, [recents, query]);

  const createNew = () => {
    triggerImpact('Light');
    navigate('/editor', { state: { action: 'new' } });
  };

  const openFromDevice = () => {
    triggerImpact('Light');
    if (!online) {
      alert('Opening DOCX files requires internet connection. Only cached documents can be opened offline.');
      return;
    }
    fileInputRef.current?.click();
  };

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    navigate('/editor', { state: { action: 'open', file } });
    e.currentTarget.value = '';
  };

  const openRecent = (doc: RecentDoc) => {
    triggerImpact('Light');
    if (!online && !doc.cached) {
      alert('This document is not cached. Connect to the internet to open it.');
      return;
    }
    navigate('/editor', { state: { action: 'openByName', name: doc.name, filePath: doc.filePath || `${doc.name}.docx`, cached: doc.cached } });
  };

  const goToSettings = () => {
    triggerImpact('Light');
    navigate('/settings');
  };

  const removeRecent = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    triggerImpact('Light');
    const updatedRecents = recents.filter(doc => doc.id !== docId);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updatedRecents));
    setRecents(updatedRecents);
  };

  const handleRefresh = async () => {
    setRecents(readRecents());
    await new Promise(resolve => setTimeout(resolve, 300));
    triggerSuccess();
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">JWORD</h1>
        <div className="home-header-actions">
          {!online && <span className="offline-badge">Offline</span>}
          <button className="settings-btn" onClick={goToSettings} aria-label="Settings">
            ⚙️
          </button>
        </div>
      </header>

      <input
        className="search-bar"
        type="search"
        placeholder="Search documents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputMode="search"
      />

      <div className="actions-grid">
        <div className="action-card" onClick={openFromDevice}>
          <span className="action-icon" role="img" aria-hidden="true">📂</span>
          <span className="action-label">Open File</span>
        </div>
        <div className="action-card" onClick={createNew}>
          <span className="action-icon" role="img" aria-hidden="true">📝</span>
          <span className="action-label">New Doc</span>
        </div>
      </div>

      <div className="recents-container">
        <h2 className="recents-header">Recent Documents</h2>
        <div className="recents-scrollable">
          <ConfigProvider locale={enUS}>
            <PullToRefresh onRefresh={handleRefresh}>
              {filteredRecents.length > 0 ? (
                <div className="recents-list">
                  {filteredRecents.map(doc => (
                    <div 
                      key={doc.id} 
                      className={`recent-item ${!online && !doc.cached ? 'recent-item-disabled' : ''}`}
                    >
                      <div className="recent-item-content" onClick={() => openRecent(doc)}>
                        <span className="recent-icon" role="img" aria-hidden="true">📄</span>
                        <div className="recent-info">
                          <div className="recent-name">{doc.name}</div>
                          <div className="recent-meta">
                            {doc.source} • {formatRelativeTime(doc.lastOpened)}
                            {doc.cached && <span className="cached-badge">Cached</span>}
                          </div>
                        </div>
                      </div>
                      <button 
                        className="recent-remove-btn"
                        onClick={(e) => removeRecent(e, doc.id)}
                        aria-label={`Remove ${doc.name} from recent files`}
                        title="Remove from recent files"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-recents">
                  Your recent documents will appear here.
                </div>
              )}
            </PullToRefresh>
          </ConfigProvider>
        </div>
      </div>

      <OfflineWarning 
        isOpen={showOfflineWarning} 
        onClose={() => setShowOfflineWarning(false)} 
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".doc,.docx,.rtf,.txt,.sfdt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        style={{ display: 'none' }}
        onChange={onPickFile}
      />
    </div>
  );
}
