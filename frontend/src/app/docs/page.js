"use client";
import React, { useState } from "react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("getting-started");

  return (
    <div className="app-layout animate-fade-in">
      <aside className="sidebar">
        <div className="section-title" style={{marginBottom: '20px'}}>
          <span style={{color: 'var(--primary)', fontSize: '11px', fontWeight: 'bold'}}>DOCS_INDEX</span>
        </div>
        <div className="docs-nav control-group" style={{gap: '8px', marginTop: '10px'}}>
          <div className={`doc-link ${activeTab === 'getting-started' ? 'active' : ''}`} onClick={() => setActiveTab('getting-started')}>GETTING_STARTED</div>
          <div className={`doc-link ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>CORE_ARCHITECTURE</div>
          <div className={`doc-link ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>API_REFERENCE</div>
          <div className={`doc-link ${activeTab === 'cli' ? 'active' : ''}`} onClick={() => setActiveTab('cli')}>CLI_TOOLKIT</div>
          <div className={`doc-link ${activeTab === 'filters' ? 'active' : ''}`} onClick={() => setActiveTab('filters')}>CUSTOM_FILTERS</div>
        </div>
      </aside>

      <main className="main-content" style={{padding: '60px', overflowY: 'auto'}}>
        <div className="docs-content-wrapper">
          {activeTab === 'getting-started' && (
            <div className="doc-section">
              <h1>GETTING_STARTED</h1>
              <p>Welcome to the ASCII_ARCHITECT documentation. Our engine transforms high-fidelity visual input into structural character matrices.</p>
              
              <h2 style={{marginTop: '40px', color: 'var(--primary)', fontSize: '18px'}}>INSTALLATION</h2>
              <p style={{marginTop: '10px'}}>You can integrate the core rendering engine directly into your Node.js projects.</p>
              <div className="code-block faux-terminal">
                <span>$ npm install @ascii-architect/core</span>
              </div>

              <h2 style={{marginTop: '40px', color: 'var(--primary)', fontSize: '18px'}}>QUICK_START</h2>
              <p style={{marginTop: '10px'}}>Initialize the engine with a target canvas context and a source image buffer.</p>
              <div className="code-block" style={{color: 'var(--secondary-accent)'}}>
{`import { Architect } from '@ascii-architect/core';

const engine = new Architect({
  density: 12,
  colorMode: 'monochrome',
  charset: '@#S%?*+;:,. '
});

engine.render(sourceBuffer, document.getElementById('target-canvas'));`}
              </div>
              
              <div style={{padding: '20px', borderLeft: '2px solid var(--primary)', background: 'rgba(0, 240, 255, 0.05)', marginTop: '40px'}}>
                <strong style={{color: 'var(--primary)'}}>NOTE:</strong> Ensure your source images are pre-processed or the engine is running on a WebGL-enabled device for optimal framerates.
              </div>
            </div>
          )}

          {activeTab !== 'getting-started' && (
            <div className="doc-section text-muted">
              <h1>{activeTab.toUpperCase().replace('-', '_')}</h1>
              <p style={{marginTop: '20px'}}>Documentation module [ {activeTab} ] is currently under construction in v2.4.0-stable.</p>
              <div className="code-block faux-terminal" style={{marginTop: '20px'}}>
                <span>ERR: ERR_MODULE_NOT_LOADED</span>
                <span>Please refer to the Github repository for bleeding-edge commits.</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
