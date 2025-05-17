import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { JwtPayload } from './types'

export function getAccessToken() {
  return Cookies.get('access_token')
}

export function getRefreshToken() {
  return Cookies.get('refresh_token')
}

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set('access_token', accessToken, { secure: true, sameSite: 'Strict' })
  Cookies.set('refresh_token', refreshToken, { secure: true, sameSite: 'Strict' })
}

export function clearTokens() {
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
}

export const getUserScope = (token: string): string[] => {
  if (!token) return []

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.scope?.split(' ') || []
  } catch (e) {
    console.error('Error when trying to decode JWT Token', e)
    return []
  }
}
