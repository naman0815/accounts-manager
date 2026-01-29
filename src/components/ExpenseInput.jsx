import { useState } from 'react';
import { parseMultipleExpenses } from '../utils/parser';
import { Mic, MicOff } from 'lucide-react';

export function ExpenseInput({ onAdd }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isSubmitting) return;

        const transactions = parseMultipleExpenses(input);
        if (transactions.length > 0) {
            setIsSubmitting(true);
            try {
                // Execute all adds sequentially to ensure proper storage updates
                for (const t of transactions) {
                    await onAdd(t);
                }
                setInput('');
                setError(false);
            } catch (err) {
                console.error("Error adding transaction", err);
                setError(true);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice input is not supported in this browser. Try Chrome.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true; // Use interim to show text while typing
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const result = event.results[0];
            const transcript = result[0].transcript;

            setInput(transcript);

            if (result.isFinal) {
                recognition.stop();
                setIsListening(false);

                // Auto-submit logic
                // Delay to ensure state update and prevent race conditions
                setTimeout(() => {
                    const transactions = parseMultipleExpenses(transcript);
                    if (transactions.length > 0) {
                        setIsSubmitting(true);
                        Promise.all(transactions.map(t => onAdd(t)))
                            .then(() => {
                                setInput('');
                                setError(false);
                            })
                            .catch(() => setError(true))
                            .finally(() => setIsSubmitting(false));
                    }
                }, 200);
            }
        };

        recognition.start();
    };

    return (
        <form onSubmit={handleSubmit} className="input-section">
            <div className={`input-wrapper ${isListening ? 'listening' : ''}`}>
                <input
                    type="text"
                    className={`expense-input glass-panel ${error ? 'shake-error' : ''}`}
                    placeholder={isListening ? "Listening..." : "Type e.g. '25 for Lunch'"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isSubmitting} // Disable input while submitting
                />
                <button
                    type="button"
                    className={`mic-btn ${isListening ? 'active' : ''}`}
                    onClick={handleMicClick}
                    title="Voice Input"
                    disabled={isSubmitting}
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            </div>
            {isSubmitting && <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: '0.8rem', color: '#ccc' }}>Saving...</div>}
        </form>
    );
}
