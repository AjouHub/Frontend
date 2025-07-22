// src/pages/Login.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import Home from "./Home";


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
        console.log('Email:', email);
        console.log('Password:', password);
        // 여기에 로그인 API 호출 추가 가능
        window.location.href = 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/auth/google';
        // navigate('/GoogleCallbackPage');
    };

    const handleGoogleLogin = () => {
        // 백엔드 서버의 /auth/google 주소로 리디렉션 (Google 로그인 시작)
        window.location.href = 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/auth/google';
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');

        if (accessToken && refreshToken) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            console.log(accessToken, refreshToken);
            navigate('/account-info'); // ✅ 로그인 성공 시 이동
        }
    }, []);


    return (
        <div style={{ padding: '20px' }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email:</label><br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">로그인</button>
                <button onClick={handleGoogleLogin}>구글 로그인</button>
            </form>
        </div>
    );
}


export default Login;