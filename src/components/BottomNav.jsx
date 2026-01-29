import { Home, PieChart, TrendingUp, Settings } from 'lucide-react';

export function BottomNav({ activeTab, onTabChange }) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'investments', label: 'Invest', icon: TrendingUp },
        { id: 'settings', label: 'Settings', icon: Settings }, // Renamed from Profile
    ];

    return (
        <div className="bottom-nav-container">
            <div className="bottom-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                        >
                            <div className="icon-wrapper">
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            {/* Optional: Hide labels for cleaner floating look, or keep small */}
                            {/* <span className="nav-label">{item.label}</span> */}
                        </button>
                    );
                })}
            </div>

            <style>{`
                .bottom-nav-container {
                    position: fixed;
                    bottom: 1.5rem;
                    left: 0; right: 0;
                    display: flex;
                    justify-content: center;
                    z-index: 100;
                    pointer-events: none; /* Let clicks pass through outside the nav */
                }

                .bottom-nav {
                    pointer-events: auto;
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.5);
                    padding: 0.75rem 1.5rem;
                    border-radius: 2rem;
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }

                .nav-item {
                    background: none;
                    border: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    width: 44px;
                    height: 44px;
                }

                .nav-item:hover {
                    background: rgba(0,0,0,0.05);
                    transform: translateY(-2px);
                }

                .nav-item.active {
                    color: #fff;
                    background: #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    transform: translateY(-4px);
                }
                
                .nav-item.active .icon-wrapper {
                     transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}
