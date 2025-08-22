import {API_BASE_URL} from "./api";


export const handleOAuthCallback = (navigate: (path: string) => void) => {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const signUp: string | null = params.get('signUp');

    if (signUp === null) return;

    window.history.replaceState({}, '', '/LoginPage');

    if (signUp.toLowerCase() === 'true') navigate('/select-department');
    else navigate('/mypage');
};


export const redirectToGoogleOAuth = () => {
    try {
        const URL = `${API_BASE_URL}/auth/google`;
        console.debug('[Front] Redirecting to /auth/google');
        window.location.href = URL;
    } catch (error) {
        alert('로그인에 실패했습니다.');
        console.error(error);
    }
};