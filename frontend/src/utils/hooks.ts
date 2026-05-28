import { useEffect, useState } from 'react'

export function useAsync<T>(loader: () => Promise<T>, fallback: T, deps: unknown[] = []) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    loader()
      .then((result) => {
        if (mounted) setData(result)
      })
      .catch((reason) => {
        if (mounted) setError(reason)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, deps)

  return { data, loading, error, setData }
}
