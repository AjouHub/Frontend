import api, {API_BASE_URL} from "./api";
import type {Keyword} from "../types/keywords";
import {notify} from "../utils/notify";


//  앱(WebView) 환경 감지
export function isAppEnv(): boolean {
    const usp = new URLSearchParams(window.location.search);
    if (usp.get('embed') === 'app') return true;
    if ((window as any).ReactNativeWebView) return true;
    // 필요시 UA 플래그도 추가
    if (navigator.userAgent.includes('AURA-App')) return true;
    return (process.env.REACT_APP_RUNTIME || '').toLowerCase() === 'app';
}


export const handleOAuthCallback = (navigate: (path: string) => void) => {
    const params: URLSearchParams = new URLSearchParams(window.location.search);

    const signUp: string | null = params.get('signUp');
    if (signUp === null) return;

    window.history.replaceState({}, '', '/LoginPage');

    if (signUp.toLowerCase() === 'true') navigate('/select-department');
    else navigate('/notice');
};


export async function redirectToGoogleOAuth(): Promise<void> {
    const url = `${API_BASE_URL}/auth/google`;

    // JSON 파싱을 안전하게 하려는 작은 헬퍼
    const tryReadMessage = async (res: Response) => {
        try {
            const ct = res.headers.get("content-type") || "";
            if (!ct.includes("application/json")) return null;
            const json: any = await res.json();
            // 명세: { status:"error", code:502, message:"...", data:{ errors:[{code:...}] } }
            return typeof json?.message === "string" ? json.message : null;
        } catch {
            return null;
        }
    };

    try {
        const res = await fetch(url, {
            method: "GET",
            credentials: "include",
            redirect: "manual",   // ← 302를 자동 추적하지 않음
            cache: "no-store",
        });

        // 502라면 서버가 내려준 message를 그대로 노출
        if (res.status === 502) {
            const msg = (await tryReadMessage(res)) ?? "로그인 서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.";
            notify.error(msg);
            return;
        }

        // 크로스오리진 302는 status가 0 + type 'opaqueredirect' 로 옵니다.
        // 동일 오리진이면 302가 그대로 올 수 있음.
        if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
            // 문제 없으니 실제 네비게이션 수행
            window.location.replace(url); // or assign(url)
            return;
        }

        // 여기까지 왔는데 2xx가 아니라면(=예상 밖 응답) 메시지 보여주기
        if (!(res.status >= 200 && res.status < 300)) {
            const msg = (await tryReadMessage(res)) ?? `로그인 요청에 실패했습니다. (HTTP ${res.status})`;
            notify.error(msg);
            return;
        }

        // 서버가 2xx로 뭔가 별도 처리하는 경우가 아니라면, 최종적으로 이동
        window.location.replace(url);
    } catch {
        notify.error("네트워크 오류로 로그인 페이지를 열 수 없습니다.");
    }
};