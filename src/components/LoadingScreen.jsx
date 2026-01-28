import { useEffect, useState } from 'react';

export function LoadingScreen() {
    // Generate random positions for coins once on mount
    const coins = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        left: Math.random() * 60 + 20 + '%', // Random horizontal position 20-80%
        delay: Math.random() * 1.5 + 's',
        duration: Math.random() * 1 + 1 + 's'
    }));

    return (
        <div className="loading-screen">
            {/* Falling Coins Container */}
            <div className="coins-container">
                {coins.map((coin) => (
                    <div
                        key={coin.id}
                        className="coin"
                        style={{
                            left: coin.left,
                            animationDelay: coin.delay,
                            animationDuration: coin.duration
                        }}
                    >
                        $
                    </div>
                ))}
            </div>

            <div className="piggy-wrapper">
                <div className="piggy-container">
                    {/* Background Pig (Gray/Empty) */}
                    <svg
                        viewBox="0 0 24 24"
                        className="piggy-base"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            d="M19 5c-1.5 0-2.8 0.6-3.5 1.5l-1 1.3c-0.6 0.8-1.7 1.2-2.8 1.2h-5.4c-1.1 0-2.1 0.4-2.8 1.2l-1 1.3c-0.7 0.9-2 1.5-3.5 1.5v0c-1.7 0-3 1.3-3 3v2c0 1.7 1.3 3 3 3h16c1.7 0 3-1.3 3-3v-2c0-1.7-1.3-3-3-3v0z M16 5v-2c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2 M12 9v2"
                            stroke="#94a3b8"
                            fill="#e2e8f0"
                        />
                    </svg>

                    {/* Foreground Pig (Gold/Filling) */}
                    <div className="piggy-fill-mask">
                        <svg
                            viewBox="0 0 24 24"
                            className="piggy-gold"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path
                                d="M19 5c-1.5 0-2.8 0.6-3.5 1.5l-1 1.3c-0.6 0.8-1.7 1.2-2.8 1.2h-5.4c-1.1 0-2.1 0.4-2.8 1.2l-1 1.3c-0.7 0.9-2 1.5-3.5 1.5v0c-1.7 0-3 1.3-3 3v2c0 1.7 1.3 3 3 3h16c1.7 0 3-1.3 3-3v-2c0-1.7-1.3-3-3-3v0z M16 5v-2c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2 M12 9v2"
                                stroke="#b45309"
                                fill="#fbbf24"
                            />
                        </svg>
                    </div>
                </div>

                <div className="loading-text">Syncing...</div>
            </div>

            <style>{`
                .loading-screen {
                    position: fixed;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.2); 
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    overflow: hidden;
                    transition: opacity 0.3s ease;
                }

                .piggy-wrapper {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    z-index: 20;
                }

                .piggy-container {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }

                .piggy-base, .piggy-gold {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                /* Mask wrapper to animate height/filling */
                .piggy-fill-mask {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 0%; /* Start empty */
                    overflow: hidden;
                    animation: fillUp 1.5s ease-out forwards;
                }
                
                /* The gold pig inside the mask needs to stay fixed size, 
                   so we set height to 100px (container height) and position it 
                   relative to the bottom so it doesn't squat when mask shrinks. */
                .piggy-fill-mask svg {
                    height: 100px;
                    width: 100px;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                }

                @keyframes fillUp {
                    0% { height: 0%; }
                    100% { height: 100%; }
                }

                /* Coins */
                .coins-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 10;
                }

                .coin {
                    position: absolute;
                    top: -20px;
                    font-size: 24px;
                    color: #fbbf24;
                    font-weight: bold;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    opacity: 0;
                    animation-name: fall;
                    animation-timing-function: ease-in;
                    animation-iteration-count: infinite;
                }

                @keyframes fall {
                    0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
                }

                .loading-text {
                    font-weight: 600;
                    color: #64748b;
                    font-size: 1.1rem;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}
