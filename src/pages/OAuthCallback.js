// src/pages/OAuthCallback.js

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');

        if (token) {
            localStorage.setItem('access_token', token);
            navigate('/account-info'); // 여기서 이동
        } else {
            console.error('토큰이 없습니다.');
            navigate('/');
        }
    }, [navigate]);

    return <p>로그인 중입니다...</p>;
}

export default OAuthCallback;