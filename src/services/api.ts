import axios, { AxiosInstance, AxiosError } from 'axios';

const ORIGIN_URL = (process.env.REACT_APP_SERVER_ORIGIN || '').replace(/\/+$/, '');
const API_PREFIX = '/api';
export const API_BASE_URL = `${ORIGIN_URL}${API_PREFIX}`;
console.log('[API] BASE_URL =', API_BASE_URL);  // ← 콘솔로 반드시 확인
if (!API_PREFIX) {
    throw new Error('REACT_APP_API_URL 가 비어있습니다. .env를 확인하세요.');
}

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',   // Spring CookieCsrfTokenRepository 기본
    xsrfHeaderName: 'X-XSRF-TOKEN', // 쓰기 요청 시 자동 첨부
});

// 2xx만 성공으로 취급 (403을 반드시 에러로 보냄)
api.defaults.validateStatus = (s) => s >= 200 && s < 300;

// 리프레시 전용 클라이언트(인터셉터 X, 무한루프 방지)
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// 동시 401 방지를 위한 간단한 락
let refreshing: Promise<void> | null = null;
function refreshSession(): Promise<void> {
    if (!refreshing) {
        refreshing = refreshClient
            .post('/auth/refresh?web=true', null, { _isRefresh: true } as any)
            .then(() => {})
            .finally(() => { refreshing = null; });
    }
    return refreshing!;
}

// ✅ 1. 요청 시 accessToken 자동 포함
api.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    config.headers.Accept = 'application/json';

    // 쓰기 요청인데 Content-Type 없으면 기본값 세팅
    const method = (config.method ?? 'get').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method) && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }

    return config;
});


// ✅ 2. 응답 에러 시 accessToken 재발급 시도
api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {

        const originalRequest = (error.config || {}) as any;
        const status = error.response?.status ?? 0;

        const isRefreshCall = originalRequest._isRefresh === true || String(originalRequest.url || '').includes('/auth/refresh');
        const shouldRefresh = (status === 401 || status === 403) && !isRefreshCall && !originalRequest?._retry;

        if (shouldRefresh) {
            (originalRequest)._retry = true;

            try {
                await refreshSession();
                console.log('[토큰 재발급 성공]');
                return api.request(originalRequest);
            } catch (e) {
                console.error('[토큰 재발급 실패]', e);
                window.location.href = '/login'; // 필요 시
                throw e;
            } finally {}
        }

        throw error;
    }
);



export default api;