// src/layouts/RequireOnboarding.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequireOnboarding() {
    const location = useLocation();
    const [signUp, setSignUp] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // ✅ window.location 직접 사용
        const windowParams = new URLSearchParams(window.location.search);
        const params = new URLSearchParams(location.search);
        const byWindowQuery = windowParams.get('signUp') === 'true';
        const byQuery = params.get('signUp') === 'true';
        const byState = (location.state as any)?.signUp === true;
        const bySession = sessionStorage.getItem('justSignedUp') === '1';
        const shouldSignUp = byWindowQuery || byQuery || byState || bySession;

        console.log('[RequireOnboarding] Check:', JSON.stringify({
            windowSearch: window.location.search,
            reactRouterSearch: location.search,
            pathname: location.pathname,
            state: location.state,
            byWindowQuery,
            byQuery,
            byState,
            bySession,
            shouldSignUp,
            sessionStorageValue: sessionStorage.getItem('justSignedUp')
        }));

        setSignUp(shouldSignUp);

        if (bySession && shouldSignUp) {
            sessionStorage.removeItem('justSignedUp');
            console.log('[RequireOnboarding] ✅ Consumed justSignedUp flag');
        }

        setIsChecking(false);
    }, [location.pathname, location.search, location.state]);

    // 렌더 부분에도 로그 추가
    if (isChecking) {
        console.log('[RequireOnboarding] Still checking...');
        return null;
    }

    if (signUp && location.pathname !== '/select-department') {
        console.log('[RequireOnboarding] 🚀 Redirecting to /select-department (signUp=true)');
        return <Navigate to="/select-department" replace state={{from: location}}/>;
    }

    console.log('[RequireOnboarding] ✅ Rendering Outlet (signUp=' + signUp + ')');
    return <Outlet/>;
}