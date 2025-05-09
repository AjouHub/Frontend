// src/services/AuthService.ts
// Google 로그인 → 백엔드에 idToken 전송 → access/refresh 저장

import api from '../utils/Api';
import { googleIdToken } from '../libs/GoogleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export async function loginWithGoogle() {
  console.log('[AuthService] loginWithGoogle Called');
  
  // 1) 구글 로그인 UI → idToken 확보
  const idToken = await googleIdToken();
  console.log('[AuthService] Get Google Id Token:', idToken);

  try {
    // 2) 서버에 idToken 전송 → access / refresh JWT 획득
    const response = await api.post('/oauth2/google', { idToken });

    console.log('[AuthService] /oauth2/google response:', response);

    const { accessToken, refreshToken } = response.data;

    // 3) 안전한 스토리지에 저장
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);

    // 4) (선택) JWT 디코딩해 사용자 정보 얻기
    return jwtDecode<{ email: string }>(accessToken);

  } catch (error: any) {
    // 에러 응답 데이터가 있다면 같이 출력
    if (error.response) {
      console.error(
        '[AuthService] /oauth2/google error response:',
        error.response.status,
        error.response.data
      );
    } else {
      console.error('[AuthService] network or unexpected error:', error);
    }
    throw error; // 호출자에게도 에러 전파
  }
}
