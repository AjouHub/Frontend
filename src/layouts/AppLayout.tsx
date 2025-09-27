// src/layouts/AppLayout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar';
import AppBar from '../components/AppBar';
import { isAppEnv } from '../services/auth.service';
import { useDebounce } from '../hooks/usedebounce';
import NativeBridge from '../components/NativeBridge';

export default function AppLayout() {
    const app = isAppEnv();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    return (
        <div className={app ? 'is-app' : 'is-web'}>
            <NativeBridge />

            {/* 웹 환경에서만 AppBar 렌더링 */}
            {!app && <AppBar searchQuery={searchTerm} setSearchQuery={setSearchTerm} />}

            {/* id를 부여하여 스크롤 제어가 가능하도록 main 태그 설정 */}
            <main id="app-scroll-root">
                <Outlet context={{ searchQuery: debouncedSearchTerm }} />
            </main>

            {/* 웹 환경에서만 BottomTabBar 렌더링 */}
            {!app && <BottomTabBar />}
        </div>
    );
}