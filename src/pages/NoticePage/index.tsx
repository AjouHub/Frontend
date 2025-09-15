import React, { JSX, useEffect, useMemo, useState } from "react";
import "./NoticePage.css";
import { fetchUserInfo } from "../../services/fetchUserInfo";
import { fetchNotices } from "../../services/fetchNotices";
import type { Notice } from "../../types/notice";
import type { UserInfo } from "../../types/user";
import NoticeCard from "./NoticeCard";
import { listKeywords } from "../../services/settings.service";
import { departmentNameMap } from "../../components/departmentMap";

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


const FALLBACK_TAGS = [
    "수강신청","학사","계절학기","강의","특강","수업","공모전","장학","채용","설문","대회"];
async function fetchSuggestedTags(): Promise<string[]> {
    const list = await listKeywords(); // Promise<Keyword[]>
    const phrases = list
        // .filter(k => k.scope === 'GLOBAL')
        .map(k => (k.phrase ?? "").trim())
        .filter(p => p.length > 0);

    return Array.from(new Set(phrases));
}

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

    // 칩(해시태그) — ‘완전 닫힘’ 토글
    const [chipsOpen, setChipsOpen] = useState(true);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // 추천 태그 상태 (기본은 폴백으로 시작)
    const [suggestedTags, setSuggestedTags] = useState<string[]>(FALLBACK_TAGS);


    /** 초기 데이터 */
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
                setSuggestedTags(FALLBACK_TAGS);
            }
        })();
    }, []);

    /** 목록 호출 */
    useEffect(() => {
        const typeForApi = tab === "department" ? (deptType || "general") : tab;
        setLoading(true);
        fetchNotices({ page, size: 10, type: typeForApi })
            .then((d: any) => {
                setNotices(d?.content ?? []);
                setTotalPages(d?.totalPages ?? 1);
            })
            .catch((e: any) => {
                setError(e?.message ?? "공지 불러오기 실패");
                setStatus(e?.status ?? "Unknown");
            })
            .finally(() => setLoading(false));
    }, [tab, deptType, page]);

    /** 서버 태그 or 예비 칩 */
    const allChips = useMemo(() => {
        const s = new Set<string>();
        notices.forEach((n: any) => n?.tags?.forEach((t: string) => s.add(t)));
        const dynamic = Array.from(s);
        // 서버 공지에 태그가 없으면 추천 태그 사용
        return dynamic.length ? dynamic : suggestedTags;
    }, [notices, suggestedTags]);

    /** 칩 선택 토글 */
    const toggleChip = (t: string) => {
        setSelectedTags((prev) =>
            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
        );
        setPage(0);
    };

    /** 칩 필터링 결과 */
    const filteredNotices = useMemo(() => {
        if (!selectedTags.length) return notices;
        return notices.filter((n: any) => {
            const tags: string[] = n?.tags ?? [];
            return selectedTags.every((t) => tags.includes(t));
        });
    }, [notices, selectedTags]);

    /** 렌더 */
    if (loading && !notices.length) {
        return <div className="np-container"><div className="np-loading">로딩 중…</div></div>;
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
            {/* ───────── 상단 AppBar ───────── */}
            <header className="np-appbar">
                <div className="np-appbar-side" />
                <h1 className="np-logo">AURA</h1>
                <button className="np-icon-btn" aria-label="검색">
                    <svg viewBox="0 0 24 24" className="np-ico">
                        <path
                            d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
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

                {/* ───────── 칩/해시태그: 완전 닫힘 지원 ───────── */}
                {/* ───────── 칩/해시태그: 완전 닫힘(둥근 사각형 남김) ───────── */}
                {chipsOpen ? (
                    <section className="np-chip-wrap">
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
                        <button
                            className="np-chip-toggle"
                            onClick={() => setChipsOpen(false)}
                            aria-label="칩 접기"
                            title="칩 접기"
                        >
                            <svg viewBox="0 0 24 24" className="np-caret up">
                                <path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </section>
                ) : (
                    <div className="np-chip-collapsed">
                        <button
                            className="np-chip-cbtn"
                            onClick={() => setChipsOpen(true)}
                            aria-label="칩 펼치기"
                            title="칩 펼치기"
                        >
                            <svg viewBox="0 0 24 24" className="np-caret down">
                                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                )}


                {/* ───────── 공지 카드 리스트 ───────── */}
                <ul className="np-card-list">
                    {filteredNotices.map((n) => (
                        <li key={n.id}>
                            <NoticeCard
                                notice={n}
                                leftBarColor={AURA_BLUE}
                                dateColor={STONE_GRAY}
                                heartColor={ACCENT_ORANGE}
                            />
                        </li>
                    ))}
                    {!filteredNotices.length && (
                        <li className="np-empty">공지사항이 없습니다.</li>
                    )}
                </ul>

                {/* ───────── 페이지네이션 (숫자만, 원형 X) ───────── */}
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

            {/* ───────── 하단 고정 네비 ───────── */}
            <nav className="np-bottom-nav">
                {[
                    { key: "home", label: "홈", active: true },
                    { key: "mark", label: "북마크" },
                    { key: "setting", label: "설정" },
                    { key: "me", label: "나" },
                ].map((it) => (
                    <button
                        key={it.key}
                        className={`np-bnav-item ${it.active ? "is-active" : ""}`}
                    >
                        <span className="np-bnav-ico" />
                        <span className="np-bnav-text">{it.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
