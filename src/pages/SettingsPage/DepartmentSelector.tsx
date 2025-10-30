import React, { useState } from 'react';
import { departmentNameMap, departmentGroups } from '../../components/departmentMap';


// 부모로부터 받을 props 타입 정의
interface DepartmentSelectorProps {
    departments: string[];
    loading: boolean;
    onAddDepartment: (code: string) => Promise<void>;
    onRemoveDepartment: (code: string) => Promise<void>;
}

export default function DepartmentSelector({ departments, loading, onAddDepartment, onRemoveDepartment }: DepartmentSelectorProps) {
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selected, setSelected] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 개별 동작 로딩 상태

    // const options = departmentGroups;
    const colleges = Object.keys(departmentGroups) as string[];

    const onAdd = async () => {
        if (!selected) return;
        setIsSubmitting(true);
        try {
            await onAddDepartment(selected);
            setSelected('');
            setSelectedCollege('');
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
        <div className="department-input-container">
            {/* 'input-group' 클래스를 추가하여 CSS 스타일 적용 */}
            <div className="input-group input-group--two-rows">
                <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    disabled={loading}
                    className="college-select"
                >
                    <option value="">단과대 선택</option>
                    {colleges.map(college => (
                        <option key={college} value={college}>
                            {college}
                        </option>
                    ))}
                </select>

                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    disabled={loading || !selectedCollege}
                    className="department-select"
                >
                    <option value="">학과 선택</option>
                    {(departmentGroups[selectedCollege] ?? []).map(department => (
                        <option key={department} value={department}>
                            {departmentNameMap[department] ?? department}
                        </option>
                    ))}
                </select>

                <button onClick={onAdd} disabled={loading || !selected}>추가</button>
            </div>

            <div className="item-list-container">
                <div className="item-list-title">내 학과</div>
                {departments.length === 0 ? (
                    <div className="empty-list-message">등록된 학과가 없습니다.</div>
                ) : (
                    <div className="item-chip-list">
                        {departments.map((code) => (
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
