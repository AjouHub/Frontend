import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import SelectDepartmentPage from "./pages/SelectDepartmentPage";
import NoticePage from "./pages/NoticePage";
import SettingsPage from "./pages/SettingsPage";
import {BookMarkPage} from "./pages/BookMarkPage";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useEffect} from "react";
import {setAppNavigate} from "./utils/router";
import {fetchUserAndNotifyNativeApp} from "./services/auth.service";
import {LoginErrorPage} from "./pages/LoginErrorPage";
import RequireOnboarding from "./layouts/RouteGuard";


function App() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setAppNavigate((path, opts) => navigate(path, opts));
    }, [navigate]);

    // ✅ OAuth 콜백 처리
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const signUp = params.get('signUp');

        if (signUp != null) {
            // ✅ signUp=true면 sessionStorage에 플래그 저장
            if (signUp.toLowerCase() === 'true') {
                sessionStorage.setItem('justSignedUp', '1');
            }

            const target = signUp.toLowerCase() === 'true'
                ? '/select-department'
                : '/notice';

            console.log('OAuth callback detected, navigating to:', target);
            navigate(target, { replace: true });
        }
    }, [location.search, navigate]);

    // 앱이 처음 로드될 때 사용자 정보를 가져오고 네이티브에 알림
    useEffect(() => {
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
