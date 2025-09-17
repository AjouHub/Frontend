import React, { useState, ReactNode, useEffect } from 'react';
import './SettingsPage.css'; // 새롭게 작성된 CSS 파일을 임포트합니다.

// 기존 컴포넌트들을 가져옵니다.
import AccountInfo from './AccountInfo';
import DepartmentSelector from './DepartmentSelector';
import KeywordController from './KeywordController';
import NotificationPreferences from './NotificationPreferences';

// -- 아이콘 SVG 컴포넌트들 --
// 실제 프로젝트에서는 아이콘 라이브러리(react-icons 등)를 사용하거나 별도 파일로 관리하는 것이 좋습니다.
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.09-.76-1.71-1.06L14 2.1c-.06-.2-.25-.33-.47-.33h-4c-.22 0-.41.13-.47.33L9.23 4.8c-.62.3-1.19.66-1.71 1.06l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.64-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.09.76 1.71 1.06L9.53 21.9c.06.2.25.33.47.33h4c.22 0 .41-.13.47-.33l.25-2.7c.62-.3 1.19-.66 1.71-1.06l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const UserAvatarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40px" height="40px"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;


// 재사용 가능한 아코디언(Collapsible) 섹션 컴포넌트
interface CollapsibleSectionProps {
    title: string;
    children: ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div className="collapsible-card">
            <button className="collapsible-header" onClick={toggleOpen}>
                <span className="collapsible-title">{title}</span>
                <span className={`collapsible-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="collapsible-content">
                    {children}
                </div>
            )}
        </div>
    );
};

// 메인 설정 페이지
export default function SettingsPage() {
    return (
        <div className="settings-container">
            <header className="settings-header">
                <span className="header-version">NoticePage 3.0</span>
                <h1 className="header-logo">AURA</h1>
            </header>

            <main className="settings-main">
                {/* AccountInfo 컴포넌트의 내용을 직접 통합하고 디자인 적용 */}
                <div className="profile-card">
                    <div className="profile-avatar">
                        <UserAvatarIcon />
                    </div>
                    <div className="profile-details">
                        {/* 실제로는 AccountInfo 컴포넌트에서 fetch한 데이터를 props로 받아 사용합니다. */}
                        <div className="detail-row">
                            <span className="detail-label">이름</span>
                            <span className="detail-value">유성현</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">이메일</span>
                            <span className="detail-value">yueric050930@ajou.ac.kr</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">학과</span>
                            <span className="detail-value">소프트웨어학과, 전자공학과</span>
                        </div>
                    </div>
                </div>

                <CollapsibleSection title="학과 선택">
                    <DepartmentSelector />
                </CollapsibleSection>

                <CollapsibleSection title="키워드 선택">
                    <KeywordController />
                </CollapsibleSection>

                <CollapsibleSection title="알림 선택">
                    <NotificationPreferences />
                </CollapsibleSection>
            </main>

            <footer className="settings-footer">
                <div className="footer-item">
                    <HomeIcon />
                    <span>홈</span>
                </div>
                <div className="footer-item">
                    <BookmarkIcon />
                    <span>북마크</span>
                </div>
                <div className="footer-item active">
                    <SettingsIcon />
                    <span>설정</span>
                </div>
                <div className="footer-item">
                    <ProfileIcon />
                    <span>나</span>
                </div>
            </footer>
        </div>
    );
}