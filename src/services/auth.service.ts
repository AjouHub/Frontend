import { UserInfo } from '../types/user';
import { getAccessToken, getRefreshToken, setTokens } from '../utils/auth';


export async function fetchUserInfo(): Promise<UserInfo> {
    const res = await fetch('/user/me', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
}

export async function refreshAccessToken(): Promise<string> {
    const res = await fetch('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
}


export const handleOAuthCallback = (navigate: (path: string) => void) => {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const accessToken: string | null = params.get('accessToken');
    const refreshToken: string | null = params.get('refreshToken');

    if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        window.history.replaceState({}, '', '/LoginPage');
        navigate('/mypage');
    }
};


export const redirectToGoogleOAuth = () => {
    try {
        console.debug('[Front] Redirecting to /auth/google');
        window.location.href = 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/auth/google';
    } catch (error) {
        alert('로그인에 실패했습니다.');
        console.error(error);
    }
};