import React, { useEffect } from 'react';

function FloatingIcon() {
  useEffect(() => {
    console.log('🎯 FloatingIcon component mounted');
    console.log('window.electronAPI available?', !!window.electronAPI);
    if (window.electronAPI) {
      console.log('electronAPI methods:', Object.keys(window.electronAPI));
    } else {
      console.error('❌ window.electronAPI NOT FOUND on mount');
    }
  }, []);

  const handleClick = (e) => {
    console.log('\n=== 🖱️  ICON CLICKED ===');
    console.log('window.electronAPI exists?', !!window.electronAPI);
    
    if (window.electronAPI) {
      console.log('✅ electronAPI found! Calling functions...');
      window.electronAPI.iconClicked();
      window.electronAPI.toggleChat();
      console.log('✓ Functions called successfully\n');
    } else {
      console.error('❌ window.electronAPI is UNDEFINED!');
      console.error('Available on window:', Object.keys(window));
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {/* Glass orb with gradient and glow */}
      <div 
        className="relative w-16 h-16 rounded-full cursor-pointer group"
        onClick={handleClick}
      >
        {/* Outer glow layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-white/10 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Main glass orb */}
        <div className="relative w-full h-full rounded-full glass-panel-strong border-gradient shadow-orb flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
          {/* Inner gradient highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full"></div>
          
          {/* Radial gradient for depth */}
          <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent rounded-full"></div>
          
          {/* Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="relative h-7 w-7 text-white pointer-events-none drop-shadow-lg z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default FloatingIcon;

