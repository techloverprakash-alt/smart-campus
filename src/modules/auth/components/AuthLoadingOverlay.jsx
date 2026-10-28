import React, { useEffect, useState } from 'react';

/**
 * Reusable Cinematic Transparent Loading Overlay
 * Renders transparently directly over the blurred login screen.
 */
export default function AuthLoadingOverlay({
  visible,
  role = 'Student',
  statusText = 'Verifying institutional credentials...',
  successText = 'Access Granted. Entering Portal...',
}) {
  const [currentStatus, setCurrentStatus] = useState(statusText);

  useEffect(() => {
    if (visible) {
      setCurrentStatus(statusText);
      const timer = setTimeout(() => {
        setCurrentStatus(successText);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [visible, statusText, successText]);

  if (!visible) return null;

  const roleLabel = typeof role === 'string' ? role.toUpperCase() : 'INSTITUTIONAL';

  return (
    <div className="auth-loading-overlay" role="dialog" aria-modal="true" aria-label="Authenticating session">
      <div className="auth-loading-backdrop" />
      <div className="auth-loading-content">
        {/* Glowing Logo Crest with Dual Orbital Rings */}
        <div className="campus-morph-crest-box">
          <div className="campus-morph-orbital-ring outer" />
          <div className="campus-morph-orbital-ring inner" />
          <div className="campus-morph-crest">
            <img src="/info_logo.png" alt="Info Institute of Technology" />
          </div>
        </div>

        {/* Dynamic Role Badge */}
        <div className="campus-morph-badge">{roleLabel} AUTHENTICATION</div>

        {/* Portal Title & Subtitle */}
        <h2 className="campus-morph-title">NEXUS Portal</h2>
        <p className="campus-morph-sub">Info Institute of Technology</p>

        {/* High-Tech Glowing Progress Bar */}
        <div className="campus-morph-progress-track">
          <div className="campus-morph-progress-bar" />
        </div>

        {/* Live Status Text with Pulsing Dot */}
        <div className="campus-morph-status">
          <span className="campus-morph-dot" />
          <span className="campus-morph-status-text">{currentStatus}</span>
        </div>
      </div>
    </div>
  );
}

