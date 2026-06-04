import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface AvatarCacheContextValue {
  /** Timestamp hiện tại — append vào avatar URL để bust cache */
  version: number
  /** Gọi sau khi upload avatar thành công để force tất cả Avatar re-fetch */
  bumpVersion: () => void
}

const AvatarCacheContext = createContext<AvatarCacheContextValue>({
  version: 0,
  bumpVersion: () => {},
})

export function AvatarCacheProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(() => Date.now())
  const bumpVersion = useCallback(() => setVersion(Date.now()), [])
  return (
    <AvatarCacheContext.Provider value={{ version, bumpVersion }}>
      {children}
    </AvatarCacheContext.Provider>
  )
}

export function useAvatarCache() {
  return useContext(AvatarCacheContext)
}
