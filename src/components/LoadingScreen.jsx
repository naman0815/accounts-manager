export function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="gif-wrapper">
                {/* 
                   INSTRUCTIONS FOR USER:
                   1. Rename your GIF file to "loading.gif"
                   2. Paste it into the "public" folder of this project.
                */}
                <img
                    src={`${import.meta.env.BASE_URL}loading.gif?t=${Date.now()}`}
                    alt="Loading..."
                    className="loading-gif"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        document.getElementById('missing-text').style.display = 'block';
                    }}
                />

                {/* Fallback Text if GIF is missing */}
                <div id="missing-text" style={{ display: 'none', textAlign: 'center', color: '#64748b' }}>
                    <p style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>🐖</p>
                    <p>Add <strong>loading.gif</strong> to the <strong>public</strong> folder</p>
                </div>

                <div className="loading-text">Syncing...</div>
            </div>

            <style>{`
                .loading-screen {
                    position: fixed;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.4); 
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    transition: opacity 0.5s ease;
                }

                .gif-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }

                .loading-gif {
                    max-width: 150px; /* Adjust size as needed */
                    max-height: 150px;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border-radius: 12px;
                }

                .loading-text {
                    font-weight: 700;
                    color: #475569;
                    font-size: 0.9rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}
