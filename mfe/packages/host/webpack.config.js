const { ModuleFederationPlugin } = require('webpack').container;
const { createBaseConfig, federationShared } = require('@gym/shared');

module.exports = (env, argv) => {
  const base = createBaseConfig({ name: 'Host', port: 4000 });
  return {
    ...base,
    entry: './src/index.ts',
    plugins: [
      ...base.plugins,
      new ModuleFederationPlugin({
        name: 'host',
        filename: 'remoteEntry.js',
        exposes: {
          './stores': './src/stores/RootStore',
          './AuthContext': './src/context/AuthContext',
          './api/auth': './src/api/auth',
          './api/gym': './src/api/gym',
        },
        remotes: {
          clientApp: 'clientApp@http://localhost:4001/remoteEntry.js',
          adminApp: 'adminApp@http://localhost:4002/remoteEntry.js',
        },
        shared: federationShared,
      }),
    ],
  };
};
