module.exports = {
  productionBrowserSourceMaps: true,
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
} 