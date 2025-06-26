import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearTokens, getAccessToken, getUserScope } from '@/lib/auth'

interface AuthContextProps {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  userRoles: string[],
  isLoading: boolean,
  logout: () => void
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  setAuthenticated: () => {},
  userRoles: [],
  isLoading: true,
  logout: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const token = getAccessToken()
    
    if (token) {
      setAuthenticated(true)
      setUserRoles(getUserScope(token))

      if (location.pathname === '/login') navigate('/')
    } else {
      setAuthenticated(false)
      if (location.pathname !== '/login') navigate('/login')
    }
  
    setIsLoading(false)
  }, [])

  const logout = () => {
    clearTokens();
    setAuthenticated(false);
    setUserRoles([]);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, userRoles, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
