const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,
  entry: {
    admin: './src/admin/index.ts',
    'media-modal': './src/media/media-modal.ts',
    'media-edit-page': './src/media/media-edit-page.ts',
    'media-upload': './src/media/media-upload.tsx',
    editor: './src/editor/index.tsx',
  },
};
