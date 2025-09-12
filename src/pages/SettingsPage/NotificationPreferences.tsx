import React, { useEffect, useState } from 'react';
import {
    listNoticeTypes,
    getNotificationPrefs,
    saveNotificationPrefs,
    ensureFcmTokenRegistered,
    subscribeTopics,
    unsubscribeTopics,
    type NoticeType,
    type NotificationPrefs
} from '../../services/settings.service';

export default function NotificationPreferences() {
    const [types, setTypes] = useState<NoticeType[]>([]);
    const [prefs, setPrefs] = useState<NotificationPrefs>({
        allTypes: true,
        selectedTypes: [],
        useKeywordsOnly: false
    });
    const [fcmReady, setFcmReady] = useState(false);
    const [loading, setLoading] = useState(false);

    // 초기 로드
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                setTypes(await listNoticeTypes());                 // 백엔드/상수에서 타입 목록 로드
                setPrefs(await getNotificationPrefs());            // 내 현재 설정 로드
                setFcmReady(await ensureFcmTokenRegistered());     // 브라우저 권한, 토큰 백엔드 등록
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleType = (t: NoticeType) => {
        setPrefs((p) => {
            const has = p.selectedTypes.includes(t);
            const next = has ? p.selectedTypes.filter(x => x !== t) : [...p.selectedTypes, t];
            return { ...p, selectedTypes: next };
        });
    };

    const onSave = async () => {
        setLoading(true);
        try {
            await saveNotificationPrefs(prefs);
            // 토픽 구독/해제: 예시 - 전체 받기면 모든 type 구독, 아니면 선택된 것만 구독
            if (prefs.allTypes) {
                await subscribeTopics(types);
            } else {
                await subscribeTopics(prefs.selectedTypes);
                const toUnsub = types.filter(t => !prefs.selectedTypes.includes(t));
                if (toUnsub.length) await unsubscribeTopics(toUnsub);
            }
            alert('알림 설정이 저장되었습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={prefs.allTypes}
                        onChange={(e) => setPrefs((p) => ({ ...p, allTypes: e.target.checked }))}
                        disabled={loading}
                    />
                    전체 수신
                </label>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    전체 수신을 끄면 아래에서 유형을 선택해서 구독할 수 있어요.
                </div>
            </div>

            {!prefs.allTypes && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>받을 공지 유형</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {types.map((t) => (
                            <label key={t} style={{ border: '1px solid #ddd', borderRadius: 16, padding: '6px 10px' }}>
                                <input
                                    type="checkbox"
                                    checked={prefs.selectedTypes.includes(t)}
                                    onChange={() => toggleType(t)}
                                    disabled={loading}
                                    style={{ marginRight: 6 }}
                                />
                                {t}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={prefs.useKeywordsOnly}
                        onChange={(e) => setPrefs((p) => ({ ...p, useKeywordsOnly: e.target.checked }))}
                        disabled={loading}
                    />
                    키워드 일치 시에만 알림 받기
                </label>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    키워드 컨트롤러에서 등록한 단어가 제목/본문에 포함될 때만 알림을 받을 수 있어요.
                </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button onClick={onSave} disabled={loading || !fcmReady}>저장</button>
                {!fcmReady && <span style={{ color: '#c00', fontSize: 12 }}>브라우저 알림 권한 또는 FCM 등록 필요</span>}
            </div>
        </div>
    );
}
