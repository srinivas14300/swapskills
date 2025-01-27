module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ],
  plugins: [
    'babel-plugin-transform-vite-meta-env',
    ['@babel/plugin-transform-runtime', { regenerator: true }],
    ['babel-plugin-styled-components', { 
      displayName: true,
      fileName: true
    }]
  ]
};
