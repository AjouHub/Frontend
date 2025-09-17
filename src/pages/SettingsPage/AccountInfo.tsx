import React, {JSX, useEffect, useState} from 'react';
import { UserInfo } from '../../types/user';
import { fetchUserInfo } from "../../services/fetchUserInfo";

export default function AccountInfoPage(): JSX.Element {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [error, setError] = useState<string>('');
    const [statusCode, setStatusCode] = useState<number | string | null>(null);

    // const token = localStorage.getItem('accessToken');

    useEffect(() => {
        // if (!token) return;
        (async () => {
            try {
                const data = await fetchUserInfo();
                setUser(data);
            } catch (err: any) {
                if (err?.response) {
                    setStatusCode(err.response.status);
                    setError(err.response.data?.message || '서버 오류 발생');
                } else {
                    setStatusCode('Unknown');
                    setError('알 수 없는 에러 발생');
                }
            }
        })();
    }, []); // ★ 의존성 배열 추가


    if (error) {
        return (
            <p style={{ color: 'red' }}>
                {error} <br />
                상태 코드: {statusCode}
            </p>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '20px' }}>
                <h1>로딩 중...</h1>
            </div>
        );
    }

    return (
        <div className="account-info">
            <h2>계정 정보</h2>
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>학과:</strong> {user.departments.join(', ')}</p>
        </div>
    );
}
