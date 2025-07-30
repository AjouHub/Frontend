import api from './api';
import { NoticePage } from '../types/notice';

interface FetchNoticeParams {
    page?: number;
    size?: number;
    type?: string;
    search?: string;
    sort?: string;
}

export async function fetchNotices({
                                       page = 0,
                                       size = 10,
                                       type,
                                       search,
                                       sort = 'date,desc',
                                   }: FetchNoticeParams): Promise<NoticePage> {
    try {
        const response = await api.get('/notices', {
            params: {
                page,
                size,
                type,
                search,
                sort,
            },
            withCredentials: true,
        });

        if (response.data.status !== 'success') {
            const error = new Error(response.data.message || '공지사항을 불러올 수 없습니다.');
            (error as any).status = response.status;
            throw error;
        }

        return response.data.data as NoticePage;
    } catch (error) {
        throw error;
    }
}
