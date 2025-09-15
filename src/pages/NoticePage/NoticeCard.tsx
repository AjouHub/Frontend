// ✅ 상단 import
import { useState } from "react";
import { setNoticeBookmark } from "../../services/bookMark";

type NoticeCardProps = {
    notice: {
        id: string | number;
        title: string;
        link?: string;
        category?: string;
        department?: string;
        date?: string;
        tags?: string[];
    };
    leftBarColor: string;
    dateColor: string;
    heartColor?: string;     // on 색
    heartOffColor?: string;  // off 색
    isBookmarked?: boolean;  // 부모가 상태를 줄 때 (컨트롤드)
    onToggleBookmark?: (id: string | number, next: boolean) => void;
};

export default function NoticeCard({
                                       notice,
                                       leftBarColor,
                                       dateColor,
                                       heartColor = "#FFA852",
                                       heartOffColor = "#C0C5CF",
                                       isBookmarked,
                                       onToggleBookmark,
                                   }: NoticeCardProps) {
    // 컨트롤드 prop이 없을 때만 내부 로컬 상태 사용
    const [markedLocal, setMarkedLocal] = useState(false);
    const marked = isBookmarked ?? markedLocal;

    const handleToggle = async () => {
        const next = !marked;

        // 1) 부모가 관리하면 부모 콜백만 호출
        if (onToggleBookmark) {
            onToggleBookmark(notice.id, next);
            return;
        }

        // 2) 내부에서 관리하면 낙관적 업데이트 + 서버 호출
        setMarkedLocal(next);
        try {
            await setNoticeBookmark(notice.id, next);
        } catch (e) {
            // 실패 시 롤백
            setMarkedLocal(!next);
            console.error(e);
            alert((e as any)?.message ?? "북마크 처리에 실패했습니다.");
        }
    };

    return (
        <div className="np-card">
            {/* 좌측 컬러 바 */}
            <div className="np-card-bar" style={{ background: leftBarColor }} />

            {/* 본문 */}
            <div className="np-card-body">
                <a
                    className="np-card-title"
                    href={notice.link || "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    {notice.title}
                </a>

                <div className="np-card-tags">
                    {notice.tags?.length ? (
                        notice.tags.map((t) => (
                            <span key={t} className="np-card-tag">#{t}</span>
                        ))
                    ) : (
                        <>
                            {notice.category && (
                                <span className="np-card-tag">#{notice.category}</span>
                            )}
                            {notice.department && (
                                <span className="np-card-tag">#{notice.department}</span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 우측 – 하트 + 날짜 */}
            <div className="np-card-side">
                <button
                    className="np-heart"
                    onClick={handleToggle}
                    aria-label="북마크"
                    title="북마크"
                    style={{ color: marked ? heartColor : heartOffColor }}
                >
                    <svg viewBox="0 0 24 24" className="np-heart-ico">
                        {marked ? (
                            <path
                                d="M12 21s-7.5-4.35-9.75-8.1C-0.4 8.8 2.33 4.5 6.6 5.2 8.22 5.47 9.55 6.6 12 9c2.45-2.4 3.78-3.53 5.4-3.8 4.27-.7 7 3.6 4.35 7.7C19.5 16.65 12 21 12 21Z"
                                fill="currentColor"
                            />
                        ) : (
                            <path
                                d="M12 20.5s-7.22-4.19-9.38-7.84c-2.3-3.86.45-7.93 4.45-7.27 1.84.3 3.28 1.62 4.93 3.24 1.65-1.62 3.09-2.94 4.93-3.24 4-.66 6.75 3.41 4.45 7.27C19.22 16.31 12 20.5 12 20.5Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </svg>
                </button>

                {notice.date && (
                    <div className="np-card-date" style={{ color: dateColor }}>
                        {notice.date}
                    </div>
                )}
            </div>
        </div>
    );
}
