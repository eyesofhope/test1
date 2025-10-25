import React from 'react';
import './OfflineWarning.css';

interface OfflineWarningProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineWarning: React.FC<OfflineWarningProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="offline-warning-overlay">
      <div className="offline-warning-content" role="dialog" aria-modal="true" aria-labelledby="offline-warning-title">
        <div className="offline-warning-icon">📴</div>
        <h2 id="offline-warning-title" className="offline-warning-title">Offline Mode</h2>
        <div className="offline-warning-message">
          <p>You're currently offline. Limited functionality is available:</p>
          <ul className="offline-warning-list">
            <li>✓ Open cached documents</li>
            <li>✓ Edit and save as DOCX</li>
            <li>✗ Open new DOCX/RTF/TXT files</li>
            <li>✗ Spell check & advanced paste</li>
          </ul>
        </div>
        <button className="offline-warning-btn" onClick={onClose} autoFocus>
          OK
        </button>
      </div>
    </div>
  );
};

export default OfflineWarning;
