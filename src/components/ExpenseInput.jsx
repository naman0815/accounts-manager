import { useState } from 'react';
import { parseMultipleExpenses } from '../utils/parser';
import { Mic, MicOff } from 'lucide-react';

export function ExpenseInput({ onAdd }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const transactions = parseMultipleExpenses(input);
        if (transactions.length > 0) {
            transactions.forEach(t => onAdd(t));
            setInput('');
            setError(false);
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
            // Stop logical handling if user clicks off manually, 
            // though recognition usually auto-stops
            setIsListening(false);
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // or en-IN

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            // Optional: Auto-submit? Let's verify first
            // handleSubmit(); 
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
                    autoFocus
                />
                <button
                    type="button"
                    className={`mic-btn ${isListening ? 'active' : ''}`}
                    onClick={handleMicClick}
                    title="Voice Input"
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            </div>
        </form>
    );
}
