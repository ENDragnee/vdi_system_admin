// lib/session-provider.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { Session } from 'better-auth/types'

interface SessionContextType {
  session: Session | null
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

interface SessionProviderProps {
  children: ReactNode
  session: Session | null
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

// Convenience hook for just the user
// export function useUser() {
//   const { session } = useSession()
//   return session?.user || null