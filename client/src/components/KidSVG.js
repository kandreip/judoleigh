import React from 'react';

const KidSVG = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    {/* Head */}
    <circle cx="30" cy="15" r="5" fill="#ffd700" stroke="black" strokeWidth="1"/>
    
    {/* Gi (Uniform) */}
    <rect x="20" y="20" width="20" height="25" fill="white" stroke="black" strokeWidth="2"/>
    
    {/* Belt */}
    <rect x="20" y="35" width="20" height="5" fill="black" stroke="black" strokeWidth="1"/>
    
    {/* Arms - Judo stance */}
    <rect x="15" y="25" width="5" height="15" fill="white" stroke="black" strokeWidth="2"/>
    <rect x="40" y="25" width="5" height="15" fill="white" stroke="black" strokeWidth="2"/>
    
    {/* Legs - Judo stance */}
    <rect x="22" y="40" width="5" height="15" fill="white" stroke="black" strokeWidth="2"/>
    <rect x="33" y="40" width="5" height="15" fill="white" stroke="black" strokeWidth="2"/>
  </svg>
);

export default KidSVG; 