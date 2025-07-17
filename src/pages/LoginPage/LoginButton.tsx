import styled from 'styled-components';

const Button = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
`;

interface Props {
    onClick: () => void;
}

export default function LoginButton({ onClick }: Props) {
    return <Button onClick={onClick}>구글 로그인</Button>;
}