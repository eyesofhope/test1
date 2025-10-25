# Offline/Online Mode Implementation - Complete Guide

## Overview
This implementation adds comprehensive offline/online support to the JWORD document editor application. The app now intelligently detects network connectivity and adapts its functionality accordingly, with document caching for offline access.

## Features Implemented

### 1. **Connectivity Detection**
- Real-time network status monitoring (web and Capacitor/Android)
- Automatic UI adaptation based on connectivity
- Visual indicators (offline badge, offline banner)

### 2. **Settings Page**
- **Auto-cache on open**: Toggle to automatically cache documents opened online
- **Dark mode**: Toggle for dark theme with system theme support
- **Offline cache management**: View, manage, and clear cached documents
- Mobile-optimized UI with safe area support

### 3. **Document Caching**
- SFDT format caching for offline editing
- Manual caching via "Make Available Offline" button
- Automatic caching when auto-cache is enabled
- Cache metadata tracking (size, timestamp, filename)

### 4. **Offline Mode Capabilities**
- Open cached SFDT documents
- Edit documents fully offline
- Save as DOCX (client-side)
- Local paste functionality
- Clear visual feedback about limitations

### 5. **Online Mode Capabilities**
- Open DOCX/RTF/TXT files via serviceUrl
- Full server-side features (spell check, rich paste, etc.)
- Document conversion to SFDT
- Automatic/manual caching

### 6. **UX Enhancements**
- Offline warning modal on app launch when offline
- Offline banner in editor
- Cached status badges in recent documents
- Disabled state for non-cached documents when offline
- Settings button on home screen

## File Structure

### New Files Created
```
src/
├── utils/
│   ├── connectivity.ts       # Network status detection
│   └── cache.ts              # Document caching management
├── pages/
│   ├── Settings.tsx          # Settings page component
│   └── Settings.css          # Settings page styles
└── components/
    ├── OfflineWarning.tsx    # Offline warning modal
    ├── OfflineWarning.css    # Modal styles
    ├── OfflineBanner.tsx     # Editor offline banner
    └── OfflineBanner.css     # Banner styles
```

### Modified Files
```
src/
├── App.tsx                   # Added connectivity, caching, routes
├── pages/
│   ├── Home.tsx             # Added settings button, offline detection
│   └── Home.css             # Added offline/cached badge styles
├── components/
│   ├── SaveDialog.tsx       # Added cache button
│   └── SaveDialog.css       # Added cache button styles
└── utils/
    └── storage.ts           # Added cached flag to RecentDoc
```

## How It Works

### Connectivity Management
```typescript
// Initialize on app start
await initializeConnectivity();

// Listen for changes
const unsubscribe = addConnectivityListener((status) => {
  setOnline(status.isOnline);
});

// Check current status
const online = isOnline();
```

### Document Caching Flow

**Online → Cache:**
1. User opens DOCX file online (via serviceUrl)
2. Document converts to SFDT internally
3. If auto-cache enabled: automatically serialize and cache
4. If manual: user clicks "Make Available Offline" in save dialog
5. SFDT stored in Capacitor Filesystem (native) or localStorage (web)

**Offline → Open:**
1. User selects cached document from recents
2. App retrieves SFDT from cache
3. Document opens in editor
4. User can edit and save as DOCX (client-side)

### Settings Storage
```typescript
// Settings stored in localStorage
interface AppSettings {
  autoCacheEnabled: boolean;
  darkModeEnabled: boolean;
  useSystemTheme: boolean;
}

// Load/Save
const settings = loadSettings();
saveSettings(newSettings);
```

### Cache Management
```typescript
// Cache a document
await cacheDocument(filename, sfdtContent);

// Retrieve cached document
const sfdt = await getCachedDocument(filename);

// Check if cached
const isCached = await isDocumentCached(filename);

// Clear cache
await clearAllCache();
```

## User Workflows

### Workflow 1: Online → Cache → Offline → Edit
1. User opens app while **online**
2. Opens a DOCX file from device
3. Document opens via serviceUrl conversion
4. User clicks "Make Available Offline" (or auto-cached if enabled)
5. User goes **offline**
6. User opens same document from recents (shows "Cached" badge)
7. Document opens from cache (SFDT)
8. User edits and saves as DOCX

### Workflow 2: Auto-Cache Enabled
1. User enables "Auto-cache on open" in Settings
2. Opens any DOCX file while online
3. Document automatically cached in background
4. "Make Available Offline" button disabled in save dialog
5. Shows "✓ Auto-cache enabled" instead

