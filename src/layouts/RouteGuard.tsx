// src/layouts/RequireOnboarding.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequireOnboarding() {
    const location = useLocation();
    const [signUp, setSignUp] = useState(false);

    // location 변경될 때마다 signUp 플래그 재계산
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const byQuery = params.get('signup') === 'true';
        const byState = (location.state as any)?.signUp === true;
        const bySession = sessionStorage.getItem('justSignedUp') === '1';

        const on = byQuery || byState || bySession;
        setSignUp(on);

        // one-shot 플래그는 소모
        if (bySession) sessionStorage.removeItem('justSignedUp');
    }, [location.key]);

    // ✅ signUp일 때만 온보딩으로 강제 이동
    if (signUp && location.pathname !== '/select-department') {
        return <Navigate to="/select-department" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
