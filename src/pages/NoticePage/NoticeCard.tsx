import React from "react";

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
    leftBarColor: string;  // 좌측 세로 바 색 (시안: 아주 블루)
    dateColor: string;     // 날짜 글자색 (회색)
    heartColor: string;    // 북마크 on 색 (오렌지)
};

export default function NoticeCard({
                                       notice,
                                       leftBarColor,
                                       dateColor,
                                       heartColor,
                                   }: NoticeCardProps) {
    const [marked, setMarked] = React.useState(false);

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
                            <span key={t} className="np-card-tag">
                #{t}
              </span>
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
                    onClick={() => setMarked((v) => !v)}
                    aria-label="북마크"
                    title="북마크"
                    style={{ color: marked ? heartColor : "#C0C5CF" }}
                >
                    {/* 하트 아이콘 (시안 느낌) */}
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
