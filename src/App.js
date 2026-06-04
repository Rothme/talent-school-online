import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ChildDashboard from './pages/child/ChildDashboard';
import ChessLesson from './components/chess/ChessLesson';
import TypingLesson from './components/typing/TypingLesson';
import './styles/globals.css';

function LessonRouterWrapper() {
  const { subject } = useParams();
  if (subject === 'chess') return <ChessLesson lessonIndex={0} childName="Chidera" />;
  if (subject === 'typing') return <TypingLesson lessonIndex={0} childName="Chidera" />;
  return (
    <div style={{ padding: 40, fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
      <h2>Coding lesson — coming next session!</h2>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/child/dashboard" />} />
          <Route path="/child/dashboard" element={
            <ChildDashboard
              childName="Chidera"
              progress={{
                coding: { lessonsComplete: 2, totalLessons: 6 },
                chess: { lessonsComplete: 0, totalLessons: 6 },
                typing: { lessonsComplete: 1, totalLessons: 8 },
              }}
            />
          } />
          <Route path="/child/lesson/:subject" element={<LessonRouterWrapper />} />
          <Route path="*" element={<Navigate to="/child/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
