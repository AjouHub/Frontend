import axios from "axios";
import { UserInfo } from '../types/user';

export async function fetchUserInfo(token: string): Promise<UserInfo> {
    if (!token) {
        throw new Error('No token');
    }

    const res = await axios.get(
        'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/user/info', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            withCredentials: true,
        });

    if (res.data.status != 'success') {
        const error = new Error(res.data.message || '사용자 정보를 불러올 수 없습니다.');
        (error as any).status = res.status;
        throw error;
    }

    return res.data.data as UserInfo;
}
