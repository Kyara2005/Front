import create from "zustand";

const useStoreAuth = create((set) => ({
  token: localStorage.getItem("token") || null, // ← Recupera token al iniciar
  justLoggedIn: false,

  setToken: (token) => {
    localStorage.setItem("token", token); // ← Guarda token
    set({ token, justLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem("token"); // ← Borra token
    set({ token: null, justLoggedIn: false });
  },
}));

export default useStoreAuth;
