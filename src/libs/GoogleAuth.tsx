// src/libs/GoogleAuth.ts
// Google 로그인 SDK 초기화 + idToken 획득 유틸

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

// SDK 전체 설정(앱이 시작될 때 1회)
export function configureGoogle() {
  console.log('GOOGLE_WEB_CLIENT_ID=', Config.GOOGLE_WEB_CLIENT_ID);

  GoogleSignin.configure({
    webClientId: Config.GOOGLE_WEB_CLIENT_ID, // 백엔드 검증 및 RefreshToken 발급에 쓰이는 ‘Web Client ID’
    offlineAccess: true, // → refresh token 발급 허용
    forceCodeForRefreshToken: true, // 항상 “승인 code” 기반 흐름 사용
    // email 클레임을 ID Token에 포함시키기 위해 scopes에 'email' 추가
    scopes: [
      'openid',           // sub, iss, aud, exp 등 기본 OIDC 필수 클레임
      'email',            // email 클레임 요청
    ],
  });
}

// 실제 로그인 UI 띄우고 idToken 받아오는 함수
export async function googleIdToken(): Promise<string> {
  console.log('🔑 googleIdToken: start');

  // 1. 기기에 “Google Play 서비스”가 설치·업데이트되어 있는지 체크
  console.log('🔑 Checking Play Services…');
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  console.log('🔑 Play Services OK');

  // 2. 로그인 화면 표시 → 사용자가 구글 계정을 고르면 user 객체 반환
  console.log('🔑 Calling GoogleSignin.signIn()…');
  const user = (await GoogleSignin.signIn()) as any; // 타입 단언
  console.log('🔑 signIn() returned:', user);

  // 3. user.idToken 속성에 JWT(ID Token)가 담겨 있음
  if (!user?.idToken) {
    console.error('🔑 No idToken in user object:', user);
    throw new Error('No idToken returned');
  }
  
  console.log('🔑 Returning idToken:', user.idToken);
  return user.idToken as string;
}
