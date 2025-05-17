import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken, getUserScope } from '@/lib/auth'
import { AuthContextProps } from '@/lib/types'

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  setAuthenticated: () => {},
  userRoles: [],
  isLoading: true
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, userRoles, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
