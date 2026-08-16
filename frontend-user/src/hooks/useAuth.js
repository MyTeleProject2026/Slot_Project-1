import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values instead of throwing
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      api: null,
    };
  }
  return context;
};

export default useAuth;
