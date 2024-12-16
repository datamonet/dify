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
      'https://takin.ai/auth/signin?callbackUrl=https%3A%2F%2Fdify.takin.ai%2Fapps',
    )
  }, [router])
  if (step === 'next')
    return <OneMoreStep />
  return <NormalForm />
}

export default SignIn
