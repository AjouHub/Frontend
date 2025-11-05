import React, {useState, ReactNode, useEffect, useRef} from 'react';
import './SettingsPage.css';

// 기존 컴포넌트들을 가져옵니다.
import AccountInfo from './AccountInfo';
import DepartmentSelector from './DepartmentSelector';
import KeywordController from './KeywordController';
import NotificationPreferences from './NotificationPreferences';
import Logout from "./Logout";
import AboutPage from "./AboutPage";
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
import CollapsibleTabs from "../../components/CollapsibleTabs";


// 메인 설정 페이지
export default function SettingsPage() {
    // --- 상태 끌어올리기 ---
    // keywords 상태와 관련 로직을 부모인 SettingsPage에서 관리합니다.
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [keywordLoading, setKeywordLoading] = useState(true);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // 초기 데이터 로딩
    useEffect(() => {
        (async () => {
            await loadDepartments();
            await loadKeywords();
        })();
    }, []);


    // 자식(CollapsibleTabs)의 높이 보고를 받을 상태 추가
    const [tabContentHeight, setTabContentHeight] = useState(0);
    // CollapsibleTabs를 참조
    const tabsRef = useRef<HTMLDivElement>(null);
    // 바닥 앵커
    const bottomRef = useRef<HTMLDivElement>(null);
    // 탭이 열릴 때 스크롤을 내림
    useEffect(() => {
        // 탭이 '열릴' 때만 (null이 아닐 때) 스크롤 로직 실행
        if (openIndex !== null) {
            // 애니메이션 시간(260ms)을 고려하여 약간의 딜레이 후 스크롤
            const timer = setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: 'smooth', // 부드럽게 스크롤
                    block: 'end'    // 요소를 화면에 표시하기 위한 최소한의 스크롤만 수행
                });
            }, 260); // 0.3초 후 실행

            return () => clearTimeout(timer); // 컴포넌트 unmount 시 타이머 정리
        }
    }, [openIndex, tabContentHeight]); // openIndex가 변경될 때마다 이 effect 실행



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
        <div className="np-root">

            <div className="settings-container">
                <main className="settings-main">
                    <AccountInfo
                        departments={departments} // 상태를 props로 전달
                        loading={loadingDepartments}
                    />

                    <CollapsibleSection title="학과 설정">
                        <DepartmentSelector
                            departments={departments} // 상태와
                            onAddDepartment={handleAddDepartment} // 핸들러 함수를
                            onRemoveDepartment={handleRemoveDepartment} // props로 전달
                            loading={loadingDepartments}
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="키워드 설정">
                        {/* 자식에게 상태와 함수를 props로 전달 */}
                        <KeywordController
                            keywords={keywords}
                            onAddKeyword={handleAddKeyword}
                            onRemoveKeyword={handleRemoveKeyword}
                            loading={keywordLoading}
                        />
                    </CollapsibleSection>

                    <div ref={tabsRef}>
                        <CollapsibleTabs
                            title="알림 설정"
                            openIndex={openIndex}
                            onTabClick={setOpenIndex}
                            onHeightChange={setTabContentHeight}
                            items={[
                                { label: '일반', content: (
                                    <NotificationPreferences
                                        allKeywords={keywords}
                                        loading={keywordLoading}
                                        category="general"
                                    />), },
                                { label: '장학', content: (
                                        <NotificationPreferences
                                            allKeywords={keywords}
                                            loading={keywordLoading}
                                            category="scholarship"
                                        />), },
                                { label: '생활관', content: (
                                        <NotificationPreferences
                                            allKeywords={keywords}
                                            loading={keywordLoading}
                                            category="dormitory"
                                        />), },
                                { label: '학과', content: (
                                        <NotificationPreferences
                                            allKeywords={keywords}
                                            loading={keywordLoading}
                                            category="department"
                                            isDepartment={true}
                                            departments={departments}
                                        />), },
                            ]}
                        />
                    </div>

                    <AboutPage/>
                    <Logout/>
                    <div ref={bottomRef} className="settings-bottom-anchor" />
                </main>
            </div>
        </div>
    );
}