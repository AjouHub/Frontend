import {API_BASE_URL} from "./api";


//  앱(WebView) 환경 감지
export function isAppEnv(): boolean {
    const usp = new URLSearchParams(window.location.search);
    if (usp.get('embed') === 'app') return true;
    if ((window as any).ReactNativeWebView) return true;
    // 필요시 UA 플래그도 추가
    if (navigator.userAgent.includes('AURA-App')) return true;
    return (process.env.REACT_APP_RUNTIME || '').toLowerCase() === 'app';
}


export const handleOAuthCallback = (navigate: (path: string) => void) => {
    const params: URLSearchParams = new URLSearchParams(window.location.search);

    // if (isAppEnv()) {
    //     const accessToken = params.get('accessToken');
    //     const refreshToken = params.get('refreshToken');
    //     if (accessToken) {
    //         authTokens.setFromLogin(accessToken, refreshToken);
    //     }
    // }


    const signUp: string | null = params.get('signUp');
    if (signUp === null) return;

    window.history.replaceState({}, '', '/LoginPage');

    if (signUp.toLowerCase() === 'true') navigate('/select-department');
    else navigate('/mypage');
};


export const redirectToGoogleOAuth = () => {
    try {
        const mode = isAppEnv() ? 'app' : 'web';
        const URL = `${API_BASE_URL}/auth/google?mode=${mode}`;
        console.debug('[Front] Redirecting to /auth/google', URL);
        // window.location.href = URL;
        window.location.assign(URL);
    } catch (error) {
        alert('로그인에 실패했습니다.');
        console.error(error);
    }
};