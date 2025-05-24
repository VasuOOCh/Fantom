'use client'
import { RootState } from '@/lib/redux/store'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  /* 
  React does not allow you to trigger navigation (router.push) during render. If you do, you’ll see this warning:
  Warning: Cannot update a component (`Router`) while rendering a different component (`AuthLayout`)

  So we cannot diretly use if condition with useRouter, so we use useEffect as :
  useEffect runs only after the component is loaded, so we use isAuthChecked to load the component initially then useEffect is run
  
  We needed to render something before our user condition is checked in useEffect, so we used isAuthChecked initially as false to render "Checking Auth status"

  */
  
  // useEffect(() => {
  //   if (user != null) {
  //     return router.push('/dashboard')
  //   } else {
  //     setIsAuthChecked(true)
  //   }
  // }, [user, router])

  // if (!isAuthChecked) return "Checking Auth status";


  //  ********************** USING MIDDLEWARE.TS INSTEAD *********************************
  return (
    <>
      {children}
    </>
  )
}

export default AuthLayout