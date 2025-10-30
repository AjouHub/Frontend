import React from 'react';
import { deleteCookie } from "../../services/settings.service";
import { appNavigate } from "../../utils/router";

export default function Logout() {

    const handleLogout = async () => {
        await deleteCookie();
        appNavigate('/login');
    }

    return (
        <div className="logout-container">
            <button className="logout-button" onClick={handleLogout} >
                로그아웃
            </button>
        </div>
    );
}
