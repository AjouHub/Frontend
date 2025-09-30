import api, {API_BASE_URL} from "./api";
import {notify} from "../utils/notify";
import {appNavigate} from "../utils/router";
import {UserInfo} from "../types/user";
import {fetchUserInfo} from "./fetchUserInfo";


//  앱(WebView) 환경 감지
export function isAppEnv(): boolean {
    const usp = new URLSearchParams(window.location.search);
    if (usp.get('embed') === 'app') return true;
    if ((window as any).ReactNativeWebView) return true;
    // 필요시 UA 플래그도 추가
    if (navigator.userAgent.includes('AURA-App')) return true;
    return (process.env.REACT_APP_RUNTIME || '').toLowerCase() === 'app';
}

/** OAuth 콜백 처리: /?signUp=... 만 보고 라우팅 + 쿼리 정리 */
export const handleOAuthCallback = (): void => {
    const { pathname, search } = window.location;     // 예: "/" 와 "?signUp=false&x=1"
    if (!search) return;

    const params = new URLSearchParams(search);
    const signUp = params.get('signUp');
    if (signUp == null) return;

    // URL에서 signUp만 제거(다른 쿼리는 유지)
    params.delete('signUp');
    const cleaned = params.toString();
    const newUrl = cleaned ? `${pathname}?${cleaned}` : pathname;
    window.history.replaceState({}, '', newUrl);

    // 분기 이동
    const target = signUp.toLowerCase() === 'true'
        ? '/select-department'
        : '/notice';

    appNavigate(target, { replace: true });
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


/**
 * [앱 전용] 사용자 정보를 가져온 후, 네이티브 앱에 토픽 구독을 요청합니다.
 * 앱이 시작되거나 로그인 직후 한 번만 호출되는 것이 가장 이상적입니다.
 */
export async function fetchUserAndNotifyNativeApp(): Promise<void> {
    try {
        const user = await fetchUserInfo();

        // 유저 이메일이 있고, 앱 환경일 때만 네이티브 함수 호출
        if (user?.email && isAppEnv() && window.AURA?.ensureUserTopic) {
            window.AURA.ensureUserTopic(String(user.email));
        }
    } catch (error) {
        console.error("Failed to fetch user and notify native app:", error);
    }
}