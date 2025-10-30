import api from './api';
import type { Keyword } from '../types/keywords';
import { notify } from "../utils/notify";


// 공통 API 응답 타입
interface ApiResponse<T> {
    status: 'success' | 'error';
    code: number;
    message?: string;
    data: T;
}

// Departments
export type DepartmentCode = string;

export async function listDepartments(): Promise<DepartmentCode[]> {
    try {
        const response = await api.get('/user/departments');

        if (response.data.status !== 'success') {
            const error = new Error(response.data.message || '학과 정보를 불러올 수 없습니다.');
            (error as any).status = response.status;
            throw error;
        }
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export async function addDepartment(code: DepartmentCode): Promise<void> {
    try {
        await api.post('/user/departments', { department: code });
        notify.success('학과 등록에 성공했습니다.');
    } catch (error: any) {
        const status = error?.response?.status;
        const data = error?.response?.data;

        if (status === 409) {
            const code = data?.errors?.[0]?.code;
            const msg = data?.message;
            notify.error(msg);
        }
    }
}

export async function removeDepartment(code: DepartmentCode): Promise<void> {
    try {
        await api.delete('/user/departments', { data: { department: code } });
        notify.warn('학과를 제거했습니다.');
    } catch (error) {
        console.error('학과 제거 에러:', error);
        // alert('학과 제거에 실패했습니다.');
        notify.error('학과 제거에 실패했습니다.');
    }
}



// Keywords
export async function listKeywords(): Promise<Keyword[]> {
    try {
        const response = await api.get<ApiResponse<Keyword[]>>('/keywords');

        if (response.data.status !== 'success') {
            const error = new Error(response.data.message || '키워드 정보를 불러올 수 없습니다.');
            (error as any).status = response.status;
            throw error;
        }
        return response.data.data;
    } catch (error) {
        throw error;
    }
}
// globalKeywords
export async function listGlobalKeywords(): Promise<Keyword[]> {
    try {
        const response = await api.get<ApiResponse<Keyword[]>>('/keywords/global');

        if (response.data.status !== 'success') {
            const error = new Error(response.data.message || '전역 키워드 정보를 불러올 수 없습니다.');
            (error as any).status = response.status;
            throw error;
        }
        return response.data.data;
    } catch (error) {
        throw error;
    }
}



export async function addKeyword(phrase: string): Promise<Keyword> {
    try {
        const response = await api.post<ApiResponse<Keyword>>('/keywords',
            undefined,
            {params: {phrase}});
        notify.success('키워드 등록에 성공했습니다.')
        return response.data.data;
    } catch(e: any) {
        const status = e?.response?.status;
        const data = e?.response?.data;

        if (status === 409) {
            const code = data?.errors?.[0]?.code;
            const msg = data?.message;
            notify.error(msg);
        }
        // 호출부에서 더 처리할 수 있게 그대로 던짐(또는 여기서 종료해도 됨)
        throw e;
    }
}

export async function removeKeyword(id: number): Promise<void> {
    try {
        await api.delete<ApiResponse<null>>(`/keywords/${encodeURIComponent(id)}`);
        notify.warn('키워드를 제거했습니다.')
    } catch (e: any) {
        const status = e?.response?.status;
        const data = e?.response?.data;

        if (status === 409) {
            const code = data?.errors?.[0]?.code;
            const msg = data?.message;
            notify.error(msg);
        }
        else if (status === 500) notify.error("구독 중인 키워드는 제거할 수 없습니다.");
        console.error('키워드 제거 에러:', e);
        // alert('키워드 제거에 실패했습니다.');
        // notify.warn('키워드 제거에 실패했습니다.');
        // 호출부에서 더 처리할 수 있게 그대로 던짐(또는 여기서 종료해도 됨)
        throw e;
    }
}



// Notifications / FCM
export async function listKeywordSubscriptions(category: string): Promise<number[]> {
    const res = await api.get<ApiResponse<number[]>>(
        `/subscriptions/types/${category}/keywords`);

    if (res.data.status !== 'success' || !Array.isArray(res.data.data)) {
        const err = new Error(res.data.message || '키워드 구독 목록을 불러올 수 없습니다.');
        (err as any).status = res.status;
        throw err;
    }
    return res.data.data;
}


// 키워드 구독
// 구독 추가
export async function subscribeKeywords(category:string, id: number): Promise<void> {
    const res = await api.post<ApiResponse<null>>(
        `/subscriptions/types/${category}/keywords`,
        undefined,
            {params: { keywordId: id }});
    if (res.data.status !== 'success') {
        const err = new Error(res.data.message || '키워드 구독에 실패했습니다.');
        (err as any).status = res.status;
        throw err;
    }
}

// 구독 해제
export async function unsubscribeKeywords(category:string, id: number): Promise<void> {
    const res = await api.delete<ApiResponse<null>>(
        `/subscriptions/types/${category}/keywords/${id}`);
    if (res.data.status !== 'success') {
        const err = new Error(res.data.message || '키워드 구독 해제에 실패했습니다.');
        (err as any).status = res.status;
        throw err;
    }
}

/**
 * 구독 저장 헬퍼: 이전 구독 목록(prev)과 새 구독 목록(next)의 차이를 계산해서
 * subscribe/unsubscribe 를 각각 호출.
 */
export async function saveKeywordSubscriptions(prev: number[], next: number[], category:string): Promise<void> {
    const prevSet = new Set(prev);
    const nextSet = new Set(next);

    const toSubscribe = next.filter((id) => !prevSet.has(id));
    const toUnsubscribe = prev.filter((id) => !nextSet.has(id));

    if (toSubscribe.length) {
        for (const keyword_id of toSubscribe) await subscribeKeywords(category, keyword_id);
    }
    if (toUnsubscribe.length) {
        for (const keyword_id of toUnsubscribe) await unsubscribeKeywords(category, keyword_id);
    }
}


export async function subscribeType(category:string): Promise<string> {
    const res = await api.get<ApiResponse<string>>(`/subscriptions/types/${category}`);

    if (res.data.status !== 'success') {
        const err = new Error(res.data.message || '구독 모드를 불러올 수 없습니다.');
        (err as any).status = res.status;
        throw err;
    }
    return res.data.data;
}

export async function SetSubscibeType(category:string, mode:string): Promise<void> {
    const res = await api.post<ApiResponse<null>>(
        `/subscriptions/types/${category}/mode`,
        undefined,
        {params: { value: mode }});
    if (res.data.status !== 'success') {
        const err = new Error(res.data.message || '구독 모드 설정에 실패했습니다.');
        (err as any).status = res.status;
        throw err;
    }
    // 모드 저장 성공 시
    window.AURA?.applyTypeMode?.(category, mode) // mode: "ALL" | "KEYWORD" | "NONE"
}


// 로그아웃 쿠키 삭제
export async function deleteCookie(): Promise<void> {
    try {
        await api.post('/auth/logout');
    } catch (e) {
        throw e;
    }
}