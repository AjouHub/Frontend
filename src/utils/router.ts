// 전역 navigate 주입/사용 유틸
export type NavigateFn = (path: string, opts?: { replace?: boolean; state?: any }) => void;

// 기본 no-op (초기화 전 호출 방지)
export let appNavigate: NavigateFn = () => {};
export const setAppNavigate = (fn: NavigateFn) => { appNavigate = fn; };
