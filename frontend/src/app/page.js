export default function LandingPage() {
  return (
    <div className="landing-container dot-grid animate-fade-in">
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="section-label"><span className="dot"></span> CORE_PHILOSOPHY</div>
          <h1 className="hero-title">
            CREATE <span className="text-cyan">ART</span> IN STUDIO <br/>
            RUN IN <span className="text-cyan">TERMINAL</span>.
          </h1>
          <p className="hero-subtitle">
            A dual-purpose engine. Users can generate high-fidelity ASCII masterpieces right in the browser, while developers can architect and pipe matrices straight from the command line.
          </p>
          <div className="hero-cta">
            <a href="/studio"><button className="primary">START ARCHITECTING &gt;</button></a>
            <button className="secondary">VIEW_GALLERY</button>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="features-section container">
        <div className="section-label"><span className="dot"></span> CAPABILITIES</div>
        <h2 className="section-heading">SYSTEM_FEATURES</h2>
        
        <div className="features-grid">
          <div className="feature-card border-card">
            <div className="card-icon">⚡</div>
            <h3>Real-time Processing</h3>
            <p>Our proprietary "Chartmatrix" engine processes 4K video frames into ASCII in under 16ms. Zero latency, total precision.</p>
            <div className="card-visual faux-terminal">
              <span>processing frame_001... [OK]</span>
              <span>mapping luminance... [OK]</span>
            </div>
          </div>
          
          <div className="feature-card border-card flex-col justify-between">
            <div>
              <div className="card-icon">🌍</div>
              <h3>Global Community</h3>
              <p>Share matrices with over 10k+ architects across 40 countries. Open-source character sets and collaborative filters.</p>
            </div>
            <div className="community-avatars">
              <div className="avatar cyan-border"></div>
              <div className="avatar"></div>
              <div className="avatar"></div>
            </div>
          </div>
          
          <div className="feature-card border-card">
            <div className="card-icon">🎛️</div>
            <h3>Character Precision</h3>
            <p>Select from over 500+ custom character sets. From classic 7-bit ASCII to modern UTF-8 block elements.</p>
            <div className="card-visual">
              <span className="text-cyan">█ ▓ ▒ ░</span>
            </div>
          </div>
          
          <div className="feature-card cyan-card">
            <div className="card-icon" style={{color: '#000'}}>💻</div>
            <h3 style={{color: '#000'}}>Native CLI Interface</h3>
            <p style={{color: '#111'}}>Pipe your outputs directly to any unix-based terminal. Architect your art where you live: the command line.</p>
            <div className="card-visual terminal-snippet">
              $ ascii-arch --image ./source.jpg --output matrix.txt
            </div>
          </div>
        </div>
      </section>

      {/* The Viewport */}
      <section className="viewport-section container">
        <div className="viewport-content">
          <h2 className="section-heading">THE_VIEWPORT</h2>
          <p className="hero-subtitle" style={{maxWidth: '400px'}}>
            Experience the power of our rendering engine. Tweak density, adjust contrast, and watch your image evolve into a structural masterpiece in real-time.
          </p>
          <ul className="feature-list">
            <li><span className="cyan-bullet"></span> Autoscaling character density</li>
            <li><span className="cyan-bullet"></span> High-dynamic range character mapping</li>
            <li><span className="cyan-bullet"></span> One-click SVG and Text export</li>
          </ul>
        </div>
        <div className="viewport-visual">
          <div className="mock-window">
            <div className="mock-header">
              <div className="flex gap-2">
                <span className="mock-dot"></span><span className="mock-dot"></span><span className="mock-dot"></span>
              </div>
              <div className="mock-title">ASCII_STUDIO | 800 x 600 px</div>
            </div>
            <div className="mock-body flex items-center justify-center">
              <div className="mock-ascii text-cyan" style={{whiteSpace: 'pre', fontSize: '14px', lineHeight: '14px'}}>
{`   /\\
  /  \\
 /____\\
/      \\`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2 className="cta-heading">READY TO START<br/>ARCHITECTING?</h2>
        <p className="cta-sub">Join the premier platform for terminal artists. Scale your vision character by character.</p>
        <a href="/register"><button className="primary" style={{marginTop: '30px', padding: '16px 30px'}}>CREATE_ACCOUNT</button></a>
      </section>

      <footer className="footer-bottom container">
        <div className="logo text-muted">ASCII_<span>ARCHITECT</span></div>
        <div className="footer-links">
          <span>NOTES</span>
          <span>STAR</span>
          <span>FORK</span>
        </div>
        <div className="text-muted text-sm">&copy; 2026 ASCII ARCHITECT STUDIO. ALL RIGHTS RESERVED.</div>
      </footer>
    </div>
  );
}
