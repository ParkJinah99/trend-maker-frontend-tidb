// craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@utils': path.resolve(__dirname, 'src/lib/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
    }
  }
};
