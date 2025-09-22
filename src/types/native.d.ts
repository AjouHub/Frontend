export {};

declare global {
    interface Window {
        AURA?: {
            /** 네이티브 오버레이 웹뷰로 공지 상세를 열기 */
            openNotice: (url: string) => void;
        };
    }
}
