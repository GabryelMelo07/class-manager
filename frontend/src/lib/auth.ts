import Cookies from 'js-cookie'

export function getAccessToken() {
  return Cookies.get('access_token')
}

export function getRefreshToken() {
  return Cookies.get('refresh_token')
}

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set('access_token', accessToken, { secure: true })
  Cookies.set('refresh_token', refreshToken, { secure: true })
}

export function clearTokens() {
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
}
