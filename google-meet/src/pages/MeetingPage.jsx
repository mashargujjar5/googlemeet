import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Mic, MicOff, Video, VideoOff,
  Monitor, Users, MessageSquare, PhoneOff,
  Shield, Hand, LayoutGrid, Send, X, Copy, Check, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SOCKET_URL } from '../config';
import joinSound from '../assets/sounds/notification.mp3';

/* ─── helpers ─────────────────────────────────────────── */
const getInitials = (name = 'Guest') =>
  name.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase() || '??';

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 65%, 50%)`;

const fmtTime = (s) => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/* ─── JoinRequestModal ────────────────────────────────── */
function JoinRequestModal({ requests, onAccept, onReject }) {
  if (!requests.length) return null;
  const req = requests[0]; // Show one at a time

  return (
    <div style={{
      position: 'absolute', top: 84, left: 24, zIndex: 1000,
      background: 'rgba(45, 46, 48, 0.95)', borderRadius: '16px', padding: '20px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
      width: '320px', display: 'flex', flexDirection: 'column', gap: '16px',
      backdropFilter: 'blur(12px)',
      animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', 
          background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontWeight: '600', color: 'white', fontSize: '15px',
          boxShadow: '0 4px 12px rgba(26,115,232,0.3)'
        }}>{getInitials(req.name)}</div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#e8eaed', fontSize: '15px', margin: 0, fontWeight: 500 }}>{req.name}</p>
          <p style={{ color: '#9aa0a6', fontSize: '12px', margin: 0, marginTop: 2 }}>wants to join this call</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onReject(req.socketId)}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #5f6368',
            background: 'transparent', color: '#e8eaed', cursor: 'pointer', 
            fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >Deny</button>
        <button
          onClick={() => onAccept(req.socketId)}
          style={{
            flex: 2, padding: '10px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #1a73e8, #4285f4)', color: 'white', cursor: 'pointer', 
            fontSize: '13px', fontWeight: 600, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(26,115,232,0.4)',
            position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(26,115,232,0.6)'; }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(26,115,232,0.4)'; }}
        >Admit</button>
      </div>
    </div>
  );
}

/* ─── SettingsModal ──────────────────────────────────── */
function SettingsModal({ isOpen, onClose, audioOutputs, selectedOutput, onSelectOutput }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#2d2e30', borderRadius: '24px', width: '90%', maxWidth: '400px',
        padding: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', border: '1px solid #3c4043'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#e8eaed', fontSize: '20px', margin: 0 }}>Audio Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9aa0a6', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#9aa0a6', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Speakers / Headphones</label>
          <select
            value={selectedOutput}
            onChange={(e) => onSelectOutput(e.target.value)}
            style={{
              width: '100%', padding: '12px', background: '#3c4043', border: '1px solid #5f6368',
              borderRadius: '8px', color: '#e8eaed', outline: 'none'
            }}
          >
            {audioOutputs.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Speaker ${device.deviceId.slice(0,5)}`}</option>
            ))}
          </select>
          <p style={{ color: '#5f6368', fontSize: '11px', marginTop: '6px' }}>* Browser support for output switching may vary.</p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '12px', background: '#1a73e8', color: 'white',
            borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 500
          }}
        >Done</button>
      </div>
    </div>
  );
}

