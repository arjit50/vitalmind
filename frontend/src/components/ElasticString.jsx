import React, { useRef } from 'react';
import gsap from 'gsap';

const ElasticString = () => {
  const pathRef = useRef(null);
  const containerRef = useRef(null);

  // The resting state of the line
  const initialPath = "M 10 100 Q 500 100 990 100";

  const handleMouseMove = (e) => {
    // Get the position of the container relative to the viewport
    // This ensures the string bends correctly even if you scroll down
    const rect = containerRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update the path using the mouse coordinates
    const path = `M 10 100 Q ${x} ${y} 990 100`;

    gsap.to(pathRef.current, {
      attr: { d: path },
      duration: 0.2,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = () => {
    // Snap back to straight line with elastic wobble
    gsap.to(pathRef.current, {
      attr: { d: initialPath },
      duration: 1.5,
      ease: "elastic.out(1, 0.2)",
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      style={{
        height: '250px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'none' // Optional: hides cursor so it feels more immersive
      }}
    >
      <svg width="1000" height="200" style={{ overflow: 'visible' }}>
        <path 
          ref={pathRef} 
          d={initialPath} 
          stroke="white" 
          strokeWidth="2"
          fill="transparent" 
        />
      </svg>
    </div>
  );
};

export default ElasticString;