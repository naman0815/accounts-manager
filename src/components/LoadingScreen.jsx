import { useEffect, useState } from 'react';

export function LoadingScreen() {
    // Generate random positions for coins
    const coins = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 80 + 10 + '%',
        delay: Math.random() * 2 + 's',
        duration: Math.random() * 1.5 + 1.5 + 's'
    }));

    // Pig Path Data (The Outline)
    const pigBodyPath = "M19.72,10.47a11.65,11.65,0,0,0-6.31.52A.8.8,0,1,0,14,12.48,10.11,10.11,0,0,1,19.44,12a.8.8,0,1,0,.28-1.57Z M35.51,18.63a1,1,0,0,0-.84-.44,3.42,3.42,0,0,1-2.09-1.12,17.35,17.35,0,0,1-2.63-3.78l2.88-4.5A1.89,1.89,0,0,0,33,7a1.77,1.77,0,0,0-1.33-1,10.12,10.12,0,0,0-5.39.75,12.72,12.72,0,0,0-2.72,1.63,16.94,16.94,0,0,0-5.16-1.39C11.31,6.3,4.83,10.9,4,17H4a2.56,2.56,0,0,1-1.38-1.53,1.81,1.81,0,0,1,.14-1.4,1.19,1.19,0,0,1,.43-.43,1.08,1.08,0,0,0-1.12-1.85A3.31,3.31,0,0,0,.91,13a4,4,0,0,0-.33,3.08A4.76,4.76,0,0,0,3,18.95l.92.46a17.58,17.58,0,0,0,1.82,7l.17.38A23,23,0,0,0,9.2,31.88a1,1,0,0,0,.75.34h4.52a1,1,0,0,0,.92-1.38L15,29.94l1.18.13a20.33,20.33,0,0,0,4,0c.37.6.77,1.2,1.21,1.79a1,1,0,0,0,.8.41h4.34a1,1,0,0,0,.92-1.39c-.17-.4-.34-.83-.47-1.2-.18-.53-.32-1-.43-1.45A13.18,13.18,0,0,0,29.56,26a12.5,12.5,0,0,0,3,0,1,1,0,0,0,.78-.62l2.26-5.81A1,1,0,0,0,35.51,18.63Zm-3.78,5.44a11.37,11.37,0,0,1-2.35-.11h0a8.2,8.2,0,0,1-2.53-.87,1,1,0,0,0-.93,1.77,11.72,11.72,0,0,0,1.29.58,8,8,0,0,1-1.8,1.16l-1.06.48s.49,2.19.82,3.16H22.79c-.24-.34-1.45-2.36-1.45-2.36l-.67.09a18.53,18.53,0,0,1-4.25.12c-.66-.06-1.76-.2-2.62-.35l-1.55-.27s.63,2.43.75,2.74v0H10.42A20.57,20.57,0,0,1,7.76,26l-.18-.39A14.62,14.62,0,0,1,6,17.48c.54-5.19,6.12-9.11,12.19-8.54a15.47,15.47,0,0,1,5.08,1.48l.62.29.5-.47A10.29,10.29,0,0,1,27,8.54a8.25,8.25,0,0,1,4-.65l-3.38,5.29.25.5h0";

    return (
        <div className="loading-screen">
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
                    <svg
                        viewBox="0 0 36 36"
                        className="piggy-svg"
                    >
                        <defs>
                            {/* Mask: The "Void" inside the pig */}
                            <mask id="pig-inner-mask">
                                {/* Conservative shapes to fill the inside without spilling */}
                                {/* Main Body */}
                                <ellipse cx="18" cy="19" rx="11" ry="8.5" fill="white" />
                                {/* Snout Area */}
                                <circle cx="30" cy="15" r="3.5" fill="white" />
                                {/* Back Leg Area */}
                                <circle cx="11.5" cy="26" r="3" fill="white" />
                                {/* Front Leg Area */}
                                <circle cx="23.5" cy="26" r="3" fill="white" />
                                {/* Top Head/Ear Area */}
                                <circle cx="20" cy="10" r="3" fill="white" />

                                {/* Subtract Eye (Optional: if we want liquid behind eye, keep white. If hole, black) */}
                                {/* Typically piggy banks are solid, so liquid inside shows through eye hole if eye is hole. */}
                                {/* If outline has eye hole, then liquid behind it is fine. */}
                            </mask>
                        </defs>

                        {/* 1. Liquid Layer (Behind) */}
                        <g mask="url(#pig-inner-mask)">
                            {/* Background opacity (Empty state) */}
                            <rect x="0" y="0" width="36" height="36" fill="#fbbf24" opacity="0.1" />

                            {/* Rising Liquid */}
                            <rect
                                className="liquid-level"
                                x="0"
                                y="36"
                                width="36"
                                height="36"
                                fill="#fbbf24"
                            />
                        </g>

                        {/* 2. Outline Layer (Front) */}
                        <path
                            d={pigBodyPath}
                            fill="#334155"
                            stroke="none"
                        />
                        <circle cx="25.38" cy="16.71" r="1.36" fill="#334155" /> {/* Eye point if needed, or hole */}
                    </svg>
                </div>

                <div className="loading-text">Syncing...</div>
            </div>

            <style>{`
                .loading-screen {
                    position: fixed;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.2); 
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    overflow: hidden;
                    transition: opacity 0.5s ease;
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
                    width: 140px; /* Slightly larger for impact */
                    height: 140px;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.15));
                }

                .piggy-svg {
                    width: 100%;
                    height: 100%;
                }

                /* Liquid Animation */
                .liquid-level {
                    animation: rise 2.5s ease-in-out forwards;
                }

                @keyframes rise {
                    0% { y: 36; } 
                    100% { y: 0; }
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
                    top: -30px;
                    font-size: 20px;
                    color: #fbbf24;
                    font-weight: 800;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    opacity: 0;
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }

                @keyframes fall {
                    0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(60vh) rotate(360deg); opacity: 0; }
                }

                .loading-text {
                    font-weight: 700;
                    color: #475569;
                    font-size: 1rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    opacity: 0.9;
                }
            `}</style>
        </div>
    );
}
