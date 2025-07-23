import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';

export default function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            // ✅ localStorage에 저장
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // ✅ 주소창에서 토큰 제거 (보안상 중요)
            window.history.replaceState({}, '', '/LoginPage');

            // ✅ 마이페이지로 이동
            navigate('/MyPage');
        }
    }, [navigate]);

    const handleLogin = () => {
        try {
            console.debug('[Front] Redirecting to /auth/google');
            window.location.href = 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/auth/google';
        } catch (error) {
            alert('로그인에 실패했습니다.');
            console.error(error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
            <h1>로그인</h1>
            <LoginButton onClick={handleLogin} />
        </div>
    );
}
