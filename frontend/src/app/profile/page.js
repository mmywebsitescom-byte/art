"use client";
import { useState, useEffect } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`/api/auth/me`, {
        headers: { "x-auth-token": token }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUsername(data.username || "");
        setRole(data.role || "student");
        setBio(data.bio || "");
        setLocation(data.location || "");
      } else {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/auth/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ username, role, bio, location })
      });
      
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setIsEditing(false);
      } else {
        setError(data.msg || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  if (loading) return <div className="container flex justify-center items-center h-full"><div className="text-muted">LOADING_PROFILE_DATA...</div></div>;

  return (
    <div className="container flex justify-center items-center h-full animate-fade-in" style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
      <div className="glass" style={{ padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '600px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
          <h1 className="gallery-title" style={{ margin: 0, fontSize: '24px' }}>USER_PROFILE</h1>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="secondary" style={{ padding: '8px 16px' }}>
              EDIT_DATA
            </button>
          )}
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px' }}>[ERROR]: {error}</div>}

        {!isEditing ? (
          <div className="profile-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="info-group">
              <div className="text-muted text-sm" style={{ marginBottom: '4px' }}>USERNAME</div>
              <div style={{ fontSize: '18px', color: 'var(--primary)' }}>{profile.username}</div>
            </div>
            
            <div className="flex gap-4">
              <div className="info-group" style={{ flex: 1 }}>
                <div className="text-muted text-sm" style={{ marginBottom: '4px' }}>EMAIL</div>
                <div style={{ fontSize: '14px' }}>{profile.email}</div>
              </div>
              <div className="info-group" style={{ flex: 1 }}>
                <div className="text-muted text-sm" style={{ marginBottom: '4px' }}>ROLE</div>
                <div style={{ fontSize: '14px', textTransform: 'uppercase' }}>{profile.role}</div>
              </div>
            </div>

            <div className="info-group">
              <div className="text-muted text-sm" style={{ marginBottom: '4px' }}>LOCATION</div>
              <div style={{ fontSize: '14px' }}>{profile.location || 'UNKNOWN_SECTOR'}</div>
            </div>

            <div className="info-group">
              <div className="text-muted text-sm" style={{ marginBottom: '4px' }}>BIO_DATA</div>
              <div style={{ fontSize: '14px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', minHeight: '80px' }}>
                {profile.bio || 'NO_DATA_PROVIDED'}
              </div>
            </div>
            
            <div className="info-group" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div className="text-muted text-sm">SYSTEM_ENTRY: {new Date(profile.createdAt).toLocaleDateString()}</div>
              <div className="text-muted text-sm">SOURCE_NODE: {profile.source || 'DIRECT'}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="control-group">
              <label className="control-label">USERNAME</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            
            <div className="control-group">
              <label className="control-label">ROLE</label>
              <select value={role} onChange={e => setRole(e.target.value)} required style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px', width: '100%' }}>
                <option value="student" style={{ background: 'var(--bg-card)' }}>Student</option>
                <option value="professional" style={{ background: 'var(--bg-card)' }}>Professional</option>
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">LOCATION</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Neo-Tokyo, Sector 4" />
            </div>

            <div className="control-group">
              <label className="control-label">BIO_DATA</label>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Enter personal details..."
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '12px', width: '100%', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div className="flex gap-4" style={{ marginTop: '16px' }}>
              <button type="button" onClick={() => { setIsEditing(false); setError(null); }} className="secondary" style={{ flex: 1 }}>
                CANCEL
              </button>
              <button type="submit" className="primary shadow-glow" style={{ flex: 2 }}>
                SAVE_DATA
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
