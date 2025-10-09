import React, { useState } from "react";
import {
    IoHeartOutline as RawHeartOutline,
    IoHeart as RawHeart,
} from "react-icons/io5";
import { setNoticeBookmark } from "../services/bookMark.service";
import { formatNoticeDate, isNew } from "../utils/date";
import {departmentNameMap} from "./departmentMap";

// 아이콘 캐스팅(타입 충돌 우회)
type IconProps = { size?: number; color?: string; className?: string };
const IoHeart = RawHeart as unknown as React.ComponentType<IconProps>;
const IoHeartOutline = RawHeartOutline as unknown as React.ComponentType<IconProps>;


type NoticeCardProps = {
    notice: {
        id: string;
        title: string;
        link: string;
        category?: string;
        department?: string;
        date: string;
    };
    leftBarColor: string;
    dateColor: string;
    heartColor?: string;     // on 색
    heartOffColor?: string;  // off 색
    isBookmarked?: boolean;  // 부모가 상태를 줄 때 (컨트롤드)
    onToggleBookmark?: (id: string, next: boolean) => void;
    onNoticeClick: (event: React.MouseEvent<HTMLAnchorElement>, link: string) => void;
    tabs?: string;           // 현재 탭(학과 이름용)
    isBookmarkPage?: boolean;  // 북마크 페이지라면 앞에 #카테고리 붙이기
};

export default function NoticeCard({
                                       notice,
                                       leftBarColor,
                                       dateColor,
                                       heartColor = "#EF4C43",
                                       heartOffColor = "#C0C5CF",
                                       isBookmarked,
                                       onToggleBookmark,
                                       onNoticeClick,
                                       tabs,
                                       isBookmarkPage,
                                   }: NoticeCardProps) {
    // 컨트롤드 prop이 없을 때만 내부 로컬 상태 사용
    const [markedLocal, setMarkedLocal] = useState(false);
    const marked = isBookmarked ?? markedLocal;

    const handleToggle = async () => {
        const next = !marked;

        // 부모가 관리하면 부모 콜백만 호출
        if (onToggleBookmark) {
            onToggleBookmark(notice.id, next);
            return;
        }

        // 내부에서 관리하면 낙관적 업데이트 + 서버 호출
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

    // department가 관리자 -> 소프트웨어학과
    const departmentDisplayName = notice.department === '관리자' || notice.department === 'none' ? departmentNameMap[tabs ?? ""] : notice.department;

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
                    onClick={(e) => onNoticeClick(e, notice.link)} // props로 받은 함수를 실행
                >
                    {notice.title}
                </a>

                <div className="np-card-tags">
                    {isBookmarkPage && (
                        <span className="np-card-tag tabs">#{tabs}</span>
                    )}
                    {isNew(notice.date, 1) && (
                        <span className="np-card-tag today">#오늘</span>
                    )}
                    {notice.category && notice.category !== 'none' && (
                        <span className="np-card-tag">#{notice.category}</span>
                    )}
                    {departmentDisplayName && (
                        <span className="np-card-tag">#{departmentDisplayName}</span>
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
                    {marked ? <IoHeart size={24}/> : <IoHeartOutline size={24}/> }
                </button>
                {notice.date && (
                    <div className="np-card-date" style={{ color: dateColor }}>
                        {formatNoticeDate(notice.date)}
                    </div>
                )}
            </div>
        </div>
    );
}