/* ─── ParticipantTile (separate component so hooks are stable) ─── */
function ParticipantTile({ participant, localStream, streamsRef, selectedOutput }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (participant.videoOff) return;

    const attach = () => {
      if (!videoRef.current) return;
      if (participant.isMe) {
        if (localStream) videoRef.current.srcObject = localStream;
      } else {
        const stream = streamsRef.current[participant.socketId];
        if (stream) {
          videoRef.current.srcObject = stream;
          // Apply audio output if supported
          if (videoRef.current.setSinkId && selectedOutput) {
            videoRef.current.setSinkId(selectedOutput).catch(e => console.error("Error setting sinkId for remote track:", e));
          }
        }
      }
    };

    const t = setTimeout(attach, 80);
    return () => clearTimeout(t);
  }, [participant.isMe, participant.socketId, participant.videoOff, localStream, selectedOutput]);

  return (
    <div style={{
      position: 'relative', background: '#1a1a1c',
      borderRadius: '14px', overflow: 'hidden', aspectRatio: '16/9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: participant.speaking ? '2px solid #00c752' : '2px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)', transition: 'border-color 0.3s'
    }}>
      {/* Avatar / off state */}
      {participant.videoOff && (
        <div style={{
          position: 'absolute', inset: 0, background: '#202124',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {participant.avatar ? (
            <img
              src={`${SOCKET_URL}/${participant.avatar}`}
              alt={participant.name}
              style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #3c4043' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: participant.color || '#4285f4',
            display: participant.avatar ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: '700', color: 'white',
            border: '3px solid rgba(255,255,255,0.15)',
            boxShadow: `0 0 0 6px ${(participant.color || '#4285f4')}33`
          }}>
            {participant.initials}
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.isMe}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: participant.isMe ? 'scaleX(-1)' : 'none',
          display: participant.videoOff ? 'none' : 'block',
          background: '#1a1a1c'
        }}
      />

      {/* Name bar */}
      <div style={{
        position: 'absolute', bottom: 8, left: 8, right: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '70%' }}>
          <span style={{
            background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: '12px',
            padding: '3px 10px', borderRadius: '6px', backdropFilter: 'blur(6px)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {participant.name}{participant.isMe ? ' (You)' : ''}
          </span>
          {participant.isMe && !participant.muted && participant.volume !== undefined && (
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: participant.volume > 0.05 ? '#00c752' : 'rgba(255,255,255,0.2)',
              boxShadow: participant.volume > 0.05 ? '0 0 10px #00c752' : 'none',
              transition: 'all 0.1s'
            }} title="Mic active" />
          )}
        </div>
        {participant.muted && (
          <div style={{
            background: 'rgba(234,67,53,0.9)', borderRadius: '6px',
            padding: '3px 6px', display: 'flex'
          }}>
            <MicOff size={12} color="white" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ControlBtn ──────────────────────────────────────── */
function ControlBtn({ icon, onClick, active, activeColor = '#3c4043', inactiveColor = '#3c4043', tooltip, badge }) {
  const [hover, setHover] = useState(false);
  const bg = active ? activeColor : inactiveColor;

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: bg, color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', transform: hover ? 'scale(1.08)' : 'scale(1)',
          boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.4)' : 'none'
        }}
      >
        {icon}
      </button>
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          background: '#8ab4f8', color: '#202124', fontSize: '10px',
          fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px',
          border: '2px solid #202124', minWidth: 18, textAlign: 'center'
        }}>{badge}</span>
      )}
      {hover && tooltip && (
        <div style={{
          position: 'absolute', bottom: 62, left: '50%', transform: 'translateX(-50%)',
          background: '#3c4043', color: '#e8eaed', padding: '6px 12px',
          borderRadius: '8px', fontSize: '12px', whiteSpace: 'nowrap',
          zIndex: 100, pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>{tooltip}</div>
      )}
    </div>
  );
}

