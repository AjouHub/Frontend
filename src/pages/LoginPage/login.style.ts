import styled, { createGlobalStyle } from 'styled-components';


export const LoginPageWrapper = styled.div`
  font-family: 'jsMath-cmbx10', serif;
  background-color: #120F16;
  color: white;
  width: 100vw;
  height: 100vh;
  text-align: center;
`;

export const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@700&display=swap');
`;

export const Background = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #120f16;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Title = styled.h1`
  color: white;
  font-size: 45px;
  font-family: 'EB Garamond', serif;
  margin-bottom: 80px;
`;
