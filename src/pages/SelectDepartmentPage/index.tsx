import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPreferences from "../SettingsPage/NotificationPreferences";
import {Keyword} from "../../types/keywords";
import {addDepartment, listDepartments, listKeywords, removeDepartment} from "../../services/settings.service";
import DepartmentSelector from "../SettingsPage/DepartmentSelector";
import "./SelectDepartmentPage.css"
import {appNavigate} from "../../utils/router";


export default function SelectDepartmentPage() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<string[]>([]);
    const navigate = useNavigate();

    const hasDepartments = departments.length > 0;

    // 초기 데이터 로딩
    useEffect(() => {
        (async () => {
            await loadDepartments();
            await loadKeywords();
        })();
    }, []);


    // 키워드 목록을 불러오는 함수
    const loadKeywords = async () => {
        setLoading(true);
        try {
            const list = await listKeywords();
            setKeywords(list ?? []);
        } finally {
            setLoading(false);
        }
    };

    // 학과 목록만 불러오는 함수 (재사용을 위해 분리)
    const loadDepartments = async () => {
        setLoading(true);
        try {
            const departmentsData = await listDepartments();
            setDepartments(departmentsData);
        } catch (error) {
            console.error("학과 정보 로딩 실패:", error);
            setDepartments([]); // 에러 발생 시 빈 배열로 초기화
        } finally {
            setLoading(false);
        }
    };

    // 학과 추가/삭제 핸들러
    const handleAddDepartment = async (code: string) => {
        setLoading(true);
        await addDepartment(code);
        await loadDepartments(); // 변경 후 목록 새로고침
        setLoading(false);
    };
    const handleRemoveDepartment = async (code: string) => {
        setLoading(true);
        await removeDepartment(code);
        await loadDepartments(); // 변경 후 목록 새로고침
        setLoading(false);
    };

    // 설정 완료
    const handleOnClick  = () => {
        appNavigate('/notice');
    }

    return (
        <div className="sdp-root">
            <div className="sdp-container">
                <header className="sdp-header">
                    <h1 className="sdp-title">앱의 기본값을 설정해주세요</h1>
                    <p className="sdp-subtitle">기본 설정은 이후에 설정창에서 변경할 수 있습니다.</p>
                </header>

                <section className="sdp-section">
                    <h2 className="sdp-section-title">학과 설정</h2>
                    <DepartmentSelector
                        departments={departments}
                        onAddDepartment={handleAddDepartment}
                        onRemoveDepartment={handleRemoveDepartment}
                        loading={loading}
                    />
                </section>

                <section className="sdp-section">
                    <h2 className="sdp-section-title">기본 알림 설정</h2>
                    <div className="fcm-group">
                        <div className="fcm-item">
                            <h3 className="fcm-item-title">일반 공지 알림</h3>
                            <NotificationPreferences
                                allKeywords={keywords}
                                loading={loading}
                                category="general"
                            />
                        </div>
                        <div className="fcm-item">
                            <h3 className="fcm-item-title">장학 공지 알림</h3>
                            <NotificationPreferences
                                allKeywords={keywords}
                                loading={loading}
                                category="scholarship"
                            />
                        </div>
                        <div className="fcm-item">
                            <h3 className="fcm-item-title">생활관 공지 알림</h3>
                            <NotificationPreferences
                                allKeywords={keywords}
                                loading={loading}
                                category="dormitory"
                            />
                        </div>

                        <div className={`fcm-item ${!hasDepartments ? 'fcm-item-disabled' : ''}`}>
                            <h3 className="fcm-item-title">학과 공지 알림</h3>

                            {/* 학과가 없을 때 안내 메시지 표시 */}
                            {!hasDepartments && (
                                <p className="fcm-disabled-message">
                                    학과를 먼저 등록해주세요.
                                </p>
                            )}

                            {/* 학과가 있을 때만 NotificationPreferences를 활성화하여 렌더링 */}
                            <div style={{ pointerEvents: hasDepartments ? 'auto' : 'none' }}>
                                <NotificationPreferences
                                    allKeywords={keywords}
                                    loading={loading}
                                    // 첫 번째 학과를 category로 전달, 없으면 빈 문자열
                                    category={hasDepartments ? departments[0] : ""}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="sdp-footer">
                <button className="sdp-submit-button" onClick={handleOnClick}>
                    설정 완료
                </button>
            </footer>
        </div>
    );
}