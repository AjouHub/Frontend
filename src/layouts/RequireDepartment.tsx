// src/layouts/RequireOnboarding.tsx
import {useEffect, useState, type ReactNode} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {listDepartments} from '../services/settings.service';

export default function RequireOnboarding({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [hasDept, setHasDept] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const list = await listDepartments();
                if (alive) setHasDept((list ?? []).length > 0);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    if (loading) return null; // 또는 스피너

    if (!hasDept && location.pathname !== '/select-department') {
        return <Navigate to="/select-department" replace />;
    }
    if (hasDept && location.pathname === '/select-department') {
        return <Navigate to="/notice" replace />;
    }
    return <>{children}</>;
}
