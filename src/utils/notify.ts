// src/utils/notify.ts
import { toast, ToastOptions } from 'react-toastify';

const base: ToastOptions = {
    autoClose: 2200,
    pauseOnHover: true,
    closeOnClick: true,
};

// 아이콘 상 warn과 error 바꿈
export const notify = {
    success: (msg: string, opts?: ToastOptions) =>
        toast.success(msg, { ...base, ...opts }),
    warn: (msg: string, opts?: ToastOptions) =>
        // toast.error(msg, { ...base, ...opts }),
        toast.success(msg, { ...base, ...opts }), // 삭제 성공도 성공으로 처리
    error: (msg: string, opts?: ToastOptions) =>
        toast.warn(msg, { ...base, ...opts }),
    info: (msg: string, opts?: ToastOptions) =>
        toast.info(msg, { ...base, ...opts }),
};
