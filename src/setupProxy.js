const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/clarifai-api',
    createProxyMiddleware({
      target: 'https://api.clarifai.com',
      changeOrigin: true,
      pathRewrite: {
        '^/clarifai-api': '',
      },
    })
  );
};