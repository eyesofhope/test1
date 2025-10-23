import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PullToRefresh, ConfigProvider } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import { triggerImpact, triggerSuccess } from '../utils/haptics';
import './Home.css';

type RecentDoc = {
  id: string;
  name: string;
  lastOpened: number; // epoch ms
  source: 'Device' | 'Cloud' | 'Unknown';
  filePath?: string;
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

  useEffect(() => {
    const onStorage = () => setRecents(readRecents());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
    navigate('/editor', { state: { action: 'openByName', name: doc.name, filePath: doc.filePath || `${doc.name}.docx` } });
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
        <button className="new-doc-btn" onClick={createNew}>
          <span role="img" aria-hidden="true">➕</span>
          New Doc
        </button>
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
        <div className="action-card" onClick={() => alert('Feature coming soon!')}>
          <span className="action-icon" role="img" aria-hidden="true">☁️</span>
          <span className="action-label">Cloud Sync</span>
        </div>
      </div>

      <ConfigProvider locale={enUS}>
        <PullToRefresh onRefresh={handleRefresh}>
          <h2 className="recents-header">Recent Documents</h2>
          {filteredRecents.length > 0 ? (
            <div className="recents-list">
              {filteredRecents.map(doc => (
                <div key={doc.id} className="recent-item" onClick={() => openRecent(doc)}>
                  <span className="recent-icon" role="img" aria-hidden="true">📄</span>
                  <div className="recent-info">
                    <div className="recent-name">{doc.name}</div>
                    <div className="recent-meta">
                      {doc.source} • {formatRelativeTime(doc.lastOpened)}
                    </div>
                  </div>
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
