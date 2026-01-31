import { useState } from 'react';
import { parseMultipleExpenses } from '../utils/parser';
import { StorageService } from '../services/storage';
import { Mic, MicOff, X } from 'lucide-react';
import { AiChatWindow } from './AiChatWindow';

const AiIcon = ({ color }) => (
    <svg fill={color || "currentColor"} viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }}>
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
            <path d="M208.8584,144a15.85626,15.85626,0,0,1-10.46778,15.01367l-52.16015,19.2168-19.2168,52.16015a16.00075,16.00075,0,0,1-30.02734,0l-19.2168-52.16015-52.16015-19.2168a16.00075,16.00075,0,0,1,0-30.02734l52.16015-19.2168,19.2168-52.16015a16.00075,16.00075,0,0,1,30.02734,0l19.2168,52.16015,52.16015,19.2168A15.85626,15.85626,0,0,1,208.8584,144Z"></path>
        </g>
    </svg>
);

export function ExpenseInput({ onAdd }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI State
    const [isAiMode, setIsAiMode] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // AI Chat State
    const [chatMode, setChatMode] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    // Handlers
    const closeChat = () => {
        setChatMode(false);
        setConversation([]);
        setIsAiMode(false);
        setInput('');
        setIsLoadingAi(false); // Fix bug: clear loading state
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isSubmitting || isLoadingAi) return;

        if (isAiMode) {
            await handleAiSubmit();
            return;
        }

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

    const handleAiSubmit = async () => {
        if (!input.trim()) return;
        setIsLoadingAi(true);
        setAiResponse(null);

        try {
            const settings = StorageService.getAiSettings();
            const token = settings.token;

            if (!token) {
                alert("Please add your Hugging Face Token in Settings!");
                setIsTyping(false);
                setIsLoadingAi(false);
                return;
            }

            // Enter Chat Mode immediately
            setChatMode(true);
            setIsTyping(true);
            setIsLoadingAi(false);

            // Add user message to UI
            const userMsg = { role: 'user', content: input };
            setConversation(prev => [...prev, userMsg]);

            // Context snapshot
            const financeData = await StorageService.getAllFinanceData();
            setInput('');

            // Initialize HF
            const { HfInference } = await import("@huggingface/inference");
            const hf = new HfInference(token);

            const systemPrompt = `You are a personal finance analyst AI.
Answer based ONLY on the provided JSON data.

Data:
${JSON.stringify(financeData)}

Rules:
- Be concise, friendly, and helpful.
- If data is missing, say so.
- Format with Markdown.
`;

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMsg.content }
            ];

            // Create placeholder for assistant response
            setConversation(prev => [...prev, { role: 'assistant', content: '' }]);

            let fullText = '';

            // Streaming Chat Completion
            for await (const chunk of hf.chatCompletionStream({
                model: "Qwen/Qwen2.5-7B-Instruct",
                messages: messages,
                max_tokens: 1000,
                temperature: 0.5
            })) {
                if (chunk.choices && chunk.choices[0]?.delta?.content) {
                    const chunkText = chunk.choices[0].delta.content;
                    fullText += chunkText;

                    setConversation(prev => {
                        const newConv = [...prev];
                        const lastMsg = newConv[newConv.length - 1];
                        if (lastMsg.role === 'assistant') {
                            lastMsg.content = fullText;
                        }
                        return newConv;
                    });
                }
            }

            setIsTyping(false);

        } catch (error) {
            console.error(error);
            setConversation(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
            setIsTyping(false);
        }
    };

    const toggleListening = () => {
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

    // --- RENDER HELPERS ---

    const renderInputBox = () => (
        <div className={`input-wrapper ${isListening ? 'listening' : ''} ${isAiMode ? 'ai-mode' : ''}`}>
            <textarea
                className={`expense-input glass-panel ${error ? 'shake-error' : ''}`}
                placeholder=""
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSubmitting || isTyping}
                rows={1}
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (isAiMode) handleAiSubmit();
                        else handleSubmit(e);
                    }
                }}
            />

            <div className="action-buttons" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '5px' }}>
                <button
                    type="button"
                    className={`mic-btn ${isAiMode ? 'active-ai' : ''}`}
                    onClick={() => {
                        if (!chatMode) {
                            setIsAiMode(!isAiMode);
                            setInput('');
                            setAiResponse(null);
                        }
                    }}
                    title="Toggle AI Mode"
                    disabled={isSubmitting}
                    style={{ color: isAiMode ? '#f472b6' : 'inherit' }}
                >
                    <AiIcon color={isAiMode ? '#f472b6' : undefined} />
                </button>
                <button
                    type="button"
                    className={`mic-btn ${isListening ? 'active' : ''}`}
                    onClick={toggleListening}
                    title="Voice Input"
                    disabled={isSubmitting}
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            </div>
        </div>
    );

    if (chatMode) {
        return (
            <div className="chat-mode-container">
                <button className="chat-close-btn" onClick={closeChat}>
                    <X size={20} />
                </button>

                <AiChatWindow conversation={conversation} isTyping={isTyping} />

                <div className="chat-input-dock">
                    {renderInputBox()}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="input-section">
            {renderInputBox()}

            {/* Show old static response only if NOT in chat mode (legacy fallback) */}
            {isAiMode && aiResponse && !chatMode && (
                <div className="ai-response-card glass-panel" style={{ marginTop: '1rem', padding: '1rem' }}>
                    {aiResponse}
                </div>
            )}

            {isLoadingAi && !chatMode && (
                <div style={{ textAlign: 'center', marginTop: '1rem', color: '#94a3b8' }}>
                    Thinking...
                </div>
            )}
        </form>
    );
}
