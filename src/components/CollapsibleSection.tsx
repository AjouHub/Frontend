import React, { useState, ReactNode } from 'react';
// import './CollapsibleSection.css'; // 이 컴포넌트만을 위한 CSS를 만들 수도 있습니다.

// 재사용 가능한 아코디언(Collapsible) 섹션 컴포넌트
interface CollapsibleSectionProps {
    title: string;
    children: ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div className="collapsible-card">
            <button className="collapsible-header" onClick={toggleOpen}>
                <span className="collapsible-title">{title}</span>
                <span className={`collapsible-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="collapsible-content">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;