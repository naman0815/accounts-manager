import { Home, PieChart, TrendingUp, Settings, Target } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function BottomNav({ activeTab, onTabChange }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const lastScrollY = useRef(0);

    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'investments', label: 'Invest', icon: TrendingUp },
        { id: 'goals', label: 'Goals', icon: Target },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Threshold to ignore small elastic scrolls
            if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                // Scrolling Down
                setIsCollapsed(true);
            } else {
                // Scrolling Up
                setIsCollapsed(false);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bottom-nav-container">
            <div
                className={`bottom-nav ${isCollapsed ? 'collapsed' : ''}`}
                onClick={() => isCollapsed && setIsCollapsed(false)}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={(e) => {
                                if (isCollapsed) return; // Prevent click when expanding
                                onTabChange(item.id);
                            }}
                            tabIndex={isCollapsed ? -1 : 0}
                        >
                            <div className="icon-wrapper">
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
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
                    pointer-events: none;
                }

                .bottom-nav {
                    pointer-events: auto;
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 0.75rem 1.5rem;
                    border-radius: 2rem;
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    /* Full size values */
                    width: auto;
                    height: auto;
                    overflow: hidden;
                }

                /* Collapsed State (Pill) */
                .bottom-nav.collapsed {
                    width: 60px;
                    height: 8px;
                    padding: 0;
                    gap: 0;
                    background: rgba(255, 255, 255, 0.3);
                    border-color: transparent;
                    border-radius: 100px;
                    cursor: pointer;
                    /* Push it down slightly or keep it in place? Keeping it in place looks cooler like a gesture bar */
                    transform: translateY(1rem); 
                }

                .bottom-nav.collapsed:hover {
                    background: rgba(255, 255, 255, 0.5);
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
                    transition: all 0.2s;
                    width: 44px;
                    height: 44px;
                    opacity: 1;
                    transform: scale(1);
                }

                .bottom-nav.collapsed .nav-item {
                    opacity: 0;
                    width: 0;
                    height: 0;
                    padding: 0;
                    margin: 0;
                    overflow: hidden;
                    pointer-events: none;
                }

                .nav-item:hover {
                    background: rgba(255,255,255,0.1);
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
