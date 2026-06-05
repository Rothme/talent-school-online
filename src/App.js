/* eslint-disable */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage      from './pages/LandingPage';
import Login            from './pages/auth/Login';
import Register         from './pages/auth/Register';
import ChildLogin       from './pages/auth/ChildLogin';
import ParentSetup      from './pages/auth/ParentSetup';
import ParentDashboard  from './pages/parent/ParentDashboard';
import TodaySession     from './pages/child/TodaySession';
import WarmupSession    from './pages/child/WarmupSession';
import MainSession      from './pages/child/MainSession';
import SessionComplete  from './pages/child/SessionComplete';
import ProjectViewer    from './pages/projects/ProjectViewer';
import './styles/globals.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"                        element={<LandingPage />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/register"                element={<Register />} />
          <Route path="/child/login"             element={<ChildLogin />} />
          <Route path="/parent/setup"            element={<ParentSetup />} />
          <Route path="/parent/dashboard"        element={<ParentDashboard />} />
          <Route path="/child/today"             element={<TodaySession />} />
          <Route path="/child/session/warmup"    element={<WarmupSession />} />
          <Route path="/child/session/main"      element={<MainSession />} />
          <Route path="/child/session/complete"  element={<SessionComplete />} />
          <Route path="/projects/:projectId"     element={<ProjectViewer projectId="chidera-guessing-game" />} />
          <Route path="*"                        element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
