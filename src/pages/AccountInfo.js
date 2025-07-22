import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AccountInfo() {
    // const [email, setEmail] = useState('yueric050930@ajou.ac.kr');
    // const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [statusCode, setStatusCode] = useState(null);
    // const [loggedIn, setLoggedIn] = useState(false);

    // 예시: 로그인 후 로컬에 저장된 토큰 가져오기
    const token = localStorage.getItem('access_token');


    // const handleLogin = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const res = await axios.post(
    //             'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/auth/google', // ← 로그인 경로 확인 필요
    //             { email, password }
    //         );
    //         const token = res.data.access_token;
    //         localStorage.setItem('access_token', token);
    //         setLoggedIn(true);
    //         setError('');
    //     } catch (err) {
    //         setError('로그인 실패: ' + (err.response?.data?.message || '서버 오류'));
    //     }
    // };


    useEffect(() => {
        axios.get('https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/user/info', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            }
        })
            .then(res => {
                if (res.data.status === 'success') {
                    setUser(res.data.data);
                } else {
                    setError(res.data.message || '사용자 정보를 불러올 수 없습니다.');
                }
            })
            .catch(err => {
                if (err.response) {
                    setStatusCode(err.response.code);
                    setError(err.response.data.message || '서버 오류가 발생했습니다.');
                } else {
                    setStatusCode('Network Error');
                    setError('서버에 연결할 수 없습니다.');
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
            <p><strong>학과:</strong> {user.departments.join(', ')}</p>
        </div>
    );
}

export default AccountInfo;
