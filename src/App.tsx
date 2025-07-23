import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import SelectDepartmentPage from "./pages/SelectDepartmentPage";
function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/select-department" element={<SelectDepartmentPage />} />
        </Routes>
    );
}

export default App;
