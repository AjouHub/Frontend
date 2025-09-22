import { Outlet, useLocation } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar';
import AppBar from '../components/AppBar';
import { isAppEnv } from '../services/auth.service';
import NativeBridge from '../components/NativeBridge';
import { BOTTOM_TAB_HEIGHT } from '../components/BottomTabBar';
import {useState} from "react";


// const TABBAR_PX = 64;

export default function AppLayout() {
    // ⬇️ 추가: 앱(WebView) 환경에서는 탭바 숨김
    const location = useLocation();
    const app = isAppEnv();

    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            {/* 네이티브 이벤트 리스너 */}
            <NativeBridge />

            {/* 모든 화면 컨텐츠 영역 (탭바에 가리지 않도록 하단 패딩) */}
            <div
                style={{
                    minHeight: '100dvh',
                    paddingBottom: app
                        ? `calc(${BOTTOM_TAB_HEIGHT}px + env(safe-area-inset-bottom, 0px))`
                        : 'env(safe-area-inset-bottom, 0px)',
                }}
            >
                {/* 앱 모드가 아니면 AppBar와 BottomTabBar를 렌더링 */}
                {/* AppBar에 검색어와 상태 변경 함수를 props로 전달합니다. */}
                {!app && <AppBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}

                {/* Outlet의 context를 통해 검색어를 자식 컴포넌트(NoticePage)에 전달합니다. */}
                <Outlet context={{ searchQuery, setSearchQuery }} />
            </div>

            {/* ⬇️ 변경: 앱 환경이면 탭바 미표시 */}
            {!app && <BottomTabBar />}
        </>
    );
}
