// src/navigation/RootStack.tsx
/* 앱 전체 화면 이동(네비게이션)을 담당하는 파일
  - React Navigation 라이브러리로 ‘Stack(스택) 네비게이션’ 구성
  - Login → Home → Profile … 같은 “페이지 전환”을 정의
*/

/* React-Navigation 핵심 컴포넌트 2가지
  - NavigationContainer  : 앱 전체에 네비게이션 상태(Context) 제공
  - createNativeStackNavigator : 실물-같은 ‘스택(푸시·팝)’ 전환 효과
*/

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen'; // 로그인 component

// Stack Navigator 인스턴스 생성 → 타입 안전(제네릭) 버전을 쓰려면 createNativeStackNavigator<ParamList>() 형태
const Stack = createNativeStackNavigator();

/*
 * <RootStack />  (최상위 네비게이션 컴포넌트)
 * ──────────────────────────────────────────────
 *   <NavigationContainer> : “네비게이션 시스템을 켜는 전원 스위치”
 *   <Stack.Navigator>     : push/pop 스택(순서대로 쌓이는 화면) 정의
 *     └ <Stack.Screen>    : 실제로 보여질 화면(컴포넌트) 하나하나
 */
export default function RootStack() {
  return (
    <NavigationContainer>{ /* 네비게이션 시스템을 켜는 전원 스위치 */}
      {/* 모든 화면을 “헤더(타이틀바) 없이” 풀스크린으로 사용 */}
      <Stack.Navigator // push/pop 스택(순서대로 쌓이는 화면) 정의
        initialRouteName="Login"              // 앱을 처음 열면 ‘Login’ 화면부터
        screenOptions={{ headerShown: false }} // 상단 헤더 없애기
        >

        {/* ─── 로그인 화면 ─── */}
        <Stack.Screen
          name="Login"                        // 네비게이터 내부에서 참조할 라우트 이름
          component={LoginScreen}          // 실제 렌더링할 컴포넌트
        />

        {/* ─── 앞으로 홈·프로필 등 추가 ───
        <Stack.Screen name="Home"    component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}