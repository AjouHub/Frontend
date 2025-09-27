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
        <div style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <NativeBridge />

            {!app && (
                <AppBar searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
            )}

            <main
                id="app-scroll-root"
                style={{
                    flex: 1, // 남은 공간을 모두 차지하도록 설정합니다.
                    overflowY: 'auto', // 내용이 길어지면 스크롤이 생기도록 합니다.
                }}
            >
                <Outlet context={{ searchQuery: debouncedSearchTerm }} />
            </main>

            {!app && <BottomTabBar />}
        </div>
    );
}