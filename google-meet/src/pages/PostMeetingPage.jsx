import { useState } from 'react';
import { Video, Calendar, Star, MessageSquare, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';

export default function PostMeetingPage({ meetingCode, duration, onHome }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`meet.example.com/${meetingCode}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#202124',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', paddingTop: '88px'
    }}>
      <div style={{
        maxWidth: '540px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '24px',
        animation: 'fadeIn 0.4s ease-out'
      }}>
        {/* Left the meeting */}
        <div style={{
          background: '#2d2e30', borderRadius: '20px', padding: '32px',
          border: '1px solid #3c4043', textAlign: 'center'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00897b, #00b294)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Video size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '400', color: '#e8eaed', marginBottom: '8px' }}>
            You left the meeting
          </h1>
          <p style={{ color: '#9aa0a6', fontSize: '14px', marginBottom: '24px' }}>
            Meeting duration: {duration ? formatTime(duration) : '0m 0s'}
          </p>

          {/* Meeting link */}
          <div style={{
            background: '#202124', borderRadius: '12px', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '24px', border: '1px solid #3c4043'
          }}>
            <div>
              <p style={{ color: '#9aa0a6', fontSize: '11px', marginBottom: '2px' }}>Meeting link</p>
              <p style={{ color: '#8ab4f8', fontSize: '13px' }}>meet.example.com/{meetingCode}</p>
            </div>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: copied ? '#137333' : '#3c4043',
                color: copied ? '#81c995' : '#e8eaed',
                fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onHome}
              style={{
                flex: 1, padding: '13px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                color: 'white', fontSize: '14px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 12px rgba(26,115,232,0.4)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,115,232,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,115,232,0.4)'; }}
            >
              Return to home
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex: 1, padding: '13px', borderRadius: '10px',
                border: '1px solid #444746', background: 'transparent',
                color: '#e8eaed', fontSize: '14px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3c4043'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Rejoin
            </button>
          </div>
        </div>

        {/* Rating */}
        {!submitted ? (
          <div style={{
            background: '#2d2e30', borderRadius: '20px', padding: '28px',
            border: '1px solid #3c4043'
          }}>
            <h3 style={{ color: '#e8eaed', fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>
              How was your call quality?
            </h3>
            <p style={{ color: '#9aa0a6', fontSize: '13px', marginBottom: '20px' }}>
              Your feedback helps us improve
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '32px', transition: 'transform 0.15s',
                    filter: star <= rating ? 'none' : 'grayscale(1) opacity(0.4)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ⭐
                </button>
              ))}
            </div>

            {rating > 0 && (
              <div style={{ marginBottom: '16px', animation: 'fadeIn 0.3s ease-out' }}>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Tell us more (optional)..."
                  rows={3}
                  style={{
                    width: '100%', background: '#202124', border: '1px solid #444746',
                    borderRadius: '10px', padding: '12px', color: '#e8eaed',
                    fontSize: '14px', resize: 'none', outline: 'none',
                    transition: 'border-color 0.2s', fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a73e8'}
                  onBlur={e => e.target.style.borderColor = '#444746'}
                />
              </div>
            )}

            <button
              onClick={() => setSubmitted(true)}
              disabled={!rating}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: rating ? '#1a73e8' : '#3c4043',
                color: rating ? 'white' : '#9aa0a6',
                fontSize: '14px', fontWeight: '500',
                cursor: rating ? 'pointer' : 'default', transition: 'all 0.2s'
              }}
            >
              Submit feedback
            </button>
          </div>
        ) : (
          <div style={{
            background: '#2d2e30', borderRadius: '20px', padding: '28px',
            border: '1px solid #3c4043', textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🙏</div>
            <h3 style={{ color: '#e8eaed', fontSize: '16px', marginBottom: '6px' }}>
              Thanks for your feedback!
            </h3>
            <p style={{ color: '#9aa0a6', fontSize: '13px' }}>
              We use it to improve your experience
            </p>
          </div>
        )}

        {/* Google Calendar promo */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2744, #1a3a5c)',
          borderRadius: '20px', padding: '24px',
          border: '1px solid #2a4a7a',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#e8eaed', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Schedule your next meeting
            </p>
            <p style={{ color: '#9aa0a6', fontSize: '12px' }}>
              Add it to Google Calendar with one click
            </p>
          </div>
          <button style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: '#1a73e8', color: 'white', fontSize: '13px',
            fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
