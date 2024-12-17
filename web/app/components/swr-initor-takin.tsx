'use client'

import { SWRConfig } from 'swr'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getCookie } from '@/app/api/user'

type SwrInitorProps = {
  children: ReactNode
}
const SwrInitor = ({
  children,
}: SwrInitorProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consoleTokenFromLocalStorage = localStorage?.getItem('console_token')
  const pathname = usePathname()
  const [init, setInit] = useState(false)

  /**
   * takin command:获取takin cookie token;验证登录一般不会多过更改，直接copy一份，减少合并的冲突
   * ↓
   * 有 token?
   * ├── 是 → 检查是否与 localStorage 中的 token 匹配
   * │         ├── 匹配 → 设置 init 为 true
   * │         └── 不匹配 → 更新 localStorage token 并重定向到 /apps
   * │
   * └── 否 → 重定向到登录页面
   */

  useEffect(() => {
    const checkAuth = async () => {
      // const token = await getCookie('next-auth.session-token')
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZmF5ZSIsImVtYWlsIjoicmFpbnl1aGFuakBnbWFpbC5jb20iLCJpYXQiOjE3MjI5Mzc1Nzh9.iiq3P0tbJVofK2j3SoijaCxRBLuf2KFLo-XRbLg6RJU'
      if (!token) {
        router.replace('https://takin.ai/auth/signin?callbackUrl=https%3A%2F%2Fdify.takin.ai%2Fapps')
        return
      }

      if (token === consoleTokenFromLocalStorage) {
        setInit(true)
        return
      }

      localStorage?.setItem('console_token', token)
      router.replace('/apps', { forceOptimisticNavigation: false } as any)
      setInit(true)
    }

    checkAuth()
  }, [router, pathname, searchParams, consoleTokenFromLocalStorage])

  return init
    ? (
      <SWRConfig value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}>
        {children}
      </SWRConfig>
    )
    : null
}

export default SwrInitor
