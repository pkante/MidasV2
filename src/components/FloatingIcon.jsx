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
      <div 
        className="w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 hover:shadow-3xl transition-all duration-200 cursor-pointer border border-gray-200"
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-black pointer-events-none"
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
  );
}

export default FloatingIcon;

