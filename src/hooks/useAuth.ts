import { useState, useEffect } from 'react'
import {
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
  type AuthProvider,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const providers = {
  google: new GoogleAuthProvider(),
  twitter: new TwitterAuthProvider(),
} as const

export type AuthProviderName = keyof typeof providers

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = (provider: AuthProviderName = 'twitter') =>
    signInWithPopup(auth, providers[provider] as AuthProvider)
  const logout = () => signOut(auth)

  return { user, loading, login, logout }
}
