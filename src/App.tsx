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

    // OAuth 콜백 처리 (개선된 버전)
    useEffect(() => {
        // 이미 처리했으면 스킵
        if (hasProcessedOAuth.current) {
            return;
        }

        const params = new URLSearchParams(location.search);
        const signUp = params.get('signUp');

        console.log('[App] Current location:', {
            pathname: location.pathname,
            search: location.search,
            signUp: signUp
        });

        if (signUp !== null) {
            hasProcessedOAuth.current = true;

            // ✅ signUp=true면 sessionStorage에 플래그 저장
            if (signUp.toLowerCase() === 'true') {
                sessionStorage.setItem('justSignedUp', '1');
                console.log('[App] Set justSignedUp flag in sessionStorage');

                // 앱 환경에서는 직접 navigate 대신 state로 전달
                navigate('/select-department', {
                    replace: true,
                    state: { signUp: true }
                });
            } else {
                navigate('/notice', { replace: true });
            }
        }
    }, [location.search, navigate]);

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