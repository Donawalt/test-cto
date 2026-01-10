import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useRedirect(path: string, enabled = true) {
  useEffect(() => {
    if (enabled && path) {
      window.location.href = path
    }
  }, [path, enabled])
}

export function useOnboardingCheck() {
  const router = useRouter()

  useEffect(() => {
    const isOnboarded = localStorage.getItem('sanity-onboarded')
    if (!isOnboarded) {
      router.push('/onboarding')
    }
  }, [router])
}
