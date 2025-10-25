import React from 'react';
import './OfflineBanner.css';

const OfflineBanner: React.FC = () => {
  return (
    <div className="offline-banner" role="alert" aria-live="polite">
      <span className="offline-banner-icon">📴</span>
      <span className="offline-banner-text">
        Offline mode • Limited features available
      </span>
    </div>
  );
};

export default OfflineBanner;
