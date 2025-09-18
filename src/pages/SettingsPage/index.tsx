import React, { useState, ReactNode, useEffect } from 'react';
import './SettingsPage.css'; // 새롭게 작성된 CSS 파일을 임포트합니다.

// 기존 컴포넌트들을 가져옵니다.
import AccountInfo from './AccountInfo';
import DepartmentSelector from './DepartmentSelector';
import KeywordController from './KeywordController';
import NotificationPreferences from './NotificationPreferences';
import {Keyword} from "../../types/keywords";
import {
    addDepartment,
    addKeyword,
    listDepartments,
    listKeywords,
    removeDepartment,
    removeKeyword
} from "../../services/settings.service";
import CollapsibleSection from "../../components/CollapsibleSection";

// 메인 설정 페이지
export default function SettingsPage() {
    // --- 상태 끌어올리기 ---
    // keywords 상태와 관련 로직을 부모인 SettingsPage에서 관리합니다.
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [keywordLoading, setKeywordLoading] = useState(true);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);


    // 키워드 목록을 불러오는 함수
    const loadKeywords = async () => {
        setKeywordLoading(true);
        try {
            const list = await listKeywords();
            setKeywords(list ?? []);
        } finally {
            setKeywordLoading(false);
        }
    };

    // 학과 목록만 불러오는 함수 (재사용을 위해 분리)
    const loadDepartments = async () => {
        setLoadingDepartments(true);
        try {
            const departmentsData = await listDepartments();
            setDepartments(departmentsData);
        } catch (error) {
            console.error("학과 정보 로딩 실패:", error);
            setDepartments([]); // 에러 발생 시 빈 배열로 초기화
        } finally {
            setLoadingDepartments(false);
        }
    };

    // 초기 데이터 로딩
    useEffect(() => {
        loadDepartments();
        loadKeywords();
    }, []);

    // 키워드 추가 함수
    const handleAddKeyword = async (phrase: string) => {
        await addKeyword(phrase);
        await loadKeywords(); // 목록 새로고침
    };

    // 키워드 삭제 함수
    const handleRemoveKeyword = async (id: number) => {
        await removeKeyword(id);
        await loadKeywords(); // 목록 새로고침
    };

    // 학과 추가/삭제 핸들러
    const handleAddDepartment = async (code: string) => {
        await addDepartment(code);
        await loadDepartments(); // 변경 후 목록 새로고침
    };
    const handleRemoveDepartment = async (code: string) => {
        await removeDepartment(code);
        await loadDepartments(); // 변경 후 목록 새로고침
    };


    return (
        <div className="settings-container">
            <main className="settings-main">
                <AccountInfo
                    departments={departments} // 상태를 props로 전달
                    loading={loadingDepartments}
                />

                <CollapsibleSection title="학과 선택">
                    <DepartmentSelector
                        departments={departments} // 상태와
                        onAddDepartment={handleAddDepartment} // 핸들러 함수를
                        onRemoveDepartment={handleRemoveDepartment} // props로 전달
                        loading={loadingDepartments}
                    />
                </CollapsibleSection>

                <CollapsibleSection title="키워드 선택">
                    {/* 자식에게 상태와 함수를 props로 전달 */}
                    <KeywordController
                        keywords={keywords}
                        onAddKeyword={handleAddKeyword}
                        onRemoveKeyword={handleRemoveKeyword}
                        loading={keywordLoading}
                    />
                </CollapsibleSection>

                <CollapsibleSection title="알림 선택">
                    {/* 자식에게 상태를 props로 전달 */}
                    <NotificationPreferences
                        allKeywords={keywords}
                        loading={keywordLoading}
                    />
                </CollapsibleSection>
            </main>
        </div>
    );
}