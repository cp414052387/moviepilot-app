module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/api': './src/api',
            '@/hooks': './src/hooks',
            '@/stores': './src/stores',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/styles': './src/styles',
            '@/navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
