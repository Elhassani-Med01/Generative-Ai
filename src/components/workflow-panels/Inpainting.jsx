// src/components/workflow-panels/Inpainting.jsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import PromptChatbot from '../PromptChatbot';
import FeedbackChatbot from '../FeedbackChatbot';
import { PROMPT_CONTEXTS } from './promptContexts';

const Inpainting = ({ 
  prompt, 
  setPrompt, 
  negativePrompt, 
  setNegativePrompt,
  baseImage,
  maskImage,
  handleBaseImageUpload,
  handleMaskImageUpload,
  baseImageRef,
  maskImageRef,
  showFeedback,
  setShowFeedback
}) => {
  const [lastPrompt, setLastPrompt] = useState('');

  return (
    <div className="space-y-4">
      <PromptChatbot
        context={PROMPT_CONTEXTS["inpainting"].prompt}
        onPrompt={p => { setPrompt(p); setLastPrompt(p); }}
      />

      {/* Base Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Image Source</label>
        <div
          onClick={() => baseImageRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer"
        >
          {baseImage ? (
            <img src={baseImage} alt="Base" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-gray-400 text-center">
              <Upload className="mx-auto mb-2" />
              <span>Téléchargez l'image à retoucher</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleBaseImageUpload}
          ref={baseImageRef}
          className="hidden"
        />
      </div>

      {/* Mask Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Masque</label>
        <div
          onClick={() => maskImageRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer"
        >
          {maskImage ? (
            <img src={maskImage} alt="Mask" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-gray-400 text-center">
              <Upload className="mx-auto mb-2" />
              <span>Téléchargez le masque (zones à modifier en blanc)</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleMaskImageUpload}
          ref={maskImageRef}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setLastPrompt(e.target.value); }}
          placeholder="Décrivez les modifications souhaitées..."
          rows="3"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Negative Prompt</label>
        <textarea
          value={negativePrompt}
          onChange={e => setNegativePrompt(e.target.value)}
          placeholder="Ce que vous voulez éviter dans les zones modifiées..."
          rows="2"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>
      {showFeedback && (
        <FeedbackChatbot
          lastPrompt={lastPrompt}
          context={PROMPT_CONTEXTS["inpainting"].feedback}
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

export default Inpainting;