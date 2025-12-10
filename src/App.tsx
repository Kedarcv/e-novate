import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Certify from './pages/Certify';
import Jobs from './pages/Jobs';
import JobApplication from './pages/JobApplication';
import Connect from './pages/Connect';
import Wallet from './pages/Wallet';
import ClientPortal from './pages/ClientPortal';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import CourseModule from './pages/CourseModule';
import GamifiedLearning from './pages/GamifiedLearning';
import CommunityFeed from './pages/CommunityFeed';
import LiveLearningSession from './features/learning/LiveLearningSession';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CourseQuest from './pages/CourseQuest';
import Portfolio from './pages/Portfolio';
import CVGenerator from './pages/CVGenerator';
import CareerGuidance from './pages/CareerGuidance';
import BottomNav from './components/bottom-nav/BottomNav';
import './App.scss';

// Clear auth on app load to require login every time
const clearSessionOnLoad = () => {
  // Only clear if this is a fresh page load (not a refresh within session)
  const sessionActive = sessionStorage.getItem('sessionActive');
  if (!sessionActive) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentUser');
    sessionStorage.setItem('sessionActive', 'true');
  }
};

// Call on module load
clearSessionOnLoad();

// Auth Guard Component - checks if user is logged in
const RequireAuth: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'client') {
      return <Navigate to="/client-portal" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <DatabaseProvider>
      <Router>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes - public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirect /client to /client-portal */}
          <Route path="/client" element={<Navigate to="/client-portal" replace />} />
          
          {/* Admin Dashboard - requires admin role */}
          <Route path="/admin" element={
            <RequireAuth requiredRole="admin">
              <AdminDashboard />
            </RequireAuth>
          } />
          
          {/* Protected App routes with sidebar layout */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/learn" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Learn />} />
          </Route>
          <Route path="/certify" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Certify />} />
          </Route>
          <Route path="/jobs" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Jobs />} />
          </Route>
          {/* Job Application Page */}
          <Route path="/jobs/apply/:jobId" element={
            <RequireAuth>
              <JobApplication />
            </RequireAuth>
          } />
          <Route path="/connect" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Connect />} />
          </Route>
          <Route path="/wallet" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Wallet />} />
          </Route>
          
          {/* Portfolio - LinkedIn-like professional profile */}
          <Route path="/portfolio" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Portfolio />} />
          </Route>
          
          {/* CV Generator - AI-powered resume builder */}
          <Route path="/cv-generator" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<CVGenerator />} />
          </Route>
          
          {/* Career Guidance - AI career counselor with Gemini Live */}
          <Route path="/career-guidance" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<CareerGuidance />} />
          </Route>
          
          <Route path="/client-portal" element={
            <RequireAuth requiredRole="client">
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<ClientPortal />} />
          </Route>
          <Route path="/settings" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Settings />} />
          </Route>
          <Route path="/notifications" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<Notifications />} />
          </Route>
          <Route path="/community" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<CommunityFeed />} />
          </Route>
          
          {/* Gamified course module view */}
          <Route path="/course/:courseId" element={
            <RequireAuth>
              <CourseModule />
            </RequireAuth>
          } />
          
          {/* Quest-based Course Experience */}
          <Route path="/course/:courseId/quest/:questId" element={
            <RequireAuth>
              <CourseQuest />
            </RequireAuth>
          } />
          
          {/* Gamified Learning Experience */}
          <Route path="/learn/gamified/:courseId/:moduleId" element={
            <RequireAuth>
              <GamifiedLearning />
            </RequireAuth>
          } />
          
          {/* Standalone route for the immersive AI learning session */}
          <Route path="/learn/session/:courseId" element={
            <RequireAuth>
              <LiveLearningSession />
            </RequireAuth>
          } />
        </Routes>
        
        {/* Bottom navigation */}
        <BottomNav />
      </Router>
    </DatabaseProvider>
  );
}

export default App;
