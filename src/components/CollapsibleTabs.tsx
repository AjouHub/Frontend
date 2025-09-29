import React, { useEffect, useMemo, useRef, useState } from "react";

type TabItem = { label: string; content: React.ReactNode };

interface CollapsibleTabsProps {
    title: string,
    items: TabItem[];               // [{label, content}]
    openIndex: number | null;
    onTabClick: (index: number | null) => void;
}

export default function CollapsibleTabs({ title, items, openIndex, onTabClick }: CollapsibleTabsProps) {
    const [contentHeight, setContentHeight] = useState(0);
    const innerRef = useRef<HTMLDivElement>(null);
    // 화면에 '실제로 표시될' 컨텐츠를 위한 별도의 state
    const [displayedContent, setDisplayedContent] = useState<React.ReactNode>(() =>
        openIndex !== null ? items[openIndex]?.content : null
    );


    // 탭이 열리거나 다른 탭으로 전환될 때, 표시될 컨텐츠를 즉시 업데이트
    useEffect(() => {
        if (openIndex !== null) {
            setDisplayedContent(items[openIndex]?.content);
        }
        // 탭이 닫힐 때(openIndex가 null이 될 때)는 displayedContent를 안바꿈
    }, [openIndex, items]);

    // 표시될 컨텐츠가 변경되면, 그 높이를 다시 계산
    useEffect(() => {
        if (openIndex !== null && innerRef.current) {
            setContentHeight(innerRef.current.scrollHeight);
        }
    }, [openIndex, displayedContent]);

    // (내용 크기 변화를 추적하는 ResizeObserver는 그대로 유지)
    useEffect(() => {
        const el = innerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            if (openIndex !== null) setContentHeight(el.scrollHeight);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [openIndex]);

    const onClickTab = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // 헤더 클릭 이벤트 전파 방지
        const nextIndex = openIndex === index ? null : index;
        onTabClick(nextIndex); // 부모의 상태 변경 함수 호출
    };

    const onClickHeader = () => {
        // 헤더를 클릭하면 첫 번째 탭을 열거나 전체를 닫습니다.
        onTabClick(openIndex === null ? 0 : null);
    };


    return (
        <div className="collapsible-card">
            {/* 상단 가로 버튼들 */}
            <div className="collapsible-header" onClick={onClickHeader}>
                <span className="collapsible-title">{title}</span>

                <div className="tabs-row">
                    {items.map((it, i) => {
                        const active = openIndex === i;
                        return (
                            <button
                                key={i}
                                className={`tab-btn ${active ? "is-active" : ""}`}
                                onClick={(e) => onClickTab(i, e)}
                                type="button"
                            >
                                {it.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 아래 접히는 영역 */}
            <div
                className={`collapsible-content ${openIndex !== null ? "open" : ""}`}
                style={{ maxHeight: openIndex !== null ? contentHeight : 0 }}
                // 애니메이션이 끝난 후 실행될 이벤트 핸들러
                onTransitionEnd={() => {
                    // 탭이 닫혔을 때 (애니메이션이 끝난 후) 컨텐츠 제거
                    if (openIndex === null) {
                        setDisplayedContent(null);
                    }
                }}
            >
                <div ref={innerRef} className="collapsible-body">
                    {/* useMemo 대신 state인 displayedContent를 렌더링 */}
                    {displayedContent}
                </div>
            </div>
        </div>
    );
}
