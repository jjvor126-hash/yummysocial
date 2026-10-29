import type { ReactNode } from 'react'
import { StorageNotice } from './StorageNotice'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-[#e8e3de] dark:bg-black">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-3 focus:z-[100] focus:-translate-x-1/2 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <div
        id="contenido-principal"
        tabIndex={-1}
        className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface shadow-[0_0_60px_rgba(0,0,0,0.15)] outline-none dark:bg-surface-dark"
      >
        <StorageNotice />
        {children}
      </div>
    </div>
  )
}
