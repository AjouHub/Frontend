import React, { useEffect, useRef, useState, ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
    openByDefault?: boolean;
    onToggle?: (open: boolean) => void;
};

export default function ChipCollapse({
                                         children,
                                         className = "",
                                         openByDefault = false,
                                         onToggle,
                                     }: Props) {
    const [open, setOpen] = useState(openByDefault);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [max, setMax] = useState(0);

    useEffect(() => onToggle?.(open), [open, onToggle]);

    // 펼칠 때 내부 높이 측정
    useEffect(() => {
        if (!open) return;
        const el = bodyRef.current;
        if (!el) return;
        const run = () => setMax(el.scrollHeight);
        run();
        const ro = new ResizeObserver(run);
        ro.observe(el);
        return () => ro.disconnect();
    }, [open, children]);

    return (
        <div className={`mc ${open ? "open" : ""} ${className}`}>
            {/* (기존) mc-head 는 제거하거나 필요 없으면 그대로 삭제 */}
            {/* <button className="mc-head" ... /> */}

            {/* 본문: 높이 애니메이션 */}
            <div className="mc-body" style={{ maxHeight: open ? max : 0 }}>
                <div ref={bodyRef} className="mc-inner">
                    {children}
                </div>
            </div>

            {/* ▼ 토글 버튼을 절대배치가 아닌 '흐름 안'에 배치 */}
            <button
                type="button"
                className={`mc-toggle ${open ? "open" : ""}`}
                aria-label={open ? "칩 접기" : "칩 펼치기"}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(v => !v);
                }}
            >
                <svg viewBox="0 0 24 24" className={`chev ${open ? "up" : "down"}`}>
                    <path
                        d="M7 10l5 5 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}