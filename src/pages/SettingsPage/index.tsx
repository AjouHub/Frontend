import React from 'react';
import DepartmentSelector from './DepartmentSelector';
import KeywordController from './KeywordController';
import NotificationPreferences from './NotificationPreferences';

export default function SettingsPage() {
    return (
        <div style={{ maxWidth: 820, margin: '32px auto', padding: '0 16px' }}>
            <h1 style={{ marginBottom: 24 }}>설정</h1>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>학과 선택 (추가/삭제)</h2>
                <DepartmentSelector />
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>Keyword Controller</h2>
                <KeywordController />
            </section>

            {/*<section>*/}
            {/*    <h2 style={{ marginBottom: 12 }}>알림/구독 (FCM)</h2>*/}
            {/*    <NotificationPreferences />*/}
            {/*</section>*/}
        </div>
    );
}
