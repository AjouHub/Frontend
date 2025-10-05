// src/layouts/RequireOnboarding.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { listDepartments } from '../services/settings.service';

export default function RequireOnboarding() {
    const [loading, setLoading] = useState(true);
    const [hasDept, setHasDept] = useState<boolean>(false);
    const location = useLocation();

    // ✅ location.pathname을 의존성에 추가하여 경로 변경 시마다 재확인
    useEffect(() => {
        let alive = true;
        setLoading(true); // 재확인 시작

        (async () => {
            try {
                const list = await listDepartments();
                if (alive) setHasDept(Boolean(list && list.length > 0));
            } catch {
                if (alive) setHasDept(false);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [location.pathname]); // 경로 변경 시마다 실행

    if (loading) return null;

    const path = location.pathname;

    const guardBypass =
        path.startsWith('/login') ||
        path.startsWith('/auth/error') ||
        path.startsWith('/select-department');

    if (!guardBypass && !hasDept) {
        return <Navigate to="/select-department" replace state={{ from: location }} />;
    }

    // 부서 있는데 온보딩 페이지면 메인으로 (루프 방지)
    if (hasDept && path === '/select-department') {
        return <Navigate to="/notice" replace />;
    }

    return <Outlet />;
}