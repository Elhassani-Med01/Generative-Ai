import React, { useState } from 'react';
import PromptChatbot from '../PromptChatbot';
import FeedbackChatbot from '../FeedbackChatbot';
import { PROMPT_CONTEXTS } from './promptContexts';

const ImageGeneration = ({ 
  prompt, 
  setPrompt, 
  negativePrompt, 
  setNegativePrompt,
  showFeedback,
  lastGeneratedPrompt 
}) => {
  const [showFeedbackState, setShowFeedback] = useState(showFeedback);
  const [lastPrompt, setLastPrompt] = useState(lastGeneratedPrompt);

  // Appelle setShowFeedback(true) après la génération d'image dans ComfyUIWrapper

  return (
    <div className="space-y-4">
      <PromptChatbot
        context={PROMPT_CONTEXTS["image-gen"]}
        onPrompt={p => { setPrompt(p); setLastPrompt(p); }}
      />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setLastPrompt(e.target.value); }}
          placeholder="Décrivez l'image à générer..."
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
      {showFeedbackState && (
        <FeedbackChatbot
          lastPrompt={lastPrompt}
          context={PROMPT_CONTEXTS["image-gen"]} // ou autre selon le workflow
          onRefined={(positive, negative) => {
            setPrompt(positive);
            setNegativePrompt(negative);
            setShowFeedback(false);
          }}
        />
      )}
    </div>
  );
};

export default ImageGeneration;