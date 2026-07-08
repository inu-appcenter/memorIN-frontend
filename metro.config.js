const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// SVG를 컴포넌트로 import 가능하게
config.transformer.babelTransformerPath =
  require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg' // svg를 "에셋"에서 제외하고
);
config.resolver.sourceExts.push('svg'); // "소스 코드"로 취급

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16,
});
