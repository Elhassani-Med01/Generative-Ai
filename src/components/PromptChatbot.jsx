import React, { useState } from 'react';

export default function PromptChatbot({ context, onPrompt }) {
  const [userInput, setUserInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message) => {
    setLoading(true);
    const newChat = [...chat, { role: 'user', content: message }];
    setChat(newChat);
    try {
      const response = await fetch('http://localhost:3001/api/ollama', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuestion: message, context, history: newChat }),
      });
      const data = await response.json();
      setChat(c => [...c, { role: 'assistant', content: data.response }]);
      if (onPrompt) onPrompt(data.response);
    } catch (e) {
      setChat(c => [...c, { role: 'assistant', content: "Erreur lors de la connexion à l'API." }]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900/80 rounded-xl p-4 mb-4 border border-gray-700/50">
      <div className="mb-2 font-semibold text-purple-300">Assistant IA (Ollama)</div>
      <div className="h-32 overflow-y-auto text-sm mb-2 bg-gray-800 rounded p-2">
        {chat.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-blue-300' : 'text-green-300'}>
            <b>{msg.role === 'user' ? 'Vous' : 'Assistant'}:</b> {msg.content}
          </div>
        ))}
        {loading && <div className="text-purple-400">Assistant écrit...</div>}
      </div>
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          if (userInput.trim()) {
            sendMessage(userInput.trim());
            setUserInput('');
          }
        }}
      >
        <input
          className="flex-1 bg-gray-700 text-white px-2 py-1 rounded"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Votre idée..."
        />
        <button type="submit" className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
          Envoyer
        </button>
      </form>
    </div>
  );
}