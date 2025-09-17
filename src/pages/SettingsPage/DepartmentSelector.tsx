import React, { useEffect, useMemo, useState } from 'react';
import { departmentNameMap, departmentGroups } from '../../components/departmentMap';
import { addDepartment, listDepartments, removeDepartment } from '../../services/settings.service';


export default function DepartmentSelector() {
    const [selected, setSelected] = useState('');
    const [myDepartments, setMyDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const options = departmentGroups;

    const load = async () => {
        setLoading(true);
        try {
            const codes = await listDepartments();
            setMyDepartments(codes);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const onAdd = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            await addDepartment(selected);
            setSelected('');
            await load();
        } finally {
            setLoading(false);
        }
    };

    const onRemove = async (code: string) => {
        setLoading(true);
        try {
            await removeDepartment(code);
            await load();
        } finally {
            setLoading(false);
        }
    };

    // return (
    //     <div>
    //         <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    //             <select
    //                 value={selected}
    //                 onChange={(e) => setSelected(e.target.value)}
    //                 disabled={loading}
    //                 style={{ minWidth: 320, padding: 6 }}
    //             >
    //                 <option value="">-- 학과 선택 --</option>
    //                 {Object.entries(options).map(([group, keys]) => (
    //                     <optgroup key={group} label={group}>
    //                         {keys.map((key) => (
    //                             <option key={key} value={key}>
    //                                 {departmentNameMap[key] ?? key}
    //                             </option>
    //                         ))}
    //                     </optgroup>
    //                 ))}
    //             </select>
    //             <button onClick={onAdd} disabled={loading || !selected}>추가</button>
    //         </div>
    //
    //         <div style={{ marginTop: 12 }}>
    //             <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>내 학과</div>
    //             {myDepartments.length === 0 ? (
    //                 <div style={{ color: '#888' }}>등록된 학과가 없습니다.</div>
    //             ) : (
    //                 <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    //                     {myDepartments.map((code) => (
    //                         <span
    //                             key={code}
    //                             style={{
    //                                 display: 'inline-flex',
    //                                 alignItems: 'center',
    //                                 gap: 6,
    //                                 padding: '6px 10px',
    //                                 borderRadius: 16,
    //                                 border: '1px solid #ddd',
    //                                 background: '#fafafa'
    //                             }}
    //                         >
    //             {departmentNameMap[code] ?? code}
    //                             <button onClick={() => onRemove(code)} disabled={loading} style={{ marginLeft: 4 }}>
    //               ×
    //             </button>
    //           </span>
    //                     ))}
    //                 </div>
    //             )}
    //         </div>
    //     </div>
    // );
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
                    {/* ... options */}
                </select>
                <button onClick={onAdd} disabled={loading || !selected}>추가</button>
            </div>

            <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>내 학과</div>
                {myDepartments.length === 0 ? (
                    <div style={{ color: '#888' }}>등록된 학과가 없습니다.</div>
                ) : (
                    // 'item-chip-list' 클래스 적용
                    <div className="item-chip-list">
                        {myDepartments.map((code) => (
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
