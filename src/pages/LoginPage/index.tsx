import { useEffect } from 'react';
import { handleOAuthCallback, redirectToGoogleOAuth } from "../../services/auth.service";
import "./LoginPage.css"

// Google 로고 아이콘 SVG
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#4285F4">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.84-2.22.82-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
);


export default function LoginPage() {
    useEffect(() => {
        handleOAuthCallback();
    }, []);

    // 풀스크린 클래스 + JS 기반 vh 보정
    useEffect(() => {
        const root = document.documentElement;

        const applyVH = () => {
            // 실제 보이는 높이 기준 1vh 계산
            root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        };

        // 로그인 페이지 동안만 풀스크린 모드 클래스 부여
        root.classList.add('aura-fullscreen');
        applyVH();

        // 앱이 보내는 풀스크린 토글 이벤트 처리
        const onFullscreen = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.on) root.classList.add('aura-fullscreen');
            else root.classList.remove('aura-fullscreen');
            applyVH();
        };

        window.addEventListener('resize', applyVH);
        window.addEventListener('aura:fullscreen', onFullscreen as EventListener);

        return () => {
            window.removeEventListener('resize', applyVH);
            window.removeEventListener('aura:fullscreen', onFullscreen as EventListener);
            root.classList.remove('aura-fullscreen');
            root.style.removeProperty('--vh');
        };
    }, []);

    async function handleLogin(){
        await redirectToGoogleOAuth();
    };

    return (
        <div className="lp-root">
            <div className="lp-container">
                <div className="lp-main-content">
                    <h2 className="lp-welcome-text">환영합니다</h2>
                    <h1 className="lp-logo">AURA</h1>
                    <h3 className="lp-introduction">아주대학교 공지사항을 알림으로 받아보세요.</h3>
                    <button className="lp-google-button" onClick={handleLogin}>
                        <GoogleIcon />
                        <span>Google로 로그인</span>
                    </button>
                </div>
            </div>
            <p className="lp-footer-text">이 앱은 아주대학교 공식 사업과 무관합니다.</p>
        </div>
    );
}
