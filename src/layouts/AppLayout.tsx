// src/layouts/AppLayout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar';
import AppBar from '../components/AppBar';
import { isAppEnv } from '../services/auth.service';
import { useDebounce } from '../hooks/usedebounce';
import NativeBridge from '../components/NativeBridge'; // NativeBridge를 App.tsx 대신 여기에 두는 것이 더 명확할 수 있습니다.

export default function AppLayout() {
    const app = isAppEnv();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    return (
        <>
            {/* NativeBridge는 UI가 없으므로 여기에 두어도 괜찮습니다. */}
            <NativeBridge />

            {/* 웹 환경에서만 AppBar를 렌더링합니다. */}
            {!app && (
                <AppBar searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
            )}

            {/* 메인 컨텐츠 영역입니다.
                복잡한 높이 계산 대신, 컨텐츠 길이에 따라 자연스럽게 늘어나도록 합니다.
            */}
            <main>
                <Outlet context={{ searchQuery: debouncedSearchTerm }} />
            </main>

            {/* 웹 환경에서만 BottomTabBar를 렌더링합니다. */}
            {!app && <BottomTabBar />}
        </>
    );
}