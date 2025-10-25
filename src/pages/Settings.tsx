import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from 'antd-mobile';
import { triggerImpact, triggerSuccess } from '../utils/haptics';
import { getCacheMetadata, clearAllCache, removeCachedDocument, formatBytes } from '../utils/cache';
import type { CachedDocument } from '../utils/cache';
import './Settings.css';

// Settings storage keys
const SETTINGS_KEY = 'app_settings';

export interface AppSettings {
  autoCacheEnabled: boolean;
  darkModeEnabled: boolean;
  useSystemTheme: boolean;
}

const defaultSettings: AppSettings = {
  autoCacheEnabled: false,
  darkModeEnabled: false,
  useSystemTheme: true
};

// Load settings from localStorage
export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return defaultSettings;
}

// Save settings to localStorage
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [cachedDocs, setCachedDocs] = useState<CachedDocument[]>([]);
  const [totalCacheSize, setTotalCacheSize] = useState(0);
  const [showCacheManager, setShowCacheManager] = useState(false);

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    const metadata = await getCacheMetadata();
    setCachedDocs(metadata.documents);
    setTotalCacheSize(metadata.totalSize);
  };

  const handleSettingChange = (key: keyof AppSettings, value: boolean) => {
    triggerImpact('Light');
    const newSettings = { ...settings, [key]: value };
    
    // If switching to system theme, detect and apply
    if (key === 'useSystemTheme' && value) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newSettings.darkModeEnabled = prefersDark;
    }
    
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Apply theme immediately
    applyTheme(newSettings);
  };

  const applyTheme = (settings: AppSettings) => {
    if (settings.darkModeEnabled) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  const handleClearAllCache = async () => {
    if (window.confirm('Are you sure you want to clear all cached documents? This cannot be undone.')) {
      triggerImpact('Medium');
      const success = await clearAllCache();
      if (success) {
        triggerSuccess();
        await loadCacheInfo();
        alert('All cached documents cleared successfully');
      } else {
        alert('Failed to clear cache');
      }
    }
  };

  const handleRemoveCachedDoc = async (filename: string) => {
    if (window.confirm(`Remove "${filename}" from offline cache?`)) {
      triggerImpact('Light');
      const success = await removeCachedDocument(filename);
      if (success) {
        triggerSuccess();
        await loadCacheInfo();
      } else {
        alert('Failed to remove document from cache');
      }
    }
  };

  const goBack = () => {
    triggerImpact('Light');
    navigate('/');
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <button className="settings-back-btn" onClick={goBack} aria-label="Go back">
          ← Back
        </button>
        <h1 className="settings-title">Settings</h1>
      </header>

      <div className="settings-content">
        {/* General Settings - Auto-cache option hidden as requested */}
        {/* <section className="settings-section">
          <h2 className="settings-section-title">General</h2>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-item-label">Auto-cache on open</div>
              <div className="settings-item-description">
                Automatically cache documents opened online for offline access
              </div>
            </div>
            <Switch
              checked={settings.autoCacheEnabled}
              onChange={(checked) => handleSettingChange('autoCacheEnabled', checked)}
            />
          </div>
        </section> */}

        {/* Appearance Settings */}
        <section className="settings-section">
          <h2 className="settings-section-title">Appearance</h2>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-item-label">Use system theme</div>
              <div className="settings-item-description">
                Follow system dark/light mode setting
              </div>
            </div>
            <Switch
              checked={settings.useSystemTheme}
              onChange={(checked) => handleSettingChange('useSystemTheme', checked)}
            />
          </div>

          {!settings.useSystemTheme && (
            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-label">Dark mode</div>
                <div className="settings-item-description">
                  Use dark theme throughout the app
                </div>
              </div>
              <Switch
                checked={settings.darkModeEnabled}
                onChange={(checked) => handleSettingChange('darkModeEnabled', checked)}
              />
            </div>
          )}
        </section>

        {/* Offline Cache Settings */}
        <section className="settings-section">
          <h2 className="settings-section-title">Offline Cache</h2>
          
          <div className="settings-item settings-item-clickable" onClick={() => setShowCacheManager(!showCacheManager)}>
            <div className="settings-item-info">
              <div className="settings-item-label">Manage offline cache</div>
              <div className="settings-item-description">
                {cachedDocs.length} document{cachedDocs.length !== 1 ? 's' : ''} cached ({formatBytes(totalCacheSize)})
              </div>
            </div>
            <span className="settings-chevron">{showCacheManager ? '▼' : '▶'}</span>
          </div>

          {showCacheManager && (
            <div className="cache-manager">
              {cachedDocs.length > 0 ? (
                <>
                  <div className="cache-list">
                    {cachedDocs.map(doc => (
                      <div key={doc.id} className="cache-item">
                        <div className="cache-item-info">
                          <div className="cache-item-name">{doc.filename}</div>
                          <div className="cache-item-meta">
                            {formatBytes(doc.size)} • {new Date(doc.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          className="cache-item-remove-btn"
                          onClick={() => handleRemoveCachedDoc(doc.filename)}
                          aria-label={`Remove ${doc.filename}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="settings-btn settings-btn-danger" onClick={handleClearAllCache}>
                    Clear All Cache
                  </button>
                </>
              ) : (
                <div className="cache-empty">
                  No cached documents. Open documents while online with auto-cache enabled to cache them.
                </div>
              )}
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="settings-section">
          <h2 className="settings-section-title">About</h2>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-item-label">Version</div>
              <div className="settings-item-description">JWORD 1.0.0</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
