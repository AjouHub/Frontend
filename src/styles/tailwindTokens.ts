// 파일: features/notice/styles/tailwindTokens.ts
export const CHIP_BASE = "px-3 py-1 rounded-full text-sm font-medium";
export const CHIP_INACTIVE = "bg-gray-100 text-gray-600";
/** 공지사항 태그/탭의 카테고리별 배경색 및 글자색 */
export const NOTICE_CATEGORY_STYLES: Record<string, { tag: string; tabActive: string }> = {
    "일반": {
        tag: "bg-blue-100 text-blue-800",
        tabActive: "bg-blue-500 text-white"
    },
    "장학": {
        tag: "bg-amber-100 text-amber-800",
        tabActive: "bg-amber-500 text-white"
    },
    "생활관": {
        tag: "bg-green-100 text-green-800",
        tabActive: "bg-green-500 text-white"
    },
    "학과": {
        tag: "bg-purple-100 text-purple-800",
        tabActive: "bg-purple-500 text-white"
    }
};
/** (옵션) 하단 네비게이션 활성/비활성 탭 색상 */
export const NAV_ACTIVE_COLOR = "text-blue-500";
export const NAV_INACTIVE_COLOR = "text-gray-400";
