"use server";
import { cookies } from "next/headers";
import axios from "axios";

type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  level: string;
  credits: number;
} | null;

/**
 * Get user information
 */
export async function getUserInfo() {
  try {
    const token = await getCookie();
    const response = await axios.get(
      `${process.env.TAKIN_API_URL}/api/integrations/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const userData = response.data.data;

    if (!userData) return null;

    return {
      ...userData,
      image: `${process.env.TAKIN_API_URL}${userData.image}`,
      credits:
        userData.subscriptionCredits +
        userData.extraCredits +
        userData.subscriptionPurchasedCredits,
    } as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function deleteCookie(name: string) {
  cookies().set(name, "", {
    domain: ".takin.ai", // 确保跨子域名的cookie
    path: "/", // 确保路径正确
    expires: new Date(0), // 设置过期时间为过去的时间点
    secure: true, // 如果在 HTTPS 环境下
    httpOnly: true, // 如果需要httpOnly属性
  });
}

export async function getCookie() {
  const isProd = process.env.NODE_ENV === "production";
  const tokenName = isProd
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  return cookies().get(tokenName)?.value;
}
