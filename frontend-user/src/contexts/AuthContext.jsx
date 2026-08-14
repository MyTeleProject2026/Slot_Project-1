import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const login = useCallback(({ user: u, token: t }) => {
    setUser(u)
    setToken(t)
    // optionally persist to localStorage
    try {
      localStorage.setItem('auth_user', JSON.stringify(u))
      localStorage.setItem('auth_token', t)
    } catch (e) {}
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    try {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    } catch (e) {}
  }, [])

  const value = { user, token, login, logout, setUser, setToken }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
