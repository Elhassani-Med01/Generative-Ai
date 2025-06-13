import React, { useState } from 'react';
import { Send } from 'lucide-react';

const FeedbackChatbot = ({ lastPrompt, context, onRefined, history }) => {
	const [feedback, setFeedback] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('http://localhost:3001/api/ollama-feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lastPrompt, feedback, context, history }),
			});

			const data = await response.json();
			if (response.ok) {
				onRefined(data.positive, data.negative);
			} else {
				setError(data.error || 'Une erreur est survenue');
			}
		} catch (err) {
			setError('Erreur de connexion au serveur');
		}
		setLoading(false);
	};

	return (
		<div className="space-y-4">
			<p className="text-gray-300 text-sm">
				Comment pouvons-nous améliorer l'image générée ? Décrivez ce que vous souhaitez modifier.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<textarea
					value={feedback}
					onChange={(e) => setFeedback(e.target.value)}
					placeholder="Ex: Je voudrais plus de détails dans le fond, des couleurs plus vives..."
					rows="3"
					className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none resize-none"
				/>
				<div className="flex justify-between items-center">
					<button
						type="submit"
						disabled={loading || !feedback.trim()}
						className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
					>
						<Send className="w-4 h-4" />
						<span>{loading ? 'Analyse...' : 'Envoyer le feedback'}</span>
					</button>
				</div>
			</form>
			{error && (
				<div className="text-red-400 text-sm">
					{error}
				</div>
			)}
		</div>
	);
};

export default FeedbackChatbot;