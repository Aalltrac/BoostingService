const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  style: {
    postcss: {
      mode: "extends",
      loaderOptions: (postcssLoaderOptions) => {
        postcssLoaderOptions.postcssOptions.plugins = [
          require("tailwindcss"),
          require("autoprefixer"),
        ];
        return postcssLoaderOptions;
      },
    },
  },
};
