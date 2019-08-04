module.exports = function(config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
    files: ["src/**/*.ts"],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    preprocessors: {
      "**/*.ts": "karma-typescript" // *.tsx for React Jsx
    },
    reporters: ["progress", "karma-typescript"],
    browsers: ["ChromeHeadless"],
    autoWatch: true,
    concurrency: Infinity,
    karmaTypescriptConfig: {
      compilerOptions: {
        lib: ["dom", "esnext"],
        target: "es6"
      },
      tsConfig: "./tsconfig.json"
    }
  });
};
