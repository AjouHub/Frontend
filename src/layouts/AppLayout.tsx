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
        <div
            className={app ? 'is-app' : 'is-web'} // 1. 환경에 따라 클래스 이름 부여
            style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f7f8fa' // body 배경색과 동일하게 설정
        }}>
            <NativeBridge />

            {/* 웹 환경에서만 AppBar 렌더링 */}
            {!app && <AppBar searchQuery={searchTerm} setSearchQuery={setSearchTerm} />}

            {/* id를 부여하여 스크롤 제어가 가능하도록 main 태그 설정 */}
            <main
                id="app-scroll-root"
                style={{
                    flex: 1, // 남은 공간을 모두 차지
                    minHeight: 0, // flex 환경에서 내부 스크롤을 위한 필수 속성
                    overflowY: 'auto', // 내용이 길어지면 세로 스크롤 생성
                }}>
                <Outlet context={{ searchQuery: debouncedSearchTerm }} />
            </main>

            {/* 웹 환경에서만 BottomTabBar 렌더링 */}
            {!app && <BottomTabBar />}
        </div>
    );
}