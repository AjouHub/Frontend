// services/bookMark.ts
import api from "./api";

interface ApiResponse<T> {
    status: "success" | "error";
    code: number;
    message?: string;
    data: T;
}

/** 공지 북마크 추가 */
export async function addNoticeBookmark(id: string | number): Promise<void> {
    const res = await api.post<ApiResponse<null>>(
        `/user/sabed-notices/${encodeURIComponent(id)}`
    );
    if (res.data.status !== "success") {
        const err = new Error(res.data.message || "북마크 추가에 실패했습니다.");
        (err as any).status = res.status;
        throw err;
    }
}

/** 공지 북마크 해제 */
export async function removeNoticeBookmark(id: string | number): Promise<void> {
    const res = await api.delete<ApiResponse<null>>(
        `/user/sabed-notices/${encodeURIComponent(id)}`
    );
    if (res.data.status !== "success") {
        const err = new Error(res.data.message || "북마크 해제에 실패했습니다.");
        (err as any).status = res.status;
        throw err;
    }
}

/** 편의 함수: true → 추가, false → 해제 */
export async function setNoticeBookmark(
    id: string | number,
    marked: boolean
): Promise<void> {
    return marked ? addNoticeBookmark(id) : removeNoticeBookmark(id);
}

/** ✅ 내가 북마크한 공지들의 ID 목록 조회 */
export async function listNoticeBookmarks(): Promise<(string | number)[]> {
    const res = await api.get<ApiResponse<any>>(`/user/sabed-notices`);

    if (res.data.status !== "success") {
        const err = new Error(res.data.message || "북마크 목록을 불러오지 못했습니다.");
        (err as any).status = res.status;
        throw err;
    }

    const raw = res.data.data;

    // 서버가 [id, id, ...] 또는 [{id}, {noticeId}, ...] 둘 중 하나를 줄 가능성 대비
    if (Array.isArray(raw)) {
        const ids = raw
            .map((item) =>
                typeof item === "object" && item !== null
                    ? item.noticeId ?? item.id
                    : item
            )
            .filter((v): v is string | number => typeof v === "string" || typeof v === "number");

        return ids;
    }

    // 예상치 못한 응답 형식
    throw new Error("북마크 목록 응답 형식이 올바르지 않습니다.");
}
