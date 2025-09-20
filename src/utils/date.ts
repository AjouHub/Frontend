// src/utils/date.ts
export function formatNoticeDate(iso?: string): string {
    if (!iso) return "";

    // 1) "YYYY-MM-DD" 또는 "YYYY/MM/DD" (앞 3개 토큰만 사용)
    const m = iso.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) {
        const yy = m[1].slice(-2);
        const mm = m[2].padStart(2, "0");
        const dd = m[3].padStart(2, "0");
        return `${yy}/${mm}/${dd}`;
    }

    // 2) 그 외 ISO 문자열 대비(예: 2025-09-16T10:00:00Z)
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yy}/${mm}/${dd}`;
    }

    // 3) 인식 불가 시 원문 반환
    return iso;
}
