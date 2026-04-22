import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';
import SetupPage from './pages/SetupPage';
import MentorSetupPage from './pages/MentorSetupPage';
import ProfilePage from './pages/ProfilePage';
import DepartmentPage from './pages/DepartmentPage';
import TeamPage from './pages/TeamPage';
import CommunityPage from './pages/CommunityPage';
import MobileAccessPage from './pages/MobileAccessPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/mentor-setup" element={<MentorSetupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/department/:id" element={<DepartmentPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/mobile" element={<MobileAccessPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
