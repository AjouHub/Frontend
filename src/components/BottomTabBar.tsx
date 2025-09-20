// src/components/BottomTabBar.tsx
import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import {
    IoHomeOutline, IoHome,
    IoStarOutline, IoStar,
    IoSettingsOutline,
    IoPersonOutline,
} from "react-icons/io5";
import type { IconType, IconBaseProps } from "react-icons";

const AURA_BLUE  = "#4A6DDB";
const MUTED_GRAY = "#94a3b8";
export const BOTTOM_TAB_HEIGHT = 64;

type Tab = {
    to: string;
    label: string;
    icon: IconType;
    activeIcon?: IconType;
};

const TABS: readonly Tab[] = [
    { to: "/notice",       label: "홈",   icon: IoHomeOutline,     activeIcon: IoHome },
    { to: "/bookmark",     label: "북마크", icon: IoStarOutline,     activeIcon: IoStar },
    { to: "/settings",     label: "설정", icon: IoSettingsOutline, activeIcon: IoSettingsOutline },
    // { to: "/account-info", label: "나",   icon: IoPersonOutline,   activeIcon: IoPersonOutline },
] as const;

const BottomTabBar: React.FC = () => {
    return (
        <nav
            aria-label="Bottom Tabs"
            role="navigation"
            style={{
                position: "fixed",
                left: 0, right: 0, bottom: 0,
                zIndex: 1000,
                height: BOTTOM_TAB_HEIGHT,
                display: "grid",
                gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
                alignItems: "center",
                background: "#fff",
                borderTop: "1px solid #eee",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
        >
            {TABS.map((t) => (
                <NavLink
                    key={t.to}
                    to={t.to}
                    style={{
                        textDecoration: "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        height: "100%",
                    }}
                >
                    {({ isActive }) => {
                        const Icon: IconType =
                            (isActive ? t.activeIcon : undefined) ?? t.icon;

                        // ✅ react-icons 타입/React19 타입 충돌 우회: JSX 컴포넌트로 캐스팅
                        const IconC = Icon as unknown as React.ComponentType<IconBaseProps>;

                        const color = isActive ? AURA_BLUE : MUTED_GRAY;
                        return (
                            <>
                                <IconC size={26} color={color} />
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: isActive ? 700 : 600,
                                        color,
                                        lineHeight: 1,
                                    }}
                                >
                  {t.label}
                </span>
                            </>
                        );
                    }}
                </NavLink>
            ))}
        </nav>
    );
};

export default memo(BottomTabBar);
