import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export const AiChatWindow = ({ conversation, isTyping }) => {
    const bottomRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isTyping]);

    return (
        <div className="ai-chat-window">
            {conversation.map((msg, idx) => (
                <ChatMessage
                    key={idx}
                    message={msg}
                    isLast={idx === conversation.length - 1}
                />
            ))}

            {isTyping && (
                <div className="chat-message ai">
                    <div className="message-content">
                        <div className="thinking-brain" style={{ fontSize: '1.5rem', animation: 'pulse 1.5s infinite' }}>
                            🧠
                        </div>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
};

const ChatMessage = ({ message, isLast }) => {
    const isAi = message.role === 'assistant' || message.role === 'ai';
    const [displayedContent, setDisplayedContent] = useState(isAi && isLast ? "" : message.content);
    const [isStreaming, setIsStreaming] = useState(isAi && isLast);

    // Streaming Logic
    useEffect(() => {
        if (!isAi || !isLast || !message.content) return;

        // If it's already fully displayed (e.g. from history), skip streaming
        if (displayedContent === message.content) {
            setIsStreaming(false);
            return;
        }

        let index = 0;
        const fullText = message.content;

        // Faster typing for long responses
        const speed = fullText.length > 500 ? 5 : 15;

        const interval = setInterval(() => {
            if (index < fullText.length) {
                setDisplayedContent((prev) => prev + fullText.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                setIsStreaming(false);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [message.content, isAi, isLast]);

    return (
        <div className={`chat-message ${isAi ? 'ai' : 'user'}`}>
            <div className={`message-content ${isStreaming ? 'streaming-text' : 'streaming-done'}`}>
                {isAi ? (
                    <ReactMarkdown>{displayedContent}</ReactMarkdown>
                ) : (
                    displayedContent
                )}
            </div>
        </div>
    );
};
