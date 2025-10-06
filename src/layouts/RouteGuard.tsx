// src/layouts/RequireOnboarding.tsx
import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequireOnboarding() {
    const location = useLocation();

    // useState 초기화 시점에 체크 & 제거 (한 번만 실행)
    const [signUp] = useState(() => {
        const windowParams = new URLSearchParams(window.location.search);
        const byWindowQuery = windowParams.get('signUp') === 'true';
        const byQuery = new URLSearchParams(location.search).get('signUp') === 'true';
        const byState = (location.state as any)?.signUp === true;
        const bySession = sessionStorage.getItem('justSignedUp') === '1';

        const shouldSignUp = byWindowQuery || byQuery || byState || bySession;

        console.log('[RequireOnboarding] Init check:', JSON.stringify({
            pathname: location.pathname,
            byWindowQuery,
            byQuery,
            byState,
            bySession,
            shouldSignUp
        }));

        // 체크와 동시에 즉시 제거 (재실행 방지)
        if (bySession) {
            sessionStorage.removeItem('justSignedUp');
            console.log('[RequireOnboarding] ✅ Consumed justSignedUp (init)');
        }

        return shouldSignUp;
    });

    if (signUp && location.pathname !== '/select-department') {
        console.log('[RequireOnboarding] 🚀 Redirecting to /select-department');
        return <Navigate to="/select-department" replace />;
    }

    console.log('[RequireOnboarding] ✅ Rendering Outlet (signUp=' + signUp + ')');
    return <Outlet />;
}