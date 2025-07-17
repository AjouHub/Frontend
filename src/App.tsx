import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/mypage" element={<MyPage />} />
        </Routes>
    );
}

export default App;
