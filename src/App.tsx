import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import {DocumentEditorContainerComponent, Ribbon, Inject} from '@syncfusion/ej2-react-documenteditor';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { triggerImpact, triggerSuccess } from './utils/haptics';
import { saveFolderPreference, getFolderPreference, addRecentDoc } from './utils/storage';
import SaveDialog from './components/SaveDialog';
import './App.css';

// Ensure Syncfusion license is registered
import './syncfusion-license';

// Filename sanitization utility
const sanitizeFilename = (filename: string): string => {
  if (!filename || !filename.trim()) {
    return `Document_${new Date().toISOString().split('T')[0]}`;
  }
  
  // Remove path separators and illegal characters
  let sanitized = filename
    .replace(/[/\\:*?"<>|]/g, '') // Remove illegal characters
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
  
  // If result is empty after sanitization, use default
  if (!sanitized) {
    sanitized = `Document_${new Date().toISOString().split('T')[0]}`;
  }
  
  // Ensure .docx extension
  if (!sanitized.toLowerCase().endsWith('.docx')) {
    sanitized = sanitized.replace(/\.(docx?|txt|rtf)$/i, '') + '.docx';
  }
  
  return sanitized;
};
// import TextEditorToolbar from './TextEditorToolbar';

// Inject Ribbon service as recommended by Syncfusion
DocumentEditorContainerComponent.Inject(Ribbon);

function EditorPage() {
  const editorRef = useRef<DocumentEditorContainerComponent | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomToolbarRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name?: string } | null>(null);
  const [defaultFilename, setDefaultFilename] = useState('Document');
  const location = useLocation();
  // Formatting presets and helpers removed with bottom toolbar

  // Handle document editor ready event to set up listeners
  const onDocumentEditorCreated = () => {
    if (editorRef.current?.documentEditor) {
      // Listen for document changes (like file open)
      editorRef.current.documentEditor.documentChange = () => {
        const currentDocName = editorRef.current?.documentEditor?.documentName;
        if (currentDocName && currentDocName.trim() && currentDocName !== 'Document1') {
          const nameWithoutExt = currentDocName.replace(/\.(docx?|txt|rtf)$/i, '');
          setDefaultFilename(nameWithoutExt);
          addRecentDoc(nameWithoutExt, 'Unknown');
        }
      };

      // Add custom save button and hide export functionality with improved detection
      const addSaveButton = () => {
        console.log('Attempting to add Save button...');
        
        // Hide export functionality programmatically
        const exportElements = document.querySelectorAll(
          '[title*="Export"], [aria-label*="Export"], .e-de-export-dropdown, .e-export-dropdown'
        );
        exportElements.forEach(element => {
          (element as HTMLElement).style.display = 'none';
        });

        // Try multiple selectors for the toolbar
        const toolbarSelectors = [
          '.e-de-ctnr-toolbar .e-toolbar-items',
          '.e-toolbar-items',
          '.e-de-ctnr-toolbar',
          '.e-ribbon .e-toolbar-items',
          '.e-ribbon-tab .e-toolbar-items'
        ];
        
        let toolbar = null;
        for (const selector of toolbarSelectors) {
          toolbar = document.querySelector(selector);
          if (toolbar) {
            console.log(`Found toolbar with selector: ${selector}`);
            break;
          }
        }
        
        if (toolbar) {
          // Check if save button already exists to prevent multiple insertions
          const existingSaveButton = toolbar.querySelector('#custom-save-btn');
          if (!existingSaveButton) {
            console.log('Creating Save button...');
            const saveButton = document.createElement('button');
            saveButton.className = 'e-tbar-btn e-btn e-primary';
            saveButton.id = 'custom-save-btn';
            saveButton.title = 'Save Document';
            saveButton.style.marginRight = '8px';
            saveButton.innerHTML = `
              <span class="e-btn-icon e-icons e-save"></span>
              <span class="e-tbar-btn-text">Save</span>
            `;
            saveButton.onclick = (e) => {
              e.preventDefault();
              console.log('Save button clicked');
              openSaveDialog();
            };
            
            // Insert at the beginning of toolbar
            toolbar.insertBefore(saveButton, toolbar.firstChild);
            console.log('Save button added successfully!');
          } else {
            console.log('Save button already exists');
          }
        } else {
          console.warn('Syncfusion toolbar not found with any selector');
          // Retry after a longer delay
          setTimeout(addSaveButton, 1000);
        }
      };
      
      // Try multiple times with different delays
      setTimeout(addSaveButton, 500);
      setTimeout(addSaveButton, 1000);
      setTimeout(addSaveButton, 2000);
    }
  };

  // Initialize folder preference on mount
  useEffect(() => {
    const savedFolder = getFolderPreference();
    if (savedFolder) {
      setSelectedFolder(savedFolder);
    }
  }, []);

  // Open save dialog
  const openSaveDialog = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setIsSaveDialogOpen(true);
    triggerImpact('Light');
    if (!defaultFilename || defaultFilename === 'Document') {
      setDefaultFilename(`Document_${new Date().toISOString().split('T')[0]}`);
    }
  };

  // Handle folder selection
  const handleFolderSelection = async (): Promise<{ id: string; name?: string } | null> => {
    try {
      if (Capacitor.isNativePlatform()) {
        // On native, we save to a predefined directory, so we just inform the user.
        const documentsFolder = { id: 'Documents/JWORD_Documents', name: 'JWORD_Documents' };
        setSelectedFolder(documentsFolder);
        saveFolderPreference(documentsFolder, 'native');
        alert('Documents will be saved in the "JWORD_Documents" folder inside your device\'s Documents directory.');
        return documentsFolder;
      } else {
        // Web platform - check for File System Access API (Chromium)
        if ('showDirectoryPicker' in window) {
          const dirHandle = await (window as any).showDirectoryPicker();
          const folder = { id: dirHandle.name, name: dirHandle.name };
          // Don't save web folder preference as it won't be reused in save flow
          setSelectedFolder(folder);
          triggerSuccess();
          return folder;
        }
      }
    } catch (error) {
      console.warn('Folder selection cancelled or failed:', error);
    }
    return null;
  };

  // Handle save confirmation from dialog
  const handleSaveConfirm = async (filename: string) => {
    setIsSaveDialogOpen(false);
    triggerImpact('Medium');
    
    if (!editorRef.current?.documentEditor) return;

    try {
      const blob = await editorRef.current.documentEditor.saveAsBlob('Docx');
      
      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor Filesystem API for reliable saving
        const reader = new FileReader();
        reader.onloadend = async () => {
          let base64Data: string = '';
          try {
            base64Data = (reader.result as string).split(',')[1];
            if (!base64Data) {
              throw new Error('Failed to convert document to base64.');
            }

            let sanitizedFilename = filename.trim();
            if (!sanitizedFilename.toLowerCase().endsWith('.docx')) {
              sanitizedFilename = sanitizedFilename.replace(/\.(docx?|txt|rtf)$/i, '') + '.docx';
            }
            
            const path = `JWORD_Documents/${sanitizedFilename}`;

            const writeResult = await Filesystem.writeFile({
              path,
              data: base64Data,
              directory: Directory.Documents,
              recursive: true, // Creates the JWORD_Documents folder if it doesn't exist
            });

            console.log('File saved successfully:', writeResult.uri);
            alert(`Document saved to: Documents/JWORD_Documents/${sanitizedFilename}`);
            
            // Store relative path for opening later
            addRecentDoc(filename, 'Device', path);
            triggerSuccess();

          } catch (error: any) {
            console.error('Error saving document to Android:', error);
            
            // Show user-friendly error and fallback to share
            alert(`Failed to save document: ${error?.message || 'Unknown error'}. Trying alternative save method...`);
            
            try {
              if (base64Data) {
                await Share.share({
                  title: 'Share Document - Save Failed',
                  text: 'Document from JWORD (Save to folder failed, please save manually)',
                  url: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + base64Data
                });
              }
            } catch (shareError) {
              console.error('Error sharing document:', shareError);
              alert('Both save and share failed. Please try again or restart the app.');
            }
          }
        };
        reader.readAsDataURL(blob);
        
      } else {
        // Web platform
        const sanitizedFilename = sanitizeFilename(filename);
        
        if ('showSaveFilePicker' in window) {
          // File System Access API (Chromium)
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: sanitizedFilename,
              types: [{
                description: 'Word Document',
                accept: {
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                }
              }]
            });
            
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            
            addRecentDoc(filename, 'Device');
            triggerSuccess();
          } catch (error) {
            console.warn('Save picker cancelled or failed:', error);
          }
        } else {
          // Fallback for Firefox/Safari
          const url = (window as any).URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = sanitizedFilename;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          (window as any).URL.revokeObjectURL(url);
          
          addRecentDoc(filename, 'Device');
          triggerSuccess();
        }
      }
      
    } catch (error) {
      console.error('Error in save process:', error);
    }
  };

  // Handle save dialog cancel
  const handleSaveCancel = () => {
    setIsSaveDialogOpen(false);
    triggerImpact('Light');
  };

  // Removed custom save modal and handlers

  const onToolbarClick = (args: any) => {
    const id = args?.item?.id || args?.item?.properties?.id;
    const text = args?.item?.text || args?.item?.properties?.text || '';
    console.log('Toolbar clicked:', id, text); // Debug log
    
    if (id === 'textMenuToggle') {
      setShowTextPanel((prev) => !prev);
      if (typeof args.cancel !== 'undefined') {
        args.cancel = true;
      }
    } else if (id === 'custom-save-btn' || id === 'save' || id === 'Save') {
      // Handle our custom save functionality
      console.log('Custom save action triggered');
      openSaveDialog();
      if (typeof args.cancel !== 'undefined') {
        args.cancel = true; // Cancel default save behavior
      }
    } else if (
      // Block all other export related actions (but not our save)
      id === 'Export' || 
      id?.includes('export') || id?.includes('Export') ||
      id?.includes('pdf') || id?.includes('PDF') ||
      id?.includes('docx') || id?.includes('DOCX') ||
      text?.toLowerCase().includes('export') ||
      text?.toLowerCase().includes('pdf') ||
      text?.toLowerCase().includes('docx')
    ) {
      console.log('Blocking export action');
      // Block any default export functionality
      if (typeof args.cancel !== 'undefined') {
        args.cancel = true;
      }
    }
  };

  // Detect focus inside the editor to toggle bottom toolbar visibility
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const onFocusIn = () => setIsEditing(true);
    const onFocusOut = (event: FocusEvent) => {
      // Hide only if focus truly leaves the editor area
      const nextTarget = event.relatedTarget as Node | null;
      if (nextTarget && containerEl.contains(nextTarget)) return;
      setIsEditing(false);
    };
    containerEl.addEventListener('focusin', onFocusIn);
    containerEl.addEventListener('focusout', onFocusOut);
    return () => {
      containerEl.removeEventListener('focusin', onFocusIn);
      containerEl.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // Move toolbar above virtual keyboard using VisualViewport when available
  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    if (!vv) return;
    const updateOffset = () => {
      const isKeyboardLikelyOpen = vv.height < window.innerHeight * 0.8;
      const bottomInset = window.innerHeight - (vv.height + vv.offsetTop);
      setKeyboardOffset(isKeyboardLikelyOpen ? Math.max(0, Math.round(bottomInset)) : 0);
    };
    vv.addEventListener('resize', updateOffset);
    vv.addEventListener('scroll', updateOffset);
    updateOffset();
    return () => {
      vv.removeEventListener('resize', updateOffset);
      vv.removeEventListener('scroll', updateOffset);
    };
  }, []);

  // Prevent overlap by padding the editor content when toolbar is visible
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const toolbarEl = bottomToolbarRef.current;
    const height = (toolbarEl?.offsetHeight ?? 0) + keyboardOffset;
    if (isEditing || showTextPanel) {
      root.classList.add('with-bottom-toolbar');
      root.style.setProperty('--bottom-toolbar-h', `${height}px`);
    } else {
      root.classList.remove('with-bottom-toolbar');
      root.style.removeProperty('--bottom-toolbar-h');
    }
  }, [isEditing, showTextPanel, keyboardOffset]);

  // Handle navigation state for opening/creating docs from Home
  useEffect(() => {
    const state = location.state as any;
    if (!state || !editorRef.current?.documentEditor) return;
    const de = editorRef.current.documentEditor;
    if (state.action === 'new') {
      de.openBlank();
      addRecentDoc('Untitled', 'Device');
      window.history.replaceState({}, document.title);
    } else if (state.action === 'open' && state.file instanceof File) {
      de.open(state.file);
      addRecentDoc(state.file.name.replace(/\.(docx?|txt|rtf)$/i, ''), 'Device');
      window.history.replaceState({}, document.title);
    } else if (state.action === 'openByName') {
      // Handle opening recent documents by name
      const handleOpenByName = async () => {
        if (state.filePath && Capacitor.isNativePlatform()) {
          try {
            // Try to read the file using Capacitor Filesystem
            console.log('Reading file with path:', state.filePath);
            
            const fileData = await Filesystem.readFile({
              path: state.filePath,
              directory: Directory.Documents,
            });
            
            // Convert base64 to Blob
            const byteCharacters = atob(fileData.data as string);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            
            // Create a File object and open it
            const file = new File([blob], state.filePath, { type: blob.type });
            de.open(file);
            addRecentDoc(state.name || state.filePath.replace(/\.(docx?|txt|rtf)$/i, ''), 'Device');
          } catch (error) {
            console.warn('Could not open file by name, falling back to file picker:', error);
            // Fallback: trigger file picker
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.doc,.docx,.rtf,.txt,.sfdt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword';
            fileInput.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                de.open(file);
                addRecentDoc(file.name.replace(/\.(docx?|txt|rtf)$/i, ''), 'Device');
              }
            };
            fileInput.click();
          }
        } else {
          // No file path or folder, trigger file picker
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.doc,.docx,.rtf,.txt,.sfdt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword';
          fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              de.open(file);
              addRecentDoc(file.name.replace(/\.(docx?|txt|rtf)$/i, ''), 'Device');
            }
          };
          fileInput.click();
        }
      };
      
      handleOpenByName();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, selectedFolder]);


  // Formatting helper functions removed

  return (
    <div className="App document-editor-container" ref={containerRef}>
      {/* Floating Save Button removed */}

      {/* Main Syncfusion toolbar + editor */}
      <div className="main-toolbar">
      <DocumentEditorContainerComponent 
        ref={editorRef} 
        height={"calc(100vh - 56px)"}
        enableToolbar={true}
        toolbarMode="Ribbon"
        created={onDocumentEditorCreated}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        showPropertiesPane={true}
        toolbarClick={onToolbarClick}>
        <Inject services={[Ribbon]}></Inject>
      </DocumentEditorContainerComponent>
      </div>

      {/* Custom bottom toolbar - DISABLED */}
      {/* 
      {(isEditing || showTextPanel) && (
        <div
          ref={bottomToolbarRef}
          className="custom-bottom-toolbar"
          style={{ bottom: `calc(${keyboardOffset}px + env(safe-area-inset-bottom))` }}
        >
          <div className="text-editing-toolbar-wrapper text-toolbar-bottom">
            <TextEditorToolbar
              editorRef={editorRef}
              fontFamilies={fontFamilies}
              fontSizes={fontSizes}
              paragraphStyles={paragraphStyles}
              highlightOptions={highlightOptions}
            />
          </div>
        </div>
      )}
      */}

      {/* Bottom Save Button removed */}
      {/* Save modal removed */}
      
      <SaveDialog
        isOpen={isSaveDialogOpen}
        defaultFilename={defaultFilename}
        currentFolder={selectedFolder}
        onSave={handleSaveConfirm}
        onChangeFolder={handleFolderSelection}
        onCancel={handleSaveCancel}
        restoreFocusTo={openerRef.current}
      />
    </div>
  );
}

export default App;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export { EditorPage };
