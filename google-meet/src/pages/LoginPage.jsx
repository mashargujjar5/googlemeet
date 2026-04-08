import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });
      
      const resData = response.data || response;
      const { accessToken, refreshToken, user } = resData;

      if (accessToken) {
        login(accessToken, refreshToken, user);
        navigate('/');
      } else {
        setError('Invalid server response: Missing tokens');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '14px 16px 14px 48px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      {/* Mesh Gradients Background */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(26,115,232,0.15) 0%, transparent 70%)',
        filter: 'blur(80px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
        filter: 'blur(80px)', zIndex: 0
      }} />

      {/* Glass Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', background: 'rgba(37, 99, 235, 0.1)',
            borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <LogIn size={32} color="#3b82f6" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Welcome Back</h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Access your meetings & stay connected</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px', padding: '14px 16px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', fontSize: '14px'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(59, 130, 246, 0.5)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(59, 130, 246, 0.5)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '12px',
              height: '52px',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <>Sign In <LogIn size={20} /></>}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            New to Google Meet?{' '}
            <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
