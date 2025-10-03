// services/bookMark.service.ts
import api from "./api";
import { BookMark } from '../types/bookmark'


interface ApiResponse<T> {
    status: "success" | "error";
    code: number;
    message?: string;
    data: T;
}

/** 공지 북마크 추가 */
export async function addNoticeBookmark(id: string): Promise<void> {
    const res = await api.post<ApiResponse<null>>(
        `/user/saved-notices/${id}`
    );
    if (res.data.status !== "success") {
        const err = new Error(res.data.message || "북마크 추가에 실패했습니다.");
        (err as any).status = res.status;
        throw err;
    }
}

/** 공지 북마크 해제 */
export async function removeNoticeBookmark(id: string): Promise<void> {
    const res = await api.delete<ApiResponse<null>>(
        `/user/saved-notices/${id}`
    );
    if (res.data.status !== "success") {
        const err = new Error(res.data.message || "북마크 해제에 실패했습니다.");
        (err as any).status = res.status;
        throw err;
    }
}

/** 편의 함수: true → 추가, false → 해제 */
export async function setNoticeBookmark(
    id: string,
    marked: boolean
): Promise<void> {
    return marked ? addNoticeBookmark(id) : removeNoticeBookmark(id);
}

// 북마크한 공지들의 ID 목록 조회
export async function listNoticeBookmarks(): Promise<BookMark[]> {
    const res = await api.get<ApiResponse<BookMark[]>>(`/user/saved-notices`);

    if (res.data.status !== "success") {
        const err = new Error(res.data.message || "북마크 목록을 불러오지 못했습니다.");
        (err as any).status = res.status;
        throw err;
    }

    return res.data.data;
}
