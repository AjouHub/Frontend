import axios from 'axios';

const api = axios.create({
    baseURL: 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app',
    withCredentials: true, // refreshToken 쿠키 전송용
});

// ✅ 1. 요청 시 accessToken 자동 포함
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    // const token = null;  // 토큰 재발급 테스트

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ 2. 응답 에러 시 accessToken 재발급 시도
api.interceptors.response.use(
    (res) => res,
    async (error) => {

        const originalRequest = error.config;

        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // refresh 요청
                const res = await axios.post('/auth/refresh', null, {
                    baseURL: api.defaults.baseURL,
                    withCredentials: true,
                });




                const newAccessToken = res.data.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                console.log('New Token : ', newAccessToken);


                // 헤더에 새 토큰 붙여서 재요청
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error('[토큰 재발급 실패]', refreshError);
                // refresh 실패 → 로그아웃 처리 등
                localStorage.removeItem('accessToken');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
