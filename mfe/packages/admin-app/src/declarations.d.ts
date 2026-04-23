declare module 'host/stores' {
  export { useStore, rootStore, RootStore } from '../../host/src/stores/RootStore';
}
declare module 'host/AuthContext' {
  export { useAuth, AuthProvider } from '../../host/src/context/AuthContext';
}
declare module 'host/api/gym' {
  export * from '../../host/src/api/gym';
}
