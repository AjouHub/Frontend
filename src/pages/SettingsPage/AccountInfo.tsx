import React, {JSX, useEffect, useState} from 'react';
import { UserInfo } from '../../types/user';
import { fetchUserInfo } from "../../services/fetchUserInfo";
import {departmentNameMap} from "../../components/departmentMap";


// 아이콘 SVG 컴포넌트 (파일 상단 또는 별도 파일로 관리)
const UserAvatarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40px" height="40px"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;

// 부모로부터 받을 props 타입 정의
interface AccountInfoProps {
    departments: string[]; // 부모로부터 직접 받음
    loading: boolean;
}

export default function AccountInfo({ departments, loading }: AccountInfoProps): JSX.Element {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [error, setError] = useState<string>('');
    const [statusCode, setStatusCode] = useState<number | string | null>(null);

    useEffect(() => {
        // if (!token) return;
        (async () => {
            try {
                const data = await fetchUserInfo();
                setUser(data);
            } catch (err: any) {
                if (err?.response) {
                    setStatusCode(err.response.status);
                    setError(err.response.data?.message || '서버 오류 발생');
                } else {
                    setStatusCode('Unknown');
                    setError('알 수 없는 에러 발생');
                }
            }
        })();
    }, []); // ★ 의존성 배열 추가


    // 로딩 중일 때 UI
    if (!user || loading) {
        return (
            <div className="profile-card">
                <div className="profile-avatar-placeholder" />
                <div className="profile-details">
                    <div className="detail-row-placeholder" />
                    <div className="detail-row-placeholder" />
                    <div className="detail-row-placeholder" />
                </div>
            </div>
        );
    }

    // 에러 발생 시 UI
    if (error) {
        return (
            <div className="profile-card">
                <p style={{ color: 'red' }}>
                    {error} <br />
                    상태 코드: {statusCode}
                    </p>
            </div>
        );
    }

    // 성공적으로 데이터를 불러왔을 때 UI
    return (
        <div className="profile-card">
            <div className="profile-avatar">
                <UserAvatarIcon />
            </div>
            <div className="profile-details">
                <div className="detail-row">
                    <span className="detail-label">이름</span>
                    <span className="detail-value">{user.name}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">이메일</span>
                    <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">학과</span>
                    <span className="detail-value">
                        {departments.map(code => departmentNameMap[code] || code).join(', ')}
                        {/*{user.departments.join(', ')}*/}
                    </span>
                </div>
            </div>
        </div>
    );
}
