const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

const root = path.resolve(__dirname, '../..')

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(root, 'node_modules'),
]

// expo/expo-router는 앱 로컬에서 해석 (root AppEntry.js 상대경로 오동작 방지)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  expo: path.resolve(__dirname, 'node_modules/expo'),
  'expo-router': path.resolve(__dirname, 'node_modules/expo-router'),
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
}

// Windows FallbackWatcher가 node_modules 모든 하위 디렉터리에 fs.watch 등록 → 타임아웃
// blockList → ignorePattern → ignorePatternForWatch 경로로 watcher 제외에 사용됨
// posixPathMatchesPattern이 경로를 / 로 변환 후 비교하므로 패턴도 / 기준으로 작성해야 함
// 번들러는 nodeModulesPaths 기반 해석(HasteMap 아님)을 쓰므로 번들링에 영향 없음
config.resolver.blockList = [/\/node_modules\//]

module.exports = config
