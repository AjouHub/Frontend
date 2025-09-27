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
                    style={{
                        flex: '1 1 auto', // 남는 공간을 모두 차지하도록 설정
                        minHeight: 0, // flex 환경에서 내부 스크롤이 되게 하는 중요한 속성
                        overflowY: 'auto', // 내용이 길어지면 세로 스크롤바가 생김
                        WebkitOverflowScrolling: 'touch', // 모바일에서 부드러운 스크롤
                    }}
                >
                    <Outlet context={{ searchQuery: debouncedSearchTerm, setSearchQuery }}/>
                </main>

                {/* 하단 탭바 (웹에서만) */}
                {!app && <BottomTabBar/>}
            </div>
        </>
    );
}