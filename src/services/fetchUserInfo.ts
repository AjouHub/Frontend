import api from './api';
import { UserInfo } from '../types/user';

export async function fetchUserInfo(): Promise<UserInfo> {
    console.log('*** FETCH_USER_INFO (services/fetchUserInfo.ts) ***');

    console.log('[fetchUserInfo] api id =', (api as any).__ID); // 디버그 테스트용

    try {
        const response = await api.get('/user/info');

        if (response.data.status != 'success') {
            const error = new Error(response.data.message || '사용자 정보를 불러올 수 없습니다.');
            (error as any).status = response.status;
            throw error;
        }

        return response.data.data as UserInfo;
    } catch (error) {
        console.log('*** FETCH_USER_INFO ERROR ***', error);
        throw error;
    }

}
