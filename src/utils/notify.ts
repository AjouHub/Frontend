// src/utils/notify.ts
import { toast, ToastOptions } from 'react-toastify';

const base: ToastOptions = {
    autoClose: 2200,
    pauseOnHover: true,
    closeOnClick: true,
};

export const notify = {
    success: (msg: string, opts?: ToastOptions) =>
        toast.success(msg, { ...base, ...opts }),
    error: (msg: string, opts?: ToastOptions) =>
        toast.error(msg, { ...base, ...opts }),
    warn: (msg: string, opts?: ToastOptions) =>
        toast.warn(msg, { ...base, ...opts }),
    info: (msg: string, opts?: ToastOptions) =>
        toast.info(msg, { ...base, ...opts }),
};
