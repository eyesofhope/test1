import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import useIsMobile from '../hooks/useIsMobile'; // Currently unused
import { PullToRefresh } from 'antd-mobile';
import { triggerImpact, triggerSuccess } from '../utils/haptics';
import './Home.css';

type RecentDoc = {
  id: string;
  name: string;
  lastOpened: number; // epoch ms
  source: 'Device' | 'Cloud' | 'Unknown';
};

const RECENTS_KEY = 'recentDocs';

function readRecents(): RecentDoc[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as RecentDoc[];
    return [];
  } catch {
    return [];
  }
}

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<RecentDoc[]>(() => readRecents());
  // const isMobile = useIsMobile(); // Currently unused but may be needed for future mobile optimizations

  useEffect(() => {
    const onStorage = () => setRecents(readRecents());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return recents.sort((a,b)=> b.lastOpened - a.lastOpened);
    const q = query.toLowerCase();
    return recents.filter(r => r.name.toLowerCase().includes(q)).sort((a,b)=> b.lastOpened - a.lastOpened);
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
    // reset so selecting the same file again re-fires
    e.currentTarget.value = '';
  };

  const openRecent = (doc: RecentDoc) => {
    triggerImpact('Light');
    // Navigate to editor; the editor page will try to re-open by name if possible
    navigate('/editor', { state: { action: 'openByName', name: doc.name } });
  };

  const handleRefresh = async () => {
    setRecents(readRecents());
    await new Promise(resolve => setTimeout(resolve, 300));
    triggerSuccess();
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="brand">JWORD</div>
        <div className="actions">
          <button className="btn primary" onClick={createNew}><span>＋</span> New</button>
          <button className="btn" onClick={openFromDevice}><span>📂</span> Open</button>
        </div>
      </header>

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search documents"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
          />
        </div>

        <section className="section">
          <h3 className="section-title">Recent</h3>
          {filtered.length === 0 ? (
            <div className="empty">No recent documents yet.</div>
          ) : (
            <div className="grid">
              {filtered.map(doc => (
                <button key={doc.id} className="card" onClick={()=>openRecent(doc)}>
                  <div className="card-icon">📄</div>
                  <div className="card-title" title={doc.name}>{doc.name}</div>
                  <div className="card-meta">
                    <span>{doc.source}</span>
                    <span>{new Date(doc.lastOpened).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </PullToRefresh>

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


