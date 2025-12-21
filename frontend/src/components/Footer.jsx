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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Column (Span 4 cols) */}
          <div className="footer-col lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-emerald-900/30 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <HeartPulse className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-wide">VitalMind</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Your personal AI-powered health assistant available 24/7. 
              Bridging the gap between technology and personalized medical care.
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Twitter} href="#" />
              <SocialIcon Icon={Github} href="#" />
              <SocialIcon Icon={Linkedin} href="#" />
              <SocialIcon Icon={Mail} href="#" />
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-col lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <FooterLink to="/features">Features</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/specialists">Specialists</FooterLink>
              <FooterLink to="/reviews">Reviews</FooterLink>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-col lg:col-span-2">
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* Links Column 3 (Legal) */}
          <div className="footer-col lg:col-span-2">
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/cookie">Cookie Policy</FooterLink>
              <FooterLink to="/hipaa">HIPAA Compliance</FooterLink>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} VitalMind AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-emerald-400 transition-colors">Security</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Helper Components for clean code ---

const SocialIcon = ({ Icon, href }) => (
  <a 
    href={href} 
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