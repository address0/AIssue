'use client'

import axios from 'axios'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

// 로그인하지 않는 사용자용
export const publicAPI = axios.create({
  baseURL: SERVER_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
})

// 로그인한 사용자용
export const privateAPI = axios.create({
  baseURL: SERVER_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
})

privateAPI.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem('accessToken')

  config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

privateAPI.interceptors.response.use(
  (response) => {
    return response
  },

  async (error) => {
    return Promise.reject(error)
  },
)
