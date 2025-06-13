// src/App.js
import React from 'react';
import ComfyUIWrapper from './components/ComfyUIWrapper'; // Corrected path
import './index.css'; // Or './App.css' if your project links to that. Ensure Tailwind directives are in the linked CSS file.

function App() {
  return (
    <ComfyUIWrapper />
  );
}

export default App;