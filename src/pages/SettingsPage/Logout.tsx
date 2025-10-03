import React, {JSX, useEffect, useState} from 'react';

export default function Logout() {

    const handleLogout = () => {
        return ;
    }

    return (
        <div className="logout-container">
            <button className="logout-button" onClick={handleLogout} >
                로그아웃
            </button>
        </div>
    );
}
