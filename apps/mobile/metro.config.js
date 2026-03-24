const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

const root = path.resolve(__dirname, '../..')

// 모노레포 루트 node_modules 탐색 경로 추가
config.watchFolders = [root]
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(root, 'node_modules'),
]

// @expo/metro의 중첩된 metro 패키지 대신 루트의 단일 인스턴스 사용
const metroPackages = [
  'metro',
  'metro-config',
  'metro-core',
  'metro-runtime',
  'metro-source-map',
  'metro-resolver',
  'metro-transform-worker',
  'metro-babel-transformer',
  'metro-file-map',
]
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(
    metroPackages.map((pkg) => [pkg, path.resolve(root, 'node_modules', pkg)])
  ),
}

module.exports = config
