'use client'
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OneMoreStep from './oneMoreStep'
import NormalForm from './normalForm'

const SignIn = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get('step')
  useEffect(() => {
    router.replace(
      `${process.env.TAKIN_API_URL}/signin?callbackUrl=${encodeURIComponent(process.env.NEXT_PUBLIC_CALLBACK_URL)}`,
    )
  }, [router])
  if (step === 'next')
    return <OneMoreStep />
  return <NormalForm />
}

export default SignIn
