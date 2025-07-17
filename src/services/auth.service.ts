import { UserInfo } from '../types/user';
import { getAccessToken, getRefreshToken, setTokens } from '../utils/auth';

export async function loginWithGoogle(): Promise<void> {
    const res = await fetch('/auth/google', { method: 'POST' });
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
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