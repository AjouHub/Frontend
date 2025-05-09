// src/screens/LoginScreen.tsx
/*로그인 화면 컴포넌트를 정의
  - Google 로그인 버튼 클릭 → 로그인 로직 호출 → 결과에 따라 Alert 표시
*/

import React, { useState } from 'react';
// SafeAreaView: 노치·상태바를 피해 안전 영역 확보
// Button: 기본 버튼 컴포넌트
// ActivityIndicator: 로딩 스피너
// Alert: 간단한 팝업 메시지
import { SafeAreaView, Button, ActivityIndicator, Alert } from 'react-native';
// Google 로그인 → ID Token 획득 → 백엔드 연동 → JWT 저장 함수
import { loginWithGoogle } from '../services/AuthService';

export default function LoginScreen() {
  // 로딩 상태 관리: true일 때 스피너, false일 때 버튼 표시
  const [loading, setLoading] = useState(false);

  // 버튼 눌렀을 때 실행될 비동기 함수
  const onPress = async () => {
    console.log('[LoginScreen] onPress fired!');
    
    try {
      // 1) 로딩 시작
      setLoading(true);

      // 2) Google 로그인 → 서버 연동 → 자체 JWT 발급
      //    반환값 user 에는 jwtDecode로 파싱된 { email: string } 정보가 있음
      const user = await loginWithGoogle();

      // 3) 로그인 성공 알림
      Alert.alert('Logged in!', `Welcome ${user.email}`);

      // navigation.replace('Home');

    } catch (e: any) {
      // 4) 네트워크 오류 또는 로그인 실패 시 에러 알림
      Alert.alert('Login error', e.message);
    } finally {
      // 5) 로딩 종료
      setLoading(false);
    }
  };

  return (
    // SafeAreaView 로 전체 화면 감쌈
    <SafeAreaView
      style={{
        flex: 1,                   // 화면 전체를 채움
        justifyContent: 'center',  // 수직 중앙 정렬
        alignItems: 'center',      // 수평 중앙 정렬
      }}
    >
      {
        // 로딩 중이면 스피너, 아니면 로그인 버튼 표시
        loading
          ? <ActivityIndicator size="large" />
          : <Button title="Google Login" onPress={onPress} />
      }
    </SafeAreaView>
  );
}
