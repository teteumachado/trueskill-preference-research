'use client'

import { useEffect } from 'react'
import { useTitle } from './title-provider'

export const SetTitle = ({ title }: { title: string | null }) => {
  const { setTitle } = useTitle()

  useEffect(() => {
    setTitle(title)
    return () => setTitle(null)
  }, [title, setTitle])

  return null
}
