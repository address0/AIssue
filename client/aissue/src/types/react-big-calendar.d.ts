/* eslint-disable @typescript-eslint/no-explicit-any */

// global.d.ts
declare module 'react-big-calendar' {
  import { ComponentType } from 'react'

  // 필요한 타입들을 추가로 선언할 수 있습니다
  export interface Event {
    title: string
    start: Date
    end: Date

    [key: string]: any
  }

  export const Calendar: ComponentType<any>
  export const momentLocalizer: (momentInstance: any) => any
}
