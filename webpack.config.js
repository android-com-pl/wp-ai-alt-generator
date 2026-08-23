const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,
  entry: {
    admin: './src/admin/index.ts',
    'media-modal': './src/media/media-modal.tsx',
    'media-edit-page': './src/media/media-edit-page.tsx',
    'media-upload': './src/media/media-upload.tsx',
    editor: './src/editor/index.tsx',
  },
};
