import axios from 'axios';


const BASE_URL = process.env.REACT_APP_API_URL || '/api'; // ✅ 프록시 안 씀
console.log('[API] BASE_URL =', BASE_URL);  // ← 콘솔로 반드시 확인
if (!BASE_URL) {
    throw new Error('REACT_APP_API_URL 가 비어있습니다. .env를 확인하세요.');
}


const api = axios.create({
    // baseURL: 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app',
    baseURL: BASE_URL,
    withCredentials: true, // refreshToken 쿠키 전송용
});


// 3) 리프레시 전용 클라이언트 (인터셉터 없음: 무한루프 방지)
export const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});


// ✅ 1. 요청 시 accessToken 자동 포함
api.interceptors.request.use((config) => {
    // const token = localStorage.getItem('accessToken');
    const token = null;  // 토큰 재발급 테스트
    config.headers = config.headers ?? {};
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accpet = 'application/json';
    return config;
});

// ── 응답 인터셉터(401/403 → /auth/refresh)
let isRefreshing = false;
let waitQueue: Array<(t: string) => void> = [];
const flushQueue = (newToken: string) => {
    waitQueue.forEach((cb) => cb(newToken));
    waitQueue = [];
};


// ✅ 2. 응답 에러 시 accessToken 재발급 시도
api.interceptors.response.use(
    (res) => res,
    async (error) => {

        const originalRequest = error.config || {};
        const status = error.response?.status;

        if (!status) return Promise.reject(error);

        const isAuthErr = status === 401 || status === 403;
        const isRefreshReq = String(originalRequest?.url || '').includes('/auth/refresh');

        if (isAuthErr && !isRefreshReq && !originalRequest._retry) {
            (originalRequest as any)._retry = true;

            if (isRefreshing) {
                // 누군가 이미 리프레시 중 → 큐에 넣고 새 토큰 나오면 재시도
                return new Promise((resolve) => {
                    waitQueue.push((newToken: string) => {
                        originalRequest.headers = originalRequest.headers ?? {};
                        (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;
            try {
                // 스펙: body는 null, 쿠키로 refreshToken 전송, 새 refreshToken은 Set-Cookie로 재설정
                const r = await refreshClient.post('/auth/refresh', null, {
                    headers: { Accept: 'application/json' },
                });

                const newAccessToken = r?.data?.data?.accessToken;
                if (!newAccessToken) throw new Error('No accessToken in refresh response');

                localStorage.setItem('accessToken', newAccessToken);
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                console.log('[토큰 재발급 성공]', newAccessToken);

                flushQueue(newAccessToken);

                originalRequest.headers = originalRequest.headers ?? {};
                (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (e) {
                console.error('[토큰 재발급 실패]', e);
                localStorage.removeItem('accessToken');
                waitQueue = [];
                // window.location.href = '/login'; // 필요 시
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
