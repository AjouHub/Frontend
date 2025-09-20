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
            {/* 닫힘 상태에서 높이를 잡아주는 상단 바 */}
            {!open && (
                <button
                    type="button"
                    className="mc-head"
                    aria-expanded={open}
                    aria-label="칩 펼치기"
                    onClick={() => setOpen(true)}
                >
                    <svg viewBox="0 0 24 24" className="chev down">
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
            )}

            {/* 본문: 높이 애니메이션 */}
            <div className="mc-body" style={{ maxHeight: open ? max : 0 }}>
                <div ref={bodyRef} className="mc-inner">
                    {children}
                </div>
            </div>

            {/* 열렸을 때 하단 풀폭 토글 바 */}
            {open && (
                <button
                    type="button"
                    className="mc-toggle"
                    aria-label="칩 접기"
                    onClick={() => setOpen(false)}
                >
                    <svg viewBox="0 0 24 24" className="chev up">
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
            )}
        </div>
    );
}
