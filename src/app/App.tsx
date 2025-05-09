// src/app/App.tsx
/* 
앱의 진입점 역할을 하는 컴포넌트.
  ─ React Native에서 첫 화면을 그리는 최상위 컴포넌트
  ─ 네비게이션·상태관리·제스처 설정을 한곳에 초기화
*/

import React, { useEffect } from 'react'; // React (UI 라이브러리) 기본 import
// 제스처(스와이프·탭 등)가 네이티브에서 부드럽게 동작하도록 루트 뷰를 GestureHandlerRootView 로 감싸야 함
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 
import RootStack from '../navigation/RootStack'; // 화면 전환(스택 네비게이션)을 정의한 컴포넌트
import { configureGoogle } from '../libs/GoogleAuth'; // Google 로그인 SDK 초기 설정 함수
 // 서버 상태 관리 라이브러리(React Query) – 캐싱·로딩 처리 담당
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// React Query는 “QueryClient” 라는 중앙 캐시 객체를 필요로 함
const queryClient = new QueryClient();

export default function App() {
  console.log('[App] mounted!');

  // 앱 기동 시 딱 1회만 Google SDK 초기화
  useEffect(configureGoogle, []); // 컴포넌트가 맨 처음 마운트 될 때 한 번만 실행

  return (
    // (1) 제스처 루트 – 모든 터치·스와이프 이벤트의 기반
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* (2) React Query 전역 Provider – 하위 컴포넌트 어디서든 useQuery 사용 */}
      <QueryClientProvider client={queryClient}>
        {/* (3) RootStack – 앱의 실제 화면(로그인 · 홈 등)을 스택 네비게이션으로 표시 */}
        <RootStack />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
