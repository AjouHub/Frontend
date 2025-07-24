import React from 'react';
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";


/* 페이지 전환 버튼 */
const StyledButton = styled.button`
  background-color: white;
  color: black;
  font-weight: bold;
  font-size: 16px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.03);
  }

  &:active {
    transform: scale(0.98);
  }
`;

interface Props {
    to: string; // 이동할 경로
    children: React.ReactNode;
}

export default function NavigationButton({ to, children }: Props) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(to);
    }

    return <StyledButton onClick={handleClick}>{children}</StyledButton>;
}