import React, { useRef, useState, useEffect } from 'react';
import { HeartPulse, ArrowRight, User, LogOut, X, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import FeatureSection from './FeatureCard';
import Footer from '../components/Footer';
import ElasticString from '../components/ElasticString';


const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const container = useRef();
  const modalRef = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from('.nav-item', { 
      y: -20, 
      opacity: 0, 
      duration: 1,
      ease: 'power3.out'
    })
    .from('.hero-line', {
      y: 50,
      opacity: 0,
      rotateX: -10,
      stagger: 0.15,
      duration: 1,
      ease: 'power4.out',
    }, "-=0.8")
    .from('.cta-btn', {
      scale: 0.8,
      autoAlpha: 0, 
      duration: 0.8,
      ease: 'back.out(1.7)',
      clearProps: "all" 
    }, "-=0.4")
    .from('.stat-item', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    }, "-=0.6");

  }, { scope: container });

 
  useEffect(() => {
    if (showLogoutModal && modalRef.current) {
      gsap.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [showLogoutModal]);

  const confirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <div ref={container} className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-black overflow-x-hidden relative">
      
    
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

     
      {showLogoutModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div 
            ref={modalRef}
            className="bg-[#151515] border border-gray-800 p-8 rounded-2xl w-[90%] max-w-md shadow-2xl relative"
          >
           
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Log Out</h3>
              <p className="text-gray-400 mb-8">
                Are you sure you want to log out? <br/>
                You will need to sign in again to access your chat history.
              </p>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

     
      <nav className="nav-item relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer">
          <HeartPulse className="w-8 h-8 text-white" />
          <div className="leading-tight">
            <span className="block font-bold text-lg tracking-wide">VitalMind</span>
            <span className="block text-xs text-gray-400">AI Health Assistant</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#specialists" className="hover:text-emerald-400 transition-colors">Specialists</a>
          <a href="#reviews" className="hover:text-emerald-400 transition-colors">Reviews</a>
          <a href="#emergency" className="hover:text-emerald-400 transition-colors">Emergency</a>
        </div>

        {user ? (
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/profile')} >
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-200">{user.username}</span>
            </div>
            
        
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-lg hover:bg-[#1a1a1a] border border-gray-800 hover:border-red-500/50 transition-all group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        ) : (
          <div className='flex gap-5'>
            <Link to="/login" className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-6 py-2.5 rounded transition-all duration-300">
              Login
            </Link>
            <Link to="/signup" className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-6 py-2.5 rounded transition-all duration-300">
              Signup
            </Link>
          </div>
        )}
      </nav>

     
      <main className="relative z-10 flex flex-col items-center justify-center mt-16 md:mt-24 px-4 text-center">
        
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight">
            <div className="overflow-hidden">
              <span className="hero-line font-light block mb-2 origin-bottom-left">Your personal</span>
            </div>
            
            <div className="overflow-hidden flex flex-wrap justify-center items-baseline gap-3 md:gap-5">
              <span className="hero-line font-serif italic font-thin origin-bottom-left inline-block">AI-powered</span>
              <span className="hero-line font-mono text-emerald-400 font-bold origin-bottom-left inline-block">doctor</span>
            </div>
            
            <div className="overflow-hidden">
              <span className="hero-line block font-serif italic mt-2 origin-bottom-left">
                available <span className="font-sans not-italic font-normal">24/7.</span>
              </span>
            </div>
          </h1>
        </div>
        
        <div className="mt-16 md:mt-20">
          <Link 
            to="/chat" 
            className="cta-btn group relative bg-emerald-400 hover:bg-emerald-300 text-black text-lg md:text-xl font-semibold py-4 px-10 rounded-sm transition-colors duration-300 flex items-center gap-3 inline-flex"
          >
            Start Free Diagnosis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </main>

    
      <footer className="relative z-10 mt-24 md:mt-32 pb-12 max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-24 text-center">
          
          <div className="stat-item">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">1.2M+</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Queries Solved</p>
          </div>

          <div className="stat-item">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">50+</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Medical Specialties</p>
          </div>

          <div className="stat-item">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">4.9/5</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider">User Rating</p>
          </div>

        </div>
      </footer>
      <ElasticString />
      <FeatureSection />
      <Footer />
    </div>
  );
};


export default HomePage;