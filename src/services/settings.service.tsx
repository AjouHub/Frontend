import api from './api';
import type { Keyword } from '../types/keywords';
import type { NoticeType, NotificationPrefs } from '../types/noticeFCM';

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
/** 선택 가능한 공지 유형 목록 (서버 제공 시 그쪽 사용) */
export async function listNoticeTypes(): Promise<NoticeType[]> {
    // TODO: 서버에서 제공하면 아래를 사용
    // const res = await api.get<ApiResponse<{ types: NoticeType[] }>>('/notice/types');
    // return res.data?.data?.types ?? [];

    // 임시 상수
    return ['general', 'scholarship', 'dormitory'];
}

/** 내 알림 설정 조회 */
export async function getNotificationPrefs(): Promise<NotificationPrefs> {
    // TODO: GET /user/notifications/prefs
    const res = await api.get<ApiResponse<NotificationPrefs>>('/user/notifications/prefs');
    return res.data?.data ?? { allTypes: true, selectedTypes: [], useKeywordsOnly: false };
}

/** 내 알림 설정 저장 */
export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
    // TODO: PUT /user/notifications/prefs
    await api.put('/user/notifications/prefs', prefs);
}

/** 브라우저 알림 권한 보장 */
export async function ensureNotificationPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return true; // SSR/미지원 환경
    if (Notification.permission === 'granted') return true;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
}

/**
 * FCM 토큰 발급 & 서버 등록
 * 실제 구현시 firebase messaging 연동 필요:
 * - getToken(messaging, { vapidKey }) 등으로 토큰 발급
 * - 서버에 POST /user/notifications/register { token }
 */
export async function ensureFcmTokenRegistered(): Promise<boolean> {
    // 1) 브라우저 권한
    const ok = await ensureNotificationPermission();
    if (!ok) return false;

    // 2) TODO: 실제 FCM 토큰 발급
    // const token = await getFcmTokenSomehow();
    // if (!token) return false;

    // 3) TODO: 서버에 토큰 등록
    // await api.post('/user/notifications/register', { token });

    // 스켈레톤에서는 true 반환
    return true;
}

/** 서버를 통한 토픽 구독 (클라이언트가 직접 토픽 구독 불가 → 서버 처리 권장) */
export async function subscribeTopics(topics: NoticeType[]): Promise<void> {
    // TODO: POST /user/notifications/subscribe { topics }
    await api.post('/user/notifications/subscribe', { topics });
}

/** 서버를 통한 토픽 구독 해제 */
export async function unsubscribeTopics(topics: NoticeType[]): Promise<void> {
    // TODO: POST /user/notifications/unsubscribe { topics }
    await api.post('/user/notifications/unsubscribe', { topics });
}

/** ===== 파사드(옵션): Settings 관련 편의 메서드 =====
 * UI에서 한 번에 저장/구독 처리하고 싶을 때 쓸 수 있는 헬퍼
 */
export async function saveAllSettingsAndSyncTopics(prefs: NotificationPrefs): Promise<void> {
    await saveNotificationPrefs(prefs);

    const types = await listNoticeTypes();
    if (prefs.allTypes) {
        await subscribeTopics(types);
    } else {
        await subscribeTopics(prefs.selectedTypes);
        const toUnsub = types.filter(t => !prefs.selectedTypes.includes(t));
        if (toUnsub.length) await unsubscribeTopics(toUnsub);
    }
}
