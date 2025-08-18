import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import SelectDepartmentPage from "./pages/SelectDepartmentPage";
import AccountInfoPage from "./pages/AccountInfoPage";
import NoticePage from "./pages/NoticePage";


function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/select-department" element={<SelectDepartmentPage />} />
            <Route path="/account-info" element={<AccountInfoPage />} />
            <Route path="/notice" element={<NoticePage/>} />

        </Routes>
    );
}

export default App;
