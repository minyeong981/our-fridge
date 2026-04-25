const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

const root = path.resolve(__dirname, '../..')

config.watchFolders = [path.resolve(root, 'packages')]

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

module.exports = config
