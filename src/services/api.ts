import axios, {
    AxiosInstance,
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';
import { isAppEnv } from "./auth.service";
import {useNavigate} from "react-router-dom";


// // 런타임 감지
// const IS_APP =
//     !!(window as any).ReactNativeWebView ||
//     new URLSearchParams(window.location.search).get('embed') === 'app' ||
//     (process.env.REACT_APP_RUNTIME || '').toLowerCase() === 'app';
const IS_APP = isAppEnv();
const IS_WEB = !IS_APP;

// 기본 설정
const ORIGIN_URL = (process.env.REACT_APP_SERVER_URL || '').replace(/\/+$/, '');
const API_PREFIX = '/api';
export const API_BASE_URL = `${ORIGIN_URL}${API_PREFIX}`;
console.log('[API] BASE_URL =', API_BASE_URL);

const bare = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const CSRF_KEY = 'CSRF';
let csrfLock: Promise<void> | null = null;

async function bootstrapCsrf(): Promise<void> {
    const res = await bare.get('/auth/csrf', { headers: { Accept: 'application/json' } });
    const headers = res.headers || {};
    const fromHeader = (headers['x-csrf-token'] as string) || (headers['X-CSRF-TOKEN'] as any);
    const fromBody = (res.data && (res.data.token || res.data.csrf || res.data.value)) ?? null;
    const token = (fromHeader || fromBody || '').toString();
    if (token) sessionStorage.setItem(CSRF_KEY, token);
}

async function csrfOnce(): Promise<void> {
    if (!csrfLock) csrfLock = bootstrapCsrf().finally(() => (csrfLock = null));
    return csrfLock;
}

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 앱도 쿠키 사용
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    // ...(IS_WEB
    //     ? {
    //         xsrfCookieName: 'XSRF-TOKEN',
    //         xsrfHeaderName: 'X-XSRF-TOKEN',
    //     }
    //     : {}),
});

/* ===================== 앱 REAUTH 신호 ===================== */
function requestAppReauth() {
    const payload = JSON.stringify({ type: 'REAUTH' });
    try { (window as any).AURA?.postMessage(payload); } catch {}
    try { (window as any).ReactNativeWebView?.postMessage(payload); } catch {}
}


/* ===================== (웹 전용) 토큰 리프레시 ===================== */
type RetriableCfg = AxiosRequestConfig & { _retry?: boolean; _isRefresh?: boolean };

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// ✅ 헤더/바디를 모두 비워서 프리플라이트, CORS 변수 제거
refreshClient.interceptors.request.use(cfg => {
    if (cfg.headers) {
        delete (cfg.headers as any).Authorization;
        delete (cfg.headers as any)['Content-Type'];
        delete (cfg.headers as any).Accept;
        delete (cfg.headers as any)['X-XSRF-TOKEN'];
    }
    return cfg;
});

// 리프레시 핵심
async function doRefreshCore(): Promise<void> {
    // ★ 웹: 쿠키만 사용 (바디에 RT 절대 금지)
    await refreshClient.post(
        '/auth/refresh',
        undefined,
        {
            withCredentials: true,
            _isRefresh: true as any,  // 루프 방지 플래그를 쓰고 있다면 유지
        } as any
    );
}

// 동시 리프레시 락
let refreshLock: Promise<void> | null = null;
async function refreshOnce(): Promise<void> {
    if (!refreshLock) refreshLock = doRefreshCore().finally(() => (refreshLock = null));
    return refreshLock;
}

// 요청 인터셉터
api.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any).Accept = 'application/json';

    const m = (cfg.method ?? 'get').toLowerCase();
    const isWrite = ['post','put','patch','delete'].includes(m);

    // if (isWrite && !(cfg.headers as any)['Content-Type']) {
    //     (cfg.headers as any)['Content-Type'] = 'application/json';
    // }

    // ★ 웹: 쓰기 요청이면 CSRF 헤더 보장
    // 웹에서만 CSRF 처리
    if (IS_WEB && isWrite) {
        let t = sessionStorage.getItem(CSRF_KEY);
        if (!t) {                      // 아직 없으면 먼저 받아온다
            await csrfOnce();
            t = sessionStorage.getItem(CSRF_KEY);
        }
        if (t) (cfg.headers as any)['X-XSRF-TOKEN'] = t;
    }

    // ✅ 앱 모드: Authorization 절대 붙이지 않음(토큰 저장/관리 금지)
    // (이전에 있던 Bearer 주입 로직 제거)

    return cfg;
});

// 응답 인터셉터(401/403 → 리프레시 → 재시도)
api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const cfg = (error.config || {}) as RetriableCfg;
        const status = error.response?.status ?? 0;

        const url = String(cfg.url || '');
        const isAuthApi = url.startsWith('/auth/');
        const isRefreshCall = cfg._isRefresh === true || url.includes('/auth/refresh');

        // ---- 401/403 처리 ----
        // 웹: 쿠키 기반 → 프론트에서 /auth/refresh 호출 후 재시도
        // const shouldRefreshWeb = IS_WEB && !isAuthApi && !isRefreshCall && !cfg._retry && (status === 401 || status === 403);
        // 웹, 앱 : 쿠키 기반
        // const shouldRefresh = IS_WEB && !isAuthApi && !isRefreshCall && !cfg._retry && (status === 401 || status === 403);
        const shouldRefresh = !isAuthApi && !isRefreshCall && !cfg._retry && (status === 401 || status === 403);

        // // 앱: 프론트는 리프레시/토큰 관리 금지 → 앱에 REAUTH 신호 후 리로드
        // const shouldReauthApp = IS_APP && !isAuthApi && !isRefreshCall && (status === 401 || status === 403);

        if (shouldRefresh) {
            cfg._retry = true;
            try {
                console.debug('[WEB] 토큰 재발급 시도');
                await refreshOnce();
                console.info('[WEB] 토큰 재발급 성공');
                return api.request(cfg);
            } catch (e) {
                console.error('[WEB] 토큰 재발급 실패', e);
                // 필요하면 로그인 화면 이동
                // window.location.href = '/login';
                const navigate = useNavigate();
                navigate('/login')
                throw e;
            }
        }

        // if (shouldReauthApp) {
        //     console.warn('[APP] 401/403 → REAUTH 신호 전송');
        //     requestAppReauth();
        //     // 앱이 SSO로 쿠키를 재주입하는 동안 페이지를 새로고침(세션 반영)
        //     setTimeout(() => {
        //         const url = new URL(window.location.href);
        //         url.searchParams.set('embed', 'app');
        //         window.location.replace(url.toString());
        //     }, 600);
        //     // 여기서 체인을 끝내 브라우저가 진행을 멈추게 한다.
        //     return new Promise(() => {});
        // }

        // 쿠키 기반 CSRF 미부트스트랩(403) → 1회 부트스트랩 후 재시도
        if (!isAuthApi && status === 403 && !(cfg as any)._retry403) {
            (cfg as any)._retry403 = true;
            await csrfOnce();
            const t = sessionStorage.getItem(CSRF_KEY);
            if (t) {
                cfg.headers = cfg.headers ?? {};
                (cfg.headers as any)['X-XSRF-TOKEN'] = t;
            }
            return api.request(cfg);
        }

        throw error;
    }
);

export default api;