import {listGlobalKeywords} from "../services/settings.service";

export const DEFAULT_GLOBAL_TAGS = [
    "수강신청", "학사", "계절학기", "강의", "특강",
    "수업", "공모전", "장학", "채용", "설문", "대회",
];

export async function getGlobalTags(): Promise<string[]> {
    try {
        const global_keywords = await listGlobalKeywords();
                                      // 빈 문자열 제거
        return (global_keywords ?? [])
            .map(k => (k?.phrase ?? "").trim())   // phrase만 추출
            .filter(Boolean);
    } catch {
        return DEFAULT_GLOBAL_TAGS;
    }
}
