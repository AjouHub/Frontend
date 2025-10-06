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
        if (hasProcessedOAuth.current) {
            return;
        }

        // ✅ React Router 대신 window.location 직접 사용
        const params = new URLSearchParams(window.location.search);
        const signUp = params.get('signUp');

        console.log('[App] OAuth check (window.location):', JSON.stringify({
            windowPathname: window.location.pathname,
            windowSearch: window.location.search,
            reactRouterPathname: location.pathname,
            reactRouterSearch: location.search,
            signUp: signUp,
            hasProcessedOAuth: hasProcessedOAuth.current
        }));

        if (signUp !== null) {
            hasProcessedOAuth.current = true;

            if (signUp.toLowerCase() === 'true') {
                sessionStorage.setItem('justSignedUp', '1');
                console.log('[App] ✅ Set justSignedUp=1 in sessionStorage');
                console.log('[App] 🚀 Navigating to /select-department');

                navigate('/select-department', {
                    replace: true,
                    state: { signUp: true }
                });
            } else {
                console.log('[App] 🚀 Navigating to /notice (signUp=false)');
                navigate('/notice', { replace: true });
            }
        } else {
            console.log('[App] No signUp query in window.location');
        }
    }, [navigate]); // location 의존성 제거

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