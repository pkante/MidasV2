import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import FloatingIcon from './components/FloatingIcon';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/icon" element={<FloatingIcon />} />
        <Route path="/chat" element={<ChatWindow />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

