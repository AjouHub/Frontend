// src/utils/Api.ts
// axios 인스턴스 + 토큰 자동 헤더 주입

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://api.example.com', // 백엔드 호출 주소
});

// 요청을 보낼 때마다 accessToken 을 헤더에 실어 준다
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
