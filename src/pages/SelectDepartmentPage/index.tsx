import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { departmentGroups, departmentNameMap } from '../../components/departmentMap';


export default function SelectDepartmentPage() {
    const [department, setDepartment] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await api.post('/user/departments', { department });
            navigate('/mypage');

        } catch (error) {
            console.error('학과 등록 에러:', error);
            alert('학과 등록에 실패했습니다.');
        }
    };


    return (
        <div>
            <h2>학과를 선택해주세요</h2>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">-- 학과 선택 --</option>

                {Object.entries(departmentGroups).map(([college, codes]) => (
                    <optgroup key={college} label={college}>
                        {codes.map((code) => (
                            <option key={code} value={code}>
                                {departmentNameMap[code] ?? code}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>

            <br /><br />
            <button onClick={handleSubmit} disabled={!department}>확인</button>
        </div>
    );
}