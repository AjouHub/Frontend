export {};

interface AuraSDK {
    openNotice(url: string): void;
    openAbout(url: string): void;  // 어바웃 페이지 전용
    ensureUserTopic(userId: string): void | Promise<void>;
    applyTypeMode(type: string, mode: string): void | Promise<void>;
    onboardingComplete?(): void;
}

declare global {
    interface Window {
        AURA?: AuraSDK;
    }
}
