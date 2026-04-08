import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { UserPlus, Mail, Lock, User, FileImage, Image, AlertCircle, Loader2, CheckCircle2, ArrowRight, Camera } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullname: '',
    password: '',
    avatar: null,
    coverImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('fullname', formData.fullname);
    data.append('password', formData.password);
    data.append('avatar', formData.avatar);
    data.append('coverimage', formData.coverImage);

    try {
      await authService.register(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px 12px 44px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '38px',
    color: '#64748b'
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '24px' }}>
        <div style={{
          width: '100%', maxWidth: '400px', background: 'rgba(16, 185, 129, 0.05)',
          backdropFilter: 'blur(20px)', border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '24px', padding: '48px', textAlign: 'center', animation: 'fadeInUp 0.6s ease-out'
        }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} color="#10b981" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Account Created!</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', position: 'relative', overflow: 'hidden', padding: '40px 24px'
    }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '0', right: '0', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: '0', left: '0', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', filter: 'blur(100px)' }} />

      <div style={{
        width: '100%', maxWidth: '720px', background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '28px', padding: '48px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        zIndex: 1, animation: 'fadeInUp 0.6s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <UserPlus size={28} color="#3b82f6" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Join millions connecting on Google Meet</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontSize: '13px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={inputContainerStyle}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Username</label>
              <User size={18} style={iconStyle} />
              <input type="text" name="username" required value={formData.username} onChange={handleInputChange} style={inputStyle} placeholder="johndoe" autoComplete="username" />
            </div>
            <div style={inputContainerStyle}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Full Name</label>
              <User size={18} style={iconStyle} />
              <input type="text" name="fullname" required value={formData.fullname} onChange={handleInputChange} style={inputStyle} placeholder="John Doe" autoComplete="name" />
            </div>
            <div style={inputContainerStyle}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Email Address</label>
              <Mail size={18} style={iconStyle} />
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} style={inputStyle} placeholder="john@example.com" autoComplete="email" />
            </div>
            <div style={inputContainerStyle}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Password</label>
              <Lock size={18} style={iconStyle} />
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} style={inputStyle} placeholder="••••••••" autoComplete="new-password" />
            </div>
          </div>

          {/* Media Upload Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={inputContainerStyle}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Profile Avatar</label>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <input type="file" name="avatar" accept="image/*" required onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={20} color="#3b82f6" />
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formData.avatar ? formData.avatar.name : 'Choose Avatar'}
                  </span>
                </div>
              </div>
            </div>
            <div style={inputContainerStyle}>
              <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Cover Image</label>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <input type="file" name="coverImage" accept="image/*" required onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(168,85,247,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image size={20} color="#a855f7" />
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formData.coverImage ? formData.coverImage.name : 'Choose Cover'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '56px', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              border: 'none', borderRadius: '16px', color: '#fff', fontSize: '16px', fontWeight: '600',
              cursor: loading ? 'default' : 'pointer', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)', marginTop: '8px'
            }}
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
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
