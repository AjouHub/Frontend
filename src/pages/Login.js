// src/pages/Login.js

import React, { useState } from 'react';
// import Home from "./Home";


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
        console.log('Email:', email);
        console.log('Password:', password);
        // 여기에 로그인 API 호출 추가 가능
    };

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
            </form>
        </div>
    );
}


export default Login;