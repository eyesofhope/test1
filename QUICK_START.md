# Quick Start Guide - Offline/Online Mode

## For Users

### First Time Setup
1. Open JWORD app
2. If offline, you'll see a warning - click OK
3. Go to Settings (⚙️ button on home screen)
4. Enable "Auto-cache on open" for automatic offline access
5. Choose dark mode if desired

### Opening Documents

**When Online:**
- Click "Open File" to browse DOCX/RTF/TXT files
- Document opens and converts automatically
- If auto-cache is ON, it's cached for offline use
- If auto-cache is OFF, click "Make Available Offline" when saving

**When Offline:**
- Only documents with "Cached" badge can be opened
- Grayed-out documents require internet connection
- Edit and save cached documents normally

### Managing Cache
1. Go to Settings → Manage offline cache
2. View all cached documents and sizes
3. Remove individual documents or clear all
4. See total cache size

---

## For Developers

### Quick Implementation Test

**Test Online Mode:**
```bash
npm start
# App opens at http://localhost:3000
# Ensure you're online
# Open a DOCX file
# Click "Make Available Offline"
# Check Settings → Cache to verify
```

**Test Offline Mode:**
```bash
# Keep app running
# Open browser DevTools (F12)
# Go to Network tab
# Check "Offline" checkbox
# Reload app - offline warning should show
# Try to open cached document - works
# Try to open non-cached - disabled
```

**Test Auto-Cache:**
```bash
# Settings → Enable "Auto-cache on open"
# Open any DOCX file
# Check Settings → Cache
# Should see document cached automatically
# Save dialog shows "✓ Auto-cache enabled"
```

### Key Files to Understand

1. **src/utils/connectivity.ts** - Network detection
2. **src/utils/cache.ts** - Document caching
3. **src/App.tsx** - Main editor with offline logic
4. **src/pages/Settings.tsx** - Settings management
5. **src/pages/Home.tsx** - Recent docs with cached badges

### Common Issues

**Cache not working:**
```typescript
// Check browser console for errors
// Verify Filesystem permissions (Android)
// Check localStorage quota
```

**Offline detection not working:**
```typescript
// Ensure Network plugin installed:
npm install @capacitor/network

// Sync Capacitor:
npx cap sync
```

**Theme not persisting:**
```typescript
// Clear localStorage and retry:
localStorage.clear();
location.reload();
```

### Android Build

```bash
# Build and sync
npm run cap:build

# Open in Android Studio
npm run cap:android

# Or run directly
npm run cap:run:android
```

### Environment Variables (Optional)

Create `.env` file:
```env
REACT_APP_SYNCFUSION_LICENSE_KEY=your_license_key
REACT_APP_SERVICE_URL=https://your-server.com/api/documenteditor/
```

---

## Feature Toggles

Enable/disable features in Settings:
- ✅ Auto-cache on open
- ✅ Dark mode
- ✅ Use system theme

## Keyboard Shortcuts (Editor)

- **Ctrl+S** / **Cmd+S**: Save document
- **Escape**: Close dialogs

## Status Indicators

- 🟢 **Online**: Full features available
- 🟡 **Offline badge**: Limited features
- 📴 **Offline banner**: Shows in editor
- ✅ **Cached badge**: Document available offline

---

**Need Help?** Check OFFLINE_IMPLEMENTATION.md for detailed documentation.
