import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearTokens, getAccessToken, getUserScope } from '@/lib/auth';

interface AuthContextProps {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  userRoles: string[];
  isLoading: boolean;
  logout: () => void;
  isRefreshing: boolean;
  setIsRefreshing: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  setAuthenticated: () => {},
  userRoles: [],
  isLoading: true,
  logout: () => {},
  isRefreshing: false,
  setIsRefreshing: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    const path = window.location.pathname;
    
    const publicRoutes = ['/login', '/reset-password', '/public'];
    const isPublicRoute = publicRoutes.includes(path);
    
    if (!isRefreshing) {
      if (token) {
        setAuthenticated(true);
        setUserRoles(getUserScope(token));

        if (path === '/login') navigate('/');
      } else {
        setAuthenticated(false);
        if (!isPublicRoute) navigate('/login');
      }

      setIsLoading(false);
    }
  }, [isRefreshing]);

  const logout = () => {
    clearTokens();
    setAuthenticated(false);
    setUserRoles([]);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        userRoles,
        isLoading,
        logout,
        isRefreshing,
        setIsRefreshing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
