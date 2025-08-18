// src/setupProxy.disabled.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // ⬇️ 환경변수에서 백엔드 주소 읽기 (없으면 디폴트)
    const target =
        (process.env.PROXY_TARGET && process.env.PROXY_TARGET.trim()) ||
        'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app';

    app.use(
        '/api', // /api 로 시작하는 요청만 프록시
        createProxyMiddleware({
            target,
            changeOrigin: true,
            secure: false,
            pathRewrite: { '^/api': '' },       // /api/auth → /auth 로 전달  ← (주석 해제 중요!)
            cookieDomainRewrite: { '*': '' },   // 쿠키를 host-only(localhost)로 저장
            cookiePathRewrite: '/',             // 쿠키 Path 고정
            logLevel: 'debug',                  // 터미널에 프록시 로그 출력

            // 개발용: Secure/SameSite=None 쿠키를 로컬 http에서 저장·전송 가능하게 완화
            onProxyRes(proxyRes) {
                const sc = proxyRes.headers['set-cookie'];
                if (Array.isArray(sc)) {
                    proxyRes.headers['set-cookie'] = sc.map((c) =>
                        c
                            .replace(/;\s*Domain=[^;]*/i, '')            // Domain 제거 → host-only
                            .replace(/;\s*Secure/gi, '')                  // http 로컬에서 저장되게
                            .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
                            .replace(/;\s*Path=[^;]*/i, '; Path=/')
                    );
                }
            },
        })
    );
};
