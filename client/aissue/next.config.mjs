// @ts-check
import withPWAInit from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    return config
  },
}

// PWA 설정 초기화
const withPWA = withPWAInit({
  dest: 'public', // Service Worker 파일이 저장될 위치
  register: true, // Service Worker 자동 등록
})

// PWA 설정과 함께 Next.js 설정 내보내기
export default withPWA(nextConfig)
