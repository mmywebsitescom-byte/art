"use client";
import React from "react";

export default function CommunityPage() {
  const topArchitects = [
    { handle: "@0X_NULL", rank: "01", score: "42.5K", status: "ONLINE" },
    { handle: "@CYBER_PHANTOM", rank: "02", score: "38.1K", status: "OFFLINE" },
    { handle: "@GLITCH_ROOT", rank: "03", score: "31.9K", status: "ONLINE" },
    { handle: "@VECTOR_SOUL", rank: "04", score: "28.0K", status: "BUSY" },
    { handle: "@STATIC_SPACE", rank: "05", score: "21.2K", status: "ONLINE" },
  ];

  const recentCommits = [
    { id: "cm-8f92a", msg: "Added braille support to core engine", time: "2m ago" },
    { id: "cm-33b1e", msg: "Fixed memory leak in WebGL backend", time: "14m ago" },
    { id: "cm-77c8x", msg: "Update default charset weights", time: "1h ago" },
    { id: "cm-11z9p", msg: "Implement AI background segmentation", time: "3h ago" },
  ];

  return (
    <div className="app-layout animate-fade-in dot-grid" style={{overflowY: 'auto'}}>
      <div className="container" style={{padding: '60px 20px', width: '100%'}}>
        
        <h1 className="gallery-title text-cyan" style={{marginBottom: '40px'}}>GLOBAL_NETWORK</h1>

        <div className="community-grid">
          
          {/* Top Architects */}
          <div className="community-panel">
            <div className="panel-header text-cyan">TOP_ARCHITECTS</div>
            <div className="panel-body">
              {topArchitects.map(user => (
                <div key={user.handle} className="flex justify-between items-center" style={{padding: '16px 0', borderBottom: '1px solid var(--border)'}}>
                  <div className="flex items-center gap-4">
                    <span className="text-muted" style={{fontSize: '10px'}}>{user.rank}</span>
                    <span style={{fontWeight: 'bold', fontSize: '13px'}}>{user.handle}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-cyan" style={{fontSize: '11px'}}>{user.score}</span>
                    <span style={{width: '6px', height: '6px', borderRadius: '50%', background: user.status === 'ONLINE' ? 'var(--secondary-accent)' : user.status === 'BUSY' ? 'var(--danger)' : 'var(--text-muted)'}}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Status & Links */}
          <div className="flex-col gap-4">
            <div className="community-panel" style={{background: 'var(--primary)', color: '#000'}}>
              <div className="panel-header" style={{borderBottomColor: 'rgba(0,0,0,0.2)'}}>SYSTEM_STATUS</div>
              <div className="panel-body" style={{fontSize: '24px', fontWeight: 'bold'}}>
                OPERATIONAL
                <div style={{fontSize: '10px', marginTop: '10px', fontWeight: 'normal'}}>99.98% UPTIME | 142 NODES ACTIVE</div>
              </div>
            </div>

            <div className="community-panel" style={{flex: 1}}>
              <div className="panel-header text-cyan">CONNECT</div>
              <div className="panel-body flex-col gap-4">
                <button className="secondary w-full" style={{justifyContent: 'flex-start'}}>
                  <span style={{marginRight: '12px'}}>#</span> JOIN_DISCORD
                </button>
                <button className="secondary w-full" style={{justifyContent: 'flex-start'}}>
                  <span style={{marginRight: '12px'}}>&gt;</span> GITHUB_REPO
                </button>
                <button className="secondary w-full" style={{justifyContent: 'flex-start'}}>
                  <span style={{marginRight: '12px'}}>@</span> TWITTER_FEED
                </button>
              </div>
            </div>
          </div>

          {/* Recent Commits */}
          <div className="community-panel" style={{gridColumn: '1 / -1'}}>
            <div className="panel-header text-cyan">RECENT_ENGINE_COMMITS</div>
            <div className="panel-body flex-col gap-4">
              {recentCommits.map(commit => (
                <div key={commit.id} className="flex justify-between items-center" style={{background: 'rgba(255,255,255,0.03)', padding: '16px', border: '1px solid var(--border)'}}>
                  <div className="flex items-center gap-4">
                    <span className="text-muted" style={{fontFamily: 'var(--font-mono)'}}>[{commit.id}]</span>
                    <span style={{fontSize: '12px'}}>{commit.msg}</span>
                  </div>
                  <span className="text-muted" style={{fontSize: '10px'}}>{commit.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
