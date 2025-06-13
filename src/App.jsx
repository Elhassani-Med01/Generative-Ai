import React, { useState } from 'react';
import FeedbackChatbot from './components/FeedbackChatbot';

const App = () => {
	const [conversationHistory, setConversationHistory] = useState([]);
	const [lastPrompt, setLastPrompt] = useState('');
	const [imageGenerated, setImageGenerated] = useState(false);
	const [context, setContext] = useState({});
	const [image, setImage] = useState(null);
	const [prompt, setPrompt] = useState('');

	const handleImageGeneration = () => {
		// Simulate image generation
		setLastPrompt(prompt);
		setImageGenerated(true);
		setImage('https://via.placeholder.com/400x300?text=Generated+Image');
		setContext({});
		setConversationHistory(prev => [
			...prev,
			{ role: 'user', content: prompt },
			{ role: 'system', content: 'Image generated.' }
		]);
	};

	const handleRefine = (positive, negative) => {
		setConversationHistory(prev => [
			...prev,
			{ role: 'user', content: `Feedback: ${positive} / ${negative}` }
		]);
		// ...use positive/negative to generate new prompt or update UI...
	};

	return (
		<div className="app-container max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Image Generation Workflow</h1>
			<div className="mb-4">
				<input
					type="text"
					className="w-full px-3 py-2 border rounded mb-2"
					placeholder="Enter your prompt..."
					value={prompt}
					onChange={e => setPrompt(e.target.value)}
					disabled={imageGenerated}
				/>
				<button
					className="bg-blue-600 text-white px-4 py-2 rounded"
					onClick={handleImageGeneration}
					disabled={!prompt || imageGenerated}
				>
					Generate Image
				</button>
			</div>
			{imageGenerated && (
				<div className="mb-6">
					<div className="mb-4">
						<img src={image} alt="Generated" className="rounded shadow" />
					</div>
					<div className="feedback-section bg-gray-800 p-4 rounded-lg">
						<h2 className="text-lg font-semibold mb-2 text-yellow-400">Donnez votre feedback</h2>
						<FeedbackChatbot
							lastPrompt={lastPrompt}
							context={context}
							onRefined={handleRefine}
							history={conversationHistory}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;