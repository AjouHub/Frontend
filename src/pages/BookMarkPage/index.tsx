import React, { JSX, useEffect, useState } from "react";
import { fetchUserInfo } from "../../services/fetchUserInfo";
import type { UserInfo } from "../../types/user";
import type { BookMark } from "../../types/bookmark";
import NoticeCard from "../../components/NoticeCard";
import { listNoticeBookmarks, setNoticeBookmark } from "../../services/bookMark.service";
import "./BookMarkPage.css";


/** 색상 토큰 (디자인 시안) */
const STONE_GRAY = "#8D96A8";
const AURA_BLUE = "#BBDEFB";
const ACCENT_ORANGE = "#6495ED";
const TEAL_GREEN = "#0D47A1";
const LAVENDER_PURPLE = "#000080";

type GeneralTabKey = "general" | "scholarship" | "dormitory" | "department";


// 북마크 카드 색깔
const tabColorMap = new Map<string, string>([
    ["general", AURA_BLUE],
    ["scholarship", ACCENT_ORANGE],
    ["dormitory", TEAL_GREEN],
    ["department", LAVENDER_PURPLE],
]);

/* 정렬 우선순위 테이블 */
const TYPE_ORDER: Record<GeneralTabKey, number> = {
    general: 0,
    scholarship: 1,
    dormitory: 2,
    department: 3,
};

/* 들어오는 문자열을 내부 키로 정규화 */
const normalizeType = (raw?: string): GeneralTabKey => {
    const head = (raw ?? "").toLowerCase().split(".")[0]; // 'department.software' → 'department'
    switch (head) {
        case "department":  return "department";
        case "dormitory":   return "dormitory";
        case "scholarship": return "scholarship";
        case "general":     return "general";
        default:            return "general"; // 안전한 기본값
    }
};

const getLeftBarColor = (cat?: string)=>
    tabColorMap.get(cat ?? "") ?? LAVENDER_PURPLE;

export function BookMarkPage(): JSX.Element {
    const [user, setUser] = useState<UserInfo | null>(null);

    // 목록/페이지
    const [notices, setNotices] = useState<BookMark[]>([]);
    // const [page, setPage] = useState(0);
    // const [totalPages, setTotalPages] = useState(1);

    // 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState<number | string | null>(null);

    // 공지사항 type으로 정렬
    function sortNoticesByType(list: BookMark[]): BookMark[] {
        return [...list].sort((a, b) => {
            const ka = normalizeType(a.type);
            const kb = normalizeType(b.type);
            return TYPE_ORDER[ka] - TYPE_ORDER[kb];
        });
    }

    // 북마크 ID 집합
    const [bookmarksID, setBookmarksID] = useState<Set<string>>(new Set());
    const loadBookmarks = async () => {
        setLoading(true);
        try {
            const items = await listNoticeBookmarks();
            setNotices(sortNoticesByType(items)); // 화면에 표시될 공지 목록을 업데이트
            setBookmarksID(new Set(items.map(b => String(b.id))));
        } catch (e) {
            console.warn('북마크 목록 로드 실패:', e);
            setNotices([]); // 실패 시 목록 비우기
        } finally {
            setLoading(false);
        }
    };

    // 초기 데이터 (유저)
    useEffect(() => {
        (async () => {
            try {
                const u = await fetchUserInfo();
                setUser(u);
            } catch (e: any) {
                setError(e?.message ?? "데이터 오류");
                setStatus(e?.status ?? "Unknown");
            }
        })();
    }, []);

    // 유저 로드 후 북마크 목록 가져오기
    useEffect(() => {
        (async () => {
            if (!user) return;
            await loadBookmarks();
        })();
    }, [user]);


    // 실제 토글 로직(비동기) — id는 string
    const handleToggleBookmark = async (id: string, next: boolean) => {
        // 이 함수는 북마크 '설정'만 하고, 목록 로딩은 별도로 처리합니다.
        try {
            await setNoticeBookmark(id, next);
            // 북마크 상태 변경 성공 후, 목록을 다시 불러와 페이지를 새로고침합니다.
            await loadBookmarks();
        } catch (e: any) {
            alert(e?.message ?? '북마크 처리에 실패했습니다.');
            // 실패 시에도 최신 상태를 받아오기 위해 목록을 다시 로드할 수 있습니다.
            await loadBookmarks();
        }
    };

    const handleNoticeClick = (event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
        // window.AURA 객체와 openNotice 함수가 모두 존재하면 앱 모드로 간주
        if (window.AURA?.openNotice) {
            event.preventDefault(); // a 태그의 기본 링크 이동 동작(새 탭 열기)을 막음
            window.AURA.openNotice(link); // 네이티브 함수를 호출하여 앱 내 오버레이 웹뷰로 상세 페이지를 염
        }
    };


    return (
        <div className="np-root">
            <div className="np-bookmark-container">
                {/* ───────── 공지 카드 리스트 ───────── */}
                <ul className="np-card-list">
                    {notices.length > 0 ? (
                        notices.map((n) => (
                            <li key={n.id}>
                                <NoticeCard
                                    notice={n}
                                    // leftBarColor={AURA_BLUE}
                                    leftBarColor={getLeftBarColor(n.type)}
                                    dateColor={STONE_GRAY}
                                    heartColor="#EF4C43"
                                    heartOffColor="#C0C5CF"
                                    isBookmarked={bookmarksID.has(n.id)}       // {/* ✅ 하트 ON/OFF */}
                                    onToggleBookmark={handleToggleBookmark}   // {/* ✅ 클릭 처리 */}
                                    onNoticeClick={handleNoticeClick}
                                />
                            </li>
                        ))
                    ) : (
                        <li className="np-empty">저장한 공지사항이 없습니다.</li>
                    )}
                </ul>

                {/* ───────── 로딩 오버레이 (검색/헤더 유지) ───────── */}
                {loading && (
                    <div className="np-loading-overlay">
                        <div className="np-spinner" aria-label="로딩 중"/>
                    </div>
                )}
            </div>
        </div>
    );
}
