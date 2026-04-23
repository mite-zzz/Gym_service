const { ModuleFederationPlugin } = require('webpack').container;
const { createBaseConfig, federationShared } = require('@gym/shared');

module.exports = () => {
  const base = createBaseConfig({ name: 'Admin App', port: 4002 });
  return {
    ...base,
    entry: './src/index.ts',
    plugins: [
      ...base.plugins,
      new ModuleFederationPlugin({
        name: 'adminApp',
        filename: 'remoteEntry.js',
        exposes: { './App': './src/App' },
        remotes: { host: 'host@http://localhost:4000/remoteEntry.js' },
        shared: federationShared,
      }),
    ],
  };
};
