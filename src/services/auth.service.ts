import { UserInfo } from '../types/user';
import { getAccessToken, getRefreshToken, setTokens } from '../utils/auth';

export function loginWithGoogle() {
    // 브라우저 전체를 백엔드 인증 경로로 이동
    window.location.href = 'https://port-0-backend-mcx018vt98002089.sel5.cloudtype.app/auth/google';
}

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