import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Settings, ChevronDown, Users, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { meetingService } from '../services/meeting.service';
import { SOCKET_URL } from '../config';

export default function PreJoinPage() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [name, setName] = useState(user?.fullname || user?.username || '');
  const [bgEffect, setBgEffect] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef();
  const localStreamRef = useRef();

  useEffect(() => {
    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Apply initial states
        stream.getVideoTracks().forEach(track => track.enabled = camOn);
        stream.getAudioTracks().forEach(track => track.enabled = micOn);
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Could not access camera/microphone. Please check permissions.');
      }
    };

    startPreview();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped track: ${track.kind}`);
        });
        localStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Re-attach stream whenever camOn becomes true (and video element is mounted)
  useEffect(() => {
    if (camOn && videoRef.current && localStreamRef.current) {
      videoRef.current.srcObject = localStreamRef.current;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = camOn;
      });
    }
  }, [camOn]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = micOn;
      });
    }
  }, [micOn]);

  useEffect(() => {
    if (user && !name) {
      setName(user.fullname || user.username || '');
    }
  }, [user, name]);

  const backgrounds = [
    { id: 'none', label: 'No effect' },
    { id: 'blur', label: 'Blur background' },
    { id: 'office', label: 'Office' },
    { id: 'nature', label: 'Nature' },
  ];

  const handleJoin = async () => {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await meetingService.joinMeeting(meetingCode, name.trim());

      if (response.success || response.data) {
        const isHost = response.data?.host === user?._id || response.data?.host === user?.id;
        navigate(`/meeting/${meetingCode}`, { 
          state: { 
            userName: name.trim(), 
            micOn, 
            camOn, 
            isHost,
            status: response.data?.status || 'active' 
          } 
        });
      }
    } catch (err) {
      setError(err.message || 'Meeting not found or you cannot join');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#202124',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', paddingTop: '88px'
    }}>
      <div style={{
        display: 'flex', gap: '40px', alignItems: 'flex-start',
        maxWidth: '960px', width: '100%', flexWrap: 'wrap', justifyContent: 'center'
      }}>

        {/* Camera Preview */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '560px' }}>
          <div style={{
            position: 'relative', background: '#1e1e1e',
            borderRadius: '16px', overflow: 'hidden',
            aspectRatio: '16/9', marginBottom: '16px',
            border: '1px solid #3c4043'
          }}>
            {camOn ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)', // Mirror preview
                    background: '#1e1e1e'
                  }}
                />
                
                {bgEffect === 'blur' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(26,115,232,0.1)',
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Camera label */}
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                  background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
                  padding: '4px 10px', backdropFilter: 'blur(4px)',
                  zIndex: 2
                }}>
                  <span style={{ color: '#e8eaed', fontSize: '12px' }}>Camera preview</span>
                </div>
              </div>
            ) : (
              <div style={{
                width: '100%', height: '100%', background: '#1e1e1e',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '16px'
              }}>
                <div style={{ position: 'relative' }}>
                  {user?.avatar ? (
                    <img 
                      src={`${SOCKET_URL}/${user.avatar}`} 
                      alt={name}
                      style={{ 
                        width: '120px', height: '120px', borderRadius: '50%', 
                        objectFit: 'cover', border: '4px solid #3c4043',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
                    display: user?.avatar ? 'none' : 'flex', 
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '48px', fontWeight: '600', color: 'white',
                    boxShadow: '0 8px 32px rgba(26,115,232,0.4)',
                    border: '4px solid rgba(255,255,255,0.1)'
                  }}>
                    {name ? name[0].toUpperCase() : '?'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9aa0a6' }}>
                  <VideoOff size={18} />
                  <p style={{ margin: 0, fontSize: '14px' }}>Camera is off</p>
                </div>
              </div>
            )}

            {/* Mic/Cam quick toggles */}
            <div style={{
              position: 'absolute', bottom: '16px', left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: '12px'
            }}>
              <button
                onClick={() => setMicOn(!micOn)}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                  background: micOn ? 'rgba(60,64,67,0.9)' : 'rgba(234,67,53,0.9)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                  background: camOn ? 'rgba(60,64,67,0.9)' : 'rgba(234,67,53,0.9)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                {camOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>

          {/* Background Effects */}
          <div>
            <p style={{ color: '#9aa0a6', fontSize: '13px', marginBottom: '10px' }}>Background effects</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {backgrounds.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setBgEffect(bg.id)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px',
                    border: `2px solid ${bgEffect === bg.id ? '#1a73e8' : '#3c4043'}`,
                    background: bgEffect === bg.id ? '#1a4a8a' : '#2d2e30',
                    color: bgEffect === bg.id ? '#8ab4f8' : '#9aa0a6',
                    fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Join Panel */}
        <div style={{
          flex: '1', minWidth: '280px', maxWidth: '360px',
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          {error && (
            <div style={{
              padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444',
              fontSize: '13px'
            }}>
              <AlertCircle size={18} />
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          <div>
            <h1 style={{
              fontSize: '28px', fontWeight: '400', color: '#e8eaed',
              marginBottom: '8px'
            }}>
              Ready to join?
            </h1>
            <p style={{ color: '#9aa0a6', fontSize: '14px', lineHeight: '1.5' }}>
              Meeting code: <span style={{ color: '#8ab4f8', fontWeight: 'bold' }}>{meetingCode}</span>
            </p>
          </div>

          {/* Name Input */}
          <div>
            <label style={{ color: '#9aa0a6', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
              Your name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: '100%', padding: '12px 16px',
                background: '#2d2e30', border: '1px solid #444746',
                borderRadius: '10px', color: '#e8eaed',
                fontSize: '15px', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#1a73e8'}
              onBlur={e => e.target.style.borderColor = '#444746'}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleJoin}
              disabled={!(name || '').trim() || loading}
              style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: (name || '').trim() && !loading
                  ? 'linear-gradient(135deg, #1a73e8, #4285f4)'
                  : '#3c4043',
                color: (name || '').trim() && !loading ? 'white' : '#9aa0a6',
                fontSize: '15px', fontWeight: '500',
                cursor: (name || '').trim() && !loading ? 'pointer' : 'default',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Join now'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '14px', borderRadius: '12px',
                border: '1px solid #444746', background: 'transparent',
                color: '#9aa0a6', fontSize: '15px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
