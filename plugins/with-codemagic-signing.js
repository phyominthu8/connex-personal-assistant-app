const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withCodemagicSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== "groovy") return mod;
    const signingBlock = `signingConfigs {
        release {
            if (System.getenv("CM_KEYSTORE_PATH") != null) {
                storeFile file(System.getenv("CM_KEYSTORE_PATH"))
                storePassword System.getenv("CM_KEYSTORE_PASSWORD")
                keyAlias System.getenv("CM_KEY_ALIAS")
                keyPassword System.getenv("CM_KEY_PASSWORD")
            }
        }
    }
`;
    if (
      !mod.modResults.contents.includes('System.getenv("CM_KEYSTORE_PATH")')
    ) {
      mod.modResults.contents = mod.modResults.contents.replace(
        /\n\s*buildTypes\s*\{/m,
        `\n    ${signingBlock}    buildTypes {`,
      );
    }
    mod.modResults.contents = mod.modResults.contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{)/m,
      '$1\n            if (System.getenv("CM_KEYSTORE_PATH") != null) { signingConfig signingConfigs.release }',
    );
    return mod;
  });
};
