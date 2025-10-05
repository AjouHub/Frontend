// src/layouts/RequireOnboarding.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { listDepartments } from '../services/settings.service';

export default function RequireOnboarding() {
    const [loading, setLoading] = useState(true);
    const [hasDept, setHasDept] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const list = await listDepartments();
                if (alive) setHasDept(Boolean(list && list.length > 0));
            } catch {
                if (alive) setHasDept(false); // 에러 시 온보딩 필요로 간주
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    if (loading) return null; // 필요하면 로딩 스피너 넣어도 OK

    const path = location.pathname;

    // 가드 예외 경로들: 여기서는 리다이렉트 X
    const guardBypass =
        path.startsWith('/login') ||
        path.startsWith('/auth/error') ||
        path.startsWith('/select-department');

    if (!guardBypass && !hasDept) {
        // 학과 없으면 온보딩으로
        return <Navigate to="/select-department" replace state={{ from: location }} />;
    }

    return <Outlet />; // ✅ 보호된 라우트렌더
}
