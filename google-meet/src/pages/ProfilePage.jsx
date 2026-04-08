import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Camera, Image, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('fullname', fullname);
    if (avatar) formData.append('avatar', avatar);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      const response = await fetch('http://localhost:5100/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // Update user state with new data (excluding tokens)
        login(localStorage.getItem('accessToken'), localStorage.getItem('refreshToken'), data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5100/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setOldPassword('');
        setNewPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Password change failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '80px', paddingBottom: '40px', minHeight: '100vh', background: '#202124' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#e8eaed', fontSize: '28px', fontWeight: '400', margin: 0 }}>My Profile</h1>
          <p style={{ color: '#9aa0a6', marginTop: '8px' }}>Manage your account information and security</p>
        </div>

        {message.text && (
          <div style={{
            marginBottom: '24px', padding: '12px 20px', borderRadius: '12px',
            background: message.type === 'success' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(234, 67, 53, 0.1)',
            border: `1px solid ${message.type === 'success' ? '#34a853' : '#ea4335'}`,
            color: message.type === 'success' ? '#34a853' : '#ea4335',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p style={{ margin: 0, fontSize: '14px' }}>{message.text}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Edit Profile Section */}
          <div style={{
            background: '#2d2e30', borderRadius: '16px', padding: '28px', border: '1px solid #3c4043'
          }}>
            <h2 style={{ color: '#e8eaed', fontSize: '18px', fontWeight: '500', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="#8ab4f8" /> Persnal Info
            </h2>
            
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#9aa0a6', fontSize: '13px' }}>Full Name</label>
                <input
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  style={{
                    background: '#202124', border: '1px solid #444746', borderRadius: '8px',
                    padding: '12px', color: '#e8eaed', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#9aa0a6', fontSize: '13px' }}>Avatar</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    background: '#202124', border: '1px solid #444746', borderRadius: '8px',
                    padding: '10px', color: '#9aa0a6', fontSize: '12px'
                  }}>
                    <Camera size={16} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {avatar ? avatar.name : 'Update Avatar'}
                    </span>
                    <input type="file" hidden accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#9aa0a6', fontSize: '13px' }}>Cover Image</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    background: '#202124', border: '1px solid #444746', borderRadius: '8px',
                    padding: '10px', color: '#9aa0a6', fontSize: '12px'
                  }}>
                    <Image size={16} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {coverImage ? coverImage.name : 'Update Cover'}
                    </span>
                    <input type="file" hidden accept="image/*" onChange={e => setCoverImage(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateLoading}
                style={{
                  marginTop: '12px', padding: '12px', borderRadius: '8px', border: 'none',
                  background: '#1a73e8', color: 'white', fontWeight: '500', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                {updateLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Security Section */}
          <div style={{
            background: '#2d2e30', borderRadius: '16px', padding: '28px', border: '1px solid #3c4043'
          }}>
            <h2 style={{ color: '#e8eaed', fontSize: '18px', fontWeight: '500', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={20} color="#8ab4f8" /> Security
            </h2>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#9aa0a6', fontSize: '13px' }}>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  style={{
                    background: '#202124', border: '1px solid #444746', borderRadius: '8px',
                    padding: '12px', color: '#e8eaed', outline: 'none'
                  }}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#9aa0a6', fontSize: '13px' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{
                    background: '#202124', border: '1px solid #444746', borderRadius: '8px',
                    padding: '12px', color: '#e8eaed', outline: 'none'
                  }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                style={{
                  marginTop: '12px', padding: '12px', borderRadius: '8px', border: 'none',
                  background: 'transparent', color: '#8ab4f8', border: '1px solid #444746',
                  fontWeight: '500', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                {passLoading ? <Loader2 size={18} className="animate-spin" /> : 'Change Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
