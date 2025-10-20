import React from 'react';
import './DocumentSkeleton.css';

/**
 * DocumentSkeleton component provides a loading skeleton for the document editor.
 * Displays placeholder content while the document is loading.
 */
const DocumentSkeleton: React.FC = () => {
  return (
    <div className="document-skeleton" role="status" aria-busy="true" aria-label="Loading document">
      {/* Toolbar skeleton */}
      <div className="skeleton-toolbar">
        <div className="skeleton-rect"></div>
        <div className="skeleton-rect"></div>
        <div className="skeleton-rect"></div>
        <div className="skeleton-rect"></div>
      </div>

      {/* Document content skeleton */}
      <div className="skeleton-content">
        {/* First paragraph */}
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-line--short"></div>
        
        {/* Second paragraph */}
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-line--short"></div>
        
        {/* Third paragraph */}
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-line--short"></div>
        
        {/* Fourth paragraph */}
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line skeleton-line--short"></div>
      </div>
    </div>
  );
};

export default DocumentSkeleton;
