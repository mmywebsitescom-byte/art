"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Terminal, Image as ImageIcon, BookOpen, Users, Home, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      if (token) {
        fetch(`/api/auth/me`, {
          headers: { 'x-auth-token': token }
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.isAdmin) setIsAdmin(true);
        })
        .catch(err => console.error(err));
      }
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const links = [
    { name: "HOME", path: "/", icon: Home },
    { name: "STUDIO", path: "/studio", icon: Terminal },
    { name: "GALLERY", path: "/gallery", icon: ImageIcon },
    { name: "DOCUMENTATION", path: "/docs", icon: BookOpen },
    { name: "COMMUNITY", path: "/community", icon: Users }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="flex-1 flex items-center">
        <Link href="/" className="logo">
          ASCII_<span>ART</span>
        </Link>
      </div>
      
      {/* Desktop Links */}
      <div className="nav-links desktop-only flex gap-8 justify-center items-center flex-shrink-0">
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`nav-item flex items-center gap-2 ${isActive ? 'active' : ''}`}
              >
                {isActive && <span className="active-indicator">&gt;</span>}
                <link.icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
      </div>
      <div className="flex-1 flex gap-6 items-center justify-end">
        <div className="system-status">
          <span className="status-dot"></span>
          SYS.ONLINE
        </div>
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-bold hover:text-white" style={{color: 'var(--primary)', letterSpacing: '1px'}}>
                  [ADMIN]
                </Link>
              )}
              <Link href="/profile" className="icon-btn hover-glow" title="User Profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
              <button onClick={handleLogout} className="secondary shadow-glow" style={{padding: '8px 16px', borderColor: 'var(--danger)', color: 'var(--danger)'}}>
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="icon-btn hover-glow" title="Login">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
              <Link href="/register">
                <button className="primary shadow-glow">
                  SIGN_UP
                </button>
              </Link>
            </>
          )}
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{background: 'transparent', border: 'none', color: 'var(--primary)', padding: '4px'}}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`nav-item flex items-center gap-2 ${isActive ? 'active' : ''}`}
                style={{padding: '16px', borderBottom: '1px solid var(--border)', width: '100%'}}
              >
                {isActive && <span className="active-indicator">&gt;</span>}
                <link.icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
