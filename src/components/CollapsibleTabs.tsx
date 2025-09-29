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

    // 현재 열린 탭의 content 노드가 바뀔 때 height 재계산
    useEffect(() => {
        if (openIndex === null || !innerRef.current) return;
        setContentHeight(innerRef.current.scrollHeight);
    }, [openIndex, items]);

    // 열린 상태에서 내부 내용 크기 변화를 추적 (칩 변화 등)
    useEffect(() => {
        const el = innerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            if (openIndex !== null) setContentHeight(el.scrollHeight);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [openIndex]);

    // 탭 버튼 클릭: 같은 탭이면 닫기(부드럽게), 다른 탭이면 전환
    // const onClickTab = (idx: number, e?: React.MouseEvent) => {
    //     e?.stopPropagation(); // 헤더 클릭으로 전파 방지
    //
    //     setOpenIndex(prev => {
    //         // 닫기: 현재 높이를 먼저 고정 → 다음 프레임에 0으로
    //         if (prev === idx) {
    //             if (innerRef.current) {
    //                 setContentHeight(innerRef.current.scrollHeight);
    //             }
    //             requestAnimationFrame(() => {
    //                 setOpenIndex(null);
    //             });
    //             return prev; // 일단 이전 상태 유지(다음 프레임에 null로 바뀜)
    //         }
    //         // 전환 또는 처음 열기: 일단 대상 인덱스로 열기
    //         return idx;
    //     });
    // };
    const onClickTab = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // 헤더 클릭 이벤트 전파 방지
        const nextIndex = openIndex === index ? null : index;
        onTabClick(nextIndex); // 부모의 상태 변경 함수 호출
    };

    // 헤더 클릭: 닫힘→0번 열기 / 열림→닫기 (원하면 제거 가능)
    // const onClickHeader = () => {
    //     if (openIndex === null) {
    //         setOpenIndex(0);
    //     } else {
    //         // 닫기 애니메이션
    //         if (innerRef.current) {
    //             setContentHeight(innerRef.current.scrollHeight);
    //         }
    //         requestAnimationFrame(() => setOpenIndex(null));
    //     }
    // };
    const onClickHeader = () => {
        // 헤더를 클릭하면 첫 번째 탭을 열거나 전체를 닫습니다.
        onTabClick(openIndex === null ? 0 : null);
    };


    const activeContent = useMemo(() =>
            (openIndex === null ? null : items[openIndex]?.content),
        [openIndex, items]
    );


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
            >
                <div ref={innerRef} className="collapsible-body">
                    {activeContent}
                </div>
            </div>
        </div>
    );
}
