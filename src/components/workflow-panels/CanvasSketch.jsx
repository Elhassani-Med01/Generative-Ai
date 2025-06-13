// src/components/workflow-panels/CanvasSketch.jsx
import React, { useState } from 'react';
import PromptChatbot from '../PromptChatbot';
import FeedbackChatbot from '../FeedbackChatbot';
import { PROMPT_CONTEXTS } from './promptContexts';

const CanvasSketch = ({ 
  prompt, 
  setPrompt, 
  negativePrompt, 
  setNegativePrompt, 
  width, 
  height, 
  onDrawingComplete, 
  drawingCanvas: DrawingCanvasComponent,
  showFeedback,
  setShowFeedback
}) => {
  const [lastPrompt, setLastPrompt] = useState('');

  return (
    <div className="space-y-6">
      {/* Assistant IA */}
      <PromptChatbot
        context={PROMPT_CONTEXTS["canvas-sketch"].prompt}
        onPrompt={p => { setPrompt(p); setLastPrompt(p); }}
      />

      {/* Interface de dessin */}
      <div>
        <label className="block text-lg font-semibold text-gray-200 mb-2">
          Canvas Esquisse (Dessin Libre)
        </label>
        <p className="text-gray-400 text-sm mb-4">
          Dessinez librement votre esquisse ci-dessous.
        </p>
        <div className="flex justify-center">
          <DrawingCanvasComponent
            width={width}
            height={height}
            onDrawingComplete={onDrawingComplete}
            mode="drawing"
          />
        </div>
      </div>

      {/* Prompts */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setLastPrompt(e.target.value); }}
          placeholder="Décrivez ce que vous voulez générer à partir du dessin..."
          rows="3"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Negative Prompt</label>
        <textarea
          value={negativePrompt}
          onChange={e => setNegativePrompt(e.target.value)}
          placeholder="Ce que vous voulez éviter dans l'image..."
          rows="2"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>

      {/* Feedback après génération */}
      {showFeedback && (
        <FeedbackChatbot
          lastPrompt={lastPrompt}
          context={PROMPT_CONTEXTS["canvas-sketch"].feedback}
          onRefined={(positive, negative) => {
            setPrompt(positive);
            setNegativePrompt(negative);
            setShowFeedback(false);
          }}
        />
      )}

      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
        <p className="text-yellow-300 text-sm">
          Utilisez le canvas pour dessiner votre esquisse. Le système transformera votre dessin en une image réaliste.
        </p>
      </div>
    </div>
  );
};

export default CanvasSketch;