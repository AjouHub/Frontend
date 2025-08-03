

export const handleOAuthCallback = (navigate: (path: string) => void) => {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const accessToken: string | null = params.get('accessToken');
    const signUp: string | null = params.get('signUp');

    console.log('AccessToken : ', accessToken);
    console.log('signUp: ', signUp);

    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        window.history.replaceState({}, '', '/LoginPage');
        if (signUp) navigate('/select-department');
        navigate('/mypage');
    }
};


export const redirectToGoogleOAuth = () => {
    try {
        console.debug('[Front] Redirecting to /auth/google');
        window.location.href = 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app/auth/google';
    } catch (error) {
        alert('로그인에 실패했습니다.');
        console.error(error);
    }
};