// App.tsx
import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import SelectDepartmentPage from "./pages/SelectDepartmentPage";
import NoticePage from "./pages/NoticePage";
import SettingsPage from "./pages/SettingsPage";
import {BookMarkPage} from "./pages/BookMarkPage";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useEffect, useRef} from "react";
import {setAppNavigate} from "./utils/router";
import {fetchUserAndNotifyNativeApp, isAppEnv} from "./services/auth.service";
import {LoginErrorPage} from "./pages/LoginErrorPage";
import RequireOnboarding from "./layouts/RouteGuard";


function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasProcessedOAuth = useRef(false);

    useEffect(() => {
        setAppNavigate((path, opts) => navigate(path, opts));
    }, [navigate]);

    useEffect(() => {
        // ✅ sessionStorage에서 플래그 확인
        const processed = sessionStorage.getItem('oauthProcessed');
        if (processed === '1') {
            console.log('[App] OAuth already processed in this session');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const signUp = params.get('signUp');

        console.log('[App] OAuth check:', JSON.stringify({
            windowSearch: window.location.search,
            signUp: signUp,
            processed: processed
        }));

        if (signUp !== null) {
            // 처리했다고 표시
            sessionStorage.setItem('oauthProcessed', '1');

            // URL에서 쿼리 제거
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete('signUp');
            const newSearch = newParams.toString();
            const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
            window.history.replaceState(null, '', newUrl);

            if (signUp.toLowerCase() === 'true') {
                sessionStorage.setItem('justSignedUp', '1');
                console.log('[App] ✅ Set justSignedUp=1, removed signUp query');

                navigate('/select-department', {
                    replace: true,
                    state: { signUp: true }
                });
            } else {
                navigate('/notice', { replace: true });
            }
        }
    }, [navigate]);

    // 앱이 처음 로드될 때 사용자 정보를 가져오고 네이티브에 알림
    useEffect(() => {
        // 앱 환경 체크 (예: UserAgent 또는 window 객체의 특정 속성)
        const isApp = isAppEnv();
        console.log('[App] Environment:', isApp ? 'App' : 'Web');

        fetchUserAndNotifyNativeApp();
    }, []);

    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<RequireOnboarding />}>
                    <Route element={<AppLayout />}>
                        <Route index element={<NoticePage />} />
                        <Route path="/notice" element={<NoticePage />} />
                        <Route path="/bookmark" element={<BookMarkPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/select-department" element={<SelectDepartmentPage />} />
                        <Route path="/auth/error" element={<LoginErrorPage />} />
                        <Route path="*" element={<NoticePage />} />
                    </Route>
                </Route>
            </Routes>

            <ToastContainer
                position="top-center"
                autoClose={2200}
                limit={3}
                newestOnTop
                pauseOnFocusLoss={false}
                draggable={false}
                theme="light"
            />
        </>
    );
}

export default App;