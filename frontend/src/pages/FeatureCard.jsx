import React, { useRef } from 'react';
import { Brain, ShieldCheck, Activity, Clock } from 'lucide-react';
import Card from '../components/Card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register the GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const featuresData = [
  {
    title: "Symptom Analysis",
    description: "Advanced AI algorithms analyze your symptoms instantly to provide accurate preliminary diagnoses.",
    icon: Activity,
  },
  {
    title: "Mental Wellness",
    description: "Specialized cognitive behavioral therapy support and mood tracking available 24/7.",
    icon: Brain,
  },
  {
    title: "Secure Health Data",
    description: "Your medical history is encrypted with enterprise-grade security. Only you hold the key.",
    icon: ShieldCheck,
  },
  {
    title: "Instant Availability",
    description: "No waiting rooms. Access medical advice and emergency triage in seconds, day or night.",
    icon: Clock,
  }
];

const FeatureCard = () => {
  const container = useRef(null);

  useGSAP(() => {
    // Select all cards using the class name from Card.jsx
    const cards = gsap.utils.toArray('.feature-card');

    gsap.fromTo(cards, 
      {
        y: 100,    // Start 100px down
        opacity: 0, // Start invisible
      },
      {
        y: 0,      // End at natural position
        opacity: 1, // End fully visible
        duration: 1,
        stagger: 0.2, // Delay between each card
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%", // Animation starts when top of section hits 85% of viewport
          end: "bottom 70%", // Animation ends when bottom of section hits 70% of viewport
          scrub: true, // Smoothly scrubs the animation based on scroll position
          // markers: true, // Uncomment this to see debug markers on screen
        }
      }
    );
  }, { scope: container });

  return (
    <section ref={container} id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
      
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Why Choose <span className="text-emerald-400">VitalMind?</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Experience the future of healthcare with our cutting-edge features designed for your peace of mind.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuresData.map((feature, index) => (
          <Card 
            key={index}
            title={feature.title} 
            description={feature.description} 
            Icon={feature.icon} 
          />
        ))}
      </div>
    </section>
  );
};

export default FeatureCard;