import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {appNavigate} from "../utils/router";

type AuraNavigateEvent = CustomEvent<{ tab?: "home" | "bookmark" | "settings" }>;
type AuraSearchEvent  = CustomEvent<{ q?: string }>;

const tabToPath = (tab: string) => {
    switch (tab) {
        case "home":     return "/notice";
        case "bookmark": return "/bookmark";
        case "settings": return "/settings";
        default:         return "/notice";
    }
};

/**
 * 네이티브 → 웹 단방향 이벤트 브리지
 * - aura:navigate       탭 전환
 * - aura:search-change  검색 입력 중(디바운스 권장)
 * - aura:search-submit  검색 확정
 */
export default function NativeBridge() {
    useEffect(() => {
        const onNavigate = (e: Event) => {
            const tab = (e as AuraNavigateEvent).detail?.tab;
            if (!tab) return;
            appNavigate(tabToPath(tab));
        };

        const onSearchChange = (e: Event) => {
            const q = (e as AuraSearchEvent).detail?.q ?? "";
            // 입력 중에는 replace로 URL만 업데이트 (브라우저 히스토리 오염 X)
            appNavigate(`/notice?q=${encodeURIComponent(q)}`, { replace: true });
        };

        const onSearchSubmit = (e: Event) => {
            const q = (e as AuraSearchEvent).detail?.q ?? "";
            // 제출 시에는 push
            appNavigate(`/notice?q=${encodeURIComponent(q)}`);
        };

        window.addEventListener("aura:navigate", onNavigate as EventListener);
        window.addEventListener("aura:search-change", onSearchChange as EventListener);
        window.addEventListener("aura:search-submit", onSearchSubmit as EventListener);

        return () => {
            window.removeEventListener("aura:navigate", onNavigate as EventListener);
            window.removeEventListener("aura:search-change", onSearchChange as EventListener);
            window.removeEventListener("aura:search-submit", onSearchSubmit as EventListener);
        };
    }, []);

    return null;
}
