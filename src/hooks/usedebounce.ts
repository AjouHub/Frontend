import { useState, useEffect } from 'react';

// value: 디바운싱할 값 (예: 사용자가 입력하는 검색어)
// delay: 기다릴 시간 (밀리초)
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // value가 바뀔 때마다 타이머를 설정
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // value가 바뀌면 이전 타이머는 취소하고 새 타이머를 시작
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}