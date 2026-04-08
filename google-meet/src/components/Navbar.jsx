import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid3X3, HelpCircle, Settings, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 24px', height: '64px',
      background: '#202124',
      borderBottom: '1px solid #3c4043'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
        <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
          <path d="M28 4H4C1.8 4 0 5.8 0 8v12c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4v-4.5l8 6V6.5l-8 6V8c0-2.2-1.8-4-4-4z" fill="#00832d"/>
          <path d="M28 4H4C1.8 4 0 5.8 0 8v12c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4v-4.5l-4-2.7V10l4-3.5V8c0-2.2-1.8-4-4-4z" fill="#00832d"/>
          <path d="M32 6.5V10l-4 2.8V15l4 2.5V21.5l8-6V6.5l-8 6z" fill="#00ac47"/>
          <path d="M0 20v-8l16 8L0 20z" fill="#006425" opacity="0.2"/>
        </svg>
        <span style={{ fontSize: '22px', fontWeight: '400', color: '#e8eaed', letterSpacing: '-0.5px' }}>
          Meet
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', borderRight: '1px solid #3c4043', paddingRight: '16px' }}>
          <span style={{ fontSize: '13px', color: '#9aa0a6' }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ color: '#444746', margin: '0 4px' }}>•</span>
          <span style={{ fontSize: '13px', color: '#9aa0a6' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <button style={{
          width: '40px', height: '40px', borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#e8eaed',
          transition: 'background 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#3c4043'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <HelpCircle size={20} />
        </button>

        <button style={{
          width: '40px', height: '40px', borderRadius: '50%', border: 'none',
          background: 'transparent', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#e8eaed',
          transition: 'background 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#3c4043'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Settings size={20} />
        </button>

        {!user ? (
          <div style={{ display: 'flex', gap: '12px', marginLeft: '8px' }}>
            <Link to="/login" style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid #3c4043',
              color: '#4285f4', fontSize: '14px', fontWeight: '500', textDecoration: 'none',
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(66, 133, 244, 0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Sign in
            </Link>
            <Link to="/register" style={{
              padding: '8px 20px', borderRadius: '8px', background: '#1a73e8',
              color: 'white', fontSize: '14px', fontWeight: '500', textDecoration: 'none',
              transition: 'background 0.2s shadow 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#1b66c9'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
            >
              Sign up
            </Link>
          </div>
        ) : (
          /* User Avatar */
          <div style={{ position: 'relative', marginLeft: '8px' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #3c4043',
                background: user.avatar ? `url(${user.avatar}) center/cover` : '#1a73e8',
                cursor: 'pointer', fontSize: '15px', fontWeight: '600',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {!user.avatar && (user.fullname?.charAt(0) || user.username?.charAt(0) || 'U')}
            </button>
            {showProfileMenu && (
              <div style={{
                position: 'absolute', top: '48px', right: 0,
                background: '#2d2e30', borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                minWidth: '240px', padding: '8px 0', zIndex: 100,
                border: '1px solid #3c4043'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #3c4043', textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 12px',
                    background: user.avatar ? `url(${user.avatar}) center/cover` : '#1a73e8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'
                  }}>
                    {!user.avatar && (user.fullname?.charAt(0) || user.username?.charAt(0) || 'U')}
                  </div>
                  <p style={{ color: '#e8eaed', fontWeight: '600', fontSize: '15px', margin: 0 }}>{user.fullname}</p>
                  <p style={{ color: '#9aa0a6', fontSize: '13px', margin: '4px 0 0' }}>{user.email}</p>
                </div>
                
                <div style={{ padding: '4px 0' }}>
                  <button 
                    onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                    style={{
                      width: '100%', padding: '10px 16px', background: 'none',
                      border: 'none', color: '#e8eaed', textAlign: 'left',
                      cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#3c4043'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={18} className="text-gray-400" />
                    My Profile
                  </button>
                  <button style={{
                    width: '100%', padding: '10px 16px', background: 'none',
                    border: 'none', color: '#e8eaed', textAlign: 'left',
                    cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#3c4043'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Shield size={18} className="text-gray-400" />
                    Privacy Settings
                  </button>
                  <div style={{ margin: '4px 0', borderTop: '1px solid #3c4043' }}></div>
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%', padding: '10px 16px', background: 'none',
                      border: 'none', color: '#f28b82', textAlign: 'left',
                      cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#3c4043'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
