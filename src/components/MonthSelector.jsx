import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MonthSelector({ currentDate, onMonthChange }) {
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        onMonthChange(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        onMonthChange(newDate);
    };

    return (
        <div className="month-selector glass-panel">
            <button onClick={handlePrev} className="month-nav-btn">
                <ChevronLeft size={20} />
            </button>
            <span className="month-label">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNext} className="month-nav-btn">
                <ChevronRight size={20} />
            </button>

            <style>{`
                .month-selector {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem 1rem;
                    margin-bottom: 1.5rem;
                }
                .month-nav-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center; justify-content: center;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .month-nav-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .month-label {
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: #f8fafc;
                }
            `}</style>
        </div>
    );
}
