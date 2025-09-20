// pages/NoticePage/index.tsx
import React, { JSX, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import "./NoticePage.css";
import { fetchUserInfo } from "../../services/fetchUserInfo";
import { fetchNotices } from "../../services/fetchNotices";
import type { Notice } from "../../types/notice";
import type { UserInfo } from "../../types/user";
import type { Keyword } from "../../types/keywords";
import { Global_Tags } from "../../utils/tags";
import NoticeCard from "../../components/NoticeCard";
import ChipCollapse from "../../components/ChipCollapse";
import { listKeywords } from "../../services/settings.service";
import { listNoticeBookmarks, setNoticeBookmark } from "../../services/bookMark.service";
import { departmentNameMap } from "../../components/departmentMap";



/** 색상 토큰 (디자인 시안) */
const AURA_BLUE = "#4A6DDB";
const ACCENT_ORANGE = "#FFA852";
const STONE_GRAY = "#8D96A8";

const SearchIcon = IoSearchOutline as unknown as React.FC<{
    size?: number | string; className?: string; color?: string;
}>;

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

export default function NoticePage(): JSX.Element {
    const [user, setUser] = useState<UserInfo | null>(null);

    // 상단 탭(일반/장학/생활관/학과)
    const [tab, setTab] = useState<GeneralTabKey>("general");

    // 학과 탭일 때 선택된 학과 키(백엔드 type으로 사용)
    const [deptType, setDeptType] = useState<DeptKey>("");

    // 목록/페이지
    const [notices, setNotices] = useState<Notice[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState<number | string | null>(null);

    // 칩(해시태그)
    const [chipsOpen, setChipsOpen] = useState(true);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<string[]>(Global_Tags);

    const [selectedGlobalIds, setGlobalIds] = useState<string>("");
    const [selectedPersonalIds, setSelectedPersonalIds] = useState<string>("");

    const [keywords, setKeywords] = useState<Keyword[]>([]);

    // 서버 키워드 → phrase[] 로 변환
    async function fetchSuggestedTags(): Promise<string[]> {
        // const list = await listKeywords();
        setKeywords(await listKeywords());
        const phrases = keywords
            .map((k) => (k.phrase ?? "").trim())
            .filter((p) => p.length > 0);
        return Array.from(new Set(phrases));
    }

    // tags 배열과 keywords 배열을 비교하여 해당하는 id를 찾는 함수
    const mapTagsToIds = (tags: string[]): string => {
        return tags
            .map(tag => {
                // tags 배열의 각 element와 keywords 배열에서 phrase를 비교하여 일치하는 id를 찾음
                const keyword = keywords.find(k => k.phrase === tag);
                return keyword ? String(keyword.id) : null; // id가 존재하면 id를 반환
            })
            .filter(id => id !== null)  // null 제거
            .join(",");  // "1,2,3" 형태로 반환
    };



    // ✅ 북마크 ID 집합
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

    /** 초기 데이터 (유저 + 추천 태그) */
    useEffect(() => {
        (async () => {
            try {
                const u = await fetchUserInfo();
                setUser(u);

                const firstDept = u?.departments?.[0] || "";
                setDeptType(firstDept);
                setTab("general");

                const tags = await fetchSuggestedTags();
                if (tags.length) setSuggestedTags(tags);
            } catch (e: any) {
                setError(e?.message ?? "데이터 오류");
                setStatus(e?.status ?? "Unknown");
                setSuggestedTags(Global_Tags);
            }
        })();
    }, []);

    /** ✅ 유저 로드 후 북마크 목록 가져오기 */
    useEffect(() => {
        if (!user) return;
        let alive = true;
        (async () => {
            try {
                const items = await listNoticeBookmarks(); // BookMark[]
                if (!alive) return;
                setBookmarks(new Set(items.map(b => String(b.id))));
            } catch (e) {
                console.warn('북마크 목록 로드 실패:', e);
            }
        })();
        return () => { alive = false; };
    }, [user]);

    // 공지 목록 호출 부분 수정
    /** 공지 목록 호출 부분 수정 */
    useEffect(() => {
        const typeForApi = tab === "department" ? (deptType || "general") : tab;
        setLoading(true);

        fetchNotices({
            page,
            size: 10,
            type: typeForApi,
            globalIds: selectedGlobalIds,          // globalIds: "1,2,3" 형태로 넘김
            personalIds: selectedPersonalIds,        // personalIds: "10,11" 형태로 넘김
            match: 'any',
        })
            .then((d: any) => {
                setNotices(d?.content ?? []);
                setTotalPages(d?.totalPages ?? 1);
            })
            .catch((e: any) => {
                setError(e?.message ?? "공지 불러오기 실패");
                setStatus(e?.status ?? "Unknown");
            })
            .finally(() => setLoading(false));
    }, [tab, deptType, page, selectedGlobalIds, selectedPersonalIds]);

    /** 서버 태그 or 예비 칩 */
    const allChips = useMemo<string[]>(() => {
        const phrases = keywords
            .map(k => (k.phrase ?? '').trim())
            .filter(p => p.length > 0);

        // 중복 제거
        const unique = Array.from(new Set(phrases));

        // 키워드가 아직 없으면 기존 suggestedTags 사용
        return unique.length ? unique : suggestedTags;
    }, [keywords, suggestedTags]);

    /** 칩 선택 토글 */
    const toggleChip = (t: string) => {
        setSelectedTags((prev) =>
            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
        );
        setPage(0);
    };

    /** 칩 필터링 결과 */
    useEffect(() => {
        // Global_Tags에 해당하는 태그 ID와 개인 태그 ID를 별도로 구분하여 매핑
        const newGlobalIds = mapTagsToIds(selectedTags.filter(tag => Global_Tags.includes(tag)));
        const newPersonalIds = mapTagsToIds(selectedTags.filter(tag => !Global_Tags.includes(tag)));

        // 상태 업데이트
        setGlobalIds(newGlobalIds);
        setSelectedPersonalIds(newPersonalIds);
    }, [selectedTags, keywords]);  // selectedTags나 keywords가 변경될 때마다 실행


    /** 실제 토글 로직(비동기) — id는 string */
    const handleToggleBookmark = async (id: string, next: boolean) => {
        const key = String(id);

        // 낙관적 업데이트
        setBookmarks(prev => {
            const s = new Set(prev);
            next ? s.add(key) : s.delete(key);
            return s;
        });

        try {
            await setNoticeBookmark(id, next);
        } catch (e: any) {
            // 롤백
            setBookmarks(prev => {
                const s = new Set(prev);
                next ? s.delete(key) : s.add(key);
                return s;
            });
            alert(e?.message ?? '북마크 처리에 실패했습니다.');
        }
    };

    // 검색 함수
    const handleSearch = async () => {
        alert('검색');
        console.log('Button Clicked');
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

    // @ts-ignore
    return (
        <div className="np-root">
            {/* ───────── 상단 AppBar ───────── */}
            <header className="np-appbar">
                <div className="np-appbar-side" />
                <h1 className="np-logo">AURA</h1>
                <button
                    className="np-icon-btn"
                    aria-label="검색"
                    onClick={() => handleSearch()}
                >
                    <SearchIcon className="np-ico" size={22} color="#575757" />
                </button>
            </header>

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

                {/* ───────── 칩 영역 ───────── */}
                <ChipCollapse openByDefault={false}>
                    <div className="np-chips">
                        {allChips.map((c) => {
                            const active = selectedTags.includes(c);
                            return (
                                <button
                                    key={c}
                                    className={`np-chip ${active ? "is-active" : ""}`}
                                    onClick={() => toggleChip(c)}
                                >
                                    #{c}
                                </button>
                            );
                        })}
                    </div>
                </ChipCollapse>

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
                                    isBookmarked={bookmarks.has(n.id)}       // {/* ✅ 하트 ON/OFF */}
                                    onToggleBookmark={handleToggleBookmark}   // {/* ✅ 클릭 처리 */}
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
