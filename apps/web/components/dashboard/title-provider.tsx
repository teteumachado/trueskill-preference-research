'use client'

import { createContext, useContext, useState } from 'react'

type TitleContext = {
  title: string | null
  setTitle: (title: string | null) => void
}

const TitleContext = createContext<TitleContext>({ title: null, setTitle: () => {} })

export const useTitle = () => useContext(TitleContext)

export const TitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState<string | null>(null)

  return (
    <TitleContext value={{ title, setTitle }}>
      {children}
    </TitleContext>
  )
}
