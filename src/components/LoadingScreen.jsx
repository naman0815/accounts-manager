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
                    {/* 1. Liquid Fill Layer (Behind) */}
                    <div className="piggy-liquid-mask">
                        <div className="piggy-liquid"></div>
                    </div>

                    {/* 2. Outline Layer (Front) - The User's SVG */}
                    {/* We use the user's SVG as a mask/outline on top of the liquid */}
                    <svg
                        viewBox="0 0 36 36"
                        className="piggy-outline"
                        fill="#334155"
                    >
                        <path d="M19.72,10.47a11.65,11.65,0,0,0-6.31.52A.8.8,0,1,0,14,12.48,10.11,10.11,0,0,1,19.44,12a.8.8,0,1,0,.28-1.57Z"></path><circle cx="25.38" cy="16.71" r="1.36"></circle><path d="M35.51,18.63a1,1,0,0,0-.84-.44,3.42,3.42,0,0,1-2.09-1.12,17.35,17.35,0,0,1-2.63-3.78l2.88-4.5A1.89,1.89,0,0,0,33,7a1.77,1.77,0,0,0-1.33-1,10.12,10.12,0,0,0-5.39.75,12.72,12.72,0,0,0-2.72,1.63,16.94,16.94,0,0,0-5.16-1.39C11.31,6.3,4.83,10.9,4,17H4a2.56,2.56,0,0,1-1.38-1.53,1.81,1.81,0,0,1,.14-1.4,1.19,1.19,0,0,1,.43-.43,1.08,1.08,0,0,0-1.12-1.85A3.31,3.31,0,0,0,.91,13a4,4,0,0,0-.33,3.08A4.76,4.76,0,0,0,3,18.95l.92.46a17.58,17.58,0,0,0,1.82,7l.17.38A23,23,0,0,0,9.2,31.88a1,1,0,0,0,.75.34h4.52a1,1,0,0,0,.92-1.38L15,29.94l1.18.13a20.33,20.33,0,0,0,4,0c.37.6.77,1.2,1.21,1.79a1,1,0,0,0,.8.41h4.34a1,1,0,0,0,.92-1.39c-.17-.4-.34-.83-.47-1.2-.18-.53-.32-1-.43-1.45A13.18,13.18,0,0,0,29.56,26a12.5,12.5,0,0,0,3,0,1,1,0,0,0,.78-.62l2.26-5.81A1,1,0,0,0,35.51,18.63Zm-3.78,5.44a11.37,11.37,0,0,1-2.35-.11h0a8.2,8.2,0,0,1-2.53-.87,1,1,0,0,0-.93,1.77,11.72,11.72,0,0,0,1.29.58,8,8,0,0,1-1.8,1.16l-1.06.48s.49,2.19.82,3.16H22.79c-.24-.34-1.45-2.36-1.45-2.36l-.67.09a18.53,18.53,0,0,1-4.25.12c-.66-.06-1.76-.2-2.62-.35l-1.55-.27s.63,2.43.75,2.74v0H10.42A20.57,20.57,0,0,1,7.76,26l-.18-.39A14.62,14.62,0,0,1,6,17.48c.54-5.19,6.12-9.11,12.19-8.54a15.47,15.47,0,0,1,5.08,1.48l.62.29.5-.47A10.29,10.29,0,0,1,27,8.54a8.25,8.25,0,0,1,4-.65l-3.38,5.29.25.5h0a21.16,21.16,0,0,0,3.31,4.84,6.49,6.49,0,0,0,2.14,1.39Z"></path>
                    </svg>
                </div>

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
                    width: 120px;
                    height: 120px;
                }

                .piggy-outline {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 10;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                }

                /* Liquid Container (Behind the outline) */
                .piggy-liquid-mask {
                    position: absolute;
                    bottom: 15px; /* Adjust to align with feet/body bottom */
                    left: 10px;
                    width: 100px;
                    height: 80px;
                    z-index: 5;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    /* Clip closer to pig shape to avoid spilling outside lines */
                    clip-path: ellipse(48% 45% at 50% 50%);
                }

                .piggy-liquid {
                    width: 100%;
                    background: #fbbf24;
                    /* Using a simple box that fills up */
                    height: 0%;
                    animation: liquidFill 1.5s ease-out forwards;
                    box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
                }

                @keyframes liquidFill {
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
                    font-weight: 700;
                    color: #475569;
                    font-size: 1rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    opacity: 0.9;
                    text-shadow: 0 1px 2px rgba(255,255,255,0.5);
                }
            `}</style>
        </div>
    );
}
