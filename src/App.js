import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import ChildDashboard from './pages/child/ChildDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';
import ChessLesson from './components/chess/ChessLesson';
import TypingLesson from './components/typing/TypingLesson';
import CodingLesson from './components/coding/CodingLesson';
import ProjectViewer from './pages/projects/ProjectViewer';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChildLogin from './pages/auth/ChildLogin';
import './styles/globals.css';

function LessonRouterWrapper() {
  const { subject } = useParams();
  if (subject === 'chess')  return <ChessLesson  lessonIndex={0} childName="Chidera" />;
  if (subject === 'typing') return <TypingLesson lessonIndex={0} childName="Chidera" />;
  if (subject === 'coding') return <CodingLesson lessonIndex={0} childName="Chidera" />;
  return <Navigate to="/child/dashboard" />;
}

function ProjectRouterWrapper() {
  const { projectId } = useParams();
  return <ProjectViewer projectId={projectId} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"                       element={<LandingPage />} />
          <Route path="/login"                  element={<Login />} />
          <Route path="/register"               element={<Register />} />
          <Route path="/child/login"            element={<ChildLogin />} />
          <Route path="/child/dashboard"        element={<ChildDashboard childName="Chidera" progress={{ coding:{ lessonsComplete:2, totalLessons:10 }, chess:{ lessonsComplete:0, totalLessons:6 }, typing:{ lessonsComplete:1, totalLessons:8 } }} />} />
          <Route path="/child/lesson/:subject"  element={<LessonRouterWrapper />} />
          <Route path="/parent/dashboard"       element={<ParentDashboard />} />
          <Route path="/projects/:projectId"    element={<ProjectRouterWrapper />} />
          <Route path="*"                       element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
