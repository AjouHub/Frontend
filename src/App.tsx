import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import SelectDepartmentPage from "./pages/SelectDepartmentPage";
import NoticePage from "./pages/NoticePage";
import SettingsPage from "./pages/SettingsPage";


function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<LoginPage />} />

                {/* 탭 항목들 */}
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/notice" element={<NoticePage />} />
                {/*<Route path="/account-info" element={<AccountInfoPage />} />*/}
                <Route path="/settings" element={<SettingsPage />} />

                {/* 탭엔 없지만 화면은 보여야 하는 경로들도 모두 여기 */}
                <Route path="/select-department" element={<SelectDepartmentPage />} />

                <Route path="*" element={<NoticePage />} />
            </Route>
        </Routes>
    );
}

export default App;
