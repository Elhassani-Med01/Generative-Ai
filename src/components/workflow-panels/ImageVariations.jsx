import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import PromptChatbot from '../PromptChatbot';
import FeedbackChatbot from '../FeedbackChatbot';
import { PROMPT_CONTEXTS } from './promptContexts';

const ImageVariations = ({ 
  prompt, 
  setPrompt, 
  negativePrompt, 
  setNegativePrompt,
  uploadedImage,
  handleImageUpload,
  fileInputRef,
  showFeedback,
  setShowFeedback
}) => {
  const [lastPrompt, setLastPrompt] = useState('');

  return (
    <div className="space-y-4">
      <PromptChatbot
        context={PROMPT_CONTEXTS["image-variations"].prompt}
        onPrompt={p => { setPrompt(p); setLastPrompt(p); }}
      />

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Image Source</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer"
        >
          {uploadedImage ? (
            <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-gray-400 text-center">
              <Upload className="mx-auto mb-2" />
              <span>Aucune image téléchargée</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setLastPrompt(e.target.value); }}
          placeholder="Décrivez les variations souhaitées..."
          rows="3"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Negative Prompt</label>
        <textarea
          value={negativePrompt}
          onChange={e => setNegativePrompt(e.target.value)}
          placeholder="Ce que vous voulez éviter dans les variations..."
          rows="2"
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>
      {showFeedback && (
        <FeedbackChatbot
          lastPrompt={lastPrompt}
          context={PROMPT_CONTEXTS["image-variations"].feedback}
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

export default ImageVariations;