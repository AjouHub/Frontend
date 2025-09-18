import React, { useEffect, useMemo, useState } from 'react';
import { departmentNameMap, departmentGroups } from '../../components/departmentMap';
import { addDepartment, listDepartments, removeDepartment } from '../../services/settings.service';


// 부모로부터 받을 props 타입 정의
interface DepartmentSelectorProps {
    departments: string[];
    loading: boolean;
    onAddDepartment: (code: string) => Promise<void>;
    onRemoveDepartment: (code: string) => Promise<void>;
}

export default function DepartmentSelector({ departments, loading, onAddDepartment, onRemoveDepartment }: DepartmentSelectorProps) {
    const [selected, setSelected] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 개별 동작 로딩 상태

    const options = departmentGroups;

    const onAdd = async () => {
        if (!selected) return;
        setIsSubmitting(true);
        try {
            await onAddDepartment(selected);
            setSelected('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onRemove = async (code: string) => {
        setIsSubmitting(true);
        try {
            await onRemoveDepartment(code);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* 'input-group' 클래스를 추가하여 CSS 스타일 적용 */}
            <div className="input-group">
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    disabled={loading}
                >
                    <option value="">-- 학과 선택 --</option>
                    {Object.entries(options).map(([group, keys]) => (
                        <optgroup key={group} label={group}>
                            {keys.map((key) => (
                                <option key={key} value={key}>
                                    {departmentNameMap[key] ?? key}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <button onClick={onAdd} disabled={loading || !selected}>추가</button>
            </div>

            <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>내 학과</div>
                {departments.length === 0 ? (
                    <div style={{ color: '#888' }}>등록된 학과가 없습니다.</div>
                ) : (
                    // 'item-chip-list' 클래스 적용
                    <div className="item-chip-list">
                        {departments.map((code) => (
                            // 'item-chip' 클래스 적용
                            <span key={code} className="item-chip">
                            {departmentNameMap[code] ?? code}
                                <button onClick={() => onRemove(code)} disabled={loading}>×</button>
                        </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
