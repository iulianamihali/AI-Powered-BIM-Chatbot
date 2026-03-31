import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import Search from './components/Search';
import Settings from './components/Settings';
import UserProfile from './components/UserProfile'; 
import Chats from './components/Chats';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/search" element={<Search />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/chats" element={<Chats />} />
      <Route path="/chat/:conversationId" element={<Dashboard />} />

      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
