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

// 1. SPECIALISTS SECTION
export const Specialists = () => {
  const experts = [
    { title: "Mental Health", icon: <Brain size={32} />, desc: "AI trained in CBT and emotional support." },
    { title: "General Physician", icon: <Stethoscope size={32} />, desc: "Expertise in common cold to complex flu symptoms." },
    { title: "Pediatrics", icon: <Baby size={32} />, desc: "Specialized care and guidance for infant health." },
    { title: "Dermatology", icon: <Sparkles size={32} />, desc: "Advanced skin-scan analysis for rashes and marks." },
  ];

  return (
    <section className="bg-black min-h-screen w-full flex items-center px-6 md:px-10 py-20">
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
  const reviews = [
    { name: "Sarah J.", text: "VitalMind diagnosed my fatigue when my local GP was booked out for weeks. It's truly life-changing.", role: "Verified Patient" },
    { name: "Mark T.", text: "The 24/7 availability gives me peace of mind as a new parent. The pediatric AI is incredibly accurate.", role: "Premium User" },
  ];

  return (
    <section className="bg-black min-h-screen w-full flex items-center px-6 md:px-10 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <h2 className="text-white text-6xl md:text-8xl leading-none mb-6">
            Loved <br /> 
            <span className="italic font-serif">by</span> <br />
            <span className="text-[#2DD4BF] font-bold">thousands.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-sm italic font-serif">
            Join 10,000+ users who trust our AI for their daily health monitoring.
          </p>
        </div>
        
        <div className="lg:w-1/2 grid grid-cols-1 gap-8 w-full">
          {reviews.map((rev, i) => (
            <div key={i} className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-800 relative overflow-hidden">
              <Quote className="text-[#2DD4BF] absolute top-6 right-8 opacity-20" size={48} />
              <p className="text-gray-200 italic font-serif text-2xl mb-8 relative z-10 leading-snug">
                "{rev.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700" />
                <div>
                  <p className="text-[#2DD4BF] font-bold text-sm uppercase tracking-[0.2em]">{rev.name}</p>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest">{rev.role}</p>
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
  return (
    <section className="bg-black min-h-screen w-full flex items-center px-6 md:px-10 py-20">
      <div className="max-w-5xl mx-auto w-full bg-zinc-950 border border-zinc-800 rounded-[4rem] p-8 md:p-20 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 blur-[120px] pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-900/50 bg-red-950/20 text-red-500 text-xs font-bold mb-8 tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Critical Care Support
        </div>

        <h2 className="text-white text-5xl md:text-7xl mb-8 leading-tight">
          Immediate <span className="italic font-serif">emergency</span> <br />
          <span className="text-[#2DD4BF] font-bold">support 24/7.</span>
        </h2>
        
        <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          If you are experiencing chest pain, severe bleeding, or difficulty breathing, <span className="text-white font-semibold">stop using the AI</span> and contact emergency services immediately.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button className="bg-[#2DD4BF] text-black font-black py-5 px-12 rounded-full hover:bg-emerald-300 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg">
            <PhoneCall size={22} />
            Call Emergency (911)
          </button>
          
          <button className="bg-zinc-900 text-white font-bold py-5 px-12 rounded-full hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center justify-center gap-3 text-lg">
            <MapPin size={22} />
            Nearby Hospitals
          </button>
        </div>

        <p className="mt-12 text-zinc-600 text-xs uppercase tracking-[0.3em]">
          VitalMind is an assistant, not a replacement for ER care.
        </p>
      </div>
    </section>
  );
};