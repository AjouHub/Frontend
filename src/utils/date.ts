// src/utils/date.ts
export function formatNoticeDate(iso?: string): string {
    if (!iso) return "";

    // "YYYY-MM-DD" 또는 "YYYY/MM/DD" (앞 3개 토큰만 사용)
    const m = iso.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) {
        const yy = m[1].slice(-2);
        const mm = m[2].padStart(2, "0");
        const dd = m[3].padStart(2, "0");
        return `${yy}/${mm}/${dd}`;
    }

    // 그 외 ISO 문자열 대비(예: 2025-09-16T10:00:00Z)
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yy}/${mm}/${dd}`;
    }

    // 인식 불가 시 원문 반환
    return iso;
}

export function isNew(date:string, n: number = 1): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || n < 0) return false;

    const [y, m, d] = date.split('-').map(Number);
    const target_date = new Date(y, m - 1, d); target_date.setHours(0, 0, 0, 0);

    const today = new Date(); today.setHours(0, 0, 0, 0);

    const ONE_DAY = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((target_date.getTime() - today.getTime()) / ONE_DAY);

    return (Math.abs(diffDays) <= n);
}