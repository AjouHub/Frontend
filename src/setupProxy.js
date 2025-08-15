// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    const target = 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app';

    app.use(
        '/api',
        createProxyMiddleware({
            target,
            changeOrigin: true,
            secure: false,
            pathRewrite: { '^/api': '' },      // /api/user -> /user
            cookieDomainRewrite: { '*': '' },  // 쿠키를 host-only(localhost)로
            // ★ (선택) HTTP 로컬에서 Secure 쿠키가 저장/전송 안 되는 문제를 개발 동안 패치
            onProxyRes(proxyRes) {
                const sc = proxyRes.headers['set-cookie'];
                if (Array.isArray(sc)) {
                    proxyRes.headers['set-cookie'] = sc.map((c) =>
                        // dev에서만: Secure 제거 + SameSite=None → Lax 로 바꿔 저장되게
                        c
                            .replace(/;\s*Domain=[^;]*/i, '')        // host-only
                            .replace(/;\s*Secure/gi, '')              // http에서 저장 불가 → 제거
                            .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
                    );
                }
            },
        })
    );
};
