import axios, { AxiosInstance } from 'axios';

const ORIGIN_URL = (process.env.REACT_APP_SERVER_ORIGIN || '').replace(/\/+$/, '');
const API_PREFIX = '/api';
export const API_BASE_URL = `${ORIGIN_URL}${API_PREFIX}`;
// const BASE_URL = process.env.REACT_APP_API_URL!;
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
            .post('/auth/refresh?web=true', null, { headers: { Accept: 'application/json' } })
            .then(() => {
                // 성공 시 쿠키가 갱신됨. 추가 처리 불필요.
            })
            .finally(() => {
                refreshing = null;
            });
    }
    return refreshing;
}

// ✅ 1. 요청 시 accessToken 자동 포함
api.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    config.headers.Accpet = 'application/json';

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
    async (error) => {

        const originalRequest = error.config as any;
        const status = error.response?.status;

        if (status === 401 && !String(originalRequest?.url || '').includes('/auth/refresh') && !originalRequest?._retry) {
            (originalRequest)._retry = true;

            try {
                await refreshSession();
                return api(originalRequest);
            } catch (e) {
                console.error('[토큰 재발급 실패]', e);
                // window.location.href = '/login'; // 필요 시
                return Promise.reject(e);
            } finally {}
        }

        return Promise.reject(error);
    }
);


export default api;