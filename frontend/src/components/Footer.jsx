import React, { useRef } from 'react';
import {
  HeartPulse,
  Twitter,
  Github,
  Linkedin,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const container = useRef(null);

  useGSAP(() => {
    // Animate footer columns when they scroll into view
    gsap.from('.footer-col', {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 95%', // Starts when top of footer hits 95% of viewport
        toggleActions: 'play none none reverse', // Plays on enter, reverses on leave
      }
    });

    // Animate the bottom copyright bar separately
    gsap.from('.footer-bottom', {
      opacity: 0,
      duration: 1,
      delay: 0.5,
      scrollTrigger: {
        trigger: container.current,
        start: 'top 95%',
      }
    });

  }, { scope: container });

  return (
    <footer ref={container} className="relative z-10 bg-[#050505] border-t border-white/10 pt-16 pb-8 overflow-hidden">

      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-12">

          {/* Brand & Description */}
          <div className="footer-col flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-emerald-900/30 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <HeartPulse className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-wide">VitalMind</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
              Your personal AI-powered health assistant available 24/7.
              Bridging the gap between technology and personalized medical care.
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Github} href="https://github.com/arjit50" />
              <SocialIcon Icon={Linkedin} href="https://www.linkedin.com/in/arjit50/" />
              <SocialIcon Icon={Mail} href="mailto:arjitkashyap5@gmail.com" />
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom pt-8 border-t border-white/5 flex justify-center items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} VitalMind AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Helper Components for clean code ---

const SocialIcon = ({ Icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 group"
  >
    <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
  </a>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
    >
      <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300">
        <ArrowRight className="w-3 h-3 text-emerald-400" />
      </span>
      {children}
    </Link>
  </li>
);

export default Footer;