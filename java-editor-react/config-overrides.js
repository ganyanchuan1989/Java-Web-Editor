var path = require("path");

const { override, babelInclude } = require("customize-cra");

module.exports = function (config, env) {
  // config.resolve.alias = {
  //   vscode: require.resolve("monaco-languageclient/lib/vscode-compatibility"),
  // };
  
  config.resolve.fallback={ "path": false }
  return Object.assign(
    config,
    override(
      babelInclude([
        /* transpile (converting to es5) code in src/ and shared component library */
        path.resolve("src"),
        path.resolve("../remote/src/components"),
      ])
    )(config, env)
  );
};
