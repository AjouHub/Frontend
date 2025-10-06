// src/layouts/RequireOnboarding.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequireOnboarding() {
    const location = useLocation();
    const [signUp, setSignUp] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // 디버깅을 위한 로그
        console.log('[RequireOnboarding] Location changed:', {
            pathname: location.pathname,
            search: location.search,
            state: location.state,
            key: location.key
        });

        // signUp 플래그 체크
        const params = new URLSearchParams(location.search);
        const byQuery = params.get('signUp') === 'true';
        const byState = (location.state as any)?.signUp === true;
        const bySession = sessionStorage.getItem('justSignedUp') === '1';

        const shouldSignUp = byQuery || byState || bySession;

        console.log('[RequireOnboarding] SignUp flags:', {
            byQuery,
            byState,
            bySession,
            shouldSignUp
        });

        setSignUp(shouldSignUp);

        // one-shot 플래그는 소모 (단, 실제로 사용된 경우에만)
        if (bySession && shouldSignUp) {
            sessionStorage.removeItem('justSignedUp');
            console.log('[RequireOnboarding] Removed justSignedUp from sessionStorage');
        }

        setIsChecking(false);
    }, [location.pathname, location.search, location.state]); // 의존성 수정

    // 초기 체크 중일 때는 렌더링 대기
    if (isChecking) {
        return null; // 또는 로딩 스피너
    }

    // signUp일 때만 온보딩으로 강제 이동
    if (signUp && location.pathname !== '/select-department') {
        console.log('[RequireOnboarding] Redirecting to /select-department');
        return <Navigate to="/select-department" replace state={{ from: location }} />;
    }

    return <Outlet />;
}