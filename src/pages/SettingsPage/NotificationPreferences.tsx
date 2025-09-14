import React, { useEffect, useMemo, useState } from 'react';
import type { Keyword } from '../../types/keywords';
import {
    listKeywords,
    listKeywordSubscriptions,
    saveKeywordSubscriptions,
} from '../../services/settings.service';

export default function NotificationPreferences() {
    const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
    const [initialSubs, setInitialSubs] = useState<number[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // 초기 로드: 전체 키워드 + 내 구독 목록
    const load = async () => {
        setLoading(true);
        try {
            const [keywords, subs] = await Promise.all([
                listKeywords(),
                listKeywordSubscriptions(),
            ]);
            setAllKeywords(keywords);
            setInitialSubs(subs);
            setSelected(new Set(subs));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

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
        <div>
            <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>키워드 구독</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                    등록된 키워드 중에서 받길 원하는 것만 선택하세요.
                </div>
            </div>

            <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
                <button onClick={selectAll} disabled={loading || saving || allKeywords.length === 0}>
                    전체 선택
                </button>
                <button onClick={clearAll} disabled={loading || saving || selected.size === 0}>
                    전체 해제
                </button>
                <div style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                    선택 {selected.size} / 전체 {allKeywords.length}
                </div>
            </div>

            {/* 키워드 칩 리스트 */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', opacity: loading ? 0.6 : 1 }}>
                {allKeywords.length === 0 && !loading && (
                    <div style={{ color: '#888' }}>등록된 키워드가 없습니다.</div>
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
                            style={{
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: isOn ? '#1677ff' : '#ddd',
                                color: isOn ? '#0b5bd3' : '#555',
                                background: isOn ? '#eef5ff' : '#fafafa',
                                padding: '6px 12px',
                                borderRadius: 18,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 14,
                            }}
                        >
              <span
                  aria-hidden
                  style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: isOn ? '#1677ff' : '#ccc',
                  }}
              />
                            {k.phrase}
                        </button>
                    );
                })}
            </div>

            {/* 저장 바 */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={onSave} disabled={!changed || saving}>
                    {saving ? '저장 중…' : '변경사항 저장'}
                </button>
                {!changed && (
                    <span style={{ fontSize: 12, color: '#888' }}>변경된 내용이 없습니다.</span>
                )}
            </div>
        </div>
    );
}
