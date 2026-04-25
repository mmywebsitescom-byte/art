"use client";
import React, { useState, useMemo, useEffect } from "react";

export default function GalleryPage() {
  const initialMockArtworks = [
    { 
      id: "ART-01-OWL", title: "NIGHT_WATCHER", author: "@0X_NULL", likes: "1.2K", color: "var(--primary)", 
      tags: ["--AVIAN", "--V3-KERNEL", "--CHARACTERS"],
      ascii: `   ,___,\n   [O.o]\n   /)__)\n   -"--"-`
    },
    { 
      id: "ART-02-SWORD", title: "EXCALIBUR_PROTOCOL", author: "@CYBER_PHANTOM", likes: "842", color: "var(--secondary-accent)", 
      tags: ["--WEAPONRY", "--HI-RES", "--DENSITY"],
      ascii: `      /| ________________\nO|===|* >________________>\n      \\|`
    },
    { 
      id: "ART-03-SKULL", title: "MORTALITY_ENGINE", author: "@GLITCH_ROOT", likes: "2.4K", color: "var(--danger)", 
      tags: ["--ANATOMY", "--RAW-BUFFER", "--CHARACTERS"],
      ascii: `    ___\n  / ___ \\\n | /   \\ |\n | \\___/ |\n  \\_____/`
    },
    { 
      id: "ART-04-CITY", title: "NEON_DISTRICT", author: "@STATIC_SPACE", likes: "512", color: "var(--text-muted)", 
      tags: ["--LANDSCAPE", "--DENSITY"],
      ascii: ` |\\\n | \\  _\n |  \\| |\n |   | |\n_|___|_|_`
    },
    { 
      id: "ART-05-CAT", title: "FELINE_CONSTRUCT", author: "@VECTOR_SOUL", likes: "2.9K", color: "var(--primary)", 
      tags: ["--ANIMAL", "--SOLID-FILL", "--CHARACTERS"],
      ascii: `  /\\_/\\\n ( o.o )\n  > ^ <`
    },
    { 
      id: "ART-06-ROSE", title: "DATA_BLOOM", author: "@KERNEL_PANIC", likes: "1.1K", color: "var(--secondary-accent)", 
      tags: ["--BOTANICAL", "--GLITCH-ART", "--COLORING"],
      ascii: `  .-.\n (   )\n  \`-'\n   |\n   |`
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("RECENT");
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeFilter, setActiveFilter] = useState(null);
  const [artworks, setArtworks] = useState(initialMockArtworks);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAscii, setUploadAscii] = useState("");
  const [uploadImage, setUploadImage] = useState("");

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/all`);
      if (res.ok) {
        const data = await res.json();
        const dbArts = data.map(dbArt => ({
          id: dbArt._id.substring(0, 8).toUpperCase(),
          fullId: dbArt._id,
          title: dbArt.title,
          author: `@${dbArt.user?.username || 'UNKNOWN'}`,
          likes: "0",
          color: "var(--primary)",
          tags: ["--COMMUNITY", "--NEW"],
          ascii: dbArt.asciiData,
          imageData: dbArt.imageData
        }));
        setArtworks([...dbArts, ...initialMockArtworks]);
      }
    } catch (err) {
      console.error("Failed to fetch community artworks:", err);
    }
  };

  const convertAsciiToPng = (asciiStr, color) => {
    const lines = asciiStr.split('\n');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const fontSize = 12;
    const lineHeight = 14;
    
    let maxLength = 0;
    lines.forEach(line => {
      if (line.length > maxLength) maxLength = line.length;
    });
    
    canvas.width = Math.max(400, maxLength * 7.2 + 40); 
    canvas.height = Math.max(400, lines.length * lineHeight + 40);
    
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = color || '#00F0FF';
    ctx.textBaseline = 'top';
    
    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 20 + (i * lineHeight));
    });
    
    return canvas.toDataURL("image/png");
  };

  const handleDownload = (art) => {
    const dataUrl = art.imageData || convertAsciiToPng(art.ascii, art.color);
    const link = document.createElement("a");
    link.download = `${art.title.replace(/[^a-zA-Z0-9]/g, '_')}_artwork.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDirectUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to upload artwork to the gallery!");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ title: uploadTitle, asciiData: uploadAscii, imageData: uploadImage })
      });
      
      if (res.ok) {
        const newArt = await res.json();
        setIsUploadModalOpen(false);
        setUploadTitle("");
        setUploadAscii("");
        setUploadImage("");
        alert(`Artwork submitted for approval!\n\nTo view this directly in your terminal, run:\ncurl.exe -s ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${newArt._id}/raw`);
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to upload artwork.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while uploading.");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setUploadImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const filteredArtworks = useMemo(() => {
    let result = [...artworks];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(art => 
        art.title.toLowerCase().includes(q) || 
        art.author.toLowerCase().includes(q) ||
        art.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeFilter) {
      result = result.filter(art => art.tags.includes(activeFilter));
    }

    if (activeTab === "POPULAR") {
      result.sort((a, b) => b.likes.localeCompare(a.likes));
    } else if (activeTab === "TRENDING") {
      // Pseudo-random for trending
      result.sort((a, b) => a.title.length - b.title.length);
    }

    return result;
  }, [artworks, searchQuery, activeTab, activeFilter]);

  return (
    <div className="app-layout animate-fade-in">
      
      {/* Mock Sidebar to match the design's context */}
      <aside className="sidebar">
        <div className="section-title" style={{marginBottom: '20px'}}>
          <span style={{color: 'var(--primary)', fontSize: '11px', fontWeight: 'bold'}}>CONTROL_PANEL</span>
          <br/>
          <span style={{color: 'var(--text-muted)', fontSize: '9px', textTransform: 'lowercase'}}>v2.4.0-stable</span>
        </div>
        
        <div className="control-group" style={{gap: '16px', marginTop: '20px'}}>
          <div 
            onClick={() => setActiveFilter(null)}
            className="flex items-center gap-4" 
            style={{cursor: 'pointer', background: activeFilter === null ? 'rgba(255,255,255,0.05)' : 'transparent', padding: '8px', borderLeft: activeFilter === null ? '2px solid var(--primary)' : '2px solid transparent', color: activeFilter === null ? 'var(--text-main)' : 'var(--text-muted)', marginLeft: '-8px'}}
          >
            <span style={{width: '16px', textAlign: 'center'}}>▼</span> All Filters
          </div>
          <div 
            onClick={() => setActiveFilter(activeFilter === "--CHARACTERS" ? null : "--CHARACTERS")} 
            className={`flex items-center gap-4 ${activeFilter === "--CHARACTERS" ? '' : 'text-muted'}`} 
            style={{cursor: 'pointer', background: activeFilter === "--CHARACTERS" ? 'rgba(255,255,255,0.05)' : 'transparent', padding: '4px', borderLeft: activeFilter === "--CHARACTERS" ? '2px solid var(--primary)' : 'none'}}
          >
            <span style={{width: '16px', textAlign: 'center'}}>A</span> Characters
          </div>
          <div 
            onClick={() => setActiveFilter(activeFilter === "--DENSITY" ? null : "--DENSITY")} 
            className={`flex items-center gap-4 ${activeFilter === "--DENSITY" ? '' : 'text-muted'}`} 
            style={{cursor: 'pointer', background: activeFilter === "--DENSITY" ? 'rgba(255,255,255,0.05)' : 'transparent', padding: '4px', borderLeft: activeFilter === "--DENSITY" ? '2px solid var(--primary)' : 'none'}}
          >
            <span style={{width: '16px', textAlign: 'center'}}>#</span> Density
          </div>
          <div 
            onClick={() => setActiveFilter(activeFilter === "--COLORING" ? null : "--COLORING")} 
            className={`flex items-center gap-4 ${activeFilter === "--COLORING" ? '' : 'text-muted'}`} 
            style={{cursor: 'pointer', background: activeFilter === "--COLORING" ? 'rgba(255,255,255,0.05)' : 'transparent', padding: '4px', borderLeft: activeFilter === "--COLORING" ? '2px solid var(--primary)' : 'none'}}
          >
            <span style={{width: '16px', textAlign: 'center'}}>@</span> Coloring
          </div>
        </div>

        <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <a href="/studio"><button className="primary w-full">GENERATE_ASCII</button></a>
          <div className="flex items-center gap-4 text-muted" style={{cursor: 'pointer'}}>
            <span style={{width: '16px', textAlign: 'center'}}>📄</span> Docs
          </div>
          <div className="flex items-center gap-4 text-muted" style={{cursor: 'pointer'}}>
            <span style={{width: '16px', textAlign: 'center'}}>⎋</span> Logout
          </div>
        </div>
      </aside>

      <main className="main-content" style={{padding: '40px', overflowY: 'auto'}}>
        
        {/* Gallery Header */}
        <div className="gallery-header flex justify-between items-start">
          <div>
            <h1 className="gallery-title">COMMUNITY_GALLERY</h1>
            <p className="gallery-desc">Explore a curated collection of terminal-rendered architectural studies and procedural character compositions.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="search-bar">
              <span>⌕</span>
              <input 
                type="text" 
                placeholder="SEARCH_PROJECTS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{background: 'transparent', border: 'none', color: 'var(--text-main)', padding: 0, outline: 'none', width: '100%'}} 
              />
            </div>
            <div className="filter-tabs">
              {['RECENT', 'POPULAR', 'TRENDING'].map(tab => (
                <div 
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredArtworks.slice(0, visibleCount).map((art, idx) => (
            <div key={idx} className="gallery-card">
              <div className="card-header">
                <span>ID: {art.id}</span>
                <div className="flex gap-2 items-center">
                  <span onClick={() => {
                    if (art.fullId) {
                      prompt("Copy this command and run it in your terminal:", `curl.exe -s ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${art.fullId}/raw`);
                    } else {
                      alert("This is a local demo artwork and does not support CLI export.");
                    }
                  }} style={{cursor: 'pointer', color: '#ffaa00', fontSize: '12px', marginRight: '8px', fontWeight: 'bold'}} title="Copy CLI Command">[CLI]</span>
                  <span onClick={() => handleDownload(art)} style={{cursor: 'pointer', color: 'var(--primary)', fontSize: '14px', marginRight: '4px'}} title="Download to Device">⤓</span>
                  <span style={{letterSpacing: '2px'}}>● ●</span>
                </div>
              </div>
              <div className="card-preview" style={{color: art.color, padding: art.imageData ? 0 : undefined}}>
                {art.imageData ? (
                  <img src={art.imageData} alt="artwork" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                ) : (
                  art.ascii
                )}
              </div>
              <div className="card-info">
                <div className="card-title-row">
                  <span style={{fontWeight: 'bold'}}>{art.title}</span>
                  <span style={{color: 'var(--secondary-accent)'}}>♥ {art.likes}</span>
                </div>
                <div className="card-author">{art.author}</div>
                <div className="card-tags">
                  {art.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            NO_DATA_FOUND_FOR_QUERY
          </div>
        )}

        {/* Load More */}
        {visibleCount < filteredArtworks.length ? (
          <div className="load-more">
            <button onClick={() => setVisibleCount(v => v + 4)} className="secondary" style={{padding: '12px 30px'}}>LOAD_MORE_ASSETS ⌄</button>
          </div>
        ) : (
          <div className="load-more">
            <div style={{fontSize: '9px', color: 'var(--text-muted)'}}>EOF : END_OF_FILE_REACHED_V2.0</div>
          </div>
        )}

        {/* Floating Toolbar */}
        <div className="floating-toolbar">
          <div className="tool-btn">🔍</div>
          <div className="tool-btn">▦</div>
          <div className="tool-btn">⤓</div>
          <button className="add-btn" onClick={() => setIsUploadModalOpen(true)} style={{border: 'none', cursor: 'pointer'}}>+</button>
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '32px', borderRadius: '16px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: 'var(--primary)' }}>DIRECT_UPLOAD</h2>
                <button onClick={() => setIsUploadModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>
              
              <form onSubmit={handleDirectUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="control-group">
                  <label className="control-label">ARTWORK_TITLE</label>
                  <input type="text" required value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. CYBER_DRAGON" />
                </div>
                
                <div className="control-group">
                  <label className="control-label">ASCII_DATA (PASTE HERE)</label>
                  <textarea 
                    required 
                    value={uploadAscii} 
                    onChange={e => setUploadAscii(e.target.value)} 
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--primary)', padding: '16px', minHeight: '120px', fontFamily: 'var(--font-mono)', fontSize: '10px', whiteSpace: 'pre', overflowX: 'auto', resize: 'vertical' }}
                    placeholder="Paste your raw ASCII art text here..."
                  />
                </div>

                <div className="control-group">
                  <label className="control-label">COVER_IMAGE (OPTIONAL PNG/JPG)</label>
                  <input type="file" accept="image/*" onChange={handleImageSelect} style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                  {uploadImage && <div style={{marginTop: '8px', fontSize: '10px', color: 'var(--primary)'}}>Image loaded securely.</div>}
                </div>

                <div className="flex gap-4" style={{ marginTop: '16px' }}>
                  <button type="button" onClick={() => setIsUploadModalOpen(false)} className="secondary" style={{ flex: 1 }}>CANCEL</button>
                  <button type="submit" className="primary shadow-glow" style={{ flex: 2 }}>PUBLISH_TO_GALLERY</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
