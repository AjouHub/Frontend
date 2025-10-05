export {};

interface AuraSDK {
    openNotice(url: string): void;
    ensureUserTopic(userId: string): void | Promise<void>;
    applyTypeMode(type: string, mode: string): void | Promise<void>;
    onboardingComplete?(): void;
}

declare global {
    interface Window {
        AURA?: AuraSDK;
    }
}
