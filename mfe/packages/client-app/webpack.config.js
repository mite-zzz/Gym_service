const { ModuleFederationPlugin } = require('webpack').container;
const { createBaseConfig, federationShared } = require('@gym/shared');

module.exports = () => {
  const base = createBaseConfig({ name: 'Client App', port: 4001 });
  return {
    ...base,
    entry: './src/index.ts',
    plugins: [
      ...base.plugins,
      new ModuleFederationPlugin({
        name: 'clientApp',
        filename: 'remoteEntry.js',
        exposes: { './App': './src/App' },
        remotes: { host: 'host@http://localhost:4000/remoteEntry.js' },
        shared: federationShared,
      }),
    ],
  };
};
