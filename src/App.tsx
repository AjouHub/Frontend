import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import SelectDepartmentPage from "./pages/SelectDepartmentPage";
import NoticePage from "./pages/NoticePage";
import SettingsPage from "./pages/SettingsPage";
import BookMarkPage from "./pages/BookMarkPage";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NativeBridge from "./components/NativeBridge";


function App() {
    return (
        <>
            <NativeBridge />

            <Routes>
                <Route element={<AppLayout />}>
                    <Route index element={<NoticePage />} />

                    {/* 탭 항목들 */}
                    <Route path="/notice" element={<NoticePage />} />
                    <Route path="/bookmark" element={<BookMarkPage />} />
                    {/*<Route path="/account-info" element={<AccountInfoPage />} />*/}
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* 탭엔 없지만 화면은 보여야 하는 경로들도 모두 여기 */}
                    <Route path="/select-department" element={<SelectDepartmentPage />} />

                    <Route path="*" element={<NoticePage />} />
                </Route>
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
