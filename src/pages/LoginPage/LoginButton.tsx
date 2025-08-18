import React from 'react';
import styled from 'styled-components';


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
    onClick: () => void;
    children: React.ReactNode;
}

export default function LoginButton({ onClick, children }: Props) {
    return <StyledButton onClick={onClick}>{children}</StyledButton>;
}