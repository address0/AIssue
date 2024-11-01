import { privateAPI, publicAPI } from '@/api/axios'

const login = async (email: string, password: string) => {
  const res = await publicAPI.post('/auth/login', {
    email,
    password,
    loginType: 'basic',
  })
  return res.data.result
}

const signUp = async (
  email: string,
  password: string,
  jraKey: string,
  name: string,
) => {
  const res = await publicAPI.post('/member/signup', {
    email,
    password,
    jraKey,
    name,
  })
  return res.data.result
}

const logOut = async () => {
  const accessToken = sessionStorage.getItem('accessToken')
  if (!accessToken) return null
  await privateAPI.post('/auth/logout', {
    accessToken,
  })
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('loginType')
  return null
}

export { login, signUp, logOut }
