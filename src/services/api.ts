import axios, {
    AxiosInstance,
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';



// 런타임 감지
const IS_APP =
    !!(window as any).ReactNativeWebView ||
    new URLSearchParams(window.location.search).get('embed') === 'app' ||
    (process.env.REACT_APP_RUNTIME || '').toLowerCase() === 'app';
const IS_WEB = !IS_APP;

// 기본 설정
const ORIGIN_URL = (process.env.REACT_APP_SERVER_URL || '').replace(/\/+$/, '');
const API_PREFIX = '/api';
export const API_BASE_URL = `${ORIGIN_URL}${API_PREFIX}`;
console.log('[API] BASE_URL =', API_BASE_URL);

const bare = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: IS_WEB,
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
    withCredentials: IS_WEB, // 웹만 쿠키 사용
    ...(IS_WEB
        ? {
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
        }
        : {}),
});

// 앱용 토큰 저장소(웹에서는 사용 금지)
const TOK = 'ajouhub:auth';
const tokenStore = {
    get access() {
        try { return localStorage.getItem(`${TOK}:access`); } catch { return null; }
    },
    get refresh() {
        try { return localStorage.getItem(`${TOK}:refresh`); } catch { return null; }
    },
    set(access?: string | null, refresh?: string | null) {
        try {
            if (access !== undefined) {
                access === null
                    ? localStorage.removeItem(`${TOK}:access`)
                    : localStorage.setItem(`${TOK}:access`, access);
            }
            if (refresh !== undefined) {
                refresh === null
                    ? localStorage.removeItem(`${TOK}:refresh`)
                    : localStorage.setItem(`${TOK}:refresh`, refresh);
            }
        } catch {}
    },
    clear() { this.set(null, null); },
};

// ★ 웹 런타임에서는 혹시 남아있던 앱용 토큰을 청소
if (IS_WEB) {
    try {
        localStorage.removeItem(`${TOK}:access`);
        localStorage.removeItem(`${TOK}:refresh`);
    } catch {}
}

// 인터셉터 없는 얇은 클라이언트(무한루프 방지)
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: IS_WEB,
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

type RetriableCfg = AxiosRequestConfig & { _retry?: boolean; _isRefresh?: boolean };

// 리프레시 핵심
async function doRefreshCore(): Promise<void> {
    if (IS_WEB) {
        // ★ 웹: 쿠키만 사용 (바디에 RT 절대 금지)
        // await refreshClient.post('/auth/refresh'); // body/headers 지정 X
        await refreshClient.post(
            '/auth/refresh',
            undefined,
            // {}, // 빈 JSON
            {
                withCredentials: true,
                // headers: {
                //     Accept: 'application/json',
                //     'Content-Type': 'application/json',
                // },
                _isRefresh: true as any,  // 루프 방지 플래그를 쓰고 있다면 유지
            } as any
        );
    } else {
        // ★ 앱: 바디로 RT를 보냄
        const rt = tokenStore.refresh;
        if (!rt) throw new Error('No refresh token (app)');
        const res = await refreshClient.post(
            '/auth/refresh',
            { refreshToken: rt },
            {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            }
        );
        const payload = (res.data && (res.data as any).data) ? (res.data as any).data : res.data;
        const { accessToken, refreshToken } = (payload ?? {}) as {
            accessToken?: string;
            refreshToken?: string | null;
        };
        if (!accessToken) throw new Error('Refresh response has no accessToken');
        tokenStore.set(accessToken, refreshToken ?? rt);
    }
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

    if (isWrite && !(cfg.headers as any)['Content-Type']) {
        (cfg.headers as any)['Content-Type'] = 'application/json';
    }

    // ★ 웹: 쓰기 요청이면 CSRF 헤더 보장
    if (IS_WEB && isWrite) {
        let t = sessionStorage.getItem(CSRF_KEY);
        if (!t) {                      // 아직 없으면 먼저 받아온다
            await csrfOnce();
            t = sessionStorage.getItem(CSRF_KEY);
        }
        if (t) (cfg.headers as any)['X-XSRF-TOKEN'] = t;
    }

    // 앱: Bearer
    if (IS_APP) {
        const at = tokenStore.access;
        if (at) (cfg.headers as any).Authorization = `Bearer ${at}`;
    }

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

        // (기존) 만료 처리
        const isExpiredWeb = IS_WEB && (status === 401 || status === 403);
        const isExpiredApp = IS_APP && (status === 401 || status === 403) && !!tokenStore.refresh;
        const isRefreshCall = cfg._isRefresh === true || url.includes('/auth/refresh');

        if (!isAuthApi && !isRefreshCall && !cfg._retry && (isExpiredWeb || isExpiredApp)) {
            cfg._retry = true;

            try {
                console.debug('[토큰 재발급 시도]', { isWeb: IS_WEB, req: url });
                await refreshOnce();                 // ← 실제 재발급 호출
                console.info('[토큰 재발급 성공]');

                if (IS_APP) {
                    cfg.headers = cfg.headers ?? {};
                    const at = tokenStore.access;
                    if (at) (cfg.headers as any).Authorization = `Bearer ${at}`;
                }

                return api.request(cfg);
            } catch (e) {
                console.error('[토큰 재발급 실패]', e);
                // 필요 시 로그인 화면 이동
                window.location.href = '/';
                throw e;
            }
        }

        // ★ 웹: CSRF 문제(403)면 1회 부트스트랩 후 재시도
        if (IS_WEB && status === 403 && !isAuthApi && !(cfg as any)._retry403) {
            (cfg as any)._retry403 = true;
            await csrfOnce();
            // 헤더에 최신 토큰 반영
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

// 앱 로그인/로그아웃 헬퍼
export const authTokens = {
    setFromLogin(accessToken: string, refreshToken?: string | null) {
        if (IS_APP) tokenStore.set(accessToken, refreshToken ?? null);
    },
    clear() { tokenStore.clear(); },
};
