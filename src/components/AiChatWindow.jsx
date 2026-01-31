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

    // If it's AI and empty, it might be starting to stream.
    // If we have content, just show it.

    return (
        <div className={`chat-message ${isAi ? 'ai' : 'user'}`}>
            <div className={`message-content`}>
                {isAi ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                    message.content
                )}
            </div>
        </div>
    );
};
