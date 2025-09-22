// pages/NoticePage/index.tsx
import React, { JSX, useEffect, useMemo, useState } from "react";
import { fetchUserInfo } from "../../services/fetchUserInfo";
import { fetchNotices } from "../../services/fetchNotices";
import type { UserInfo } from "../../types/user";
import type { BookMark } from "../../types/bookmark";
import { Global_Tags } from "../../utils/tags";
import NoticeCard from "../../components/NoticeCard";
import { listNoticeBookmarks, setNoticeBookmark } from "../../services/bookMark.service";



/** 색상 토큰 (디자인 시안) */
const AURA_BLUE = "#4A6DDB";
const ACCENT_ORANGE = "#FFA852";
const STONE_GRAY = "#8D96A8";

type GeneralTabKey = "general" | "scholarship" | "dormitory" | "department";
type DeptKey = string;

type TopTab =
    | { key: "general"; label: "일반" }
    | { key: "scholarship"; label: "장학" }
    | { key: "dormitory"; label: "생활관" }
    | { key: "department"; label: "학과" };

const TOP_TABS: TopTab[] = [
    { key: "general", label: "일반" },
    { key: "scholarship", label: "장학" },
    { key: "dormitory", label: "생활관" },
    { key: "department", label: "학과" },
];

export default function BookMarkPage(): JSX.Element {
    const [user, setUser] = useState<UserInfo | null>(null);

    // 상단 탭(일반/장학/생활관/학과)
    const [tab, setTab] = useState<GeneralTabKey>("general");

    // 학과 탭일 때 선택된 학과 키(백엔드 type으로 사용)
    const [deptType, setDeptType] = useState<DeptKey>("");

    // 목록/페이지
    const [notices, setNotices] = useState<BookMark[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState<number | string | null>(null);

    const [selectedGlobalIds, setGlobalIds] = useState<string>("");
    const [selectedPersonalIds, setSelectedPersonalIds] = useState<string>("");

    // ✅ 북마크 ID 집합
    const [bookmarksID, setBookmarksID] = useState<Set<string>>(new Set());


    // 초기 데이터 (유저)
    useEffect(() => {
        (async () => {
            try {
                const u = await fetchUserInfo();
                setUser(u);

                const firstDept = u?.departments?.[0] || "";
                setDeptType(firstDept);
                setTab("general");
            } catch (e: any) {
                setError(e?.message ?? "데이터 오류");
                setStatus(e?.status ?? "Unknown");
            }
        })();
    }, []);

    // 유저 로드 후 북마크 목록 가져오기
    useEffect(() => {
        if (!user) return;
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const items = await listNoticeBookmarks(); // BookMark[]
                if (!alive) return;
                setNotices(items);
                setBookmarksID(new Set(items.map(b => String(b.id))));
            } catch (e) {
                console.warn('북마크 목록 로드 실패:', e);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [user]);


    /** 실제 토글 로직(비동기) — id는 string */
    const handleToggleBookmark = async (id: string, next: boolean) => {
        const key = String(id);

        // 낙관적 업데이트
        setBookmarksID(prev => {
            const s = new Set(prev);
            next ? s.add(key) : s.delete(key);
            return s;
        });

        try {
            await setNoticeBookmark(id, next);
        } catch (e: any) {
            // 롤백
            setBookmarksID(prev => {
                const s = new Set(prev);
                next ? s.delete(key) : s.add(key);
                return s;
            });
            alert(e?.message ?? '북마크 처리에 실패했습니다.');
        }
    };

    const handleNoticeClick = (event: React.MouseEvent<HTMLAnchorElement>, link: string) => {
        // window.AURA 객체와 openNotice 함수가 모두 존재하면 앱 모드로 간주
        if (window.AURA?.openNotice) {
            event.preventDefault(); // a 태그의 기본 링크 이동 동작(새 탭 열기)을 막음
            window.AURA.openNotice(link); // 네이티브 함수를 호출하여 앱 내 오버레이 웹뷰로 상세 페이지를 염
        }
        // 앱 모드가 아니면(일반 브라우저이면) 아무것도 하지 않습니다.
        // 그러면 a 태그의 기본 동작(href와 target="_blank"에 따라 새 탭으로 열기)이 실행됩니다.
    };

    /** 렌더 */
    if (loading && !notices.length) {
        return (
            <div className="np-container">
                <div className="np-loading">로딩 중…</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="np-container">
                <p className="np-error">
                    {error}
                    <br />
                    상태 코드: {status}
                </p>
            </div>
        );
    }

    return (
        <div className="np-root">
            <div className="np-container">
                {/* ───────── 상단 탭 ───────── */}
                <nav className="np-tabs">
                    {TOP_TABS.map((t) => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                className={`np-tab ${active ? "is-active" : ""}`}
                                onClick={() => {
                                    setTab(t.key);
                                    setPage(0);
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </nav>

                {/* ───────── 공지 카드 리스트 ───────── */}
                <ul className="np-card-list">
                    {notices.length > 0 ? (
                        notices.map((n) => (
                            <li key={n.id}>
                                <NoticeCard
                                    notice={n}
                                    leftBarColor={AURA_BLUE}
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
                        <li className="np-empty">공지사항이 없습니다.</li>
                    )}
                </ul>

                {/* ───────── 페이지네이션 ───────── */}
                {totalPages > 1 && (
                    <div className="np-paging">
                        <button
                            className="np-page-arrow"
                            disabled={page <= 0}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            aria-label="이전"
                        >
                            ‹
                        </button>

                        <div className="np-page-nums">
                            {Array.from({ length: Math.min(6, totalPages) }).map((_, i) => {
                                const start = Math.floor(page / 6) * 6;
                                const p = start + i;
                                if (p >= totalPages) return null;
                                const active = page === p;
                                return (
                                    <button
                                        key={p}
                                        className={`np-page-txt ${active ? "is-active" : ""}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className="np-page-arrow is-next"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            aria-label="다음"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
