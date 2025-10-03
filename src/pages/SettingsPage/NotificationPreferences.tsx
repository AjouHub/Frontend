import React, {useEffect, useMemo, useRef, useState} from 'react';
import type { Keyword } from '../../types/keywords';
import {
    listKeywordSubscriptions,
    saveKeywordSubscriptions, SetSubscibeType,
    subscribeType,
} from '../../services/settings.service';
import { notify } from "../../utils/notify";
import Switch from "../../components/Switch";
import ChipCollapse from "../../components/ChipCollapse";
import {departmentNameMap} from "../../components/departmentMap";


// 부모로부터 받을 props 타입을 정의합니다.
interface NotificationPreferencesProps {
    allKeywords: Keyword[];
    loading: boolean;
    category: string;
    isDepartment?: boolean;
    departments?: string[];
}

export default function NotificationPreferences({ allKeywords, loading, category, isDepartment = false, departments = [] }: NotificationPreferencesProps) {
    const [initialSubs, setInitialSubs] = useState<number[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [subsLoading, setSubsLoading] = useState(true); // 구독 정보 로딩 상태
    const [saving, setSaving] = useState(false);

    const [isNotiEnabled, setIsNotiEnabled] = useState<boolean>(false); // 알림 ON/OFF
    const [isKeywordNotice, setIsKeywordNotice] = useState<boolean>(false); // 전체/키워드

    // 학과
    // const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDept, setSelectedDept] = useState<string>('');

    // 실질적 탭 (학과 때문)
    const [effectiveCategory, setEffectiveCategory] = useState<string>('');


    // 애니메이션을 위한 상태와 ref 추가
    const [contentHeight, setContentHeight] = useState(0);
    const [showKeywords, setShowKeywords] = useState(true); // DOM 렌더링 여부 제어
    const contentRef = useRef<HTMLDivElement>(null);
    const [isTransitionEnabled, setIsTransitionEnabled] = useState(true); // 트랜지션 제어 상태 추가


    // 첫 렌더링 시 API 호출을 막기 위한 ref 추가
    const isInitialMount = useRef(true);

    // 키워드 목록을 보여줘야 하는 조건
    const shouldShowKeywords = isNotiEnabled && isKeywordNotice;


    useEffect(() => {
        setEffectiveCategory(category);
    }, [category]);

    // 부모로부터 받은 departments로 기본 선택값 설정/유지
    useEffect(() => {
        if (!isDepartment) return;
        if (departments.length === 0) {
            setSelectedDept('');
            return;
        }
        // 기존 선택이 여전히 유효하면 유지, 아니면 첫 번째로 초기화
        setSelectedDept(prev => (prev && departments.includes(prev) ? prev : departments[0]));
    }, [isDepartment, departments]);

    // 학과 선택이 바뀌면 effectiveCategory를 업데이트하는 useEffect
    useEffect(() => {
        if (isDepartment && selectedDept) {
            setEffectiveCategory(selectedDept);
        }
    }, [selectedDept, isDepartment]);

    useEffect(() => {
        // 구독 정보 불러오기
        const loadInitialState = async () => {
            setSubsLoading(true);
            isInitialMount.current = true;  // 카테고리가 바뀔 때마다 초기 렌더링 플래그를 true로 설정
            try {
                // API를 동시에 호출하여 효율성 증대
                const [mode, subs] = await Promise.all([
                    subscribeType(effectiveCategory),
                    listKeywordSubscriptions(effectiveCategory)
                ]);

                // mode 값에 따라 스위치 상태 설정
                if (mode === 'ALL') {
                    setIsNotiEnabled(true);
                    setIsKeywordNotice(false); // '전체' 알림
                } else if (mode === 'KEYWORD') {
                    setIsNotiEnabled(true);
                    setIsKeywordNotice(true); // '키워드' 알림
                } else { // 'NONE' 또는 null (설정 없는 경우)
                    setIsNotiEnabled(false);
                    setIsKeywordNotice(false); // 기본적으로 알림 끄기
                }

                // const subs = await listKeywordSubscriptions(category);
                setInitialSubs(subs);
                setSelected(new Set(subs));
            } catch (err) {
                // 에러 발생 시 기본값으로 설정
                setIsNotiEnabled(false);
                setIsKeywordNotice(false);
            } finally {
                setSubsLoading(false);
                // 초기 데이터 로딩이 끝난 후, 다음 변경부터 API를 호출하도록 플래그를 false로 설정
                requestAnimationFrame(() => {
                    isInitialMount.current = false;
                });
            }
        };
        loadInitialState();
    }, [effectiveCategory]);

    // 스위치 상태가 변경될 때마다 서버에 mode를 저장하는 useEffect
    useEffect(() => {
        // 초기 렌더링 시에는 실행하지 않음
        if (isInitialMount.current) return;

        let mode = 'NONE';
        if (isNotiEnabled) mode = isKeywordNotice ? 'KEYWORD' : 'ALL';

        const setMode = async () => {
            try {
                await SetSubscibeType(effectiveCategory, mode);
            } catch (e) {
                // console.error('알림 설정 저장 실패:', e);
                notify.error('알림 설정 변경에 실패했습니다.');
                // 여기서 필요하다면 이전 상태로 롤백하는 로직을 추가할 수 있습니다.
            }
        };
        setMode();
    }, [isNotiEnabled, isKeywordNotice, effectiveCategory]);

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

    // 애니메이션 '시작'을 담당
    useEffect(() => {
        if (shouldShowKeywords) {
            // 열릴 때: 트랜지션을 끄고 -> 내용물을 보여줄 준비
            setIsTransitionEnabled(false);
            setShowKeywords(true);
        } else {
            // 닫힐 때: 트랜지션을 켜고 -> 높이를 0으로 만들어 애니메이션 시작
            setIsTransitionEnabled(true);
            setContentHeight(0);
        }
    }, [shouldShowKeywords]);

    // 높이 계산을 담당하는 useEffect
    useEffect(() => {
        if (showKeywords && contentRef.current) {
            const height = contentRef.current.scrollHeight;
            setContentHeight(height);

            // 높이를 즉시 적용한 후, requestAnimationFrame을 사용해 브라우저가 렌더링한
            // 바로 다음 프레임에 트랜지션을 다시 활성화합니다. (setTimeout보다 안정적)
            requestAnimationFrame(() => {
                setIsTransitionEnabled(true);
            });
        }
    }, [showKeywords, allKeywords, subsLoading]);

    // // 학과의 설정일때만 학과 목록을 불러옴
    // useEffect(() => {
    //     if (isDepartment) {
    //         const loadDepartments = async () => {
    //             const user = await fetchUserInfo();
    //             if (user?.departments) {
    //                 setDepartments(user.departments);
    //                 // 첫 번째 학과를 기본 선택으로 설정
    //                 if (user.departments.length > 0) {
    //                     setSelectedDept(user.departments[0]);
    //                 }
    //             }
    //         };
    //         loadDepartments();
    //     }
    // }, [isDepartment]);


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
            await saveKeywordSubscriptions(initialSubs, nextIds, effectiveCategory);
            // 저장 성공 후 기준값 갱신
            setInitialSubs(nextIds);
            notify.success('키워드 구독 설정이 저장되었습니다.');
        } catch (e) {
            console.error(e);
            notify.error('구독 설정 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const isBusy = loading || subsLoading || saving

    return (
        <div className="notification-container">
            {/* 로딩오버레이 */}
            {isBusy && (
                <div className="np-loading-overlay">
                    <div className="np-spinner" aria-label="로딩 중" />
                </div>
            )}

            {/* ───────── 학과 선택 칩 ───────── */}
            {isDepartment && (
                <ChipCollapse openByDefault={true}>
                    <div className="np-chips">
                        {departments.map((deptKey) => {
                            const active = selectedDept === deptKey;
                            return (
                                <button
                                    key={deptKey}
                                    className={`np-chip ${active ? "is-active" : ""}`}
                                    onClick={() => setSelectedDept(deptKey)}
                                >
                                    {/* departmentNameMap을 사용하여 한글 학과명 표시 */}
                                    {departmentNameMap[deptKey] || deptKey}
                                </button>
                            );
                        })}
                    </div>
                </ChipCollapse>
            )}

            <div className="switch-group">
                <Switch
                    label="알림"
                    checked={isNotiEnabled}
                    onChange={setIsNotiEnabled}
                />
                <Switch
                    leftLabel="전체"
                    rightLabel="키워드"
                    checked={isKeywordNotice}
                    onChange={setIsKeywordNotice}
                    disabled={!isNotiEnabled}
                />
            </div>

            <div
                className="keyword-list-container"
                style={{ maxHeight: contentHeight }}
                onTransitionEnd={() => {
                    // 닫힘 애니메이션이 끝난 후, DOM에서 완전히 제거
                    if (!shouldShowKeywords) {
                        setShowKeywords(false);
                    }
                }}
            >
                <div ref={contentRef}>
                    {/* showKeywords 상태에 따라 조건부 렌더링 */}
                    {showKeywords && (
                        <div>
                            {/* 설명 섹션 */}
                            <div style={{ height: 20 }} />
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
                    )}
                </div>
            </div>
        </div>
    );
}
