import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';
import {handleOAuthCallback} from "../../services/auth.service";
import {redirectToGoogleOAuth} from "../../services/auth.service";

export default function LoginPage() {
    // const navigate = useNavigate();

    useEffect(() => {
        handleOAuthCallback();

    }, []);

    async function handleLogin(){
        await redirectToGoogleOAuth();
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
            <h1>로그인</h1>
            <LoginButton onClick={handleLogin}>로그인</LoginButton>
        </div>
    );
}
