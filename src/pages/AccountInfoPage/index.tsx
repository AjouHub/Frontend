import React, {JSX, useEffect, useState} from 'react';
import { UserInfo } from '../../types/user';
import { fetchUserInfo } from "../../services/fetchUserInfo";
import NavigationButton from "../../components/NavigationButton";
// import LoginButton from "../LoginPage/LoginButton";
// import {useNavigate} from "react-router-dom";
// import axios from 'axios';

function AccountInfo(): JSX.Element {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [error, setError] = useState<string>('');
    const [statusCode, setStatusCode] = useState<number | string | null>(null);

    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        if (!token) return;

        fetchUserInfo()
            .then((data: UserInfo) => {
                setUser(data)
            })
            .catch((err: unknown) => {
                if (
                    typeof err === 'object' &&
                    err !== null &&
                    'response' in err &&
                    typeof (err as any).response === 'object'
                ) {
                    const response = (err as any).response;
                    setStatusCode(response.status);
                    setError(response.data?.message || '서버 오류 발생');
                } else {
                    setStatusCode('Unknown');
                    setError('알 수 없는 에러 발생');
                }
            });
    }, [token]);

    if (error) {
        return (
            <p style={{ color: 'red' }}>
                {error} <br />
                상태 코드: {statusCode}
            </p>
        );
    }

    if (!user) return <p>로딩 중...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>계정 정보</h2>
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>학과:</strong> {user.departments.join(', ')}</p> <br/>
            <NavigationButton to='/mypage'>홈으로</NavigationButton>
        </div>
    );
}

export default AccountInfo;
