import React from 'react';
import {
  Brain,
  Stethoscope,
  Baby,
  Sparkles,
  Quote,
  PhoneCall,
  MapPin,
  ArrowRight
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// 1. SPECIALISTS SECTION
export const Specialists = () => {
  const experts = [
    { title: "Mental Health", icon: <Brain size={32} />, desc: "AI trained in CBT and emotional support." },
    { title: "General Physician", icon: <Stethoscope size={32} />, desc: "Expertise in common cold to complex flu symptoms." },
    { title: "Pediatrics", icon: <Baby size={32} />, desc: "Specialized care and guidance for infant health." },
    { title: "Dermatology", icon: <Sparkles size={32} />, desc: "Advanced skin-scan analysis for rashes and marks." },
  ];

  return (
    <section className="bg-black min-h-screen w-full flex items-center px-6 md:px-10 pt-32 md:pt-40 pb-20">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-white text-5xl md:text-7xl mb-16 leading-tight">
          Expert <span className="italic font-serif">specialized</span> <br />
          <span className="text-[#2DD4BF] font-bold">AI models.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map((exp, i) => (
            <div key={i} className="border border-zinc-800 p-8 rounded-3xl hover:border-[#2DD4BF] transition-all duration-300 group bg-zinc-900/20">
              <div className="text-[#2DD4BF] mb-6 group-hover:scale-110 transition-transform duration-300">
                {exp.icon}
              </div>
              <h3 className="text-white text-xl font-bold mb-3">{exp.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{exp.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 2. REVIEWS SECTION
export const Reviews = () => {
  const container = React.useRef();
  const reviews = [
    { name: "Sarah J.", text: "VitalMind diagnosed my fatigue when my local GP was booked out for weeks. It's truly life-changing.", role: "Verified Patient" },
    { name: "Mark T.", text: "The 24/7 availability gives me peace of mind as a new parent. The pediatric AI is incredibly accurate.", role: "Premium User" },
  ];

  useGSAP(() => {
    gsap.from('.review-content', {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.review-card', {
      x: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
    });
  }, { scope: container });

  return (
    <section ref={container} className="bg-black h-screen w-full flex items-center px-6 md:px-10 pt-20 md:pt-28 pb-10 border-t border-zinc-900 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
        <div className="review-content lg:w-1/2 text-center lg:text-left">
          <h2 className="text-white text-4xl md:text-7xl leading-none mb-3">
            Loved <br className="hidden lg:block" />
            <span className="italic font-serif">by</span> <br className="hidden lg:block" />
            <span className="text-[#2DD4BF] font-bold">thousands.</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-lg max-w-sm mx-auto lg:mx-0 italic font-serif">
            Join 10,000+ users who trust our AI for their daily health monitoring.
          </p>
        </div>

        <div className="lg:w-1/2 grid grid-cols-1 gap-3 md:gap-4 w-full">
          {reviews.map((rev, i) => (
            <div key={i} className="review-card bg-zinc-900/40 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-800 relative overflow-hidden">
              <Quote className="text-[#2DD4BF] absolute top-4 right-6 opacity-20" size={28} />
              <p className="text-gray-200 italic font-serif text-lg md:text-2xl mb-4 md:mb-6 relative z-10 leading-snug">
                "{rev.text}"
              </p>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800 border border-zinc-700" />
                <div>
                  <p className="text-[#2DD4BF] font-bold text-xs md:text-sm uppercase tracking-[0.2em]">{rev.name}</p>
                  <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 3. EMERGENCY SECTION
export const Emergency = () => {
  const container = React.useRef();

  useGSAP(() => {
    gsap.from('.emergency-card', {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.emergency-item', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      delay: 0.3,
      ease: 'power2.out'
    });
  }, { scope: container });

  return (
    <section ref={container} className="bg-black h-screen w-full flex items-center px-6 md:px-10 pt-24 md:pt-28 pb-10 overflow-hidden">
      <div className="emergency-card max-w-4xl mx-auto w-full bg-zinc-950 border border-zinc-800 rounded-3xl md:rounded-[3rem] p-6 md:p-12 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 blur-[120px] pointer-events-none" />

        <div className="emergency-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-900/50 bg-red-950/20 text-red-500 text-xs font-bold mb-6 tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Critical Care Support
        </div>

        <h2 className="emergency-item text-white text-4xl md:text-6xl mb-6 leading-tight">
          Immediate <span className="italic font-serif">emergency</span> <br />
          <span className="text-[#2DD4BF] font-bold">support 24/7.</span>
        </h2>

        <p className="emergency-item text-zinc-400 text-base md:text-lg mb-8 max-w-2xl mx-auto font-light leading-relaxed">
          If you are experiencing chest pain, severe bleeding, or difficulty breathing, <span className="text-white font-semibold">stop using the AI</span> and contact emergency services immediately.
        </p>

        <div className="emergency-item flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-[#2DD4BF] text-black font-black py-4 px-10 rounded-full hover:bg-emerald-300 transition-all active:scale-95 flex items-center justify-center gap-3 text-base">
            <PhoneCall size={20} />
            Call Emergency (112)
          </button>

          <a href="https://www.google.com/search?q=hospitals+near+me" target="_blank" rel="noopener noreferrer" className="bg-zinc-900 text-white font-bold py-4 px-10 rounded-full hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center justify-center gap-3 text-base no-underline">
            <MapPin size={20} />
            Nearby Hospitals
          </a>
        </div>

        <p className="emergency-item mt-8 text-zinc-600 text-[10px] uppercase tracking-[0.3em]">
          VitalMind is an assistant, not a replacement for ER care.
        </p>
      </div>
    </section>
  );
};