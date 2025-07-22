// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AccountInfo from './pages/AccountInfo';
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
// import Home from './pages/Home'; // 필요 시 사용

function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/account-info" element={<AccountInfo />} />
                    <Route path="/google-callback" element={<GoogleCallbackPage />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
