// src/pages/LoginPage/index.tsx
import { useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';
import { loginWithGoogle } from '../../services/auth.service';

export default function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await loginWithGoogle();              // 로그인 API 호출 및 토큰 저장
            navigate('/mypage');                  // 성공 시 마이페이지로 이동
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
