import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import {DocumentEditorContainerComponent, Toolbar, Inject} from '@syncfusion/ej2-react-documenteditor';
import './App.css';
import TextEditorToolbar from './TextEditorToolbar';

function EditorPage() {
  const editorRef = useRef<DocumentEditorContainerComponent | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomToolbarRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('Sample');
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const location = useLocation();
  const fontFamilies = ['Calibri','Arial','Times New Roman','Georgia','Courier New','Roboto'];
  const fontSizes = [9,10,11,12,14,16,18,20,22,24,28,32];
  const paragraphStyles = ['Normal','No Spacing','Heading 1','Heading 2','Heading 3','Title'];
  const highlightOptions: { name: any; color: string }[] = [
    { name: 'NoColor', color: '#ffffff' },
    { name: 'Yellow', color: '#FDE047' },
    { name: 'BrightGreen', color: '#22C55E' },
    { name: 'Turquoise', color: '#14B8A6' },
    { name: 'Pink', color: '#EC4899' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Red', color: '#EF4444' },
    { name: 'Gray25', color: '#D1D5DB' }
  ];

  const openModal = () => {
    // Try to get the current document name from the editor
    const currentDocName = editorRef.current?.documentEditor?.documentName;
    if (currentDocName && currentDocName.trim() && currentDocName !== 'Document1') {
      // Remove file extension if present and use the document name
      const nameWithoutExt = currentDocName.replace(/\.(docx?|txt|rtf)$/i, '');
      setFileName(nameWithoutExt);
    } else {
      setFileName((prev) => (prev.trim() ? prev : 'Sample'));
    }
    setIsModalOpen(true);
  };

  // Handle document editor ready event to set up listeners
  const onDocumentEditorCreated = () => {
    if (editorRef.current?.documentEditor) {
      // Listen for document changes (like file open)
      editorRef.current.documentEditor.documentChange = () => {
        const currentDocName = editorRef.current?.documentEditor?.documentName;
        if (currentDocName && currentDocName.trim() && currentDocName !== 'Document1') {
          const nameWithoutExt = currentDocName.replace(/\.(docx?|txt|rtf)$/i, '');
          setFileName(nameWithoutExt);
          updateRecents(nameWithoutExt, 'Unknown');
        }
      };
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (fileName.trim()) {
      editorRef.current?.documentEditor.save(fileName.trim(), 'Docx');
      closeModal();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
    }
  };

  const onToolbarClick = (args: any) => {
    const id = args?.item?.id || args?.item?.properties?.id;
    if (id === 'textMenuToggle') {
      setShowTextPanel((prev) => !prev);
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
      updateRecents('Untitled', 'Device');
      window.history.replaceState({}, document.title);
    } else if (state.action === 'open' && state.file instanceof File) {
      de.open(state.file);
      updateRecents(state.file.name.replace(/\.(docx?|txt|rtf)$/i, ''), 'Device');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  function updateRecents(name: string, source: 'Device' | 'Cloud' | 'Unknown') {
    try {
      const key = 'recentDocs';
      const raw = localStorage.getItem(key);
      const arr = raw ? (JSON.parse(raw) as any[]) : [];
      const id = `${name}`;
      const filtered = arr.filter((d) => d.id !== id && d.name !== name);
      filtered.unshift({ id, name, source, lastOpened: Date.now() });
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 20)));
    } catch {
      /* ignore */
    }
  }

  const execBold = () => editorRef.current?.documentEditor.editor.toggleBold();
  const execItalic = () => editorRef.current?.documentEditor.editor.toggleItalic();
  const execUnderline = () => editorRef.current?.documentEditor.editor.toggleUnderline();
  const alignLeft = () => editorRef.current?.documentEditor.editor.toggleTextAlignment('Left');
  const alignCenter = () => editorRef.current?.documentEditor.editor.toggleTextAlignment('Center');
  const alignRight = () => editorRef.current?.documentEditor.editor.toggleTextAlignment('Right');
  const alignJustify = () => editorRef.current?.documentEditor.editor.toggleTextAlignment('Justify');
  const bullets = () => editorRef.current?.documentEditor.editor.applyBullet('\u2022', 'Symbol');
  const numbering = () => editorRef.current?.documentEditor.editor.applyNumbering('%1.', 'Arabic');
  const strike = () => editorRef.current?.documentEditor.editor.toggleStrikethrough();
  const subscript = () => editorRef.current?.documentEditor.editor.toggleSubscript();
  const superscript = () => editorRef.current?.documentEditor.editor.toggleSuperscript();
  const indentInc = () => editorRef.current?.documentEditor.editor.increaseIndent();
  const indentDec = () => editorRef.current?.documentEditor.editor.decreaseIndent();
  const setFontFamily = (value: string) => {
    if (editorRef.current?.documentEditor.selection) {
      editorRef.current.documentEditor.selection.characterFormat.fontFamily = value;
    }
  };
  const setFontSize = (value: number) => {
    if (editorRef.current?.documentEditor.selection) {
      editorRef.current.documentEditor.selection.characterFormat.fontSize = value;
    }
  };
  const setFontColor = (value: string) => {
    if (editorRef.current?.documentEditor.selection) {
      editorRef.current.documentEditor.selection.characterFormat.fontColor = value;
    }
  };
  const setHighlight = (value: any) => {
    editorRef.current?.documentEditor.editor.toggleHighlightColor(value);
  };
  const applyStyle = (name: string) => {
    editorRef.current?.documentEditor.editor.applyStyle(name);
  };

  return (
    <div className="App document-editor-container" ref={containerRef}>
      {/* Main Syncfusion toolbar + editor */}
      <div className="main-toolbar">
      <DocumentEditorContainerComponent 
        ref={editorRef} 
        height={"calc(100vh - 56px)"}
        enableToolbar={true}
        created={onDocumentEditorCreated}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        showPropertiesPane={false}
        toolbarItems={[
          { id: 'textMenuToggle', text: 'Text', tooltipText: 'Text formatting', cssClass: 'e-tbar-btn-text' },
          'Separator',
          'New','Open','Undo','Redo','Image','Table','Hyperlink','Find','Bookmark'
        ]}
        toolbarClick={onToolbarClick}>
        <Inject services={[Toolbar]}></Inject>
      </DocumentEditorContainerComponent>
      </div>

      {/* Custom bottom toolbar that appears during editing and when toggled */}
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

      <button onClick={openModal} className="save-btn">
        <span className="save-btn__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" role="presentation">
            <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-2.828-2.828A2 2 0 0 0 16.172 3H5zm0 2h10v4h4v10H5V5zm2 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
          </svg>
        </span>
        <span className="save-btn__label">Save Document</span>
      </button>

      {isModalOpen && (
        <div className="modal-overlay" role="presentation" onClick={closeModal}>
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" role="presentation">
                <path d="M12 2a5 5 0 0 1 5 5v1h1a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v1h6V7a3 3 0 0 0-3-3z" />
              </svg>
            </div>
            <h2 id="save-dialog-title">Save your document</h2>
            <p className="modal-subtitle">Name your file so you can find it easily later.</p>
            <input
              className="modal-input"
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="e.g. Project-Brief"
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" type="button" onClick={closeModal}>
                Cancel
              </button>
              <button className="modal-btn save" type="button" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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
