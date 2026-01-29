import { Home, PieChart, TrendingUp, User } from 'lucide-react';

export function BottomNav({ activeTab, onTabChange }) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'investments', label: 'Invest', icon: TrendingUp },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
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
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="nav-label">{item.label}</span>
                    </button>
                );
            })}

            <style>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0; left: 0; right: 0;
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    padding: 0.5rem 1rem 1.5rem 1rem; /* Extra padding for iPhone home bar */
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    z-index: 100;
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .nav-item {
                    background: none;
                    border: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0.5rem;
                    transition: all 0.2s;
                    flex: 1;
                }

                .nav-item.active {
                    color: #3b82f6;
                }

                .nav-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
