export function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="piggy-wrapper">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="piggy-svg"
                >
                    <defs>
                        <linearGradient id="gold-fill" x1="0" x2="0" y1="1" y2="0">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="0%" stopColor="#fbbf24" className="animate-fill">
                                <animate
                                    attributeName="offset"
                                    values="0%;100%"
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="0.1%" stopColor="#e2e8f0" className="animate-fill-bg">
                                <animate
                                    attributeName="offset"
                                    values="0%;100%"
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="100%" stopColor="#e2e8f0" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#gold-fill)"
                        stroke="#94a3b8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 5c-1.5 0-2.8 0.6-3.5 1.5l-1 1.3c-0.6 0.8-1.7 1.2-2.8 1.2h-5.4c-1.1 0-2.1 0.4-2.8 1.2l-1 1.3c-0.7 0.9-2 1.5-3.5 1.5v0c-1.7 0-3 1.3-3 3v2c0 1.7 1.3 3 3 3h16c1.7 0 3-1.3 3-3v-2c0-1.7-1.3-3-3-3v0z"
                    />
                    <path
                        fill="url(#gold-fill)"
                        stroke="#94a3b8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 5v-2c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2"
                    />
                    {/* Coin slot */}
                    <path
                        d="M12 9v2"
                        stroke="#cbd5e1"
                        strokeWidth="2"
                    />
                    {/* Simplify simpler piggy shape for icon set compatibility if needed */}
                    <path
                        d="M20.5 10c0-3-2.5-5.5-5.5-5.5h-1c-.8-1.5-2.3-2.5-4-2.5S6.8 3 6 4.5H5C2 4.5 0 7 0 10v3c0 1.1.9 2 2 2h1v4h4v-4h10v4h4v-4h1c1.1 0 2-.9 2-2v-3z"
                        fill="url(#gold-fill)"
                        stroke="#475569"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M16 11h.01"
                        stroke="#475569"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="loading-text">Syncing...</div>
            </div>
            <style>{`
                .loading-screen {
                    position: fixed;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.1); 
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    transition: opacity 0.3s ease;
                }
                .piggy-wrapper {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                .piggy-svg {
                    width: 80px;
                    height: 80px;
                }
                .loading-text {
                    font-weight: 600;
                    color: #64748b;
                    font-size: 1.1rem;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
