import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';
import { FontImport, LoginPageWrapper } from './login.style';
import { handleOAuthCallback, redirectToGoogleOAuth } from "../../services/auth.service";


export default function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        handleOAuthCallback(navigate);
    }, [navigate]);

    const handleLogin = () => {
        redirectToGoogleOAuth();
    };


    return (
        <>
            <FontImport /> {/* 폰트 불러오기 (이 페이지에서만) */}
            <LoginPageWrapper>
                <h1 style={{ fontSize: '45px' }}>AjouNotice</h1>
                <div style={{ marginTop: '60px' }}>
                    <LoginButton onClick={handleLogin}>로그인</LoginButton>
                </div>
            </LoginPageWrapper>
        </>
    );
}