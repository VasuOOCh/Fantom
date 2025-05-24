import { initAuthPersistence } from '@/lib/firebase/auth'
import React from 'react'

const HomePage = () => {
  initAuthPersistence()
  return (
    <div>HomePage</div>
  )
}

export default HomePage