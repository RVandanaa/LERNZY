import { create } from 'zustand';

const useAppStore = create((set) => ({
  // App-wide state goes here
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),
}));

export default useAppStore;