### Workflow 3: Offline First Launch
1. User opens app while **offline**
2. Offline warning modal appears
3. Lists available capabilities
4. User clicks OK
5. Only cached documents are openable
6. Non-cached documents are grayed out with tooltip

## Limitations & Trade-offs

### Offline Mode Limitations
- ❌ Cannot open new DOCX/RTF/TXT files (requires serviceUrl)
- ❌ No spell check
- ❌ No restrict editing
- ❌ No rich paste with formatting
- ❌ No server-dependent export formats
- ✅ Can edit existing cached documents
- ✅ Can save as DOCX/SFDT client-side
- ✅ Can use basic paste (enableLocalPaste)

### DOCX ↔ SFDT Conversion Fidelity
- **High fidelity**: Text, styles, tables, images, lists, headers/footers
- **May lose**: Macros, OLE objects, SmartArt, complex shapes, custom fields

### Storage Considerations
- SFDT files can be large (JSON format)
- Recommend setting cache size limits
- Provide cache management UI in settings

## Dark Theme Support
All components support dark theme via `.dark-theme` class:
```css
.dark-theme .component {
  background-color: #2d3748;
  color: #e5e7eb;
}
```

## Mobile Optimizations
- Safe area insets for notches/home indicators
- Touch-friendly button sizes (min 44px)
- Responsive layouts with mobile breakpoints
- Bottom sheet style dialogs on mobile
- Pull-to-refresh on home screen

## Production Recommendations

### 1. Host Your Own ServiceUrl
```typescript
// Replace demo URL with your own server
serviceUrl={online ? "https://your-server.com/api/documenteditor/" : ""}
```

### 2. Add Cache Size Limits
```typescript
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
if (totalCacheSize + newDocSize > MAX_CACHE_SIZE) {
  // Prompt to clear old cache or reject
}
```

### 3. Add Conflict Resolution
When user edits offline and source changes online:
- Compare metadata (hash/timestamp)
- Offer: Overwrite, Save As, or Keep Both

### 4. Analytics & Error Tracking
- Track cache hit/miss rates
- Monitor conversion failures
- Log offline usage patterns

### 5. Progressive Enhancement
- Detect File System Access API support
- Fallback gracefully for older browsers
- Test on various Android versions

## Testing Checklist

### Online Mode
- [ ] Open DOCX/RTF/TXT files
- [ ] Auto-cache works when enabled
- [ ] Manual cache button works
- [ ] Cached badge appears in recents
- [ ] Settings toggle works

### Offline Mode
- [ ] Offline warning shows on launch
- [ ] Offline banner shows in editor
- [ ] Cached documents open
- [ ] Non-cached documents are disabled
- [ ] Save as DOCX works
- [ ] Local paste works

### Connectivity Changes
- [ ] Going offline disables DOCX open
- [ ] Coming online re-enables features
- [ ] Offline badge appears/disappears
- [ ] ServiceUrl switches correctly

### Cache Management
- [ ] View cached documents in settings
- [ ] Remove individual cached documents
- [ ] Clear all cache works
- [ ] Cache size displayed correctly

### Dark Theme
- [ ] All pages support dark mode
- [ ] System theme detection works
- [ ] Theme persists across sessions

## Troubleshooting

### Documents not caching
- Check browser console for errors
- Verify localStorage/Filesystem permissions
- Check available storage space

### Offline mode not detecting
- Verify Network plugin is installed (Capacitor)
- Check navigator.onLine support (web)
- Test airplane mode on device

### Theme not applying
- Check localStorage for settings
- Verify .dark-theme class on html element
- Clear browser cache

## Next Steps / Future Enhancements

1. **Background Sync**: Auto-sync cached documents when back online
2. **Versioning**: Track document versions and changes
3. **Conflict Resolution UI**: Better merge/conflict handling
4. **Pre-caching**: Background cache frequently accessed documents
5. **Compression**: Compress SFDT before caching
6. **Encryption**: Encrypt cached documents for security
7. **Multi-device Sync**: Sync cache across user's devices

## Support

For issues or questions:
- Check browser/device console logs
- Verify all dependencies are installed
- Test on latest stable browsers
- Report issues with device/browser info

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-25  
**Compatibility**: React 19.2.0, Capacitor 7.4.3, Syncfusion 31.2.2
