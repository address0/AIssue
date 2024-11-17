'use client'

import { useEffect, useRef } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface LottieAnimationProps {
  animationData: object // 정확한 타입 지정
  width?: number
  height?: number
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  width = 24,
  height = 24,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationInstance: AnimationItem | undefined

    if (containerRef.current) {
      animationInstance = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
      })
    }

    // Cleanup to prevent errors when unmounting
    return () => {
      if (animationInstance) {
        animationInstance.destroy()
      }
    }
  }, [animationData])

  return (
    <div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  )
}

export default LottieAnimation
