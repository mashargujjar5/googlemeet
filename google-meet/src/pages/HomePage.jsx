import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Calendar, Clock, ChevronRight, Users, Link2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { meetingService } from '../services/meeting.service';

export default function HomePage() {
  const [meetCode, setMeetCode] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realMeetings, setRealMeetings] = useState([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if ((meetCode || '').trim()) {
      navigate(`/prejoin/${(meetCode || '').trim()}`);
    }
  };

  const handleNewMeeting = async (type) => {
    setShowNewMenu(false);
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (type === 'schedule') {
      alert('Opening Google Calendar... (integrate your Calendar API here)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await meetingService.createMeeting(`${user.fullname || user.username}'s Meeting`);
      
      if (response.data && response.data.meetingId) {
        const code = response.data.meetingId;
        if (type === 'instant') {
          navigate(`/prejoin/${code}`);
        } else {
          // For 'later', we could show a modal with the link
          // For now, let's just go to prejoin but maybe with a "link created" state
          navigate(`/prejoin/${code}`);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    try {
      const response = await meetingService.getMyMeetings();
      setRealMeetings(response.data.results || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const meetingsToShow = realMeetings.length > 0 ? realMeetings : [
    { title: 'Weekly Team Standup', createdAt: new Date().toISOString(), participantsCount: 8, meetingId: 'weekly-standup' },
    { title: 'Product Design Review', createdAt: new Date().toISOString(), participantsCount: 5, meetingId: 'design-review' },
  ];

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: '#202124' }}>
      {error && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 2000,
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px', padding: '12px 20px', color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: '12px', backdropBlur: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <AlertCircle size={20} />
          <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
        </div>
      )}

      <style>{`
        @media (max-width: 650px) {
          .hero-h1 { fontSize: 32px !important; }
          .hero-p { fontSize: 15px !important; }
          .action-buttons { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .join-input-container { min-width: 100% !important; }
          .upcoming-item { padding: 12px !important; }
        }
      `}</style>
      {/* Hero Section */}
      <div style={{
        maxWidth: '900px', margin: '0 auto', padding: '60px 24px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
      }}>
        <h1 className="hero-h1" style={{
          fontSize: '48px', fontWeight: '400', color: '#e8eaed',
          lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-1px'
        }}>
          Video calls and meetings for everyone
        </h1>
        <p className="hero-p" style={{ fontSize: '18px', color: '#9aa0a6', marginBottom: '40px', maxWidth: '560px' }}>
          Connect, collaborate, and celebrate from anywhere with Google Meet
        </p>

        {/* Action Buttons */}
        <div className="action-buttons" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          {/* New Meeting Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #00897b, #00b294)',
                color: 'white', fontSize: '15px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 12px rgba(0, 137, 123, 0.4)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Video size={20} />}
              <span>New meeting</span>
              <ChevronRight size={16} style={{ transform: showNewMenu ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {showNewMenu && (
              <div style={{
                position: 'absolute', top: '56px', left: 0, zIndex: 50,
                background: '#2d2e30', borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                overflow: 'hidden', minWidth: '240px',
                border: '1px solid #3c4043'
              }}>
                {[
                  { icon: <Link2 size={18} />, label: 'Create a meeting for later', type: 'later' },
                  { icon: <Plus size={18} />, label: 'Start an instant meeting', type: 'instant' },
                  { icon: <Calendar size={18} />, label: 'Schedule in Google Calendar', type: 'schedule' },
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => handleNewMeeting(item.type)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 20px', background: 'none', border: 'none',
                      color: '#e8eaed', cursor: 'pointer', fontSize: '14px',
                      transition: 'background 0.2s', textAlign: 'left'
                    }}
                  >
                    <span style={{ color: '#8ab4f8' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Join Input */}
          <div className="action-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="join-input-container" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#2d2e30', border: '1px solid #444746',
              borderRadius: '10px', padding: '0 16px', height: '48px',
              transition: 'border-color 0.2s', minWidth: '220px', flex: 1
            }}>
              <Users size={18} style={{ color: '#9aa0a6', flexShrink: 0 }} />
              <input
                type="text"
                value={meetCode}
                onChange={e => setMeetCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Enter a code or link"
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: '#e8eaed', fontSize: '15px', width: '100%'
                }}
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={!(meetCode || '').trim()}
              style={{
                padding: '12px 20px', borderRadius: '10px', border: 'none',
                background: (meetCode || '').trim() ? '#1a73e8' : 'transparent',
                color: (meetCode || '').trim() ? 'white' : '#9aa0a6',
                fontSize: '15px', fontWeight: '500', cursor: (meetCode || '').trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                boxShadow: (meetCode || '').trim() ? '0 2px 12px rgba(26,115,232,0.4)' : 'none'
              }}
            >
              Join
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', maxWidth: '700px', height: '1px', background: '#3c4043', marginBottom: '40px' }} />

        {/* Upcoming Meetings */}
        <div style={{ width: '100%', maxWidth: '700px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#9aa0a6', marginBottom: '16px', textAlign: 'left' }}>
            {user ? 'My Recent meetings' : 'Upcoming meetings'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {meetingsToShow.map((meeting, i) => (
              <div
                key={i}
                className="upcoming-item"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#2d2e30', borderRadius: '12px', padding: '16px 20px',
                  border: '1px solid #3c4043', transition: 'border-color 0.2s, background 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/prejoin/${meeting.meetingId}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Video size={20} color="white" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: '#e8eaed', fontWeight: '500', fontSize: '15px', margin: 0 }}>{meeting.title}</p>
                    <p style={{ color: '#9aa0a6', fontSize: '13px', marginTop: '2px', margin: 0 }}>
                      {new Date(meeting.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • {meeting.participantsCount || 0} participants
                    </p>
                  </div>
                </div>
                <button
                  style={{
                    padding: '8px 18px', borderRadius: '8px', border: '1px solid #1a73e8',
                    background: 'transparent', color: '#8ab4f8', fontSize: '14px',
                    fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
