import { Outlet } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar';
import AppBar from '../components/AppBar';
import { isAppEnv } from '../services/auth.service';
import NativeBridge from '../components/NativeBridge';
import { BOTTOM_TAB_HEIGHT } from '../components/BottomTabBar';
import { useState } from "react";
import { useDebounce } from "../hooks/usedebounce";


// const TABBAR_PX = 64;

export default function AppLayout() {
    // ⬇️ 추가: 앱(WebView) 환경에서는 탭바 숨김
    const app = isAppEnv();

    const [searchQuery, setSearchQuery] = useState('');
    // '실시간' 입력값을 500ms 디바운싱한 값
    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    return (
        <>
            {/*<NativeBridge/>*/}

            {/* 스크롤 루트: 화면 높이 고정 + 바깥 스크롤 잠금 */}
            <div
                style={{
                    height: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',               // ← body 대신 여기서 스크롤 잠금
                }}
            >
                {/* 상단 AppBar (웹에서만) */}
                {!app && (
                    <div className="np-header-fullbleed">
                        <AppBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
                    </div>
                )}

                {/* 가운데 스크롤 영역 */}
                <main
                    id="app-scroll-root"
                    style={{
                        flex: '1 1 auto',
                        minHeight: 0,                   // ← flex 아이템에서 overflow 동작 보장
                        overflowY: 'auto',              // ← 여기만 스크롤
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain',
                        paddingBottom: !app
                            ? `calc(${BOTTOM_TAB_HEIGHT}px + env(safe-area-inset-bottom, 0px))`
                            : 'env(safe-area-inset-bottom, 0px)',   // 탭바가 있을 때만 하단 여백
                    }}
                >
                    <Outlet context={{searchQuery: debouncedSearchTerm}}/>
                </main>

                {/* 하단 탭바 (웹에서만) */}
                {!app && <BottomTabBar/>}
            </div>
        </>
    );
}