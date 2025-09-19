import React, { useEffect, useMemo, useState } from 'react';
import type { Keyword } from '../../types/keywords';
import {
    listKeywords,
    listKeywordSubscriptions,
    saveKeywordSubscriptions,
} from '../../services/settings.service';

// 부모로부터 받을 props 타입을 정의합니다.
interface NotificationPreferencesProps {
    allKeywords: Keyword[];
    loading: boolean;
}

export default function NotificationPreferences({ allKeywords, loading }: NotificationPreferencesProps) {
    const [initialSubs, setInitialSubs] = useState<number[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [subsLoading, setSubsLoading] = useState(true); // 구독 정보 로딩 상태
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // 구독 정보 불러오기
        const loadSubscriptions = async () => {
            setSubsLoading(true);
            try {
                const subs = await listKeywordSubscriptions();
                setInitialSubs(subs);
                setSelected(new Set(subs));
            } finally {
                setSubsLoading(false);
            }
        };
        loadSubscriptions();
    }, []);

    // allKeywords가 부모로부터 변경되어 전달되면, 선택된 목록을 필터링
    useEffect(() => {
        const keywordIds = new Set(allKeywords.map(k => k.id));
        setSelected(prevSelected => {
            const newSelected = new Set<number>();
            for (const id of prevSelected) {
                if (keywordIds.has(id)) {
                    newSelected.add(id);
                }
            }
            return newSelected;
        });
    }, [allKeywords]);


    // 토글 핸들러
    const toggle = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // 전체 선택/해제
    const selectAll = () => setSelected(new Set(allKeywords.map((k) => k.id)));
    const clearAll = () => setSelected(new Set());

    // 변경 여부/카운트
    const { changed, nextIds } = useMemo(() => {
        const next = Array.from(selected);
        const a = JSON.stringify([...initialSubs].sort((x, y) => x - y));
        const b = JSON.stringify([...next].sort((x, y) => x - y));
        return { changed: a !== b, nextIds: next };
    }, [initialSubs, selected]);

    const onSave = async () => {
        setSaving(true);
        try {
            await saveKeywordSubscriptions(initialSubs, nextIds);
            // 저장 성공 후 기준값 갱신
            setInitialSubs(nextIds);
            alert('키워드 구독 설정이 저장되었습니다.');
        } catch (e) {
            console.error(e);
            alert('구독 설정 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="notification-container">
            {/* 설명 섹션 */}
            <div className="notification-header">
                <div className="notification-title">키워드 구독</div>
                <div className="notification-description">
                    등록된 키워드 중에서 알림을 받길 원하는 것만 선택하세요.
                </div>
            </div>

            {/* 전체 선택/해제 바 */}
            <div className="bulk-actions-bar">
                <button
                    className="bulk-action-button"
                    onClick={selectAll}
                    disabled={loading || saving || allKeywords.length === 0}
                >
                    전체 선택
                </button>
                <button
                    className="bulk-action-button"
                    onClick={clearAll}
                    disabled={loading || saving || selected.size === 0}
                >
                    전체 해제
                </button>
                <div className="selection-status">
                    선택 {selected.size} / 전체 {allKeywords.length}
                </div>
            </div>

            {/* 키워드 칩 리스트 */}
            <div className={`toggle-chip-list ${loading ? 'loading' : ''}`}>
                {allKeywords.length === 0 && !loading && (
                    <div className="empty-list-message">등록된 키워드가 없습니다.</div>
                )}

                {allKeywords.map((k) => {
                    const isOn = selected.has(k.id);
                    return (
                        <button
                            key={k.id}
                            type="button"
                            onClick={() => toggle(k.id)}
                            disabled={saving}
                            title={isOn ? '구독 중' : '구독 안 함'}
                            className={`toggle-chip ${isOn ? 'active' : ''}`}
                        >
                            {/* 시안에서 인디케이터가 다시 보이므로 추가합니다. */}
                            <span className="toggle-chip-indicator" />
                            {k.phrase}
                        </button>
                    );
                })}
            </div>

            {/* 저장 바 */}
            <div className="save-section">
                <button onClick={onSave} disabled={!changed || saving} className="save-button">
                    {saving ? '저장 중…' : '변경사항 저장'}
                </button>
                {!changed && (
                    <span className="save-status-message">변경된 내용이 없습니다.</span>
                )}
            </div>
        </div>
    );
}
