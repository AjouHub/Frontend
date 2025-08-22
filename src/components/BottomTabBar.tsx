import { NavLink } from 'react-router-dom';
import React from 'react';

const TABS = [
    { to: '/mypage',        label: '홈',   icon: '🏠' },
    { to: '/notice',       label: '공지', icon: '📢' },
    { to: '/account-info',  label: '계정', icon: '👤' },
    { to: '/',      label: '로그인', icon: '⚙️' }, // 페이지 없으면 빼도 됨
];

export default function BottomTabBar() {
    return (
        <nav
            style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
                height: 64, display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
                alignItems: 'center', background: '#fff', borderTop: '1px solid #eee',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
            aria-label="Bottom Tabs"
            role="navigation"
        >
            {TABS.map(t => (
                <NavLink
                    key={t.to}
                    to={t.to}
                    style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#111' : '#666',
                        fontWeight: isActive ? 600 : 400,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 4, fontSize: 12,
                    })}
                >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
                    <span>{t.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