/* ─── Main MeetingPage ────────────────────────────────── */
export default function MeetingPage() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialData = location.state || {};

  // ✅ Declare userName FIRST before any usage
  const userName = initialData.userName || user?.fullname || user?.username || 'Guest';

  const [micOn, setMicOn] = useState(initialData.micOn ?? true);
  const [camOn, setCamOn] = useState(initialData.camOn ?? true);
  const [panel, setPanel] = useState(null);
  const [handRaised, setHandRaised] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([
    // Show local "me" tile immediately (before socket confirms)
    {
      socketId: 'local-me',
      isMe: true,
      name: userName,
      avatar: user?.avatar || '',
      videoOff: !(initialData.camOn ?? true),
      muted: !(initialData.micOn ?? true),
      initials: getInitials(userName),
      color: '#4285f4'
    }
  ]);
  const [unread, setUnread] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [copied, setCopied] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [localVolume, setLocalVolume] = useState(0);

  // New states for screen share and private chat
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [chatTarget, setChatTarget] = useState('all');

  // New Admission states
  const [joinStatus, setJoinStatus] = useState(initialData.isHost ? 'joined' : 'initial');
  const [isHost, setIsHost] = useState(initialData.isHost || false);
  const [joinRequests, setJoinRequests] = useState([]);

  // Audio Output states
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [selectedOutput, setSelectedOutput] = useState('default');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef({});
  const streamsRef = useRef({});
  const chatEndRef = useRef(null);
  const panelRef = useRef(panel);
  const notificationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    try {
      notificationRef.current = new Audio(joinSound);
      notificationRef.current.load();
    } catch (err) {
      console.warn("Failed to initialize notification sound:", err);
    }
  }, []);
  panelRef.current = panel;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Create peer connection ──────────────────────────
  const createPeerConnection = useCallback((targetSocketId, isInitiator) => {
    if (peersRef.current[targetSocketId]) return peersRef.current[targetSocketId];

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peersRef.current[targetSocketId] = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    // ICE
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          candidate: e.candidate, targetSocketId, meetingId: meetingCode
        });
      }
    };

    // Remote track received
    pc.ontrack = (e) => {
      streamsRef.current[targetSocketId] = e.streams[0];
      setParticipants(prev => [...prev]); // trigger re-render to attach video
    };

    // Initiator creates offer
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          if (pc.signalingState !== 'stable') return;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current?.emit('offer', { offer, targetSocketId, meetingId: meetingCode });
        } catch (err) {
          console.error('Offer error:', err);
        }
      };
    }

    return pc;
  }, [meetingCode]);

  // ── Main effect ─────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') }
    });

    const socket = socketRef.current;

    // ── Get local media (with retry for "Device in use") ──
    const tryGetMedia = async (attempts = 3, delayMs = 600) => {
      const constraints = {
        video: { width: 1280, height: 720, frameRate: 24 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      };
      
      for (let i = 0; i < attempts; i++) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          return stream;
        } catch (err) {
          console.warn(`Media attempt ${i + 1} failed:`, err.name);
          if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
        }
      }
      // Try audio only as fallback
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ 
          video: false, 
          audio: constraints.audio 
        });
        return audioOnly;
      } catch (_) {
        return null;
      }
    };

    const startVolumeDetection = (stream) => {
      try {
        if (!stream || !stream.getAudioTracks().length) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setLocalVolume(avg / 128); // normalize 0-1
          requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (err) {
        console.warn("Volume detection failed:", err);
      }
    };

    const startStream = async () => {
      const stream = await tryGetMedia();
      const hasCam = !!(initialData.camOn ?? true);
      const hasMic = !!(initialData.micOn ?? true);

      if (stream) {
        localStreamRef.current = stream;
        const vTrack = stream.getVideoTracks()[0];
        const aTrack = stream.getAudioTracks()[0];
        if (vTrack) vTrack.enabled = hasCam;
        if (aTrack) aTrack.enabled = hasMic;
        setLocalStream(stream);

        if (aTrack) startVolumeDetection(stream);

        setParticipants(prev => prev.map(p =>
          p.isMe ? { ...p, videoOff: !hasCam || !vTrack } : p
        ));
      } else {
        setParticipants(prev => prev.map(p =>
          p.isMe ? { ...p, videoOff: true, muted: true } : p
        ));
      }

      // Check audio output devices
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioOutputs(devices.filter(d => d.kind === 'audiooutput'));
      }

      // ── Join or Request ──
      if (initialData.isHost) {
        socket.emit('join-room', {
          meetingId: meetingCode,
          name: userName,
          userId: user?._id || user?.id,
          avatar: user?.avatar || '',
          isHost: true,
          isCameraOff: !hasCam || !stream?.getVideoTracks().length,
          isMuted: !hasMic
        });
      } else {
        setJoinStatus('requesting');
        socket.emit('request-join', {
          meetingId: meetingCode,
          name: userName,
          userId: user?._id || user?.id,
          avatar: user?.avatar || ''
        });
      }
    };

    startStream();

    // ── Admission Listeners ──
    socket.on('waiting-for-host', () => setJoinStatus('waiting'));
    socket.on('join-approved', () => {
      setJoinStatus('joined');
      const hasCam = !!(initialData.camOn ?? true);
      const hasMic = !!(initialData.micOn ?? true);
      socket.emit('join-room', {
        meetingId: meetingCode,
        name: userName,
        userId: user?._id || user?.id,
        avatar: user?.avatar || '',
        isHost: false,
        isCameraOff: !hasCam || !localStreamRef.current?.getVideoTracks().length,
        isMuted: !hasMic
      });
    });
    socket.on('join-denied', ({ message }) => {
      setJoinStatus('denied');
      setSocketError(message);
    });

    socket.on('incoming-join-request', (req) => {
      setJoinRequests(prev => [...prev, req]);
      // Play sound notification for host
      if (notificationRef.current) {
        notificationRef.current.play().catch(() => {});
      }
    });

    socket.on('pending-requests-sync', ({ requests }) => {
      setJoinRequests(requests);
    });

    socket.on('participant-cancelled-request', ({ socketId }) => {
      setJoinRequests(prev => prev.filter(r => r.socketId !== socketId));
    });

    // ── Room joined (existing participants) ──
    socket.on('room-joined', ({ participants: existing = [], chatHistory = [], participantId, isHost: actualHost }) => {
      if (actualHost) setIsHost(true);
      // Build full participant list, marking isMe by socket id
      const mapped = existing.map(p => ({
        ...p,
        socketId: p.socketId,
        isMe: p.isMe || p.socketId === participantId,
        videoOff: (p.isMe || p.socketId === participantId)
          ? !(initialData.camOn ?? true)
          : !!p.isCameraOff,
        muted: (p.isMe || p.socketId === participantId)
          ? !(initialData.micOn ?? true)
          : !!p.isMuted,
        initials: getInitials(p.name),
        color: (p.isMe || p.socketId === participantId) ? '#4285f4' : randomColor()
      }));

      // Replace placeholder with real socket-confirmed state
      setParticipants(mapped.length > 0 ? mapped : prev => prev);
      setMessages(chatHistory || []);

      // Initiate WebRTC with everyone already in the room
      existing.forEach(p => {
        if (!p.isMe && p.socketId && p.socketId !== participantId) {
          createPeerConnection(p.socketId, true);
        }
      });
    });

    // ── Backend error handling ──
    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      setSocketError(message);
    });

    // ── New participant joined ──
    socket.on('participant-joined', (participant) => {
      if (!participant) return;
      setParticipants(prev => {
        if (prev.find(x => x.socketId === participant.socketId)) return prev;
        return [...prev, {
          ...participant,
          videoOff: !!participant.isCameraOff,
          muted: !!participant.isMuted,
          initials: getInitials(participant.name),
          color: randomColor()
        }];
      });
      createPeerConnection(participant.socketId, false);
    });

    // ── Participant left ──
    socket.on('participant-left', ({ socketId }) => {
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
      delete streamsRef.current[socketId];
    });

    // ── WebRTC signaling ──
    socket.on('offer', async ({ offer, fromSocketId }) => {
      try {
        const pc = createPeerConnection(fromSocketId, false);
        // If we're already handling something, we might want to ignore or rollback
        // For simple stability, we only process if stable or already handling an offer
        if (pc.signalingState !== "stable" && pc.signalingState !== "have-remote-offer") {
          // If we have a local offer (collision), we could rollback, but for now just log and ignore
          // The newcomer will usually be the one whose offer is processed
          console.warn(`[WebRTC] Collision detected: received offer from ${fromSocketId} while in state ${pc.signalingState}`);
          return;
        }
        
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { answer, targetSocketId: fromSocketId, meetingId: meetingCode });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on('answer', async ({ answer, fromSocketId }) => {
      try {
        const pc = peersRef.current[fromSocketId];
        if (pc && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } else if (pc) {
          console.warn(`[WebRTC] Ignoring answer from ${fromSocketId} due to state: ${pc.signalingState}`);
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    socket.on('ice-candidate', ({ candidate, fromSocketId }) => {
      try {
        const pc = peersRef.current[fromSocketId];
        if (pc && candidate && pc.remoteDescription) {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
      } catch (err) {
        console.error('Error handling ice-candidate:', err);
      }
    });

    // ── Chat ──
    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (panelRef.current !== 'chat') setUnread(u => u + 1);
    });

    // ── Media toggles from others ──
    socket.on('participant-muted', ({ socketId, isMuted }) => {
      setParticipants(prev => prev.map(p =>
        p.socketId === socketId ? { ...p, muted: isMuted } : p
      ));
    });

    socket.on('participant-camera-toggled', ({ socketId, isCameraOff }) => {
      setParticipants(prev => prev.map(p =>
        p.socketId === socketId ? { ...p, videoOff: isCameraOff } : p
      ));
    });

    socket.on('meeting-ended', () => navigate('/post', { state: { meetingCode, duration } }));

    return () => {
      clearInterval(timer);
      socket.disconnect();
      
      // KILL ALL TRACKS (Camera, Mic, Screen)
      const stopAllTracks = (stream) => {
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(t => {
            t.stop();
            console.log(`Explicitly stopped track: ${t.kind}`);
          });
        }
      };

      stopAllTracks(localStreamRef.current);
      stopAllTracks(screenStreamRef.current); // Ensure screen share stops too
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      analyserRef.current = null;
      
      // Clear video sources
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        v.srcObject = null;
        v.load();
      });

    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingCode]); // Remove screenStream from deps to avoid reconnects

  // ── Controls ────────────────────────────────────────
  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    const aTrack = localStreamRef.current?.getAudioTracks()[0];
    if (aTrack) aTrack.enabled = next;
    setParticipants(prev => prev.map(p => p.isMe ? { ...p, muted: !next } : p));
    socketRef.current?.emit('toggle-mute', { meetingId: meetingCode, isMuted: !next });
  };

  const toggleCam = () => {
    const next = !camOn;
    setCamOn(next);
    const vTrack = localStreamRef.current?.getVideoTracks()[0];
    if (vTrack) vTrack.enabled = next;
    setParticipants(prev => prev.map(p => p.isMe ? { ...p, videoOff: !next } : p));
    socketRef.current?.emit('toggle-camera', { meetingId: meetingCode, isCameraOff: !next });
    // Re-set stream on video element when turning back on
    if (next) setLocalStream(s => s); // trigger re-render
  };

  const sendMessage = () => {
    if (!(newMessage || '').trim()) return;
    socketRef.current?.emit('send-message', {
      meetingId: meetingCode,
      message: newMessage.trim(),
      senderName: userName,
      senderId: user?._id || user?.id,
      receiverSocketId: chatTarget === 'all' ? null : chatTarget
    });
    setNewMessage('');
  };

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
    }
    screenStreamRef.current = null;
    setScreenStream(null);
    setIsScreenSharing(false);

    // Revert to camera track
    const camVideoTrack = localStreamRef.current?.getVideoTracks()[0];
    Object.values(peersRef.current).forEach(pc => {
      if (pc.signalingState === 'closed') return;
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender && camVideoTrack) {
        sender.replaceTrack(camVideoTrack).catch(err => {
          if (pc.signalingState !== 'closed') {
            console.error("Error reverting track:", err);
          }
        });
      }
    });

    // Update local tile to show camera again
    if (!camOn) {
      setParticipants(prev => prev.map(p => p.isMe ? { ...p, videoOff: true } : p));
    }
    setLocalStream(localStreamRef.current);
  }, [screenStream, camOn]);

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = stream;
      setScreenStream(stream);
      setIsScreenSharing(true);

      const screenVideoTrack = stream.getVideoTracks()[0];

      // Stop sharing when the browser default "Stop sharing" button is clicked
      screenVideoTrack.onended = () => {
        stopScreenShare();
      };

      // Replace video track for all existing peers
      Object.values(peersRef.current).forEach(pc => {
        if (pc.signalingState === 'closed') return;
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && screenVideoTrack) {
          sender.replaceTrack(screenVideoTrack).catch(err => {
            if (pc.signalingState !== 'closed') {
              console.error("Error replacing track:", err);
            }
          });
        }
      });

      // Update local tile visibility and stream
      setParticipants(prev => prev.map(p => p.isMe ? { ...p, videoOff: false } : p));
      setLocalStream(stream); // Temporary override of the local tile video stream
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        console.warn('Screen sharing permission denied by user');
      } else {
        console.error('Error sharing screen:', err);
      }
      setIsScreenSharing(false);
      setScreenStream(null);
    }
  };

  const handleLeave = () => {
    // Explicitly call cleanup logic if navigate doesn't trigger it fast enough
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    
    // If we were waiting for host, cancel request
    if (joinStatus === 'waiting' || joinStatus === 'requesting') {
      socketRef.current?.emit('cancel-join-request', { meetingId: meetingCode });
    }
    
    navigate('/post', { state: { meetingCode, duration } });
  };

  const togglePanel = (p) => {
    setPanel(prev => prev === p ? null : p);
    if (p === 'chat') setUnread(0);
  };

  const handleAcceptRequest = (socketId) => {
    socketRef.current?.emit('accept-join-request', { meetingId: meetingCode, socketId });
    setJoinRequests(prev => prev.filter(r => r.socketId !== socketId));
  };

  const handleRejectRequest = (socketId) => {
    socketRef.current?.emit('reject-join-request', { meetingId: meetingCode, socketId });
    setJoinRequests(prev => prev.filter(r => r.socketId !== socketId));
  };

  const handleSelectOutput = async (deviceId) => {
    setSelectedOutput(deviceId);
    const videos = document.querySelectorAll('video');
    for (const video of videos) {
      if (video.setSinkId) {
        try {
          await video.setSinkId(deviceId);
        } catch (err) {
          console.error("Error setting sink ID:", err);
        }
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(meetingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Grid layout ─────────────────────────────────────
  const count = participants.length || 1;
  const gridCols = count === 1 ? '1fr'
    : count <= 2 ? 'repeat(2, 1fr)'
    : count <= 4 ? 'repeat(2, 1fr)'
    : 'repeat(3, 1fr)';

  /* ═══════════ RENDER ═══════════ */
  return (
    <div style={{ height: '100vh', background: '#202124', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Google Sans', Roboto, sans-serif" }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#e8eaed', fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {fmtTime(duration)}
          </span>
          <button
            onClick={copyCode}
            title="Copy meeting code"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#2d2e30', border: 'none', borderRadius: 8,
              padding: '4px 12px', color: '#9aa0a6', fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {meetingCode}
            {copied ? <Check size={14} color="#00c752" /> : <Copy size={14} />}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {handRaised && (
            <span style={{
              background: '#fbbc04', color: '#202124', padding: '4px 14px',
              borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
            }}>✋ Hand raised</span>
          )}
          <div style={{
            background: '#2d2e30', borderRadius: 8, padding: '4px 12px',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Users size={14} color="#9aa0a6" />
            <span style={{ color: '#9aa0a6', fontSize: 13 }}>{participants.length}</span>
          </div>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', paddingTop: 60, paddingBottom: 88 }}>

        {/* Video Grid */}
        <div style={{ flex: 1, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          {socketError ? (
            <div style={{ textAlign: 'center', background: 'rgba(234,67,53,0.1)', padding: '24px 32px', borderRadius: 16, border: '1px solid rgba(234,67,53,0.3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{joinStatus === 'denied' ? '🛑' : '⚠️'}</div>
              <h3 style={{ color: '#e8eaed', marginBottom: 8 }}>{joinStatus === 'denied' ? 'Entry Denied' : 'Connection failed'}</h3>
              <p style={{ color: '#ea4335', fontSize: 16 }}>{socketError}</p>
              <button 
                onClick={() => navigate('/')} 
                style={{ marginTop: 20, padding: '10px 20px', background: '#3c4043', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Go back to Home
              </button>
            </div>
          ) : joinStatus === 'waiting' || joinStatus === 'requesting' ? (
            <div style={{ 
              textAlign: 'center', 
              background: 'rgba(45, 46, 48, 0.4)', 
              padding: '60px 48px', 
              borderRadius: '32px', 
              maxWidth: '440px', 
              boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              animation: 'fadeIn 0.6s ease-out'
            }}>
              <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
              <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 32px' }}>
                <div style={{ 
                  position: 'absolute', inset: 0,
                  border: '3px solid rgba(138, 180, 248, 0.1)', 
                  borderTop: '3px solid #8ab4f8', 
                  borderRadius: '50%', 
                  animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                  boxShadow: '0 0 20px rgba(138, 180, 248, 0.1)'
                }} />
                <div style={{ 
                  position: 'absolute', inset: '8px',
                  border: '2px solid rgba(66, 133, 244, 0.05)', 
                  borderBottom: '2px solid #4285f4', 
                  borderRadius: '50%', 
                  animation: 'spin 1.2s linear infinite reverse',
                  opacity: 0.8
                }} />
              </div>
              <h2 style={{ color: '#e8eaed', fontSize: '28px', fontWeight: '400', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                Asking to join...
              </h2>
              <p style={{ color: '#9aa0a6', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                The meeting host will let you in shortly. <br/> Make sure your camera and mic are ready.
              </p>
              <button
                onClick={handleLeave}
                style={{
                  padding: '12px 24px', borderRadius: '12px', border: '1px solid #5f6368',
                  background: 'transparent', color: '#e8eaed', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500, transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(234, 67, 53, 0.1)'; e.target.style.borderColor = '#ea4335'; e.target.style.color = '#ea4335'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = '#5f6368'; e.target.style.color = '#e8eaed'; }}
              >
                Cancel Request
              </button>
            </div>
          ) : participants.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#5f6368' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
              <p style={{ fontSize: 16 }}>Connecting to meeting...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              gap: 12, width: '100%', maxHeight: '100%', alignContent: 'center'
            }}>
              {participants.map(p => (
                <ParticipantTile
                  key={p.socketId || 'local-me'}
                  participant={{
                    ...p,
                    volume: p.isMe ? localVolume : undefined
                  }}
                  localStream={localStream}
                  streamsRef={streamsRef}
                  selectedOutput={selectedOutput}
                />
              ))}
            </div>
          )}

          {/* Admission UI for Host */}
          {isHost && (
            <JoinRequestModal 
              requests={joinRequests} 
              onAccept={handleAcceptRequest} 
              onReject={handleRejectRequest} 
            />
          )}

          {/* Settings Modal */}
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            audioOutputs={audioOutputs}
            selectedOutput={selectedOutput}
            onSelectOutput={handleSelectOutput}
          />
        </div>

        {/* ── Side Panel ── */}
        {panel && (
          <div style={{
            width: 340, background: '#2d2e30', borderLeft: '1px solid #3c4043',
            display: 'flex', flexDirection: 'column', transition: 'all 0.3s'
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #3c4043',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <h3 style={{ color: '#e8eaed', fontWeight: 500, fontSize: 16, margin: 0 }}>
                {panel === 'chat' ? '💬 In-call messages' : `👥 People (${participants.length})`}
              </h3>
              <button
                onClick={() => setPanel(null)}
                style={{ background: 'none', border: 'none', color: '#9aa0a6', cursor: 'pointer', padding: 4, borderRadius: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Participants list */}
            {panel === 'participants' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {participants.map(p => (
                  <div key={p.socketId || 'local-me'} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 8px', borderRadius: 10,
                    background: 'transparent', transition: 'background 0.2s',
                    cursor: 'default'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#3c4043'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: p.color, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 600, color: 'white'
                    }}>{p.initials}</div>
                    <span style={{ flex: 1, color: '#e8eaed', fontSize: 14 }}>
                      {p.name}{p.isMe ? ' (You)' : ''}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.muted ? <MicOff size={16} color="#ea4335" /> : <Mic size={16} color="#9aa0a6" />}
                      {p.videoOff ? <VideoOff size={16} color="#ea4335" /> : <Video size={16} color="#9aa0a6" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat */}
            {panel === 'chat' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.length === 0 && (
                    <p style={{ color: '#5f6368', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                      No messages yet. Say hello! 👋
                    </p>
                  )}
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderName === userName;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: 11, color: msg.isPrivate ? '#fbbc04' : '#9aa0a6', marginBottom: 3, padding: isMe ? '0 4px 0 0' : '0 0 0 4px' }}>
                          {isMe ? (msg.isPrivate ? 'To: Private' : 'You') : msg.senderName} {msg.isPrivate && '(Private)'}
                        </span>
                        <div style={{
                          background: msg.isPrivate 
                            ? (isMe ? 'linear-gradient(135deg, #b06000, #f29900)' : '#4d3300')
                            : (isMe ? 'linear-gradient(135deg, #1a73e8, #4285f4)' : '#3c4043'),
                          padding: '10px 14px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                          maxWidth: '82%', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                        }}>
                          <p style={{ color: '#e8eaed', fontSize: 14, lineHeight: 1.45, margin: 0 }}>{msg.message}</p>
                          <p style={{ color: msg.isPrivate ? 'rgba(255,255,255,0.7)' : (isMe ? 'rgba(255,255,255,0.55)' : '#9aa0a6'), fontSize: 10, marginTop: 4, textAlign: 'right', margin: '4px 0 0' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div style={{ padding: 12, borderTop: '1px solid #3c4043' }}>
                  <div style={{ marginBottom: 8, padding: '0 4px' }}>
                    <select
                      value={chatTarget}
                      onChange={e => setChatTarget(e.target.value)}
                      style={{
                        background: '#3c4043', color: '#e8eaed', border: '1px solid #5f6368',
                        padding: '4px 8px', borderRadius: 6, fontSize: 12, width: '100%', outline: 'none'
                      }}
                    >
                      <option value="all">Everyone</option>
                      {participants.filter(p => !p.isMe).map(p => (
                        <option key={p.socketId} value={p.socketId}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{
                    display: 'flex', gap: 8, alignItems: 'center',
                    background: '#3c4043', borderRadius: 24, padding: '8px 8px 8px 16px'
                  }}>
                    <input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Send a message…"
                      style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#e8eaed', fontSize: 14
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!(newMessage || '').trim()}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', border: 'none',
                        background: (newMessage || '').trim() ? '#1a73e8' : '#5f6368',
                        color: 'white', cursor: (newMessage || '').trim() ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s', flexShrink: 0
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Toolbar ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 28px 20px',
        background: 'linear-gradient(transparent, rgba(32,33,36,0.98))',
        zIndex: 20
      }}>
        {/* Left: code */}
        <div style={{ minWidth: 120 }}>
          <span style={{ color: '#5f6368', fontSize: 13 }}>{meetingCode}</span>
        </div>

        {/* Center: controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ControlBtn
            active={micOn} activeColor="#3c4043" inactiveColor="#ea4335"
            icon={micOn ? <Mic size={22} /> : <MicOff size={22} />}
            onClick={toggleMic} tooltip={micOn ? 'Mute mic' : 'Unmute mic'}
          />
          <ControlBtn
            active={camOn} activeColor="#3c4043" inactiveColor="#ea4335"
            icon={camOn ? <Video size={22} /> : <VideoOff size={22} />}
            onClick={toggleCam} tooltip={camOn ? 'Turn off camera' : 'Turn on camera'}
          />
          <ControlBtn
            active={isScreenSharing} activeColor="#8ab4f8" inactiveColor="#3c4043"
            icon={<Monitor size={22} color={isScreenSharing ? '#202124' : 'white'} />} 
            onClick={toggleScreenShare} 
            tooltip={isScreenSharing ? "Stop presenting" : "Present now"}
          />
          <ControlBtn
            active={handRaised} activeColor="#fbbc04" inactiveColor="#3c4043"
            icon={<Hand size={22} />}
            onClick={() => setHandRaised(h => !h)}
            tooltip={handRaised ? 'Lower hand' : 'Raise hand'}
          />
          <ControlBtn
            active={isSettingsOpen} activeColor="#1a73e8" inactiveColor="#3c4043"
            icon={<Settings size={22} />}
            onClick={() => setIsSettingsOpen(true)}
            tooltip="Settings"
          />

          {/* Leave */}
          <button
            onClick={handleLeave}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 26px', borderRadius: 50, border: 'none',
              background: '#ea4335', color: 'white', fontSize: 15,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 2px 12px rgba(234,67,53,0.45)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#c5221f'}
            onMouseLeave={e => e.currentTarget.style.background = '#ea4335'}
          >
            <PhoneOff size={20} />
          </button>
        </div>

        {/* Right: panels */}
        <div style={{ display: 'flex', gap: 8, minWidth: 120, justifyContent: 'flex-end' }}>
          <ControlBtn
            active={panel === 'chat'} activeColor="#1a73e8" inactiveColor="#3c4043"
            icon={<MessageSquare size={22} />}
            onClick={() => togglePanel('chat')}
            tooltip="Chat" badge={unread}
          />
          <ControlBtn
            active={panel === 'participants'} activeColor="#1a73e8" inactiveColor="#3c4043"
            icon={<Users size={22} />}
            onClick={() => togglePanel('participants')}
            tooltip="Participants"
          />
        </div>
      </div>
    </div>
  );
}
