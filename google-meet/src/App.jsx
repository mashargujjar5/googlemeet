import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PreJoinPage from './pages/PreJoinPage';
import MeetingPage from './pages/MeetingPage';
import PostMeetingPage from './pages/PostMeetingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import './index.css';

export default function App() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#202124' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/prejoin/:meetingCode" element={<PreJoinPage />} />
        <Route path="/prejoin" element={<PreJoinPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/meeting/:meetingCode" element={<MeetingPage />} />
        <Route path="/post" element={<PostMeetingPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
