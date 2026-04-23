import { createContext, useContext } from 'react';
import { AuthStore } from './AuthStore';
import { ClientStore } from './ClientStore';
import { AdminStore } from './AdminStore';

export class RootStore {
  auth: AuthStore;
  client: ClientStore;
  admin: AdminStore;
  constructor() {
    this.auth = new AuthStore();
    this.client = new ClientStore();
    this.admin = new AdminStore();
  }
}

export const rootStore = new RootStore();
export const RootStoreContext = createContext(rootStore);
export function useStore(): RootStore { return useContext(RootStoreContext); }
