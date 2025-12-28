import React, { useRef } from 'react';
import { Brain, ShieldCheck, Activity, Clock } from 'lucide-react';
import Card from '../components/Card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';


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
 
    const cards = gsap.utils.toArray('.feature-card');

    gsap.fromTo(cards, 
      {
        y: 100,    
        opacity: 0, 
      },
      {
        y: 0,      
        opacity: 1, 
        duration: 1,
        stagger: 0.2, 
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%", 
          end: "bottom 70%", 
          scrub: true, 
          // markers: true,
        }
      }
    );
  }, { scope: container });

  return (
    <section ref={container} id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
      

      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Why Choose <span className="text-emerald-400">VitalMind?</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Experience the future of healthcare with our cutting-edge features designed for your peace of mind.
        </p>
      </div>

  
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