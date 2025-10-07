// src/layouts/RequireOnboarding.tsx
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequireOnboarding() {
    const location = useLocation();

    // 매 렌더링마다 재평가 (useState 사용 X)
    const checkSignUp = () => {
        // 1. 현재 URL의 쿼리 파라미터 체크
        const params = new URLSearchParams(location.search);
        const byQuery = params.get('signUp') === 'true' || params.get('signup') === 'true';

        // 2. location state 체크
        const byState = (location.state as any)?.signUp === true;

        // 3. sessionStorage 체크
        const bySession = sessionStorage.getItem('justSignedUp') === '1';

        console.log('[RequireOnboarding] Check:', JSON.stringify({
            pathname: location.pathname,
            byQuery,
            byState,
            bySession,
            result: byQuery || byState || bySession
        }));

        return byQuery || byState || bySession;
    };

    // /select-department에 도착했을 때 세션 플래그 소비
    useEffect(() => {
        if (location.pathname === '/select-department') {
            const hadSession = sessionStorage.getItem('justSignedUp');
            if (hadSession === '1') {
                sessionStorage.removeItem('justSignedUp');
                console.log('[RequireOnboarding] ✅ Consumed justSignedUp flag');
            }
        }
    }, [location.pathname]);

    // 현재 signUp 조건 체크
    const shouldRedirect = checkSignUp();

    // 리디렉션 조건: signUp이 true이고 현재 페이지가 /select-department가 아닐 때
    if (shouldRedirect && location.pathname !== '/select-department') {
        console.log('[RequireOnboarding] 🚀 Redirecting to /select-department');
        return <Navigate to="/select-department" replace />;
    }

    console.log('[RequireOnboarding] ✅ Rendering Outlet');
    return <Outlet />;
}