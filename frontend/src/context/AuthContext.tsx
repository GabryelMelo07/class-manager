import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '@/lib/auth'

interface AuthContextProps {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  setAuthenticated: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      setAuthenticated(true)
      if (location.pathname === '/login') navigate('/')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
