'use server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type User = {
  id: string
  name: string
  email: string
  image: string
  role: number
  level: number
  credits: number
} | null

/**
 * Get user information
 * @param email
 */
export async function getUserInfo(email: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        level: true,
        subscription_credits: true,
        extra_credits: true,
        subscription_purchased_credits: true,
      },
    })

    if (!user)
      return null

    return {
      ...user,
      credits: (user.subscription_credits || 0) + (user.extra_credits || 0),
    } as User
  }
  catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function deleteCookie(name: string) {
  cookies().set(name, '', {
    domain: '.takin.ai', // 确保跨子域名的cookie
    path: '/', // 确保路径正确
    expires: new Date(0), // 设置过期时间为过去的时间点
    secure: true, // 如果在 HTTPS 环境下
    httpOnly: true, // 如果需要httpOnly属性
  })
}

export async function getCookie(name: string) {
  return cookies().get(name)?.value
}
