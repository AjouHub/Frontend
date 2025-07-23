import React, {JSX} from 'react';
import { useNavigate } from 'react-router-dom';

function AccountInfoButton(): JSX.Element {
    const navigate = useNavigate();

    const handleClick = () => {
        // alert('버튼이 클릭되었습니다!');
        navigate('/account-info')
    };

    return (
        <button onClick={handleClick}>
            계정 정보 페이지
        </button>
    );
}

export default AccountInfoButton;
