import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { triggerImpact } from '../utils/haptics';
import './SaveDialog.css';

// Filename sanitization utility (same as in App.tsx)
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
  
  // For display purposes, don't add .docx extension here (it's shown separately)
  // Remove any existing extensions for clean display
  sanitized = sanitized.replace(/\.(docx?|txt|rtf)$/i, '');
  
  return sanitized;
};

interface SaveDialogProps {
  isOpen: boolean;
  defaultFilename: string;
  currentFolder?: { id: string; name?: string } | null;
  onSave: (filename: string) => void;
  onChangeFolder: () => void;
  onCancel: () => void;
  restoreFocusTo?: HTMLElement | null;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  defaultFilename,
  currentFolder,
  onSave,
  onChangeFolder,
  onCancel,
  restoreFocusTo
}) => {
  const [filename, setFilename] = useState(defaultFilename);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Update filename when defaultFilename changes
  useEffect(() => {
    setFilename(sanitizeFilename(defaultFilename));
  }, [defaultFilename]);

  // Auto-focus filename input and set up focus trap when dialog opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Query focusable elements within the dialog
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex="0"]'
      ].join(', ');
      
      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll(focusableSelectors)
      ) as HTMLElement[];
      
      focusableElementsRef.current = focusableElements;
      
      // Focus the filename input
      const input = document.getElementById('save-dialog-filename-input') as HTMLInputElement;
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
      
      // Add focus trap keydown handler
      const handleFocusTrap = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = focusableElementsRef.current;
          if (focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey) {
            // Shift+Tab: if on first element, go to last
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab: if on last element, go to first
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      const currentDialogRef = dialogRef.current;
      currentDialogRef.addEventListener('keydown', handleFocusTrap);
      
      // Cleanup function
      return () => {
        if (currentDialogRef) {
          currentDialogRef.removeEventListener('keydown', handleFocusTrap);
        }
      };
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      triggerImpact('Light');
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const sanitized = sanitizeFilename(filename);
      if (sanitized) {
        e.preventDefault();
        triggerImpact('Medium');
        onSave(sanitized);
        // Restore focus after save
        if (restoreFocusTo) {
          setTimeout(() => restoreFocusTo.focus(), 100);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      triggerImpact('Light');
      onCancel();
      // Restore focus after cancel
      if (restoreFocusTo) {
        setTimeout(() => restoreFocusTo.focus(), 100);
      }
    }
  };

  const handleSave = () => {
    const sanitized = sanitizeFilename(filename);
    if (sanitized) {
      triggerImpact('Medium');
      onSave(sanitized);
      // Restore focus after save
      if (restoreFocusTo) {
        setTimeout(() => restoreFocusTo.focus(), 100);
      }
    }
  };

  const handleCancel = () => {
    triggerImpact('Light');
    onCancel();
    // Restore focus after cancel
    if (restoreFocusTo) {
      setTimeout(() => restoreFocusTo.focus(), 100);
    }
  };

  const handleChangeFolder = () => {
    triggerImpact('Light');
    onChangeFolder();
  };

  if (!isOpen) return null;

  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="save-dialog-overlay" onClick={handleOverlayClick}>
      <div 
        ref={dialogRef}
        className="save-dialog-content" 
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-dialog-title"
        aria-describedby="save-dialog-info"
      >
        <h2 id="save-dialog-title" className="save-dialog-header">
          Save Document
        </h2>

        <div className="save-dialog-form-group">
          <label htmlFor="save-dialog-filename-input" className="save-dialog-label">
            File name
          </label>
          <div className="save-dialog-filename-wrapper">
            <input
              id="save-dialog-filename-input"
              type="text"
              className="save-dialog-input"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              inputMode="text"
              autoComplete="off"
            />
            <span className="save-dialog-extension">.docx</span>
          </div>
        </div>

        {isNative && (
          <div className="save-dialog-folder">
            <div className="save-dialog-folder-info">
              <span>📁</span>
              <span>
                {currentFolder?.name || 'No folder selected'}
              </span>
            </div>
            <button
              type="button"
              className="save-dialog-btn save-dialog-btn--folder"
              onClick={handleChangeFolder}
            >
              Change Folder
            </button>
          </div>
        )}

        <p id="save-dialog-info" className="save-dialog-info">
          {isNative
            ? 'Document will be saved to the selected folder'
            : 'Document will be downloaded to your default downloads folder'
          }
        </p>

        <div className="save-dialog-actions">
          <button
            type="button"
            className="save-dialog-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="save-dialog-btn save-dialog-btn--primary"
            onClick={handleSave}
            disabled={!sanitizeFilename(filename)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
