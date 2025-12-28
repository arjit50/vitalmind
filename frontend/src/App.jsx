import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import ReportPage from './pages/ReportPage'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const circleRef = useRef(null);

  useEffect(() => {
    const moveCircle = (e) => {
      gsap.to(circleRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", moveCircle);

    return () => {
      window.removeEventListener("mousemove", moveCircle);
    };
  }, []);

  return (
    <AuthProvider>
      <div 
        ref={circleRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: 'white', 
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          
          mixBlendMode: 'difference' 
        }}
      />

      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage/>
          </ProtectedRoute>
        }/>
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage/>
          </ProtectedRoute>
        }/>
        <Route path="/report-analysis" element={
          <ProtectedRoute>
            <ReportPage/>
          </ProtectedRoute>
        }/>
      </Routes>
    </AuthProvider>
  )
}

export default App