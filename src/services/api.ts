import axios, { AxiosInstance } from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

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

export const API_INSTANCE_ID = 'API@SINGLETON';
(api as any).__ID = API_INSTANCE_ID;

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
    
    // 디버그
    (config.headers ||= {} as any)['X-Debug-Api-Instance'] = 'API@SINGLETON';
    console.log('[REQ]', config.method, config.url, 'via API@SINGLETON');

    return config;
});


type Cfg = import('axios').AxiosRequestConfig & { _retry?: boolean; _isRefresh?: boolean };
// 응답/에러에서 공통으로 cfg/status/url만 표준화해서 꺼낸다
function extract(resOrErr: AxiosResponse | AxiosError): {
    cfg: Cfg;
    status: number;   // ← 반드시 number
    url: string;
} {
    // 공통: 원요청 config
    const cfg = ((resOrErr as any).config as Cfg) ?? ({} as Cfg);
    const url = String(cfg.url ?? '');

    // 상태코드 정규화 → number 보장
    let status: number;
    if ('status' in resOrErr) {
        // AxiosResponse
        status = (resOrErr as AxiosResponse).status;
    } else {
        // AxiosError
        const s = (resOrErr as AxiosError).response?.status;
        status = typeof s === 'number' ? s : 0;
    }

    return { cfg, status, url };
}

// 리프레시가 필요하면 실행하고, 원요청을 재시도해서 응답을 돌려준다. 아니면 undefined
async function tryRefreshAndReplay<T = any>(
    cfg: Cfg,
    status: number,
    opts?: { onRefreshFail?: (e: unknown) => void }
): Promise<AxiosResponse<T> | undefined> {

    const isRefreshCall = cfg._isRefresh === true || String(cfg.url || '').includes('/auth/refresh');
    const shouldRefresh = (status === 401 || status === 403) && !isRefreshCall && !cfg._retry;

    if (!shouldRefresh) return undefined;

    cfg._retry = true;
    try {
        await refreshSession();           // ← /api/auth/refresh 호출(쿠키 재발급)
        return api.request<T>(cfg);       // ← 원래 요청 재시도
    } catch (e) {
        opts?.onRefreshFail?.(e);         // ← 필요 시 로그인 페이지로 이동 등
        throw e;
    }
}

// ✅ 2. 응답 에러 시 accessToken 재발급 시도
api.interceptors.response.use(
    async (res) => {
        console.log('interceptors');

        const { cfg, status } = extract(res);
        const replay = await tryRefreshAndReplay(cfg, status);
        return replay ?? res;
    },

    // ✅ onRejected: 기본(정상) 흐름. 4xx가 에러로 들어오면 여기서 처리
    async (error) => {
        console.log('interceptors');

        const { cfg, status } = extract(error);
        const replay = await tryRefreshAndReplay(cfg, status, {
            onRefreshFail: (e: unknown) => {
                console.error('[토큰 재발급 실패]', e);
                // window.location.href = '/login';
            },
        });
        if (replay) return replay;
        throw error;
    }
);

// 현재 등록된 응답 인터셉터 개수 확인 (디버그)
console.log('[api] resp handlers =', (api.interceptors.response as any).handlers?.length);

// api.ts 하단 어디든
const _request = api.request.bind(api);
(api as any).request = (cfg: any) => {
    console.log('[API.REQUEST]', (cfg?.method || 'get'), cfg?.url);
    return _request(cfg);
};

// fetch로 나가는 호출 감지 (개발시에만)
const _fetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    console.log('[FETCH]', typeof input === 'string' ? input : input.toString());
    return _fetch(input, init);
};


export default api;