import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
            <select value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="">-- 학과 선택 --</option>

                <optgroup label="공과대학">
                    <option value="department.me">기계공학과</option>
                    <option value="department.env">환경안전공학과</option>
                    <option value="department.academic">산업공학과</option>
                    <option value="department.ce">건설시스템공학과</option>
                    <option value="department.che">화학공학과</option>
                    <option value="department.tse">교통시스템공학과</option>
                    <option value="department.mse">첨단신소재공학과</option>
                    <option value="department.arch">건축학과</option>
                    <option value="department.chembio">응용화학생명공학과</option>
                    <option value="department.ise">융합시스템공학과</option>
                    <option value="department.appchem">응용화학과</option>
                </optgroup>

                <optgroup label="첨단ICT융합대학">
                    <option value="department.ece">전자공학과</option>
                    <option value="department.aisemi">지능형반도체공학과</option>
                    <option value="department.mobility">미래모빌리티공학과</option>
                </optgroup>

                <optgroup label="소프트웨어융합대학">
                    <option value="department.media">디지털미디어학과</option>
                    <option value="department.software">소프트웨어학과</option>
                    <option value="department.mdc">국방디지털융합학과</option>
                    <option value="department.security">사이버보안학과</option>
                    <option value="department.aai">인공지능융합학과</option>
                </optgroup>

                <optgroup label="자연과학대학">
                    <option value="department.math">수학과</option>
                    <option value="department.chem">화학과</option>
                    <option value="department.physics">물리학과</option>
                    <option value="department.biology">생명과학과</option>
                    <option value="department.frontiers">프런티어과학학부</option>
                </optgroup>

                <optgroup label="경영대학">
                    <option value="department.abiz">경영학과</option>
                    <option value="department.fe">금융공학과</option>
                    <option value="department.ebiz">경영인텔리전스학과</option>
                    <option value="department.gb">글로벌경영학과</option>
                </optgroup>

                <optgroup label="인문대학">
                    <option value="department.kor">국어국문학과</option>
                    <option value="department.history">사학과</option>
                    <option value="department.english">영어영문학과</option>
                    <option value="department.culture">문화콘텐츠학과</option>
                    <option value="department.france">불어불문학과</option>
                </optgroup>

                <optgroup label="사회과학대학">
                    <option value="department.econ">경제학과</option>
                    <option value="department.soci">사회학과</option>
                    <option value="department.pba">행정학과</option>
                    <option value="department.pol">정치외교학과</option>
                    <option value="department.apsy">심리학과</option>
                    <option value="department.slez">스포츠레저학과</option>
                    <option value="department.eps">경제정치사회융합학부</option>
                </optgroup>

                <optgroup label="의과대학">
                    <option value="department.medicine">의학과</option>
                </optgroup>

                <optgroup label="간호대학">
                    <option value="department.nursing">간호학과</option>
                </optgroup>

                <optgroup label="약학대학">
                    <option value="department.pharm">약학과</option>
                </optgroup>

                <optgroup label="첨단바이오융합대학">
                    <option value="department.ibio">첨단바이오융합대학</option>
                </optgroup>

                <optgroup label="다산학부대학">
                    <option value="department.uc">다산학부대학</option>
                    <option value="department.pre">자유전공학부</option>
                </optgroup>

                <optgroup label="국제학부">
                    <option value="department.isa">국제학부</option>
                </optgroup>
            </select>

            <br /><br />
            <button onClick={handleSubmit}>확인</button>
        </div>
    );
}
