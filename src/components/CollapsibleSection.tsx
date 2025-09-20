import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface CollapsibleSectionProps {
    title: string;
    children: ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const innerRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        // 열기 직전에 최신 scrollHeight로 맞춰주기
        if (!isOpen && innerRef.current) {
            setContentHeight(innerRef.current.scrollHeight);
        }
        setIsOpen(prev => !prev);
    };

    // 🔧 내용 높이 자동 추적 (칩 추가/삭제 등 내부 레이아웃 변경 포함)
    useEffect(() => {
        if (!innerRef.current) return;
        const el = innerRef.current;

        const ro = new ResizeObserver(() => {
            // 열려 있을 때만 max-height 갱신 (닫힌 상태는 굳이 갱신할 필요 X)
            if (isOpen) {
                // scrollHeight를 쓰면 margin/padding 포함한 전체 실제 높이로 안전
                setContentHeight(el.scrollHeight);
            }
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [isOpen]);

    // children이 통째로 바뀌는 경우도 초기 보정
    useEffect(() => {
        if (isOpen && innerRef.current) {
            setContentHeight(innerRef.current.scrollHeight);
        }
    }, [isOpen, children]);

    return (
        <div className="collapsible-card">
            <button className="collapsible-header" onClick={toggleOpen}>
                <span className="collapsible-title">{title}</span>
                <span className={`collapsible-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            <div
                className={`collapsible-content ${isOpen ? 'open' : ''}`}
                style={{ maxHeight: isOpen ? contentHeight : 0 }}
            >
                <div ref={innerRef} className="collapsible-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CollapsibleSection;
