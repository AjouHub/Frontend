import api from './api';
import type { Keyword } from '../types/keywords';

/** 공통 API 응답 타입 (백엔드 실제 스펙에 맞게 조정하세요) */
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

        if (response.data.status != 'success') {
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
    } catch (error) {
        console.error('학과 등록 에러:', error);
        alert('학과 등록에 실패했습니다.');
    }
}

export async function removeDepartment(code: DepartmentCode): Promise<void> {
    try {
        await api.delete('/user/departments', { data: { department: code } });
    } catch (error) {
        console.error('학과 제거 에러:', error);
        alert('학과 제거에 실패했습니다.');
    }
}


// Keywords
export async function listKeywords(): Promise<Keyword[]> {
    try {
        const response = await api.get<ApiResponse<Keyword[]>>('/keywords');

        if (response.data.status != 'success') {
            const error = new Error(response.data.message || '키워드 정보를 불러올 수 없습니다.');
            (error as any).status = response.status;
            throw error;
        }
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export async function addKeyword(phrase: string): Promise<Keyword> {
    const response = await api.post<ApiResponse<Keyword>>('/keywords',
        undefined,
        { params: { phrase } });

    if (response.data.status != 'success') {
        const error = new Error(response.data.message || '키워드 등록에 실패했습니다.');
        (error as any).status = response.status;
        throw error;
    }
    return response.data.data;
}

export async function removeKeyword(id: number): Promise<void> {
    try {
        await api.delete<ApiResponse<null>>(`/keywords/${encodeURIComponent(id)}`);
    } catch (error) {
        console.error('키워드 제거 에러:', error);
        alert('키워드 제거에 실패했습니다.');
    }
}


/** ===== Notifications / FCM ===== */
/** 내가 구독 중인 키워드의 ID 목록 */
export async function listKeywordSubscriptions(): Promise<number[]> {
    const res = await api.get<ApiResponse<number[]>>('/keywords/subscriptions');
    if (res.data.status !== 'success' || !Array.isArray(res.data.data)) {
        const err = new Error(res.data.message || '키워드 구독 목록을 불러올 수 없습니다.');
        (err as any).status = res.status;
        throw err;
    }
    return res.data.data;
}

/** 키워드 구독 (ids 배열) */
export async function subscribeKeywords(ids: number[]): Promise<void> {
    if (!ids.length) return;
    const res = await api.post<ApiResponse<null>>('/keywords/subscribe', { ids });
    if (res.data.status !== 'success') {
        const err = new Error(res.data.message || '키워드 구독에 실패했습니다.');
        (err as any).status = res.status;
        throw err;
    }
}

/** 키워드 구독 해제 (ids 배열) — DELETE body는 config.data에 */
export async function unsubscribeKeywords(ids: number[]): Promise<void> {
    if (!ids.length) return;
    const res = await api.delete<ApiResponse<null>>('/keywords/subscribe', {
        data: { ids },
    });
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
export async function saveKeywordSubscriptions(prev: number[], next: number[]): Promise<void> {
    const prevSet = new Set(prev);
    const nextSet = new Set(next);

    const toSubscribe = next.filter((id) => !prevSet.has(id));
    const toUnsubscribe = prev.filter((id) => !nextSet.has(id));

    if (toSubscribe.length) await subscribeKeywords(toSubscribe);
    if (toUnsubscribe.length) await unsubscribeKeywords(toUnsubscribe);
}