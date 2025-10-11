import React from "react";
import { isAppEnv } from "../../services/auth.service";

const ABOUT_PAGE_URL = (
    process.env.REACT_APP_ABOUT_PAGE_URL ||
    process.env.ABOUT_PAGE_URL || // 혹시 커스텀 번들이면 이 값도 허용
    ""
).trim().replace(/\/+$/, ""); // 끝의 / 제거

function openInNewTab(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.position = "absolute";
    a.style.left = "-9999px";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

export default function AboutPage() {
    const handleAboutButton = () => {
        if (!ABOUT_PAGE_URL) return;

        // 앱(WebView) + 네이티브 브리지가 있으면 오버레이 웹뷰로 열기
        if (window.AURA?.openAbout && isAppEnv()) {
            window.AURA.openAbout(ABOUT_PAGE_URL);
            return;
        }

        // 웹 환경: 현재 페이지 그대로 두고 새 탭만 오픈
        openInNewTab(ABOUT_PAGE_URL);
    };

    return (
        <div className="about-container">
            <button
                type="button"
                className="about-button"
                onClick={handleAboutButton}
                disabled={!ABOUT_PAGE_URL}
            >
                어바웃 페이지
            </button>
        </div>
    );
}
