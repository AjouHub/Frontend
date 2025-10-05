import {Routes, Route, useNavigate} from 'react-router-dom';
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

    // 앱이 처음 로드될 때 사용자 정보를 가져오고 네이티브에 알림
    useEffect(() => {
        fetchUserAndNotifyNativeApp();
    }, []);

    useEffect(() => {
        setAppNavigate((path, opts) => navigate(path, opts));
    }, [navigate]);

    return (
        <>
            <Routes>
                {/* 가드 밖 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/error" element={<LoginErrorPage />} />
                <Route element={<AppLayout />}>
                    <Route path="/select-department" element={<SelectDepartmentPage />} />
                </Route>

                {/* 가드 안 (보호구간) */}
                <Route element={<RequireOnboarding />}>
                    <Route element={<AppLayout />}>
                        <Route index element={<NoticePage />} />
                        <Route path="/notice" element={<NoticePage />} />
                        <Route path="/bookmark" element={<BookMarkPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<NoticePage />} />
            </Routes>

            {/* ✅ 전역 토스트 컨테이너 (앱에서 1번만 렌더) */}
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
