import { useState, useEffect } from 'react'
import { SeniorDto } from '@/types/senior'
import { seniorApiService, seniorUtils } from '@/services/senior-api'

export function useSeniorDetails(seniorId: number) {
  const [senior, setSenior] = useState<SeniorDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSenior = async () => {
      try {
        setLoading(true)
        setError(null)
        const seniorData = await seniorApiService.getSeniorById(seniorId)
        setSenior(seniorData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load senior details')
      } finally {
        setLoading(false)
      }
    }

    fetchSenior()
  }, [seniorId])

  return { senior, loading, error }
}