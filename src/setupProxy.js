const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/auth',
        createProxyMiddleware({
            target: 'https://port-0-backend-mcx0t8vt98002089.sel5.cloudtype.app',
            changeOrigin: true,
            secure: false,
            cookieDomainRewrite: 'localhost',
        })
    );
};