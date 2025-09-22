// src/components/AppBar.tsx
import React, { useState, useRef } from "react";
import { IoSearchOutline, IoChevronBackOutline } from "react-icons/io5";
import {useLocation, useNavigate} from "react-router-dom";

// 아이콘
const SearchIcon = IoSearchOutline as unknown as React.FC<{
    size?: number | string; className?: string; color?: string;
}>;
const BackIcon = IoChevronBackOutline as unknown as React.FC<{
    size?: number | string; className?: string; color?: string;
}>;

// 부모로부터 받을 props 타입을 정의합니다.
interface AppBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const AppBar: React.FC<AppBarProps> = ({ searchQuery, setSearchQuery }) => {
    // 검색
    const [searchOpen, setSearchOpen] = useState(false);
    // const [query, setQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const onClickSearch = () => setSearchOpen(true);
    const onSubmitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색 제출 시 부모의 setSearchQuery를 호출합니다.
        setSearchQuery(searchInputRef.current?.value || '');
        // 검색 결과는 NoticePage에서 보여주므로 해당 페이지로 이동시킵니다.
        navigate(`/notice?q=${encodeURIComponent(searchInputRef.current?.value || '')}`);
        setSearchOpen(false); // 검색창 닫기
    };
    const onCloseSearch = () => setSearchOpen(false);

    return (
        <header className="np-appbar">
            <div className="np-appbar-side" />
            <h1 className="np-logo">AURA</h1>

            {/* /notice 경로에서만 검색 버튼을 표시 */}
            {location.pathname === "/notice" && (
                <button
                    className={`np-icon-btn ${searchOpen ? "is-search-open" : ""}`}
                    aria-label="검색"
                    onClick={onClickSearch}
                >
                    <SearchIcon className="np-ico" size={22} color="#575757" />
                </button>
            )}

            {/* ▼ 검색 입력 오버레이 추가 */}
            <form
                className={`np-search ${searchOpen ? "is-open" : ""}`}
                onSubmit={onSubmitSearch}
            >
                <input
                    ref={searchInputRef}
                    className="np-search-input"
                    placeholder="검색어 입력"
                    // value={query}
                    // onChange={(e) => setQuery(e.target.value)}
                />
                {/* 왼쪽 화살표 (닫기) */}
                <button
                    type="button"
                    className="np-search-back"
                    onClick={onCloseSearch}
                    aria-label="검색 닫기"
                >
                    <BackIcon size={20} />
                </button>
            </form>
        </header>
    );
};

export default AppBar;
