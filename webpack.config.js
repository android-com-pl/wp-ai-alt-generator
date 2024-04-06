const defaultConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaultConfig,
  entry: {
    "media-modal": "./src/media/media-modal.ts",
    "media-edit-page": "./src/media/media-edit-page.ts",
    "media-upload": "./src/media/media-upload.ts",
    editor: "./src/editor/index.tsx",
  },
};
