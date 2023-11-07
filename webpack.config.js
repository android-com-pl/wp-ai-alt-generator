const defaultConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaultConfig,
  entry: {
    // media:'./src/media/index.ts',
    editor: "./src/editor/index.tsx",
  },
};
