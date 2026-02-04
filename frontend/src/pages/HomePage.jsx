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

  const container = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();

    // Set initial state to avoid jump
    gsap.set('.hero-line', { opacity: 0, y: 50, rotateX: -15 });

    tl.to('.hero-line', {
      y: 0,
      opacity: 1,
      rotateX: 0,
      stagger: 0.15,
      duration: 1.2,
      ease: 'power4.out',
    })
      .from('.cta-btn', {
        scale: 0.8,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
        clearProps: "all"
      }, "-=0.6")
      .from('.stat-item', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      }, "-=0.6");

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-black overflow-x-hidden relative" style={{ perspective: '1000px' }}>




      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] pt-32 md:pt-40 px-4 text-center">

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

        <div className="mt-20 md:mt-28">
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