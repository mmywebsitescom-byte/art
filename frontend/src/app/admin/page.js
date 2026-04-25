"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [pendingArtworks, setPendingArtworks] = useState([]);
  const [allArtworks, setAllArtworks] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchPending();
    fetchAllArtworks();
  }, []);

  const fetchPending = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/pending`, {
        headers: { "x-auth-token": token }
      });
      
      if (res.ok) {
        setIsAdmin(true);
        const data = await res.json();
        setPendingArtworks(data);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllArtworks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/admin/all`, {
        headers: { "x-auth-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setAllArtworks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setPendingArtworks(pendingArtworks.filter(art => art._id !== id));
        // Refresh all artworks to include the newly approved one
        fetchAllArtworks();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this artwork?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token }
      });

      if (res.ok) {
        setAllArtworks(allArtworks.filter(art => art._id !== id));
        setPendingArtworks(pendingArtworks.filter(art => art._id !== id));
      } else {
        alert("Failed to delete artwork.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  if (loading) return <div className="animate-pulse" style={{padding: '40px', textAlign: 'center', color: 'var(--primary)'}}>LOADING_ADMIN_MODULE...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen" style={{background: 'var(--bg-main)'}}>
        <div style={{padding: '100px 20px', textAlign: 'center', color: 'var(--error, #ff3366)'}}>
          <h1 style={{fontSize: '32px', marginBottom: '20px'}}>ACCESS DENIED</h1>
          <p>You do not have the required clearance to access this sector.</p>
          <Link href="/"><button className="primary mt-8">RETURN TO BASE</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-main)'}}>
      
      <main style={{padding: '40px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
          <h1 style={{fontSize: '32px', color: 'var(--primary)', letterSpacing: '2px'}}>ADMIN_DASHBOARD</h1>
          <div style={{display: 'flex', gap: '16px'}}>
            <button 
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '8px 16px', 
                background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'pending' ? 'var(--bg-main)' : 'var(--text)',
                border: '1px solid var(--primary)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              PENDING QUEUE ({pendingArtworks.length})
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 16px', 
                background: activeTab === 'all' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'all' ? 'var(--bg-main)' : 'var(--text)',
                border: '1px solid var(--primary)',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ALL POSTS ({allArtworks.length})
            </button>
          </div>
        </div>
        <p className="text-muted" style={{marginBottom: '40px'}}>
          {activeTab === 'pending' ? 'Review pending artworks before they are deployed to the public grid.' : 'Manage all published and rejected artworks.'}
        </p>
        
        {activeTab === 'pending' && (
          pendingArtworks.length === 0 ? (
            <div style={{padding: '60px', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-muted)'}}>
              Queue is empty. No pending artworks to review.
            </div>
          ) : (
            <div className="gallery-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {pendingArtworks.map(art => (
                <div key={art._id} className="gallery-card" style={{
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div className="card-preview" style={{
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#030303',
                    padding: art.imageData ? 0 : '16px',
                    color: 'var(--primary)',
                    fontSize: '8px',
                    whiteSpace: 'pre',
                    overflow: 'hidden'
                  }}>
                    {art.imageData ? (
                      <img src={art.imageData} alt="artwork" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                    ) : (
                      art.asciiData
                    )}
                  </div>
                  
                  <div className="card-info" style={{padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <div style={{fontSize: '14px', fontWeight: 'bold'}}>{art.title}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>By: @{art.user?.username || 'UNKNOWN'}</div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Date: {new Date(art.createdAt).toLocaleDateString()}</div>
                    
                    <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
                      <button 
                        onClick={() => handleStatusUpdate(art._id, 'approved')}
                        style={{flex: 1, padding: '8px', background: 'var(--primary)', color: 'var(--bg-main)', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}
                      >
                        APPROVE
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(art._id, 'rejected')}
                        style={{flex: 1, padding: '8px', background: 'transparent', color: '#ff3366', border: '1px solid #ff3366', cursor: 'pointer', fontWeight: 'bold'}}
                      >
                        REJECT
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'all' && (
          allArtworks.length === 0 ? (
            <div style={{padding: '60px', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-muted)'}}>
              No artworks exist in the database yet.
            </div>
          ) : (
            <div className="gallery-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {allArtworks.map(art => (
                <div key={art._id} className="gallery-card" style={{
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px', 
                    background: art.status === 'approved' ? 'var(--primary)' : art.status === 'rejected' ? '#ff3366' : '#ffaa00',
                    color: 'var(--bg-main)',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
                    {art.status ? art.status.toUpperCase() : 'LEGACY'}
                  </div>
                  <div className="card-preview" style={{
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#030303',
                    padding: art.imageData ? 0 : '16px',
                    color: 'var(--primary)',
                    fontSize: '8px',
                    whiteSpace: 'pre',
                    overflow: 'hidden'
                  }}>
                    {art.imageData ? (
                      <img src={art.imageData} alt="artwork" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                    ) : (
                      art.asciiData
                    )}
                  </div>
                  
                  <div className="card-info" style={{padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <div style={{fontSize: '14px', fontWeight: 'bold'}}>{art.title}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>By: @{art.user?.username || 'UNKNOWN'}</div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Date: {new Date(art.createdAt).toLocaleDateString()}</div>
                    
                    <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
                      <button 
                        onClick={() => handleDelete(art._id)}
                        style={{flex: 1, padding: '8px', background: 'transparent', color: '#ff3366', border: '1px solid #ff3366', cursor: 'pointer', fontWeight: 'bold'}}
                      >
                        DELETE POST
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
